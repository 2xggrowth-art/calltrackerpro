import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  TicketIcon,
  PhoneIcon,
  Squares2X2Icon,
  BellIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common';

const Sidebar = ({ open, setOpen }) => {
  const { 
    user, 
    logout, 
    getUserRole,
    isSuperAdmin,
    canViewAllTickets,
    canViewAnalytics
  } = useAuth();
  const location = useLocation();
  const userRole = getUserRole();

  // Role-based navigation
  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon }
    ];

    const crmNav = [
      {
        name: 'CRM',
        children: [
          { 
            name: 'Tickets', 
            href: '/dashboard/crm/tickets', 
            icon: TicketIcon,
            show: canViewAllTickets() || userRole === 'viewer'
          },
          { 
            name: 'Kanban Board', 
            href: '/dashboard/crm/kanban', 
            icon: Squares2X2Icon,
            show: canViewAllTickets()
          },
          { 
            name: 'Call Logs', 
            href: '/dashboard/crm/calls', 
            icon: PhoneIcon,
            show: true
          },
          { 
            name: 'Analytics', 
            href: '/dashboard/crm/analytics', 
            icon: ChartBarIcon,
            show: canViewAnalytics()
          }
        ]
      }
    ];

    const adminNav = [
      {
        name: 'Administration',
        children: [
          { 
            name: 'Organizations', 
            href: '/dashboard/admin/organizations', 
            icon: BuildingOfficeIcon,
            show: isSuperAdmin()
          },
          { 
            name: 'Users', 
            href: '/dashboard/admin/users', 
            icon: UsersIcon,
            show: isSuperAdmin() || userRole === 'org_admin'
          },
          { 
            name: 'Leads Management', 
            href: '/dashboard/admin/leads', 
            icon: UserGroupIcon,
            show: isSuperAdmin()
          },
          { 
            name: 'System Analytics', 
            href: '/dashboard/admin/analytics', 
            icon: ChartBarIcon,
            show: isSuperAdmin()
          },
          { 
            name: 'Settings', 
            href: '/dashboard/admin/settings', 
            icon: CogIcon,
            show: isSuperAdmin() || userRole === 'org_admin'
          }
        ]
      }
    ];

    const personalNav = [
      { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon }
    ];

    let navigation = [...baseNav, ...crmNav];
    
    if (isSuperAdmin() || userRole === 'org_admin') {
      navigation.push(...adminNav);
    }
    
    navigation.push(...personalNav);

    return navigation;
  };

  const handleLogout = async () => {
    await logout();
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 bg-primary-gradient">
        <div className="flex items-center">
          <div className="bg-white p-2 rounded-lg mr-3">
            <div className="w-6 h-6 bg-primary-gradient rounded"></div>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">CallTracker Pro</h1>
            <p className="text-white/80 text-xs">
              {userRole === 'super_admin' ? 'Super Admin' :
               userRole === 'org_admin' ? 'Org Admin' :
               userRole === 'manager' ? 'Manager' :
               userRole === 'agent' ? 'Agent' : 'Viewer'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {getNavigation().map((item) => {
          if (item.children) {
            // Section with children
            return (
              <div key={item.name} className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {item.name}
                </div>
                {item.children
                  .filter(child => child.show !== false)
                  .map((child) => {
                    const isActive = location.pathname === child.href || location.pathname.startsWith(child.href + '/');
                    return (
                      <NavLink
                        key={child.name}
                        to={child.href}
                        onClick={() => setOpen(false)}
                        className={`${
                          isActive
                            ? 'bg-primary-50 border-r-4 border-primary-500 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-3 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200`}
                      >
                        <child.icon
                          className={`${
                            isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                          } mr-3 h-5 w-5 transition-colors duration-200`}
                        />
                        {child.name}
                      </NavLink>
                    );
                  })}
              </div>
            );
          } else {
            // Single navigation item
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setOpen(false)}
                className={`${
                  isActive
                    ? 'bg-primary-50 border-r-4 border-primary-500 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-3 text-sm font-medium rounded-l-lg transition-colors duration-200`}
              >
                <item.icon
                  className={`${
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-5 w-5 transition-colors duration-200`}
                />
                {item.name}
              </NavLink>
            );
          }
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center mb-4">
          <div className="bg-primary-100 rounded-full p-2 mr-3">
            <UsersIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullName || user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'user@calltrackerpro.com'}
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-center"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </Transition.Child>
                
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white">
                  <SidebarContent />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;