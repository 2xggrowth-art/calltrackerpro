package com.calltrackerpro.calltracker.fragments;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.calltrackerpro.calltracker.R;
import com.calltrackerpro.calltracker.activities.UnifiedDashboardActivity;
import com.calltrackerpro.calltracker.adapters.ActivityAdapter;
import com.calltrackerpro.calltracker.models.ApiResponse;
import com.calltrackerpro.calltracker.models.DashboardStats;
import com.calltrackerpro.calltracker.models.User;
import com.calltrackerpro.calltracker.services.ApiService;
import com.calltrackerpro.calltracker.utils.TokenManager;
import com.calltrackerpro.calltracker.utils.RetrofitClient;
import com.google.android.material.button.MaterialButton;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.List;
import java.util.Locale;

public class EnhancedDashboardFragment extends Fragment implements UnifiedDashboardActivity.DashboardFragment {
    private static final String TAG = "EnhancedDashboard";

    private SwipeRefreshLayout swipeRefreshLayout;
    private TextView welcomeText;
    private TextView roleText;
    private TextView callsCountText;
    private TextView ticketsCountText;
    private TextView successRateText;
    private TextView activeHoursText;
    private View organizationStatsContainer;
    private TextView totalUsersText;
    private TextView activeUsersText;
    private TextView totalTicketsText;
    private TextView subscriptionStatusText;
    private RecyclerView recentActivityRecycler;
    private ActivityAdapter activityAdapter;
    private View emptyStateView;
    private View errorStateView;
    private TextView errorMessageText;
    private MaterialButton retryButton;
    private MaterialButton refreshActivityButton;
    private View performanceContainer;
    private TextView conversionRateText;
    private TextView avgCallDurationText;
    private TextView responseTimeText;
    private TextView customerSatisfactionText;

