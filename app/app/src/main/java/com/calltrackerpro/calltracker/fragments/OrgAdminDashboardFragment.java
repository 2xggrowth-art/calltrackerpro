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
import com.calltrackerpro.calltracker.models.Organization;
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

public class OrgAdminDashboardFragment extends Fragment implements UnifiedDashboardActivity.DashboardFragment {
    private static final String TAG = "OrgAdminDashboard";

    private TokenManager tokenManager;
    private ApiService apiService;
    private PermissionManager permissionManager;
    private User currentUser;
    private boolean isDataLoaded = false;

    // UI Components
    private TextView welcomeTextView;
    private TextView organizationStatsTextView;
    private TextView subscriptionStatusTextView;
    private TextView userLimitTextView;
    private TextView callLimitTextView;
    private Button manageUsersButton;
    private Button manageTeamsButton;
    private Button viewAnalyticsButton;
    private Button organizationSettingsButton;
    private Button inviteManagerButton;
    private RecyclerView recentActivitiesRecyclerView;

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
        return inflater.inflate(R.layout.fragment_org_admin_dashboard, container, false);
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
        organizationStatsTextView = view.findViewById(R.id.tvOrganizationStats);
        subscriptionStatusTextView = view.findViewById(R.id.tvSubscriptionStatus);
        userLimitTextView = view.findViewById(R.id.tvUserLimit);
        callLimitTextView = view.findViewById(R.id.tvCallLimit);
        manageUsersButton = view.findViewById(R.id.btnManageUsers);
        manageTeamsButton = view.findViewById(R.id.btnManageTeams);
        viewAnalyticsButton = view.findViewById(R.id.btnViewAnalytics);
        organizationSettingsButton = view.findViewById(R.id.btnOrganizationSettings);
        inviteManagerButton = view.findViewById(R.id.btnInviteManager);
        recentActivitiesRecyclerView = view.findViewById(R.id.recyclerRecentActivities);

