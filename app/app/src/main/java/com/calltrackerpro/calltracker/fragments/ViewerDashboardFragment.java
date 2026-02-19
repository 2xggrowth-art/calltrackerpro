package com.calltrackerpro.calltracker.fragments;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.calltrackerpro.calltracker.R;
import com.calltrackerpro.calltracker.models.User;
import com.calltrackerpro.calltracker.utils.PermissionManager;
import com.calltrackerpro.calltracker.utils.RetrofitClient;
import com.calltrackerpro.calltracker.utils.TokenManager;
import com.calltrackerpro.calltracker.services.ApiService;
import com.calltrackerpro.calltracker.activities.UnifiedDashboardActivity;

public class ViewerDashboardFragment extends Fragment implements UnifiedDashboardActivity.DashboardFragment {
    private static final String TAG = "ViewerDashboard";

    private TokenManager tokenManager;
    private ApiService apiService;
    private PermissionManager permissionManager;
    private User currentUser;
    private boolean isDataLoaded = false;

    // UI Components
    private TextView welcomeTextView;
    private TextView accessLevelTextView;
    private TextView dataStatsTextView;
    private TextView viewOnlyNoticeTextView;
    private RecyclerView assignedDataRecyclerView;
    private RecyclerView recentCallsRecyclerView;

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
        return inflater.inflate(R.layout.fragment_viewer_dashboard, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        try {
            initializeViews(view);
            updateUIForViewerRole();
        } catch (Exception e) {
            Log.e(TAG, "Error in onViewCreated: " + e.getMessage(), e);
        }
    }

    private void initializeViews(View view) {
        welcomeTextView = view.findViewById(R.id.tvWelcome);
        accessLevelTextView = view.findViewById(R.id.tvAccessLevel);
        dataStatsTextView = view.findViewById(R.id.tvDataStats);
        viewOnlyNoticeTextView = view.findViewById(R.id.tvViewOnlyNotice);
        assignedDataRecyclerView = view.findViewById(R.id.recyclerAssignedData);
        recentCallsRecyclerView = view.findViewById(R.id.recyclerRecentCalls);

        if (assignedDataRecyclerView != null && getContext() != null) {
            assignedDataRecyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        }
        if (recentCallsRecyclerView != null && getContext() != null) {
            recentCallsRecyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        }
    }

    private void updateUIForViewerRole() {
        if (currentUser != null) {
            if (welcomeTextView != null) welcomeTextView.setText("Welcome, " + currentUser.getFirstName());
            if (accessLevelTextView != null) accessLevelTextView.setText("Access Level: Viewer (Read-Only)");
            if (viewOnlyNoticeTextView != null) {
                viewOnlyNoticeTextView.setText("You have read-only access to assigned data. Contact your administrator for additional permissions.");
                viewOnlyNoticeTextView.setVisibility(View.VISIBLE);
            }
        }
        isDataLoaded = true;
    }

    @Override
    public void refreshData() {
        isDataLoaded = false;
        updateUIForViewerRole();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (!isDataLoaded && isAdded() && getContext() != null) {
            updateUIForViewerRole();
        }
    }
}
