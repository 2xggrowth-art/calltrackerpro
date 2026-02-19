package com.calltrackerpro.calltracker.fragments;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.calltrackerpro.calltracker.R;
import com.calltrackerpro.calltracker.activities.UnifiedDashboardActivity;
import com.calltrackerpro.calltracker.models.User;
import com.calltrackerpro.calltracker.utils.TokenManager;

public class MoreMenuFragment extends Fragment implements UnifiedDashboardActivity.RefreshableFragment {
    private static final String TAG = "MoreMenuFragment";

    private TokenManager tokenManager;
    private User currentUser;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_more_menu, container, false);

        Context context = getContext();
        if (context == null) return view;

        try {
            tokenManager = new TokenManager(context);
            currentUser = tokenManager.getUser();

            setupRoleBasedVisibility(view);
            setupClickListeners(view);
        } catch (Exception e) {
            Log.e(TAG, "Error setting up MoreMenuFragment: " + e.getMessage(), e);
        }

        return view;
    }

    private void setupRoleBasedVisibility(View view) {
        if (currentUser == null) return;

        View sectionAdmin = view.findViewById(R.id.section_admin);
        View menuOrganizations = view.findViewById(R.id.menu_organizations);
        View menuUsers = view.findViewById(R.id.menu_users);
        View menuTeams = view.findViewById(R.id.menu_teams);
        View menuReports = view.findViewById(R.id.menu_reports);

        boolean isSuperAdmin = "super_admin".equals(currentUser.getRole()) || currentUser.isSuperAdmin();
        boolean isOrgAdminOrManager = currentUser.isOrganizationAdmin() || currentUser.isManager();

        if (isSuperAdmin || isOrgAdminOrManager) {
            sectionAdmin.setVisibility(View.VISIBLE);

            // Organizations only for super_admin
            menuOrganizations.setVisibility(isSuperAdmin ? View.VISIBLE : View.GONE);

            // Users, Teams, Reports for admin roles
            menuUsers.setVisibility(View.VISIBLE);
            menuTeams.setVisibility(View.VISIBLE);
            menuReports.setVisibility(View.VISIBLE);
        }
    }

    private void setupClickListeners(View view) {
        view.findViewById(R.id.menu_organizations).setOnClickListener(v -> loadOrganizationsFragment());
        view.findViewById(R.id.menu_users).setOnClickListener(v -> loadUsersFragment());
        view.findViewById(R.id.menu_teams).setOnClickListener(v -> loadTeamsFragment());
        view.findViewById(R.id.menu_reports).setOnClickListener(v -> loadReportsFragment());
        view.findViewById(R.id.menu_settings).setOnClickListener(v -> loadSettingsFragment());
        view.findViewById(R.id.menu_help).setOnClickListener(v -> loadHelpFragment());
        view.findViewById(R.id.menu_about).setOnClickListener(v -> loadAboutFragment());
    }

    private void loadOrganizationsFragment() {
        replaceFragment(new OrganizationManagementFragment());
    }

    private void loadUsersFragment() {
        replaceFragment(new UserManagementFragment());
    }

    private void loadTeamsFragment() {
        replaceFragment(new TeamManagementFragment());
    }

    private void loadReportsFragment() {
        replaceFragment(new OrganizationAnalyticsFragment());
    }

    private void loadSettingsFragment() {
        replaceFragment(new SettingsFragment());
    }

    private void loadHelpFragment() {
        replaceFragment(new SettingsFragment());
    }

    private void loadAboutFragment() {
        replaceFragment(new SettingsFragment());
    }

    private void replaceFragment(Fragment fragment) {
        if (getActivity() != null && isAdded()) {
            try {
                getActivity().getSupportFragmentManager()
                    .beginTransaction()
                    .replace(R.id.fragment_container, fragment)
                    .addToBackStack(null)
                    .commit();
            } catch (Exception e) {
                Log.e(TAG, "Error replacing fragment: " + e.getMessage(), e);
            }
        }
    }

    @Override
    public void refreshData() {
        // Nothing to refresh for static menu
    }
}