        if (recentActivitiesRecyclerView != null && getContext() != null) {
            recentActivitiesRecyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        }
    }

    private void setupClickListeners() {
        if (manageUsersButton != null) {
            manageUsersButton.setOnClickListener(v -> {
                if (permissionManager != null && permissionManager.canManageUsers()) {
                    navigateToUserManagement();
                } else {
                    showPermissionError("manage users");
                }
            });
        }
        if (manageTeamsButton != null) {
            manageTeamsButton.setOnClickListener(v -> {
                if (permissionManager != null && permissionManager.canManageTeams()) {
                    navigateToTeamManagement();
                } else {
                    showPermissionError("manage teams");
                }
            });
        }
        if (viewAnalyticsButton != null) {
            viewAnalyticsButton.setOnClickListener(v -> {
                if (permissionManager != null && permissionManager.canViewOrgAnalytics()) {
                    navigateToOrganizationAnalytics();
                } else {
                    showPermissionError("view organization analytics");
                }
            });
        }
        if (organizationSettingsButton != null) {
            organizationSettingsButton.setOnClickListener(v -> {
                if (permissionManager != null && permissionManager.canManageOrgSettings()) {
                    navigateToOrganizationSettings();
                } else {
                    showPermissionError("manage organization settings");
                }
            });
        }
        if (inviteManagerButton != null) {
            inviteManagerButton.setOnClickListener(v -> {
                if (permissionManager != null && permissionManager.canInviteUsers()) {
                    showInviteManagerDialog();
                } else {
                    showPermissionError("invite users");
                }
            });
        }
    }

    private void updateUIBasedOnPermissions() {
        if (currentUser != null && welcomeTextView != null) {
            String orgName = "CallTracker Pro";
            try {
                if (currentUser.getCurrentOrganization() != null &&
                    currentUser.getCurrentOrganization().getName() != null &&
                    !currentUser.getCurrentOrganization().getName().trim().isEmpty()) {
                    orgName = currentUser.getCurrentOrganization().getName();
                }
            } catch (Exception e) {
                Log.e(TAG, "Error getting org name: " + e.getMessage());
            }
            welcomeTextView.setText("Welcome to " + orgName + ", " + currentUser.getFirstName());
        }

        if (permissionManager != null) {
            if (manageUsersButton != null) manageUsersButton.setVisibility(permissionManager.canManageUsers() ? View.VISIBLE : View.GONE);
            if (manageTeamsButton != null) manageTeamsButton.setVisibility(permissionManager.canManageTeams() ? View.VISIBLE : View.GONE);
            if (viewAnalyticsButton != null) viewAnalyticsButton.setVisibility(permissionManager.canViewOrgAnalytics() ? View.VISIBLE : View.GONE);
            if (organizationSettingsButton != null) organizationSettingsButton.setVisibility(permissionManager.canManageOrgSettings() ? View.VISIBLE : View.GONE);
            if (inviteManagerButton != null) inviteManagerButton.setVisibility(permissionManager.canInviteUsers() ? View.VISIBLE : View.GONE);
        }
    }

    private void loadDashboardData() {
        if (!isAdded() || getContext() == null) return;
        if (currentUser == null || tokenManager == null || apiService == null) return;
        loadOrganizationData();
    }

    private void loadOrganizationData() {
        String authHeader = tokenManager.getAuthHeader();
        String organizationId = currentUser.getOrganizationId();
        if (organizationId == null) return;

        try {
            Call<ApiResponse<Organization>> call = apiService.getOrganization(authHeader, organizationId);
            call.enqueue(new Callback<ApiResponse<Organization>>() {
                @Override
                public void onResponse(Call<ApiResponse<Organization>> call, Response<ApiResponse<Organization>> response) {
                    if (!isAdded()) return;
                    try {
                        if (response.isSuccessful() && response.body() != null) {
                            ApiResponse<Organization> apiResponse = response.body();
                            if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                                updateOrganizationUI(apiResponse.getData());
                                isDataLoaded = true;
                            }
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error processing org response: " + e.getMessage());
                    }
                }

                @Override
                public void onFailure(Call<ApiResponse<Organization>> call, Throwable t) {
                    Log.e(TAG, "Failed to load organization data: " + t.getMessage());
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error starting org load: " + e.getMessage());
        }
    }

    private void updateOrganizationUI(Organization organization) {
        if (!isAdded() || getActivity() == null) return;
        getActivity().runOnUiThread(() -> {
            try {
                if (organization.getSubscription() != null) {
                    Organization.Subscription subscription = organization.getSubscription();
                    if (subscriptionStatusTextView != null) {
                        subscriptionStatusTextView.setText("Plan: " + subscription.getPlan() + " (" + subscription.getStatus() + ")");
                    }
                    if (userLimitTextView != null) {
                        userLimitTextView.setText("Users: " + (subscription.getUserLimit() == 0 ? "Unlimited" : String.valueOf(subscription.getUserLimit())));
                    }
                    if (callLimitTextView != null) {
                        callLimitTextView.setText("Calls: " + (subscription.getCallLimit() == 0 ? "Unlimited" : String.valueOf(subscription.getCallLimit())));
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error updating org UI: " + e.getMessage());
            }
        });
    }

    private void navigateToUserManagement() {
        if (getActivity() instanceof UnifiedDashboardActivity) {
            ((UnifiedDashboardActivity) getActivity()).replaceFragment(new UserManagementFragment());
        }
    }

    private void navigateToTeamManagement() {
        Log.d(TAG, "Navigating to team management");
    }

    private void navigateToOrganizationAnalytics() {
        if (getActivity() instanceof UnifiedDashboardActivity) {
            ((UnifiedDashboardActivity) getActivity()).replaceFragment(new OrganizationAnalyticsFragment());
        }
    }

    private void navigateToOrganizationSettings() {
        Log.d(TAG, "Navigating to organization settings");
    }

    private void showInviteManagerDialog() {
        Log.d(TAG, "Showing invite manager dialog");
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
