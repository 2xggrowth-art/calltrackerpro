package com.calltrackerpro.calltracker.activities;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.calltrackerpro.calltracker.R;
import com.calltrackerpro.calltracker.adapters.TicketNotesAdapter;
import com.calltrackerpro.calltracker.models.Ticket;
import com.calltrackerpro.calltracker.models.TicketNote;
import com.calltrackerpro.calltracker.models.User;
import com.calltrackerpro.calltracker.services.TicketService;
import com.calltrackerpro.calltracker.utils.PermissionManager;
import com.calltrackerpro.calltracker.utils.TokenManager;
import com.google.android.material.chip.Chip;
import com.google.android.material.floatingactionbutton.ExtendedFloatingActionButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class TicketDetailsActivity extends AppCompatActivity {
    private static final String TAG = "TicketDetailsActivity";
    
    // UI Components
    private Toolbar toolbar;
    private ProgressBar progressBar;
    private androidx.core.widget.NestedScrollView layoutContent;
    private CardView cardContactInfo;
    private CardView cardCallInfo;
    private CardView cardLeadInfo;
    private CardView cardPipelineInfo;
    private CardView cardNotes;
    
    // Contact Information - View Mode
    private TextView textContactName;
    private TextView textPhoneNumber;
    private TextView textCompany;
    private TextView textEmail;
    private ImageView buttonCall;
    private ImageView buttonSms;
    
    // Contact Information - Edit Mode
    private TextInputLayout layoutContactName;
    private TextInputLayout layoutPhoneNumber;
    private TextInputLayout layoutCompany;
    private TextInputLayout layoutEmail;
    private TextInputEditText editContactName;
    private TextInputEditText editPhoneNumber;
    private TextInputEditText editCompany;
    private TextInputEditText editEmail;
    
    // Call Information - View Mode
    private LinearLayout layoutCallTypeView;
    private LinearLayout layoutCallDurationView;
    private LinearLayout layoutCallDateView;
    private LinearLayout layoutCallQualityView;
    private TextView textCallType;
    private TextView textCallDuration;
    private TextView textCallDate;
    private TextView textCallQuality;
    
    // Call Information - Edit Mode
    private LinearLayout layoutCallTypeEdit;
    private LinearLayout layoutCallQualityEdit;
    private TextInputLayout layoutCallDuration;
    private TextInputLayout layoutCallDate;
    private Spinner spinnerCallType;
    private Spinner spinnerCallQuality;
    private TextInputEditText editCallDuration;
    private TextInputEditText editCallDate;
    
    // Lead Information - View Mode
    private LinearLayout layoutStatusChipsView;
    private LinearLayout layoutLeadDetailsView;
    private Chip chipLeadStatus;
    private Chip chipPriority;
    private Chip chipInterestLevel;
    private TextView textLeadSource;
    private TextView textBudgetRange;
    private TextView textTimeline;
    
    // Lead Information - Edit Mode
    private LinearLayout layoutLeadStatusEdit;
    private LinearLayout layoutPriorityEdit;
    private LinearLayout layoutInterestLevelEdit;
    private TextInputLayout layoutBudgetRange;
    private TextInputLayout layoutTimeline;
    private Spinner spinnerLeadStatus;
    private Spinner spinnerPriority;
    private Spinner spinnerInterestLevel;
    private TextInputEditText editBudgetRange;
    private TextInputEditText editTimeline;
    
    // Pipeline Information - View Mode
    private LinearLayout layoutPipelineDetailsView;
    private Chip chipStage;
    private TextView textAssignedAgent;
    private TextView textNextFollowUp;
    private TextView textDealValue;
    private TextView textConversionProbability;
    
    // Pipeline Information - Edit Mode
    private LinearLayout layoutStageEdit;
    private TextInputLayout layoutAssignedAgent;
    private TextInputLayout layoutNextFollowUp;
    private TextInputLayout layoutDealValue;
    private TextInputLayout layoutConversionProbability;
    private Spinner spinnerStage;
    private TextInputEditText editAssignedAgent;
    private TextInputEditText editNextFollowUp;
    private TextInputEditText editDealValue;
    private TextInputEditText editConversionProbability;
    
    // Notes Section
    private RecyclerView recyclerViewNotes;
    private TicketNotesAdapter notesAdapter;
    private TextInputEditText editTextNewNote;
    private Button buttonAddNote;
    private Button buttonAddPrivateNote;
    private LinearLayout layoutNoteButtons;
    
    // Save FAB
    private ExtendedFloatingActionButton btnSaveTicket;
    
    // Data and Services
    private TicketService ticketService;
    private TokenManager tokenManager;
    private PermissionManager permissionManager;
    private User currentUser;
    private Ticket currentTicket;
    private List<TicketNote> notesList = new ArrayList<>();
    
    // Activity Mode
    private String mode; // "view", "edit", "create"
    private String ticketId;
    private boolean isEditing = false;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ticket_details);
        
        initServices();
        getIntentData();
        initViews();
        setupToolbar();
        setupNotes();
        setupBackPressedCallback();
        
        if ("create".equals(mode)) {
            enterEditMode();
        } else if (ticketId != null) {
            loadTicketDetails();
        }
    }

    private void initServices() {
        ticketService = new TicketService(this);
        tokenManager = new TokenManager(this);
        // TODO: Get current user from TokenManager
        currentUser = getCurrentUser();
        if (currentUser != null) {
            permissionManager = new PermissionManager(currentUser);
        }
    }

    private void getIntentData() {
        Intent intent = getIntent();
        mode = intent.getStringExtra("mode");
        ticketId = intent.getStringExtra("ticketId");
        
        if (mode == null) mode = "view";
    }

    private void initViews() {
        toolbar = findViewById(R.id.toolbar);
        progressBar = findViewById(R.id.progress_bar);
        layoutContent = findViewById(R.id.layout_content);
        
        // Cards
        cardContactInfo = findViewById(R.id.card_contact_info);
        cardCallInfo = findViewById(R.id.card_call_info);
        cardLeadInfo = findViewById(R.id.card_lead_info);
        cardPipelineInfo = findViewById(R.id.card_pipeline_info);
        cardNotes = findViewById(R.id.card_notes);
        
        // Contact Information - View Mode
        textContactName = findViewById(R.id.text_contact_name);
        textPhoneNumber = findViewById(R.id.text_phone_number);
        textCompany = findViewById(R.id.text_company);
        textEmail = findViewById(R.id.text_email);
        buttonCall = findViewById(R.id.button_call);
        buttonSms = findViewById(R.id.button_sms);
        
        // Contact Information - Edit Mode
        layoutContactName = findViewById(R.id.layout_contact_name);
        layoutPhoneNumber = findViewById(R.id.layout_phone_number);
        layoutCompany = findViewById(R.id.layout_company);
        layoutEmail = findViewById(R.id.layout_email);
        editContactName = findViewById(R.id.edit_contact_name);
        editPhoneNumber = findViewById(R.id.edit_phone_number);
        editCompany = findViewById(R.id.edit_company);
        editEmail = findViewById(R.id.edit_email);
        
        // Call Information - View Mode
        layoutCallTypeView = findViewById(R.id.layout_call_type_view);
        layoutCallDurationView = findViewById(R.id.layout_call_duration_view);
        layoutCallDateView = findViewById(R.id.layout_call_date_view);
        layoutCallQualityView = findViewById(R.id.layout_call_quality_view);
        textCallType = findViewById(R.id.text_call_type);
        textCallDuration = findViewById(R.id.text_call_duration);
        textCallDate = findViewById(R.id.text_call_date);
        textCallQuality = findViewById(R.id.text_call_quality);
        
        // Call Information - Edit Mode
        layoutCallTypeEdit = findViewById(R.id.layout_call_type_edit);
        layoutCallQualityEdit = findViewById(R.id.layout_call_quality_edit);
        layoutCallDuration = findViewById(R.id.layout_call_duration);
        layoutCallDate = findViewById(R.id.layout_call_date);
        spinnerCallType = findViewById(R.id.spinner_call_type);
        spinnerCallQuality = findViewById(R.id.spinner_call_quality);
        editCallDuration = findViewById(R.id.edit_call_duration);
        editCallDate = findViewById(R.id.edit_call_date);
        
        // Lead Information - View Mode
        layoutStatusChipsView = findViewById(R.id.layout_status_chips_view);
        layoutLeadDetailsView = findViewById(R.id.layout_lead_details_view);
        chipLeadStatus = findViewById(R.id.chip_lead_status);
        chipPriority = findViewById(R.id.chip_priority);
        chipInterestLevel = findViewById(R.id.chip_interest_level);
        textLeadSource = findViewById(R.id.text_lead_source);
        textBudgetRange = findViewById(R.id.text_budget_range);
        textTimeline = findViewById(R.id.text_timeline);
        
        // Lead Information - Edit Mode
        layoutLeadStatusEdit = findViewById(R.id.layout_lead_status_edit);
        layoutPriorityEdit = findViewById(R.id.layout_priority_edit);
        layoutInterestLevelEdit = findViewById(R.id.layout_interest_level_edit);
        layoutBudgetRange = findViewById(R.id.layout_budget_range);
        layoutTimeline = findViewById(R.id.layout_timeline);
        spinnerLeadStatus = findViewById(R.id.spinner_lead_status);
        spinnerPriority = findViewById(R.id.spinner_priority);
        spinnerInterestLevel = findViewById(R.id.spinner_interest_level);
        editBudgetRange = findViewById(R.id.edit_budget_range);
        editTimeline = findViewById(R.id.edit_timeline);
        
        // Pipeline Information - View Mode
        layoutPipelineDetailsView = findViewById(R.id.layout_pipeline_details_view);
        chipStage = findViewById(R.id.chip_stage);
        textAssignedAgent = findViewById(R.id.text_assigned_agent);
        textNextFollowUp = findViewById(R.id.text_next_follow_up);
        textDealValue = findViewById(R.id.text_deal_value);
        textConversionProbability = findViewById(R.id.text_conversion_probability);
        
        // Pipeline Information - Edit Mode
        layoutStageEdit = findViewById(R.id.layout_stage_edit);
        layoutAssignedAgent = findViewById(R.id.layout_assigned_agent);
        layoutNextFollowUp = findViewById(R.id.layout_next_follow_up);
        layoutDealValue = findViewById(R.id.layout_deal_value);
        layoutConversionProbability = findViewById(R.id.layout_conversion_probability);
        spinnerStage = findViewById(R.id.spinner_stage);
        editAssignedAgent = findViewById(R.id.edit_assigned_agent);
        editNextFollowUp = findViewById(R.id.edit_next_follow_up);
        editDealValue = findViewById(R.id.edit_deal_value);
        editConversionProbability = findViewById(R.id.edit_conversion_probability);
        
        // Notes
        recyclerViewNotes = findViewById(R.id.recycler_view_notes);
        editTextNewNote = findViewById(R.id.edit_text_new_note);
        buttonAddNote = findViewById(R.id.button_add_note);
        buttonAddPrivateNote = findViewById(R.id.button_add_private_note);
        layoutNoteButtons = findViewById(R.id.layout_note_buttons);
        
        // Save Button
        btnSaveTicket = findViewById(R.id.btn_save_ticket);
        if (btnSaveTicket != null) btnSaveTicket.setOnClickListener(v -> saveTicket());
        
        setupClickListeners();
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setDisplayShowHomeEnabled(true);
            
            String title = "create".equals(mode) ? "Create Ticket" : 
                          "edit".equals(mode) ? "Edit Ticket" : "Ticket Details";
            getSupportActionBar().setTitle(title);
        }
    }

    private void setupNotes() {
        notesAdapter = new TicketNotesAdapter(notesList);
        if (recyclerViewNotes != null) {
            recyclerViewNotes.setLayoutManager(new LinearLayoutManager(this));
            recyclerViewNotes.setAdapter(notesAdapter);
        }
    }

    private void setupClickListeners() {
        if (buttonCall != null) buttonCall.setOnClickListener(v -> makePhoneCall());
        if (buttonSms != null) buttonSms.setOnClickListener(v -> sendSms());
        if (buttonAddNote != null) buttonAddNote.setOnClickListener(v -> addNote(false));
        if (buttonAddPrivateNote != null) buttonAddPrivateNote.setOnClickListener(v -> addNote(true));

        if (chipLeadStatus != null) chipLeadStatus.setOnClickListener(v -> { if (isEditing) showStatusDialog(); });
        if (chipPriority != null) chipPriority.setOnClickListener(v -> { if (isEditing) showPriorityDialog(); });
        if (chipStage != null) chipStage.setOnClickListener(v -> { if (isEditing) showStageDialog(); });
    }

    private void loadTicketDetails() {
        showLoading(true);
        
        ticketService.getTicket(ticketId, new TicketService.TicketCallback<Ticket>() {
            @Override
            public void onSuccess(Ticket ticket) {
                showLoading(false);
                currentTicket = ticket;
                populateTicketData();
                loadTicketNotes();
            }
            
            @Override
            public void onError(String error) {
                showLoading(false);
                Log.e(TAG, "Error loading ticket: " + error);
                showErrorStateWithRetry(error);
            }
        });
    }

    private void loadTicketNotes() {
        ticketService.getTicketNotes(ticketId, new TicketService.TicketCallback<List<TicketNote>>() {
            @Override
            public void onSuccess(List<TicketNote> notes) {
                notesList.clear();
                notesList.addAll(notes);
                notesAdapter.notifyDataSetChanged();
            }
            
            @Override
            public void onError(String error) {
                Log.e(TAG, "Error loading notes: " + error);
            }
        });
    }

    private void populateTicketData() {
        if (currentTicket == null) return;

        // Contact Information with null checks
        if (textContactName != null) textContactName.setText(currentTicket.getDisplayName() != null ? currentTicket.getDisplayName() : "Unknown Contact");
        if (textPhoneNumber != null) textPhoneNumber.setText(currentTicket.getPhoneNumber() != null ? currentTicket.getPhoneNumber() : "No phone");
        if (textCompany != null) textCompany.setText(currentTicket.getCompany() != null ? currentTicket.getCompany() : "No company");
        if (textEmail != null) textEmail.setText(currentTicket.getEmail() != null ? currentTicket.getEmail() : "No email");

        // Call Information
        if (textCallType != null) textCallType.setText(formatCallType(currentTicket.getCallType()));
        if (textCallDuration != null) textCallDuration.setText(currentTicket.getFormattedDuration());
        if (textCallDate != null) textCallDate.setText(formatDate(currentTicket.getCallDate()));
        if (textCallQuality != null) textCallQuality.setText(formatCallQuality(currentTicket.getCallQuality()));

        // Lead Information
        if (chipLeadStatus != null) chipLeadStatus.setText(currentTicket.getLeadStatusDisplayName());
        if (chipPriority != null) chipPriority.setText(currentTicket.getPriorityDisplayName());
        if (chipInterestLevel != null) chipInterestLevel.setText(formatInterestLevel(currentTicket.getInterestLevel()));
        if (textLeadSource != null) textLeadSource.setText(formatLeadSource(currentTicket.getLeadSource()));
        if (textBudgetRange != null) textBudgetRange.setText(currentTicket.getBudgetRange());
        if (textTimeline != null) textTimeline.setText(currentTicket.getTimeline());

        // Pipeline Information
        if (chipStage != null) chipStage.setText(currentTicket.getStageDisplayName());
        if (textAssignedAgent != null) textAssignedAgent.setText(formatAssignedAgent(currentTicket.getAssignedAgent()));
        if (textNextFollowUp != null) textNextFollowUp.setText(formatDate(currentTicket.getNextFollowUp()));
        if (textDealValue != null) textDealValue.setText(formatDealValue(currentTicket.getDealValue()));
        if (textConversionProbability != null) textConversionProbability.setText(formatProbability(currentTicket.getConversionProbability()));

        // Update chip styles based on values
        updateChipStyles();
    }

    private void updateChipStyles() {
        // TODO: Apply different colors/styles based on status, priority, stage
    }

    private void makePhoneCall() {
        if (currentTicket != null && currentTicket.getPhoneNumber() != null) {
            Intent intent = new Intent(Intent.ACTION_DIAL);
            intent.setData(Uri.parse("tel:" + currentTicket.getPhoneNumber()));
            startActivity(intent);
        }
    }

    private void sendSms() {
        if (currentTicket != null && currentTicket.getPhoneNumber() != null) {
            Intent intent = new Intent(Intent.ACTION_SENDTO);
            intent.setData(Uri.parse("smsto:" + currentTicket.getPhoneNumber()));
            startActivity(intent);
        }
    }

    private void addNote(boolean isPrivate) {
        String noteText = editTextNewNote.getText().toString().trim();
        if (noteText.isEmpty()) {
            Toast.makeText(this, "Please enter a note", Toast.LENGTH_SHORT).show();
            return;
        }
        
        if (currentUser == null) {
            Toast.makeText(this, "User session expired. Please login again.", Toast.LENGTH_SHORT).show();
            return;
        }
        
        TicketNote note = new TicketNote(noteText, currentUser.getId(), isPrivate);
        note.setAuthorName(currentUser.getFullName());
        note.setTimestamp(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()).format(new Date()));
        
        if (ticketId == null) {
            Toast.makeText(this, "Cannot add note: ticket not saved yet", Toast.LENGTH_SHORT).show();
            return;
        }

        ticketService.addTicketNote(ticketId, note, new TicketService.TicketCallback<TicketNote>() {
            @Override
            public void onSuccess(TicketNote addedNote) {
                notesList.add(0, addedNote); // Add to top
                notesAdapter.notifyItemInserted(0);
                editTextNewNote.setText("");
                Toast.makeText(TicketDetailsActivity.this, "Note added successfully", Toast.LENGTH_SHORT).show();
            }
            
            @Override
            public void onError(String error) {
                Log.e(TAG, "Error adding note: " + error);
                Toast.makeText(TicketDetailsActivity.this, "Error adding note: " + error, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showStatusDialog() {
        if (currentTicket == null) return;
        String[] statuses = {"New", "Contacted", "Qualified", "Converted", "Closed"};
        String[] statusValues = {"new", "contacted", "qualified", "converted", "closed"};

        int currentIndex = findArrayIndex(statusValues, currentTicket.getLeadStatus());
        
        new AlertDialog.Builder(this)
            .setTitle("Select Lead Status")
            .setSingleChoiceItems(statuses, currentIndex, (dialog, which) -> {
                currentTicket.setLeadStatus(statusValues[which]);
                chipLeadStatus.setText(statuses[which]);
                dialog.dismiss();
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    private void showPriorityDialog() {
        if (currentTicket == null) return;
        String[] priorities = {"High", "Medium", "Low"};
        String[] priorityValues = {"high", "medium", "low"};

        int currentIndex = findArrayIndex(priorityValues, currentTicket.getPriority());
        
        new AlertDialog.Builder(this)
            .setTitle("Select Priority")
            .setSingleChoiceItems(priorities, currentIndex, (dialog, which) -> {
                currentTicket.setPriority(priorityValues[which]);
                chipPriority.setText(priorities[which]);
                dialog.dismiss();
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    private void showStageDialog() {
        if (currentTicket == null) return;
        String[] stages = {"Prospect", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"};
        String[] stageValues = {"prospect", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"};

        int currentIndex = findArrayIndex(stageValues, currentTicket.getStage());
        
        new AlertDialog.Builder(this)
            .setTitle("Select Stage")
            .setSingleChoiceItems(stages, currentIndex, (dialog, which) -> {
                currentTicket.setStage(stageValues[which]);
                chipStage.setText(stages[which]);
                dialog.dismiss();
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    private int findArrayIndex(String[] array, String value) {
        for (int i = 0; i < array.length; i++) {
            if (array[i].equals(value)) {
                return i;
            }
        }
        return 0;
    }

    private void enterEditMode() {
        isEditing = true;
        invalidateOptionsMenu();

        try {
            // Show Save button
            if (btnSaveTicket != null) btnSaveTicket.setVisibility(View.VISIBLE);

            // Contact Information - Switch to edit mode
            setViewVisibility(textContactName, View.GONE);
            setViewVisibility(textPhoneNumber, View.GONE);
            setViewVisibility(textCompany, View.GONE);
            setViewVisibility(textEmail, View.GONE);
            setViewVisibility(buttonCall, View.GONE);
            setViewVisibility(buttonSms, View.GONE);

            setViewVisibility(layoutContactName, View.VISIBLE);
            setViewVisibility(layoutPhoneNumber, View.VISIBLE);
            setViewVisibility(layoutCompany, View.VISIBLE);
            setViewVisibility(layoutEmail, View.VISIBLE);

            // Call Information - Switch to edit mode
            setViewVisibility(layoutCallTypeView, View.GONE);
            setViewVisibility(layoutCallDurationView, View.GONE);
            setViewVisibility(layoutCallDateView, View.GONE);
            setViewVisibility(layoutCallQualityView, View.GONE);

            setViewVisibility(layoutCallTypeEdit, View.VISIBLE);
            setViewVisibility(layoutCallDuration, View.VISIBLE);
            setViewVisibility(layoutCallDate, View.VISIBLE);
            setViewVisibility(layoutCallQualityEdit, View.VISIBLE);

            // Lead Information - Switch to edit mode
            setViewVisibility(layoutStatusChipsView, View.GONE);
            setViewVisibility(layoutLeadDetailsView, View.GONE);

            setViewVisibility(layoutLeadStatusEdit, View.VISIBLE);
            setViewVisibility(layoutPriorityEdit, View.VISIBLE);
            setViewVisibility(layoutInterestLevelEdit, View.VISIBLE);
            setViewVisibility(layoutBudgetRange, View.VISIBLE);
            setViewVisibility(layoutTimeline, View.VISIBLE);

            // Pipeline Information - Switch to edit mode
            setViewVisibility(chipStage, View.GONE);
            setViewVisibility(layoutPipelineDetailsView, View.GONE);

            setViewVisibility(layoutStageEdit, View.VISIBLE);
            setViewVisibility(layoutAssignedAgent, View.VISIBLE);
            setViewVisibility(layoutNextFollowUp, View.VISIBLE);
            setViewVisibility(layoutDealValue, View.VISIBLE);
            setViewVisibility(layoutConversionProbability, View.VISIBLE);

            if ("create".equals(mode)) {
                currentTicket = new Ticket();
                currentTicket.setPhoneNumber("");
                currentTicket.setContactName("");
                clearEditFields();

                // Simplified create mode: hide unnecessary sections
                setViewVisibility(layoutCompany, View.GONE);
                setViewVisibility(cardCallInfo, View.GONE);
                setViewVisibility(cardPipelineInfo, View.GONE);
                // Show notes input but hide buttons and notes list
                setViewVisibility(cardNotes, View.VISIBLE);
                setViewVisibility(layoutNoteButtons, View.GONE);
                setViewVisibility(recyclerViewNotes, View.GONE);
            } else {
                populateEditFields();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error entering edit mode: " + e.getMessage(), e);
        }
    }

    private void setViewVisibility(View view, int visibility) {
        if (view != null) view.setVisibility(visibility);
    }

    private void exitEditMode() {
        isEditing = false;
        invalidateOptionsMenu();

        try {
            // Hide Save button
            setViewVisibility(btnSaveTicket, View.GONE);

            // Contact Information - Switch to view mode
            setViewVisibility(layoutContactName, View.GONE);
            setViewVisibility(layoutPhoneNumber, View.GONE);
            setViewVisibility(layoutCompany, View.GONE);
            setViewVisibility(layoutEmail, View.GONE);

            setViewVisibility(textContactName, View.VISIBLE);
            setViewVisibility(textPhoneNumber, View.VISIBLE);
            setViewVisibility(textCompany, View.VISIBLE);
            setViewVisibility(textEmail, View.VISIBLE);
            setViewVisibility(buttonCall, View.VISIBLE);
            setViewVisibility(buttonSms, View.VISIBLE);

            // Call Information - Switch to view mode
            setViewVisibility(layoutCallTypeEdit, View.GONE);
            setViewVisibility(layoutCallDuration, View.GONE);
            setViewVisibility(layoutCallDate, View.GONE);
            setViewVisibility(layoutCallQualityEdit, View.GONE);

            setViewVisibility(layoutCallTypeView, View.VISIBLE);
            setViewVisibility(layoutCallDurationView, View.VISIBLE);
            setViewVisibility(layoutCallDateView, View.VISIBLE);
            setViewVisibility(layoutCallQualityView, View.VISIBLE);

            // Lead Information - Switch to view mode
            setViewVisibility(layoutLeadStatusEdit, View.GONE);
            setViewVisibility(layoutPriorityEdit, View.GONE);
            setViewVisibility(layoutInterestLevelEdit, View.GONE);
            setViewVisibility(layoutBudgetRange, View.GONE);
            setViewVisibility(layoutTimeline, View.GONE);

            setViewVisibility(layoutStatusChipsView, View.VISIBLE);
            setViewVisibility(layoutLeadDetailsView, View.VISIBLE);

            // Pipeline Information - Switch to view mode
            setViewVisibility(layoutStageEdit, View.GONE);
            setViewVisibility(layoutAssignedAgent, View.GONE);
            setViewVisibility(layoutNextFollowUp, View.GONE);
            setViewVisibility(layoutDealValue, View.GONE);
            setViewVisibility(layoutConversionProbability, View.GONE);

            setViewVisibility(chipStage, View.VISIBLE);
            setViewVisibility(layoutPipelineDetailsView, View.VISIBLE);

            // Restore sections that were hidden in create mode
            setViewVisibility(layoutCompany, View.GONE); // stays gone in view mode (edit layout)
            setViewVisibility(textCompany, View.VISIBLE);
            setViewVisibility(cardCallInfo, View.VISIBLE);
            setViewVisibility(cardPipelineInfo, View.VISIBLE);
            setViewVisibility(cardNotes, View.VISIBLE);
            setViewVisibility(layoutNoteButtons, View.VISIBLE);
            setViewVisibility(recyclerViewNotes, View.VISIBLE);

            populateTicketData();
        } catch (Exception e) {
            Log.e(TAG, "Error exiting edit mode: " + e.getMessage(), e);
        }
    }

    private void saveTicket() {
        if (currentTicket == null) currentTicket = new Ticket();
        
        // Collect data from input fields
        if (!collectFormData()) {
            return; // Validation failed
        }
        
        showLoading(true);
        
        if ("create".equals(mode)) {
            ticketService.createTicket(currentTicket, new TicketService.TicketCallback<Ticket>() {
                @Override
                public void onSuccess(Ticket ticket) {
                    showLoading(false);
                    currentTicket = ticket;
                    ticketId = ticket.getId();
                    mode = "view";
                    exitEditMode();
                    Toast.makeText(TicketDetailsActivity.this, "Ticket created successfully", Toast.LENGTH_SHORT).show();
                }
                
                @Override
                public void onError(String error) {
                    showLoading(false);
                    Log.e(TAG, "Error creating ticket: " + error);
                    Toast.makeText(TicketDetailsActivity.this, "Error creating ticket: " + error, Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            ticketService.updateTicket(ticketId, currentTicket, new TicketService.TicketCallback<Ticket>() {
                @Override
                public void onSuccess(Ticket ticket) {
                    showLoading(false);
                    currentTicket = ticket;
                    exitEditMode();
                    Toast.makeText(TicketDetailsActivity.this, "Ticket updated successfully", Toast.LENGTH_SHORT).show();
                }
                
                @Override
                public void onError(String error) {
                    showLoading(false);
                    Log.e(TAG, "Error updating ticket: " + error);
                    Toast.makeText(TicketDetailsActivity.this, "Error updating ticket: " + error, Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

    private void showLoading(boolean show) {
        if (progressBar != null) progressBar.setVisibility(show ? View.VISIBLE : View.GONE);
        if (layoutContent != null) layoutContent.setVisibility(show ? View.GONE : View.VISIBLE);
    }

    private void showErrorStateWithRetry(String error) {
        if (layoutContent != null) layoutContent.setVisibility(View.GONE);
        if (progressBar != null) progressBar.setVisibility(View.GONE);

        new AlertDialog.Builder(this)
            .setTitle("Error Loading Ticket")
            .setMessage(error != null ? error : "Unable to load ticket details. Please check your connection.")
            .setPositiveButton("Retry", (dialog, which) -> {
                if (ticketId != null) {
                    loadTicketDetails();
                }
            })
            .setNegativeButton("Go Back", (dialog, which) -> finish())
            .setCancelable(false)
            .show();
    }

    // Formatting helper methods
    private String formatCallType(String callType) {
        if (callType == null) return "Unknown";
        switch (callType.toLowerCase()) {
            case "incoming": return "Incoming Call";
            case "outgoing": return "Outgoing Call";
            case "missed": return "Missed Call";
            default: return callType;
        }
    }

    private String formatDate(String dateString) {
        if (dateString == null || dateString.isEmpty()) return "";
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
            SimpleDateFormat outputFormat = new SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault());
            Date date = inputFormat.parse(dateString);
            return date != null ? outputFormat.format(date) : dateString;
        } catch (Exception e) {
            return dateString;
        }
    }

    private String formatCallQuality(int quality) {
        if (quality <= 0) return "Not rated";
        return quality + "/5 stars";
    }

    private String formatInterestLevel(String level) {
        if (level == null) return "Unknown";
        switch (level.toLowerCase()) {
            case "hot": return "Hot Lead";
            case "warm": return "Warm Lead";
            case "cold": return "Cold Lead";
            default: return level;
        }
    }

    private String formatLeadSource(String source) {
        if (source == null) return "Unknown";
        switch (source.toLowerCase()) {
            case "phone_call": return "Phone Call";
            case "cold_call": return "Cold Call";
            case "referral": return "Referral";
            case "website": return "Website";
            case "marketing": return "Marketing";
            default: return source;
        }
    }

    private String formatAssignedAgent(String agentId) {
        if (agentId == null || agentId.isEmpty()) return "Unassigned";
        // TODO: Get actual agent name from ID
        return "Agent: " + agentId;
    }

    private String formatDealValue(double value) {
        if (value <= 0) return "Not set";
        return String.format(Locale.getDefault(), "$%.2f", value);
    }

    private String formatProbability(int probability) {
        if (probability <= 0) return "Not set";
        return probability + "%";
    }

    private User getCurrentUser() {
        if (tokenManager != null) {
            return tokenManager.getUser();
        }
        return null;
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_ticket_details, menu);
        
        MenuItem editItem = menu.findItem(R.id.action_edit);
        MenuItem saveItem = menu.findItem(R.id.action_save);
        MenuItem deleteItem = menu.findItem(R.id.action_delete);

        if (editItem != null && saveItem != null) {
            if (isEditing) {
                editItem.setVisible(false);
                saveItem.setVisible(true);
            } else {
                editItem.setVisible(true);
                saveItem.setVisible(false);
            }
        }

        // Show delete only if user has permission and not in create mode
        if (deleteItem != null) {
            deleteItem.setVisible(!isEditing && !"create".equals(mode) &&
                                  permissionManager != null && permissionManager.canDeleteContacts());
        }
        
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        
        if (id == android.R.id.home) {
            onBackPressed();
            return true;
        } else if (id == R.id.action_edit) {
            enterEditMode();
            return true;
        } else if (id == R.id.action_save) {
            saveTicket();
            return true;
        } else if (id == R.id.action_delete) {
            showDeleteConfirmation();
            return true;
        }
        
        return super.onOptionsItemSelected(item);
    }

    private void showDeleteConfirmation() {
        new AlertDialog.Builder(this)
            .setTitle("Delete Ticket")
            .setMessage("Are you sure you want to delete this ticket? This action cannot be undone.")
            .setPositiveButton("Delete", (dialog, which) -> deleteTicket())
            .setNegativeButton("Cancel", null)
            .show();
    }

    private void deleteTicket() {
        showLoading(true);
        
        ticketService.deleteTicket(ticketId, new TicketService.TicketCallback<String>() {
            @Override
            public void onSuccess(String result) {
                showLoading(false);
                Toast.makeText(TicketDetailsActivity.this, "Ticket deleted successfully", Toast.LENGTH_SHORT).show();
                finish();
            }
            
            @Override
            public void onError(String error) {
                showLoading(false);
                Log.e(TAG, "Error deleting ticket: " + error);
                Toast.makeText(TicketDetailsActivity.this, "Error deleting ticket: " + error, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setupBackPressedCallback() {
        OnBackPressedCallback callback = new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (isEditing && "create".equals(mode)) {
                    new AlertDialog.Builder(TicketDetailsActivity.this)
                        .setTitle("Discard Changes")
                        .setMessage("Are you sure you want to discard this ticket?")
                        .setPositiveButton("Discard", (dialog, which) -> finish())
                        .setNegativeButton("Cancel", null)
                        .show();
                } else {
                    finish();
                }
            }
        };
        getOnBackPressedDispatcher().addCallback(this, callback);
    }
    
    private void clearEditFields() {
        // Clear Contact Information
        if (editContactName != null) editContactName.setText("");
        if (editPhoneNumber != null) editPhoneNumber.setText("");
        if (editCompany != null) editCompany.setText("");
        if (editEmail != null) editEmail.setText("");

        // Clear Call Information
        if (spinnerCallType != null) spinnerCallType.setSelection(0);
        if (editCallDuration != null) editCallDuration.setText("");
        if (editCallDate != null) editCallDate.setText("");
        if (spinnerCallQuality != null) spinnerCallQuality.setSelection(0);

        // Clear Lead Information
        if (spinnerLeadStatus != null) spinnerLeadStatus.setSelection(0);
        if (spinnerPriority != null) spinnerPriority.setSelection(0);
        if (spinnerInterestLevel != null) spinnerInterestLevel.setSelection(0);
        if (editBudgetRange != null) editBudgetRange.setText("");
        if (editTimeline != null) editTimeline.setText("");

        // Clear Pipeline Information
        if (spinnerStage != null) spinnerStage.setSelection(0);
        if (editAssignedAgent != null) editAssignedAgent.setText("");
        if (editNextFollowUp != null) editNextFollowUp.setText("");
        if (editDealValue != null) editDealValue.setText("");
        if (editConversionProbability != null) editConversionProbability.setText("");
    }
    
    private void populateEditFields() {
        if (currentTicket == null) return;

        // Populate Contact Information
        if (editContactName != null) editContactName.setText(currentTicket.getDisplayName() != null ? currentTicket.getDisplayName() : "");
        if (editPhoneNumber != null) editPhoneNumber.setText(currentTicket.getPhoneNumber() != null ? currentTicket.getPhoneNumber() : "");
        if (editCompany != null) editCompany.setText(currentTicket.getCompany() != null ? currentTicket.getCompany() : "");
        if (editEmail != null) editEmail.setText(currentTicket.getEmail() != null ? currentTicket.getEmail() : "");

        // Populate Call Information
        setSpinnerSelection(spinnerCallType, getCallTypeIndex(currentTicket.getCallType()));
        if (editCallDuration != null) editCallDuration.setText(String.valueOf(currentTicket.getCallDuration()));
        if (editCallDate != null) editCallDate.setText(formatDateForInput(currentTicket.getCallDate()));
        setSpinnerSelection(spinnerCallQuality, currentTicket.getCallQuality() - 1);

        // Populate Lead Information
        setSpinnerSelection(spinnerLeadStatus, getLeadStatusIndex(currentTicket.getLeadStatus()));
        setSpinnerSelection(spinnerPriority, getPriorityIndex(currentTicket.getPriority()));
        setSpinnerSelection(spinnerInterestLevel, getInterestLevelIndex(currentTicket.getInterestLevel()));
        if (editBudgetRange != null) editBudgetRange.setText(currentTicket.getBudgetRange() != null ? currentTicket.getBudgetRange() : "");
        if (editTimeline != null) editTimeline.setText(currentTicket.getTimeline() != null ? currentTicket.getTimeline() : "");

        // Populate Pipeline Information
        setSpinnerSelection(spinnerStage, getStageIndex(currentTicket.getStage()));
        if (editAssignedAgent != null) editAssignedAgent.setText(currentTicket.getAssignedAgent() != null ? currentTicket.getAssignedAgent() : "");
        if (editNextFollowUp != null) editNextFollowUp.setText(formatDateForInput(currentTicket.getNextFollowUp()));
        if (editDealValue != null) editDealValue.setText(currentTicket.getDealValue() > 0 ? String.valueOf(currentTicket.getDealValue()) : "");
        if (editConversionProbability != null) editConversionProbability.setText(currentTicket.getConversionProbability() > 0 ? String.valueOf(currentTicket.getConversionProbability()) : "");
    }
    
    private boolean collectFormData() {
        try {
            // Collect Contact Information
            if (editContactName != null) currentTicket.setContactName(editContactName.getText().toString().trim());
            if (editPhoneNumber != null) currentTicket.setPhoneNumber(editPhoneNumber.getText().toString().trim());
            if (editCompany != null) currentTicket.setCompany(editCompany.getText().toString().trim());
            if (editEmail != null) currentTicket.setEmail(editEmail.getText().toString().trim());

            // Validate required fields
            String contactName = currentTicket.getContactName() != null ? currentTicket.getContactName() : "";
            String phoneNumber = currentTicket.getPhoneNumber() != null ? currentTicket.getPhoneNumber() : "";
            if (contactName.isEmpty() && phoneNumber.isEmpty()) {
                Toast.makeText(this, "Please enter either a contact name or phone number", Toast.LENGTH_SHORT).show();
                return false;
            }

            // Collect Call Information
            String[] callTypes = getResources().getStringArray(R.array.call_types);
            if (spinnerCallType != null && spinnerCallType.getSelectedItemPosition() < callTypes.length) {
                currentTicket.setCallType(callTypes[spinnerCallType.getSelectedItemPosition()].toLowerCase());
            }

            if (editCallDuration != null) {
                String durationStr = editCallDuration.getText().toString().trim();
                if (!durationStr.isEmpty()) {
                    currentTicket.setCallDuration(Long.parseLong(durationStr));
                }
            }

            if (editCallDate != null) currentTicket.setCallDate(editCallDate.getText().toString().trim());
            if (spinnerCallQuality != null) currentTicket.setCallQuality(spinnerCallQuality.getSelectedItemPosition() + 1);

            // Collect Lead Information
            String[] leadStatuses = getResources().getStringArray(R.array.lead_status_options);
            if (spinnerLeadStatus != null && spinnerLeadStatus.getSelectedItemPosition() < leadStatuses.length) {
                currentTicket.setLeadStatus(leadStatuses[spinnerLeadStatus.getSelectedItemPosition()].toLowerCase());
            }

            String[] priorities = getResources().getStringArray(R.array.priority_options);
            if (spinnerPriority != null && spinnerPriority.getSelectedItemPosition() < priorities.length) {
                currentTicket.setPriority(priorities[spinnerPriority.getSelectedItemPosition()].toLowerCase());
            }

            String[] interestLevels = getResources().getStringArray(R.array.interest_level_options);
            if (spinnerInterestLevel != null && spinnerInterestLevel.getSelectedItemPosition() < interestLevels.length) {
                currentTicket.setInterestLevel(interestLevels[spinnerInterestLevel.getSelectedItemPosition()].toLowerCase());
            }

            if (editBudgetRange != null) currentTicket.setBudgetRange(editBudgetRange.getText().toString().trim());
            if (editTimeline != null) currentTicket.setTimeline(editTimeline.getText().toString().trim());

            // Collect Pipeline Information
            String[] stages = getResources().getStringArray(R.array.pipeline_stages);
            if (spinnerStage != null && spinnerStage.getSelectedItemPosition() < stages.length) {
                currentTicket.setStage(stages[spinnerStage.getSelectedItemPosition()].toLowerCase());
            }

            if (editAssignedAgent != null) currentTicket.setAssignedAgent(editAssignedAgent.getText().toString().trim());
            if (editNextFollowUp != null) currentTicket.setNextFollowUp(editNextFollowUp.getText().toString().trim());

            if (editDealValue != null) {
                String dealValueStr = editDealValue.getText().toString().trim();
                if (!dealValueStr.isEmpty()) {
                    currentTicket.setDealValue(Double.parseDouble(dealValueStr));
                }
            }

            if (editConversionProbability != null) {
                String conversionProbStr = editConversionProbability.getText().toString().trim();
                if (!conversionProbStr.isEmpty()) {
                    currentTicket.setConversionProbability(Integer.parseInt(conversionProbStr));
                }
            }

            return true;
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Please check numeric fields for valid values", Toast.LENGTH_SHORT).show();
            return false;
        }
    }
    
    // Helper methods for spinner selection
    private void setSpinnerSelection(Spinner spinner, int position) {
        if (spinner != null && position >= 0 && position < spinner.getCount()) {
            spinner.setSelection(position);
        }
    }
    
    private int getCallTypeIndex(String callType) {
        if (callType == null) return 0;
        String[] types = getResources().getStringArray(R.array.call_types);
        for (int i = 0; i < types.length; i++) {
            if (types[i].toLowerCase().equals(callType.toLowerCase())) {
                return i;
            }
        }
        return 0;
    }
    
    private int getLeadStatusIndex(String status) {
        if (status == null) return 0;
        String[] statuses = getResources().getStringArray(R.array.lead_status_options);
        for (int i = 0; i < statuses.length; i++) {
            if (statuses[i].toLowerCase().equals(status.toLowerCase())) {
                return i;
            }
        }
        return 0;
    }
    
    private int getPriorityIndex(String priority) {
        if (priority == null) return 0;
        String[] priorities = getResources().getStringArray(R.array.priority_options);
        for (int i = 0; i < priorities.length; i++) {
            if (priorities[i].toLowerCase().equals(priority.toLowerCase())) {
                return i;
            }
        }
        return 0;
    }
    
    private int getInterestLevelIndex(String level) {
        if (level == null) return 0;
        String[] levels = getResources().getStringArray(R.array.interest_level_options);
        for (int i = 0; i < levels.length; i++) {
            if (levels[i].toLowerCase().equals(level.toLowerCase())) {
                return i;
            }
        }
        return 0;
    }
    
    private int getStageIndex(String stage) {
        if (stage == null) return 0;
        String[] stages = getResources().getStringArray(R.array.pipeline_stages);
        for (int i = 0; i < stages.length; i++) {
            if (stages[i].toLowerCase().equals(stage.toLowerCase())) {
                return i;
            }
        }
        return 0;
    }
    
    private String formatDateForInput(String dateString) {
        if (dateString == null || dateString.isEmpty()) return "";
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault());
            SimpleDateFormat outputFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Date date = inputFormat.parse(dateString);
            return date != null ? outputFormat.format(date) : dateString;
        } catch (Exception e) {
            return dateString;
        }
    }
}