package com.calltrackerpro.calltracker.fragments;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.calltrackerpro.calltracker.R;
import com.calltrackerpro.calltracker.models.User;
import com.calltrackerpro.calltracker.models.Team;
import com.calltrackerpro.calltracker.models.ApiResponse;
import com.calltrackerpro.calltracker.services.ApiService;
import com.calltrackerpro.calltracker.utils.PermissionManager;
import com.calltrackerpro.calltracker.activities.UnifiedDashboardActivity;
import com.calltrackerpro.calltracker.utils.RetrofitClient;
import com.calltrackerpro.calltracker.utils.TokenManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;

public class ManagerDashboardFragment extends Fragment implements UnifiedDashboardActivity.DashboardFragment {
    private static final String TAG = "ManagerDashboard";

    private TokenManager tokenManager;
    private ApiService apiService;
    private PermissionManager permissionManager;
    private User currentUser;
    private boolean isDataLoaded = false;

    // UI Components
    private TextView welcomeTextView;
    private TextView teamSummaryTextView;
    private TextView teamPerformanceTextView;
    private TextView monthlyTargetTextView;
    private Button manageTeamButton;
    private Button assignLeadsButton;
    private Button viewReportsButton;
    private Button inviteAgentButton;
    private RecyclerView teamMembersRecyclerView;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            if (getContext() == null) return;
            tokenManager = new TokenManager(getContext());
            apiService = RetrofitClient.getApiService();
            currentUser = tokenManager.getUser();
            if (currentUser != null) {
                permissionManager = new PermissionManager(currentUser);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in onCreate: " + e.getMessage(), e);
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_manager_dashboard, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        try {
            initializeViews(view);
            setupClickListeners();
            updateUIBasedOnPermissions();
            loadDashboardData();
        } catch (Exception e) {
            Log.e(TAG, "Error in onViewCreated: " + e.getMessage(), e);
        }
    }

    private void initializeViews(View view) {
        welcomeTextView = view.findViewById(R.id.tvWelcome);
        teamSummaryTextView = view.findViewById(R.id.tvTeamSummary);
        teamPerformanceTextView = view.findViewById(R.id.tvTeamPerformance);
        monthlyTargetTextView = view.findViewById(R.id.tvMonthlyTarget);
        manageTeamButton = view.findViewById(R.id.btnManageTeam);
        assignLeadsButton = view.findViewById(R.id.btnAssignLeads);
        viewReportsButton = view.findViewById(R.id.btnViewReports);
        inviteAgentButton = view.findViewById(R.id.btnInviteAgent);
        teamMembersRecyclerView = view.findViewById(R.id.recyclerTeamMembers);

        if (teamMembersRecyclerView != null && getContext() != null) {
            teamMembersRecyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        }
    }

    private void setupClickListeners() {
        if (manageTeamButton != null) {
            manageTeamButton.setOnClickListener(v -> {
                if (permissionManager != null && permissionManager.canManageTeamMembers()) {
                    Log.d(TAG, "Navigate to team management");
                } else {
                    showPermissionError("manage team members");
                }
            });
        }
        if (assignLeadsButton != null) {
            assignLeadsButton.setOnClickListener(v -> {
                if (permissionManager != null && permissionManager.canAssignLeads()) {
                    Log.d(TAG, "Navigate to lead assignment");
                } else {
                    showPermissionError("assign leads");
                }
            });
        }
        if (viewReportsButton != null) {
            viewReportsButton.setOnClickListener(v -> {
                if (permissionManager != null && permissionManager.canViewTeamAnalytics()) {
                    Log.d(TAG, "Navigate to team reports");
                } else {
                    showPermissionError("view team reports");
                }
            });
        }
        if (inviteAgentButton != null) {
            inviteAgentButton.setOnClickListener(v -> {
                if (permissionManager != null && permissionManager.canInviteUsers()) {
                    Log.d(TAG, "Navigate to invite agent");
                } else {
                    showPermissionError("invite users");
                }
            });
        }
    }

    private void updateUIBasedOnPermissions() {
        if (currentUser != null && welcomeTextView != null) {
            welcomeTextView.setText("Welcome, " + currentUser.getFirstName());
        }
        if (permissionManager != null) {
            if (manageTeamButton != null) manageTeamButton.setVisibility(permissionManager.canManageTeamMembers() ? View.VISIBLE : View.GONE);
            if (assignLeadsButton != null) assignLeadsButton.setVisibility(permissionManager.canAssignLeads() ? View.VISIBLE : View.GONE);
            if (viewReportsButton != null) viewReportsButton.setVisibility(permissionManager.canViewTeamAnalytics() ? View.VISIBLE : View.GONE);
            if (inviteAgentButton != null) inviteAgentButton.setVisibility(permissionManager.canInviteUsers() ? View.VISIBLE : View.GONE);
        }
    }

    private void loadDashboardData() {
        if (!isAdded() || getContext() == null) return;
        if (currentUser == null || tokenManager == null || apiService == null) return;

        try {
            String authHeader = tokenManager.getAuthHeader();
            String organizationId = currentUser.getOrganizationId();
            if (organizationId == null) return;

            Call<ApiResponse<List<Team>>> call = apiService.getTeams(authHeader, organizationId);
            call.enqueue(new Callback<ApiResponse<List<Team>>>() {
                @Override
                public void onResponse(Call<ApiResponse<List<Team>>> call, Response<ApiResponse<List<Team>>> response) {
                    if (!isAdded()) return;
                    try {
                        if (response.isSuccessful() && response.body() != null) {
                            ApiResponse<List<Team>> apiResponse = response.body();
                            if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                                List<Team> teams = apiResponse.getData();
                                isDataLoaded = true;
                                if (teamSummaryTextView != null && getActivity() != null) {
                                    getActivity().runOnUiThread(() -> {
                                        teamSummaryTextView.setText("Managing " + teams.size() + " team(s)");
                                    });
                                }
                            }
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error processing teams response: " + e.getMessage());
                    }
                }

                @Override
                public void onFailure(Call<ApiResponse<List<Team>>> call, Throwable t) {
                    Log.e(TAG, "Failed to load teams: " + t.getMessage());
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error starting dashboard load: " + e.getMessage());
        }
    }

    private void showPermissionError(String action) {
        if (isAdded() && getContext() != null) {
            Toast.makeText(getContext(), "You don't have permission to " + action, Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void refreshData() {
        isDataLoaded = false;
        loadDashboardData();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (!isDataLoaded && isAdded() && getContext() != null) {
            loadDashboardData();
        }
    }
}
