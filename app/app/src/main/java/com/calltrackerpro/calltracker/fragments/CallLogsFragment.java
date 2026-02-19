package com.calltrackerpro.calltracker.fragments;

import android.Manifest;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.os.Bundle;
import android.provider.ContactsContract;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.calltrackerpro.calltracker.R;
import com.calltrackerpro.calltracker.activities.TicketDetailsActivity;
import com.calltrackerpro.calltracker.adapters.CallLogsAdapter;
import com.calltrackerpro.calltracker.models.ApiResponse;
import com.calltrackerpro.calltracker.models.CallLog;
import com.calltrackerpro.calltracker.models.Ticket;
import com.calltrackerpro.calltracker.models.User;
import com.calltrackerpro.calltracker.services.ApiService;
import com.calltrackerpro.calltracker.services.TicketService;
import com.calltrackerpro.calltracker.utils.PermissionManager;
import com.calltrackerpro.calltracker.utils.TokenManager;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CallLogsFragment extends Fragment implements CallLogsAdapter.OnCallLogClickListener {
    private static final String TAG = "CallLogsFragment";

    // UI Components
    private RecyclerView recyclerView;
    private CallLogsAdapter adapter;
    private SwipeRefreshLayout swipeRefreshLayout;
    private FloatingActionButton fabCreateTicket;
    private View emptyView;

    // Services and Data
    private ApiService apiService;
    private TicketService ticketService;
    private TokenManager tokenManager;
    private PermissionManager permissionManager;
    private User currentUser;

    private List<CallLog> callLogsList = new ArrayList<>();
    private boolean isLoading = false;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        apiService = ApiService.getInstance();
        ticketService = new TicketService(getContext());
        tokenManager = new TokenManager(getContext());

        // Get current user
        currentUser = getCurrentUser();
        if (currentUser != null) {
            permissionManager = new PermissionManager(currentUser);
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_call_logs, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        initViews(view);
        setupRecyclerView();
        setupSwipeRefresh();
        setupFab();

        loadCallLogs();
    }

    private void initViews(View view) {
        recyclerView = view.findViewById(R.id.recycler_view_call_logs);
        swipeRefreshLayout = view.findViewById(R.id.swipe_refresh_call_logs);
        fabCreateTicket = view.findViewById(R.id.fab_create_ticket);
        emptyView = view.findViewById(R.id.layout_empty_call_logs);
    }

    private void setupRecyclerView() {
        adapter = new CallLogsAdapter(callLogsList, this);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
    }

    private void setupSwipeRefresh() {
        swipeRefreshLayout.setOnRefreshListener(() -> {
            callLogsList.clear();
            loadCallLogs();
        });
    }

    private void setupFab() {
        if (fabCreateTicket == null) return;
        // Show FAB only if user has permission to create tickets
        if (permissionManager != null && permissionManager.canCreateContacts()) {
            fabCreateTicket.setVisibility(View.VISIBLE);
            fabCreateTicket.setOnClickListener(v -> {
                Intent intent = new Intent(getContext(), TicketDetailsActivity.class);
                intent.putExtra("mode", "create");
                startActivity(intent);
            });
        } else {
            fabCreateTicket.setVisibility(View.GONE);
        }
    }

    // ==================== LOAD CALL LOGS ====================

    private void loadCallLogs() {
        if (isLoading) return;

        isLoading = true;
        if (swipeRefreshLayout != null) {
            swipeRefreshLayout.setRefreshing(true);
        }

        // Always try to read actual phone call logs from device first
        if (hasCallLogPermission()) {
            Log.d(TAG, "READ_CALL_LOG permission GRANTED - reading device call logs");
            loadDeviceCallLogs();
        } else {
            Log.w(TAG, "READ_CALL_LOG permission NOT granted - falling back to API");
            if (getContext() != null) {
                Toast.makeText(getContext(),
                    "Call log permission not granted. Showing server data. Please grant permission in Settings.",
                    Toast.LENGTH_LONG).show();
            }
            loadApiCallLogs();
        }
    }

    private boolean hasCallLogPermission() {
        return getContext() != null &&
            ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_CALL_LOG)
                == PackageManager.PERMISSION_GRANTED;
    }

    /**
     * Read actual call logs from the phone's call history via ContentResolver.
     */
    private void loadDeviceCallLogs() {
        try {
            ContentResolver resolver = requireContext().getContentResolver();

            String[] projection = {
                android.provider.CallLog.Calls._ID,
                android.provider.CallLog.Calls.NUMBER,
                android.provider.CallLog.Calls.CACHED_NAME,
                android.provider.CallLog.Calls.TYPE,
                android.provider.CallLog.Calls.DATE,
                android.provider.CallLog.Calls.DURATION
            };

            // Sort by date descending (no LIMIT in sortOrder for broader compatibility)
            String sortOrder = android.provider.CallLog.Calls.DATE + " DESC";

            Cursor cursor = resolver.query(
                android.provider.CallLog.Calls.CONTENT_URI,
                projection,
                null,
                null,
                sortOrder
            );

            callLogsList.clear();

            if (cursor != null) {
                int idIdx = cursor.getColumnIndex(android.provider.CallLog.Calls._ID);
                int numberIdx = cursor.getColumnIndex(android.provider.CallLog.Calls.NUMBER);
                int nameIdx = cursor.getColumnIndex(android.provider.CallLog.Calls.CACHED_NAME);
                int typeIdx = cursor.getColumnIndex(android.provider.CallLog.Calls.TYPE);
                int dateIdx = cursor.getColumnIndex(android.provider.CallLog.Calls.DATE);
                int durationIdx = cursor.getColumnIndex(android.provider.CallLog.Calls.DURATION);

                int count = 0;
                while (cursor.moveToNext() && count < 100) {
                    count++;
                    CallLog callLog = new CallLog();

                    callLog.setId(cursor.getString(idIdx));
                    callLog.setPhoneNumber(cursor.getString(numberIdx));

                    String cachedName = cursor.getString(nameIdx);
                    callLog.setContactName(cachedName != null ? cachedName : "Unknown");

                    int callTypeInt = cursor.getInt(typeIdx);
                    callLog.setCallType(mapCallType(callTypeInt));

                    long dateMillis = cursor.getLong(dateIdx);
                    callLog.setDate(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()).format(new Date(dateMillis)));
                    callLog.setTimestamp(dateMillis);

                    long durationSec = cursor.getLong(durationIdx);
                    callLog.setDuration(durationSec);

                    // Determine status from type and duration
                    callLog.setCallStatus(mapCallStatus(callTypeInt, durationSec));

                    callLogsList.add(callLog);
                }
                cursor.close();
            }

            isLoading = false;
            if (swipeRefreshLayout != null) {
                swipeRefreshLayout.setRefreshing(false);
            }

            if (adapter != null) {
                adapter.notifyDataSetChanged();
            }
            updateEmptyView();

            Log.d(TAG, "Loaded " + callLogsList.size() + " call logs from device");

        } catch (SecurityException se) {
            Log.e(TAG, "SecurityException reading call logs - permission revoked?", se);
            if (getContext() != null) {
                Toast.makeText(getContext(), "Call log permission denied by system", Toast.LENGTH_LONG).show();
            }
            isLoading = false;
            if (swipeRefreshLayout != null) swipeRefreshLayout.setRefreshing(false);
            loadApiCallLogs();
        } catch (Exception e) {
            Log.e(TAG, "Error reading device call logs: " + e.getMessage(), e);
            if (getContext() != null) {
                Toast.makeText(getContext(), "Error reading call logs: " + e.getMessage(), Toast.LENGTH_LONG).show();
            }
            isLoading = false;
            if (swipeRefreshLayout != null) swipeRefreshLayout.setRefreshing(false);
            loadApiCallLogs();
        }
    }

    private String mapCallType(int type) {
        switch (type) {
            case android.provider.CallLog.Calls.INCOMING_TYPE:
                return "incoming";
            case android.provider.CallLog.Calls.OUTGOING_TYPE:
                return "outgoing";
            case android.provider.CallLog.Calls.MISSED_TYPE:
                return "missed";
            case android.provider.CallLog.Calls.REJECTED_TYPE:
                return "rejected";
            case android.provider.CallLog.Calls.BLOCKED_TYPE:
                return "blocked";
            default:
                return "unknown";
        }
    }

    private String mapCallStatus(int type, long durationSec) {
        switch (type) {
            case android.provider.CallLog.Calls.MISSED_TYPE:
                return "missed";
            case android.provider.CallLog.Calls.REJECTED_TYPE:
                return "declined";
            case android.provider.CallLog.Calls.BLOCKED_TYPE:
                return "blocked";
            default:
                return durationSec > 0 ? "completed" : "missed";
        }
    }

    /**
     * Fallback: load call logs from the backend API.
     */
    private void loadApiCallLogs() {
        String token = "Bearer " + tokenManager.getToken();

        Call<ApiResponse<List<CallLog>>> call = apiService.getCallLogs(token);
        call.enqueue(new Callback<ApiResponse<List<CallLog>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<CallLog>>> call, Response<ApiResponse<List<CallLog>>> response) {
                isLoading = false;
                if (swipeRefreshLayout != null) {
                    swipeRefreshLayout.setRefreshing(false);
                }

                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<List<CallLog>> apiResponse = response.body();
                    if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                        callLogsList.clear();
                        callLogsList.addAll(apiResponse.getData());
                        if (adapter != null) adapter.notifyDataSetChanged();
                        Log.d(TAG, "Loaded " + callLogsList.size() + " call logs from API");
                    } else {
                        Log.e(TAG, "API error: " + (apiResponse.getMessage() != null ? apiResponse.getMessage() : "unknown"));
                    }
                } else {
                    Log.e(TAG, "Failed to load call logs: HTTP " + response.code());
                }

                updateEmptyView();
            }

            @Override
            public void onFailure(Call<ApiResponse<List<CallLog>>> call, Throwable t) {
                isLoading = false;
                if (swipeRefreshLayout != null) {
                    swipeRefreshLayout.setRefreshing(false);
                }
                Log.e(TAG, "Network error loading call logs", t);
                if (getContext() != null) {
                    Toast.makeText(getContext(), "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                }
                updateEmptyView();
            }
        });
    }

    // ==================== UI HELPERS ====================

    private void updateEmptyView() {
        if (emptyView == null || recyclerView == null) return;
        if (callLogsList.isEmpty()) {
            emptyView.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.GONE);
        } else {
            emptyView.setVisibility(View.GONE);
            recyclerView.setVisibility(View.VISIBLE);
        }
    }

    @Override
    public void onCallLogClick(CallLog callLog) {
        showCallLogOptionsDialog(callLog);
    }

    public void showCallHistory(String phoneNumber) {
        if (currentUser == null || phoneNumber == null) return;

        String authToken = "Bearer " + tokenManager.getToken();
        Call<ApiResponse<ApiService.CallHistoryResponse>> call = apiService.getCallHistory(authToken, phoneNumber);

        call.enqueue(new Callback<ApiResponse<ApiService.CallHistoryResponse>>() {
            @Override
            public void onResponse(Call<ApiResponse<ApiService.CallHistoryResponse>> call, Response<ApiResponse<ApiService.CallHistoryResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<ApiService.CallHistoryResponse> apiResponse = response.body();
                    if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                        displayCallHistoryDialog(phoneNumber, apiResponse.getData());
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<ApiService.CallHistoryResponse>> call, Throwable t) {
                Log.e(TAG, "Error fetching call history: " + t.getMessage());
                if (getContext() != null) {
                    Toast.makeText(getContext(), "Error loading call history", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    private void displayCallHistoryDialog(String phoneNumber, ApiService.CallHistoryResponse historyData) {
        if (!isAdded() || getContext() == null) return;

        StringBuilder historyText = new StringBuilder();
        historyText.append("Call History for ").append(phoneNumber).append("\n\n");

        if (historyData.getContact() != null) {
            historyText.append("Contact: ").append(historyData.getContact().getFullName()).append("\n");
            historyText.append("Status: ").append(historyData.getContact().getStatus()).append("\n\n");
        }

        historyText.append("Previous Calls (").append(historyData.getCall_history().size()).append("):\n");
        for (CallLog call : historyData.getCall_history()) {
            historyText.append("• ").append(call.getCallType()).append(" - ")
                    .append(call.getCallStatus()).append(" (").append(call.getDuration()).append("s)\n");
        }

        if (!historyData.getRelated_tickets().isEmpty()) {
            historyText.append("\nRelated Tickets (").append(historyData.getRelated_tickets().size()).append("):\n");
            for (Ticket ticket : historyData.getRelated_tickets()) {
                historyText.append("• ").append(ticket.getTicketId()).append(" (").append(ticket.getStatus()).append(")\n");
            }
        }

        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Call History")
                .setMessage(historyText.toString())
                .setPositiveButton("OK", null)
                .show();
    }

    @Override
    public void onCallLogLongClick(CallLog callLog) {
        if (permissionManager != null && permissionManager.canCreateContacts()) {
            createTicketFromCallLog(callLog);
        } else {
            if (getContext() != null) {
                Toast.makeText(getContext(), "You don't have permission to create tickets", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void showCallLogOptionsDialog(CallLog callLog) {
        if (!isAdded() || getContext() == null) return;

        String[] options;
        if (permissionManager != null && permissionManager.canCreateContacts()) {
            options = new String[]{"View Details", "Create Ticket", "Call Back", "Send SMS"};
        } else {
            options = new String[]{"View Details", "Call Back", "Send SMS"};
        }

        new MaterialAlertDialogBuilder(getContext())
            .setTitle("Call with " + (callLog.getContactName() != null ? callLog.getContactName() : callLog.getPhoneNumber()))
            .setItems(options, (dialog, which) -> {
                if (permissionManager != null && permissionManager.canCreateContacts()) {
                    switch (which) {
                        case 0: showCallLogDetails(callLog); break;
                        case 1: createTicketFromCallLog(callLog); break;
                        case 2: callPhoneNumber(callLog.getPhoneNumber()); break;
                        case 3: sendSms(callLog.getPhoneNumber()); break;
                    }
                } else {
                    switch (which) {
                        case 0: showCallLogDetails(callLog); break;
                        case 1: callPhoneNumber(callLog.getPhoneNumber()); break;
                        case 2: sendSms(callLog.getPhoneNumber()); break;
                    }
                }
            })
            .show();
    }

    private void showCallLogDetails(CallLog callLog) {
        if (!isAdded() || getContext() == null) return;

        String details = "Contact: " + (callLog.getContactName() != null ? callLog.getContactName() : "Unknown") + "\n" +
                        "Phone: " + callLog.getPhoneNumber() + "\n" +
                        "Type: " + formatCallType(callLog.getCallType()) + "\n" +
                        "Duration: " + callLog.getFormattedDuration() + "\n" +
                        "Date: " + formatTimestamp(callLog.getTimestamp()) + "\n" +
                        "Status: " + formatCallStatus(callLog.getCallStatus());

        new MaterialAlertDialogBuilder(getContext())
            .setTitle("Call Details")
            .setMessage(details)
            .setPositiveButton("OK", null)
            .setNeutralButton("Create Ticket", (dialog, which) -> {
                if (permissionManager != null && permissionManager.canCreateContacts()) {
                    createTicketFromCallLog(callLog);
                }
            })
            .show();
    }

    private void createTicketFromCallLog(CallLog callLog) {
        Log.d(TAG, "Creating ticket from call log: " + callLog.getPhoneNumber());

        Ticket ticket = new Ticket();
        ticket.setPhoneNumber(callLog.getPhoneNumber());
        ticket.setContactName(callLog.getContactName() != null ? callLog.getContactName() : callLog.getPhoneNumber());
        ticket.setCallType(callLog.getCallType());
        ticket.setCallDuration(callLog.getDuration());
        ticket.setCallDate(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()).format(new Date(callLog.getTimestamp())));
        ticket.setCallLogId(callLog.getId());

        ticket.setLeadSource("phone_call");
        ticket.setLeadStatus("new");
        ticket.setStage("prospect");
        ticket.setPriority("medium");
        ticket.setInterestLevel("warm");

        if (currentUser != null) {
            ticket.setOrganizationId(currentUser.getOrganizationId());
            ticket.setAssignedAgent(currentUser.getId());
            ticket.setCreatedBy(currentUser.getId());
        }

        if (swipeRefreshLayout != null) swipeRefreshLayout.setRefreshing(true);

        ticketService.createTicket(ticket, new TicketService.TicketCallback<Ticket>() {
            @Override
            public void onSuccess(Ticket createdTicket) {
                if (swipeRefreshLayout != null) swipeRefreshLayout.setRefreshing(false);

                Log.d(TAG, "Ticket created successfully: " + createdTicket.getTicketId());
                if (getContext() != null) {
                    Toast.makeText(getContext(), "Ticket created successfully", Toast.LENGTH_SHORT).show();

                    Intent intent = new Intent(getContext(), TicketDetailsActivity.class);
                    intent.putExtra("ticketId", createdTicket.getId());
                    intent.putExtra("mode", "view");
                    startActivity(intent);
                }
            }

            @Override
            public void onError(String error) {
                if (swipeRefreshLayout != null) swipeRefreshLayout.setRefreshing(false);

                Log.e(TAG, "Failed to create ticket: " + error);
                if (getContext() != null) {
                    Toast.makeText(getContext(), "Failed to create ticket: " + error, Toast.LENGTH_LONG).show();
                }
            }
        });
    }

    private void callPhoneNumber(String phoneNumber) {
        if (phoneNumber != null && !phoneNumber.isEmpty() && getContext() != null) {
            Intent intent = new Intent(Intent.ACTION_DIAL);
            intent.setData(android.net.Uri.parse("tel:" + phoneNumber));
            startActivity(intent);
        }
    }

    private void sendSms(String phoneNumber) {
        if (phoneNumber != null && !phoneNumber.isEmpty() && getContext() != null) {
            Intent intent = new Intent(Intent.ACTION_SENDTO);
            intent.setData(android.net.Uri.parse("smsto:" + phoneNumber));
            startActivity(intent);
        }
    }

    private String formatCallType(String callType) {
        if (callType == null) return "Unknown";
        switch (callType.toLowerCase()) {
            case "incoming": return "Incoming";
            case "outgoing": return "Outgoing";
            case "missed": return "Missed";
            case "rejected": return "Rejected";
            case "blocked": return "Blocked";
            default: return callType;
        }
    }

    private String formatCallStatus(String status) {
        if (status == null) return "Unknown";
        switch (status.toLowerCase()) {
            case "completed": return "Completed";
            case "missed": return "Missed";
            case "declined": return "Declined";
            case "busy": return "Busy";
            case "blocked": return "Blocked";
            default: return status;
        }
    }

    private String formatTimestamp(long timestamp) {
        if (timestamp <= 0) return "Unknown";
        try {
            Date date = new Date(timestamp);
            SimpleDateFormat format = new SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault());
            return format.format(date);
        } catch (Exception e) {
            return "Unknown";
        }
    }

    private User getCurrentUser() {
        if (tokenManager != null) {
            return tokenManager.getUser();
        }
        return null;
    }

    @Override
    public void onResume() {
        super.onResume();
        if (adapter != null) {
            callLogsList.clear();
            loadCallLogs();
        }
    }

    public void refreshCallLogs() {
        callLogsList.clear();
        loadCallLogs();
    }
}
