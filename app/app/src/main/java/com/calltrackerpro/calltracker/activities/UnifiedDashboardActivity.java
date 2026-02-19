package com.calltrackerpro.calltracker.activities;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;
import com.calltrackerpro.calltracker.R;
import com.calltrackerpro.calltracker.fragments.*;
import com.calltrackerpro.calltracker.models.User;
import com.calltrackerpro.calltracker.utils.PermissionManager;
import com.calltrackerpro.calltracker.utils.TokenManager;
import com.calltrackerpro.calltracker.utils.WebSocketManager;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationBarView;
import com.google.gson.JsonObject;
import java.util.ArrayList;

public class UnifiedDashboardActivity extends AppCompatActivity {
    private static final String TAG = "UnifiedDashboard";
    private static final int PERMISSION_REQUEST_CODE = 100;

    private TokenManager tokenManager;
    private PermissionManager permissionManager;
    private WebSocketManager webSocketManager;
    private User currentUser;
    private BottomNavigationView bottomNavigation;
    private FragmentManager fragmentManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_unified_dashboard);

        // Initialize managers
        initializeManagers();

        // Verify authentication
        if (!verifyAuthentication()) {
            return;
        }

        // Request all needed permissions
        requestAllPermissions();

        // Setup UI components
        setupUI();

        // Setup back press handling
        setupBackPressHandler();

        // Initialize WebSocket connection
        initializeWebSocket();

        // Load initial dashboard
        loadInitialDashboard();

        Log.d(TAG, "Unified Dashboard initialized for user: " + currentUser.getEmail() +
                   " with role: " + currentUser.getRole());
    }

    private void initializeManagers() {
        tokenManager = new TokenManager(this);
        webSocketManager = WebSocketManager.getInstance(this);
    }

    private boolean verifyAuthentication() {
        if (!tokenManager.isLoggedIn()) {
            redirectToLogin();
            return false;
        }

        currentUser = tokenManager.getUser();
        if (currentUser == null) {
            Log.e(TAG, "User data not found, redirecting to login");
            redirectToLogin();
            return false;
        }

        try {
            permissionManager = new PermissionManager(currentUser);
        } catch (Exception e) {
            Log.e(TAG, "Error creating PermissionManager: " + e.getMessage());
            redirectToLogin();
            return false;
        }

        return true;
    }

    private void setupUI() {
        // Setup toolbar
        setSupportActionBar(findViewById(R.id.toolbar));
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("CallTracker Pro");
            getSupportActionBar().setSubtitle(currentUser.getFullName() + " (" + currentUser.getRoleDisplayName() + ")");
        }

        // Setup bottom navigation
        bottomNavigation = findViewById(R.id.bottom_navigation);
        fragmentManager = getSupportFragmentManager();

        // Configure bottom navigation based on user role
        setupRoleBasedNavigation();

        bottomNavigation.setOnItemSelectedListener(navigationItemSelectedListener);

        // Sync bottom nav when fragments pop from back stack
        fragmentManager.addOnBackStackChangedListener(this::syncBottomNavToCurrentFragment);
    }

    private void setupBackPressHandler() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (fragmentManager.getBackStackEntryCount() > 0) {
                    // Pop back stack (e.g., returning from MoreMenu sub-fragment)
                    fragmentManager.popBackStack();
                    // syncBottomNavToCurrentFragment() fires via OnBackStackChangedListener
                } else {
                    Fragment current = getCurrentFragment();
                    if (isDashboardFragment(current)) {
                        showExitConfirmation();
                    } else {
                        // Return to dashboard
                        bottomNavigation.setSelectedItemId(R.id.nav_dashboard);
                    }
                }
            }
        });
    }

    private boolean isDashboardFragment(Fragment fragment) {
        return fragment instanceof DashboardFragment;
    }

    private void syncBottomNavToCurrentFragment() {
        bottomNavigation.post(() -> {
            Fragment current = getCurrentFragment();
            if (current == null) return;

            // Temporarily remove listener to prevent re-triggering
            bottomNavigation.setOnItemSelectedListener(null);

            if (isDashboardFragment(current)) {
                bottomNavigation.setSelectedItemId(R.id.nav_dashboard);
            } else if (current instanceof EnhancedTicketsFragment) {
                bottomNavigation.setSelectedItemId(R.id.nav_tickets);
            } else if (current instanceof CallLogsFragment) {
                bottomNavigation.setSelectedItemId(R.id.nav_calls);
            } else if (current instanceof MoreMenuFragment) {
                bottomNavigation.setSelectedItemId(R.id.nav_more);
            }
            // For MoreMenu sub-fragments, keep "More" selected

            bottomNavigation.setOnItemSelectedListener(navigationItemSelectedListener);
        });
    }

    private void setupRoleBasedNavigation() {
        Menu menu = bottomNavigation.getMenu();

        // Show/hide menu items based on role and permissions
        MenuItem analyticsItem = menu.findItem(R.id.nav_analytics);
        MenuItem moreItem = menu.findItem(R.id.nav_more);

        if (analyticsItem != null) {
            analyticsItem.setVisible(permissionManager.canViewAnalytics());
        }

        // Always show more for additional features
        if (moreItem != null) {
            moreItem.setVisible(true);
        }

        Log.d(TAG, "Navigation configured for role: " + currentUser.getRole());
    }

    private void initializeWebSocket() {
        // Setup WebSocket event listeners
        webSocketManager.addEventListener("dashboard", this::handleDashboardEvent);
        webSocketManager.addEventListener("tickets", this::handleTicketEvent);
        webSocketManager.addEventListener("users", this::handleUserEvent);
        webSocketManager.addEventListener("calls", this::handleCallEvent);

        // Connect WebSocket
        webSocketManager.connect();
    }

    private void handleDashboardEvent(String eventType, JsonObject data) {
        Log.d(TAG, "Dashboard event received: " + eventType);
        runOnUiThread(() -> {
            Fragment currentFragment = getCurrentFragment();
            if (currentFragment instanceof DashboardFragment) {
                ((DashboardFragment) currentFragment).refreshData();
            }
        });
    }

    private void handleTicketEvent(String eventType, JsonObject data) {
        Log.d(TAG, "Ticket event received: " + eventType);
        runOnUiThread(() -> {
            Fragment currentFragment = getCurrentFragment();
            if (currentFragment instanceof TicketsFragment) {
                ((TicketsFragment) currentFragment).refreshTickets();
            } else if (currentFragment instanceof EnhancedTicketsFragment) {
                ((EnhancedTicketsFragment) currentFragment).refreshTickets();
            }

            // Show notification for ticket assignments
            if ("ticket_assigned".equals(eventType)) {
                String assignedTo = data.has("assignedTo") ? data.get("assignedTo").getAsString() : "";
                if (currentUser.getId().equals(assignedTo)) {
                    String ticketTitle = data.has("title") ? data.get("title").getAsString() : "New ticket";
                    Toast.makeText(this, "New ticket assigned: " + ticketTitle, Toast.LENGTH_LONG).show();
                }
            }
        });
    }

    private void handleUserEvent(String eventType, JsonObject data) {
        Log.d(TAG, "User event received: " + eventType);
        runOnUiThread(() -> {
            Fragment currentFragment = getCurrentFragment();
            if (currentFragment instanceof UserManagementFragment) {
                ((UserManagementFragment) currentFragment).refreshUsers();
            }
        });
    }

    private void handleCallEvent(String eventType, JsonObject data) {
        Log.d(TAG, "Call event received: " + eventType);
        runOnUiThread(() -> {
            Fragment currentFragment = getCurrentFragment();
            if (currentFragment instanceof CallLogsFragment) {
                ((CallLogsFragment) currentFragment).refreshCallLogs();
            }
        });
    }

    private void loadInitialDashboard() {
        Fragment initialFragment = getDashboardFragment();
        if (initialFragment != null) {
            loadFragment(initialFragment);
            bottomNavigation.setSelectedItemId(R.id.nav_dashboard);
        } else {
            Log.e(TAG, "Failed to create initial dashboard fragment");
            showError("Failed to load dashboard");
        }
    }

    private final NavigationBarView.OnItemSelectedListener navigationItemSelectedListener =
            item -> {
                Fragment selectedFragment = null;
                int itemId = item.getItemId();

                try {
                    if (itemId == R.id.nav_dashboard) {
                        selectedFragment = getDashboardFragment();
                    } else if (itemId == R.id.nav_tickets) {
                        selectedFragment = new EnhancedTicketsFragment();
                    } else if (itemId == R.id.nav_calls) {
                        if (permissionManager.canViewCalls()) {
                            selectedFragment = new CallLogsFragment();
                        } else {
                            showPermissionError("view calls");
                            return false;
                        }
                    } else if (itemId == R.id.nav_analytics) {
                        if (permissionManager.canViewAnalytics()) {
                            selectedFragment = getAnalyticsFragment();
                        } else {
                            showPermissionError("view analytics");
                            return false;
                        }
                    } else if (itemId == R.id.nav_more) {
                        selectedFragment = new MoreMenuFragment();
                    }

                    if (selectedFragment != null) {
                        loadFragment(selectedFragment);
                        return true;
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error handling navigation: " + e.getMessage());
                    showError("Navigation error: " + e.getMessage());
                }

                return false;
            };

    private Fragment getDashboardFragment() {
        String role = currentUser.getRole();
        switch (role) {
            case "super_admin":
                return new SuperAdminDashboardFragment();
            case "org_admin":
                return new OrgAdminDashboardFragment();
            case "manager":
                return new ManagerDashboardFragment();
            case "agent":
                return new EnhancedDashboardFragment();
            case "viewer":
                return new ViewerDashboardFragment();
            default:
                Log.w(TAG, "Unknown role: " + role + ", using enhanced dashboard");
                return new EnhancedDashboardFragment();
        }
    }

    private Fragment getUserManagementFragment() {
        if (currentUser.getRole().equals("super_admin")) {
            return new SuperAdminUsersFragment();
        } else {
            return new UserManagementFragment();
        }
    }

    private Fragment getAnalyticsFragment() {
        if (permissionManager.canViewOrgAnalytics()) {
            return new OrganizationAnalyticsFragment();
        } else if (permissionManager.canViewTeamAnalytics()) {
            return new TeamAnalyticsFragment();
        } else {
            return new IndividualAnalyticsFragment();
        }
    }

    private void loadFragment(Fragment fragment) {
        if (fragment != null) {
            // Clear back stack when switching primary tabs
            fragmentManager.popBackStackImmediate(null, FragmentManager.POP_BACK_STACK_INCLUSIVE);
            FragmentTransaction transaction = fragmentManager.beginTransaction();
            transaction.replace(R.id.fragment_container, fragment);
            transaction.commit();
        }
    }

    private Fragment getCurrentFragment() {
        return fragmentManager.findFragmentById(R.id.fragment_container);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_dashboard, menu);

        MenuItem settingsItem = menu.findItem(R.id.action_settings);
        MenuItem logoutItem = menu.findItem(R.id.action_logout);

        if (settingsItem != null) {
            settingsItem.setVisible(true);
        }

        if (logoutItem != null) {
            logoutItem.setVisible(true);
        }

        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        int itemId = item.getItemId();

        if (itemId == R.id.action_settings) {
            loadFragment(new SettingsFragment());
            return true;
        } else if (itemId == R.id.action_logout) {
            performLogout();
            return true;
        } else if (itemId == R.id.action_refresh) {
            refreshCurrentFragment();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void refreshCurrentFragment() {
        Fragment currentFragment = getCurrentFragment();
        if (currentFragment instanceof RefreshableFragment) {
            ((RefreshableFragment) currentFragment).refreshData();
        }
        Toast.makeText(this, "Refreshing...", Toast.LENGTH_SHORT).show();
    }

    private void performLogout() {
        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Logout")
                .setMessage("Are you sure you want to logout?")
                .setPositiveButton("Logout", (dialog, which) -> {
                    webSocketManager.disconnect();
                    tokenManager.clearTokens();
                    redirectToLogin();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void redirectToLogin() {
        Intent intent = new Intent(this, com.calltrackerpro.calltracker.ui.login.LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    private void showPermissionError(String action) {
        String message = "You don't have permission to " + action;
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
        Log.w(TAG, "Permission denied: " + action + " for user: " + currentUser.getEmail());
    }

    // Add method to replace fragments from dashboard buttons (with back stack)
    public void replaceFragment(Fragment fragment) {
        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        transaction.replace(R.id.fragment_container, fragment);
        transaction.addToBackStack(null);
        transaction.commit();
    }

    private void showError(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
        Log.e(TAG, message);
    }

    private void showExitConfirmation() {
        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Exit CallTracker Pro")
                .setMessage("Are you sure you want to exit?")
                .setPositiveButton("Exit", (dialog, which) -> {
                    finish();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    @Override
    protected void onResume() {
        super.onResume();

        if (!tokenManager.isLoggedIn()) {
            redirectToLogin();
            return;
        }

        if (!webSocketManager.isConnected()) {
            webSocketManager.connect();
        }

        webSocketManager.sendStatusUpdate("online");
    }

    @Override
    protected void onPause() {
        super.onPause();

        if (webSocketManager.isConnected()) {
            webSocketManager.sendStatusUpdate("away");
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        webSocketManager.removeEventListener("dashboard");
        webSocketManager.removeEventListener("tickets");
        webSocketManager.removeEventListener("users");
        webSocketManager.removeEventListener("calls");

        if (isFinishing()) {
            webSocketManager.disconnect();
        }
    }

    // ==================== RUNTIME PERMISSIONS ====================

    private void requestAllPermissions() {
        ArrayList<String> needed = new ArrayList<>();

        String[] permissions = {
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.READ_CALL_LOG,
            Manifest.permission.WRITE_CALL_LOG,
            Manifest.permission.READ_CONTACTS,
            Manifest.permission.CALL_PHONE,
            Manifest.permission.RECORD_AUDIO
        };

        for (String perm : permissions) {
            if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                needed.add(perm);
            }
        }

        // POST_NOTIFICATIONS requires API 33+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!needed.isEmpty()) {
            ActivityCompat.requestPermissions(this,
                    needed.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        } else {
            Log.d(TAG, "All permissions already granted");
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == PERMISSION_REQUEST_CODE) {
            ArrayList<String> denied = new ArrayList<>();
            for (int i = 0; i < permissions.length; i++) {
                if (grantResults[i] != PackageManager.PERMISSION_GRANTED) {
                    denied.add(permissions[i]);
                }
            }

            if (denied.isEmpty()) {
                Log.d(TAG, "All permissions granted");
                Toast.makeText(this, "All permissions granted", Toast.LENGTH_SHORT).show();
            } else {
                Log.w(TAG, "Some permissions denied: " + denied);
                Toast.makeText(this,
                    "Some permissions were denied. Call tracking may not work fully.",
                    Toast.LENGTH_LONG).show();
            }

            Fragment current = getCurrentFragment();
            if (current instanceof CallLogsFragment) {
                ((CallLogsFragment) current).refreshCallLogs();
            }
        }
    }

    // Interface for fragments that can be refreshed
    public interface RefreshableFragment {
        void refreshData();
    }

    // Interface for dashboard fragments
    public interface DashboardFragment extends RefreshableFragment {
    }
}
