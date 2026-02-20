package com.calltrackerpro.calltracker.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.calltrackerpro.calltracker.activities.UnifiedDashboardActivity;

public class SuperAdminUsersFragment extends Fragment implements UnifiedDashboardActivity.RefreshableFragment {

    private static final int CONTAINER_ID = View.generateViewId();
    private UserManagementFragment userManagementFragment;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        // Create a container FrameLayout to host the child fragment
        FrameLayout frameLayout = new FrameLayout(requireContext());
        frameLayout.setId(CONTAINER_ID);
        frameLayout.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT));
        return frameLayout;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        if (savedInstanceState == null) {
            userManagementFragment = new UserManagementFragment();
            getChildFragmentManager().beginTransaction()
                .replace(CONTAINER_ID, userManagementFragment)
                .commit();
        } else {
            userManagementFragment = (UserManagementFragment) getChildFragmentManager()
                .findFragmentById(CONTAINER_ID);
        }
    }

    @Override
    public void refreshData() {
        // Delegate refresh to child fragment if available
    }
}