    private TokenManager tokenManager;
    private ApiService apiService;
    private User currentUser;
    private boolean isDataLoaded = false;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_enhanced_dashboard, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        try {
            initializeServices();
            initializeViews(view);
            setupRecyclerView();
            setDefaultValues();
            loadDashboardData();
        } catch (Exception e) {
            Log.e(TAG, "Error in onViewCreated: " + e.getMessage(), e);
        }
    }

    private void initializeServices() {
        if (getContext() == null) return;
        tokenManager = new TokenManager(getContext());
        apiService = RetrofitClient.getApiService();
        currentUser = tokenManager.getUser();
    }

    private void initializeViews(View view) {
        swipeRefreshLayout = view.findViewById(R.id.swipe_refresh_layout);
        welcomeText = view.findViewById(R.id.tv_welcome);
        roleText = view.findViewById(R.id.tv_role);
        callsCountText = view.findViewById(R.id.tv_calls_count);
        ticketsCountText = view.findViewById(R.id.tv_tickets_count);
        successRateText = view.findViewById(R.id.tv_success_rate);
        activeHoursText = view.findViewById(R.id.tv_active_hours);
        organizationStatsContainer = view.findViewById(R.id.organization_stats_container);
        totalUsersText = view.findViewById(R.id.tv_total_users);
        activeUsersText = view.findViewById(R.id.tv_active_users);
        totalTicketsText = view.findViewById(R.id.tv_total_tickets);
        subscriptionStatusText = view.findViewById(R.id.tv_subscription_status);
        recentActivityRecycler = view.findViewById(R.id.recycler_recent_activity);
        emptyStateView = view.findViewById(R.id.empty_state_view);
        errorStateView = view.findViewById(R.id.error_state_view);
        errorMessageText = view.findViewById(R.id.tv_error_message);
        retryButton = view.findViewById(R.id.btn_retry);
        refreshActivityButton = view.findViewById(R.id.btn_refresh_activity);
        performanceContainer = view.findViewById(R.id.performance_container);
        conversionRateText = view.findViewById(R.id.tv_conversion_rate);
        avgCallDurationText = view.findViewById(R.id.tv_avg_call_duration);
        responseTimeText = view.findViewById(R.id.tv_response_time);
        customerSatisfactionText = view.findViewById(R.id.tv_customer_satisfaction);

        if (swipeRefreshLayout != null) {
            swipeRefreshLayout.setOnRefreshListener(this::refreshData);
        }

        // Wire up retry button
        if (retryButton != null) {
            retryButton.setOnClickListener(v -> {
                hideErrorState();
                refreshData();
            });
        }

        // Wire up refresh activity button
        if (refreshActivityButton != null) {
            refreshActivityButton.setOnClickListener(v -> refreshData());
        }

        // Show/hide organization stats based on role
        if (organizationStatsContainer != null) {
            boolean showOrgStats = currentUser != null &&
                (currentUser.isOrganizationAdmin() || "super_admin".equals(currentUser.getRole()));
            organizationStatsContainer.setVisibility(showOrgStats ? View.VISIBLE : View.GONE);
        }

        // Hide performance metrics for agents (show for managers/admins)
        if (performanceContainer != null && currentUser != null) {
            boolean showPerformance = !currentUser.isAgent() && !currentUser.isViewer();
            performanceContainer.setVisibility(showPerformance ? View.VISIBLE : View.GONE);
        }
    }

    private void setDefaultValues() {
        if (currentUser != null) {
            if (welcomeText != null) welcomeText.setText("Welcome, " + currentUser.getFullName());
            if (roleText != null) roleText.setText(currentUser.getRoleDisplayName());
        }

        if (callsCountText != null) callsCountText.setText("0");
        if (ticketsCountText != null) ticketsCountText.setText("0");
        if (successRateText != null) successRateText.setText("--");
        if (activeHoursText != null) activeHoursText.setText("--");
        if (conversionRateText != null) conversionRateText.setText("--");
        if (avgCallDurationText != null) avgCallDurationText.setText("--");
        if (responseTimeText != null) responseTimeText.setText("--");
        if (customerSatisfactionText != null) customerSatisfactionText.setText("--");

        if (recentActivityRecycler != null) recentActivityRecycler.setVisibility(View.GONE);
        if (emptyStateView != null) emptyStateView.setVisibility(View.VISIBLE);
    }

    private void setupRecyclerView() {
        if (getContext() == null || recentActivityRecycler == null) return;
        try {
            activityAdapter = new ActivityAdapter(getContext());
            recentActivityRecycler.setLayoutManager(new LinearLayoutManager(getContext()));
            recentActivityRecycler.setAdapter(activityAdapter);
            activityAdapter.setOnItemClickListener(this::handleActivityItemClick);
        } catch (Exception e) {
            Log.e(TAG, "Error setting up RecyclerView: " + e.getMessage());
        }
    }

    private void loadDashboardData() {
        if (!isAdded() || getContext() == null) return;
        if (tokenManager == null || apiService == null) return;
        if (!tokenManager.isLoggedIn() || currentUser == null) return;

        if (swipeRefreshLayout != null) {
            swipeRefreshLayout.setRefreshing(true);
        }

        try {
            String token = tokenManager.getAuthHeader();
            String organizationId = currentUser.getOrganizationId();

            Call<ApiResponse<DashboardStats>> call = apiService.getDashboardStats(token, organizationId, "today");
            call.enqueue(new Callback<ApiResponse<DashboardStats>>() {
                @Override
                public void onResponse(Call<ApiResponse<DashboardStats>> call, Response<ApiResponse<DashboardStats>> response) {
                    if (!isAdded()) return;
                    if (swipeRefreshLayout != null) swipeRefreshLayout.setRefreshing(false);

                    try {
                        if (response.isSuccessful() && response.body() != null) {
                            ApiResponse<DashboardStats> apiResponse = response.body();
                            if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                                hideErrorState();
                                updateDashboardUI(apiResponse.getData());
                                isDataLoaded = true;
                            }
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error processing dashboard response: " + e.getMessage());
                    }
                }

                @Override
                public void onFailure(Call<ApiResponse<DashboardStats>> call, Throwable t) {
                    if (!isAdded()) return;
                    if (swipeRefreshLayout != null) swipeRefreshLayout.setRefreshing(false);
                    Log.e(TAG, "Dashboard load failed: " + t.getMessage());
                    showErrorState("Unable to load dashboard. Check your connection.");
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error starting dashboard load: " + e.getMessage());
            if (swipeRefreshLayout != null) swipeRefreshLayout.setRefreshing(false);
        }
    }

    private void showErrorState(String message) {
        if (errorStateView != null) {
            errorStateView.setVisibility(View.VISIBLE);
        }
        if (errorMessageText != null) {
            errorMessageText.setText(message);
        }
    }

    private void hideErrorState() {
        if (errorStateView != null) {
            errorStateView.setVisibility(View.GONE);
        }
    }

    private void updateDashboardUI(DashboardStats stats) {
        if (stats == null || !isAdded()) return;

        try {
            DashboardStats.UserStats userStats = stats.getUserStats();
            if (userStats != null) {
                if (callsCountText != null) callsCountText.setText(String.valueOf(userStats.getTotalCalls()));
                if (ticketsCountText != null) ticketsCountText.setText(String.valueOf(userStats.getTicketsAssigned()));
                if (successRateText != null) successRateText.setText(String.format(Locale.getDefault(), "%.1f%%", userStats.getSuccessRate()));
                if (activeHoursText != null) activeHoursText.setText(userStats.getActiveHours() != null ? userStats.getActiveHours() : "0 hr");
            }

            if (organizationStatsContainer != null && organizationStatsContainer.getVisibility() == View.VISIBLE) {
                DashboardStats.OrganizationStats orgStats = stats.getOrganizationStats();
                if (orgStats != null) {
                    if (totalUsersText != null) totalUsersText.setText(String.valueOf(orgStats.getTotalUsers()));
                    if (activeUsersText != null) activeUsersText.setText(String.valueOf(orgStats.getActiveUsers()));
                    if (totalTicketsText != null) totalTicketsText.setText(String.valueOf(orgStats.getTotalTickets()));
                    if (subscriptionStatusText != null) subscriptionStatusText.setText(orgStats.getSubscriptionStatus() != null ? orgStats.getSubscriptionStatus() : "Active");
                }
            }

            if (performanceContainer != null && performanceContainer.getVisibility() == View.VISIBLE) {
                DashboardStats.PerformanceMetrics metrics = stats.getPerformanceMetrics();
                if (metrics != null) {
                    if (conversionRateText != null) conversionRateText.setText(String.format(Locale.getDefault(), "%.1f%%", metrics.getConversionRate()));
                    if (avgCallDurationText != null) avgCallDurationText.setText(String.format(Locale.getDefault(), "%.1f min", metrics.getAverageCallDuration()));
                    if (responseTimeText != null) responseTimeText.setText(String.format(Locale.getDefault(), "%.1f min", metrics.getResponseTime()));
                    if (customerSatisfactionText != null) customerSatisfactionText.setText(String.format(Locale.getDefault(), "%.1f/5", metrics.getCustomerSatisfaction()));
                }
            }

            List<DashboardStats.ActivityItem> recentActivity = stats.getRecentActivity();
            if (recentActivity != null && !recentActivity.isEmpty() && activityAdapter != null) {
                activityAdapter.updateActivities(recentActivity);
                if (recentActivityRecycler != null) recentActivityRecycler.setVisibility(View.VISIBLE);
                if (emptyStateView != null) emptyStateView.setVisibility(View.GONE);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error updating dashboard UI: " + e.getMessage());
        }
    }

    private void handleActivityItemClick(DashboardStats.ActivityItem activity) {
        if (!isAdded() || getContext() == null || activity == null) return;
        Toast.makeText(getContext(), activity.getTitle(), Toast.LENGTH_SHORT).show();
    }

    @Override
    public void refreshData() {
        isDataLoaded = false;
        loadDashboardData();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (!isDataLoaded && isAdded() && getContext() != null && swipeRefreshLayout != null) {
            loadDashboardData();
        }
    }
}
