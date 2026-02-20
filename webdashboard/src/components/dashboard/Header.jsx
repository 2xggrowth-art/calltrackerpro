import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common';
import OrganizationSwitcher from '../common/OrganizationSwitcher';
import { notificationService } from '../../services/notificationService';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Get proper display name and role
  const displayName = user?.name ||
                     (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : null) ||
                     user?.firstName?.trim() ||
                     user?.email?.split('@')[0] ||
                     'User';

  const displayRole = user?.role ?
                     user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                     'Unknown Role';

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New organization registered', time: '5 minutes ago', unread: true },
    { id: 2, title: 'System backup completed', time: '1 hour ago', unread: false },
    { id: 3, title: 'Monthly report available', time: '2 hours ago', unread: false },
  ]);

  useEffect(() => {
    notificationService.getNotifications({ limit: 5 })
      .then(response => {
        if (response?.data?.length > 0) {
          setNotifications(response.data.map(n => ({
            id: n._id || n.id,
            title: n.title || n.message,
            time: n.createdAt ? new Date(n.createdAt).toLocaleString() : '',
            unread: !n.isRead
          })));
        }
      })
      .catch(() => { /* keep fallback mock data */ });
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={onMenuClick}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" />

      {/* Search */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3" />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Search tickets, contacts..."
            type="search"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Organization Switcher */}
          <div className="hidden sm:block">
            <OrganizationSwitcher className="w-64" />
          </div>

          {/* Notifications */}
          <Menu as="div" className="relative">
            <MenuButton className="relative p-2 text-gray-400 hover:text-gray-500">
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              )}
            </MenuButton>

            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 z-10 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">Notifications</p>
                </div>

                {notifications.map((notification) => (
                  <MenuItem key={notification.id}>
                    {({ active }) => (
                      <div className={`${active ? 'bg-gray-50' : ''} px-4 py-3 cursor-pointer`}>
                        <div className="flex items-start">
                          <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                            notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </MenuItem>
                ))}

                <div className="px-4 py-2 border-t border-gray-100">
                  <Link to="/dashboard/notifications">
                    <Button variant="ghost" size="sm" className="w-full text-center">
                      View all notifications
                    </Button>
                  </Link>
                </div>
              </MenuItems>
            </Transition>
          </Menu>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center gap-x-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50 rounded-lg px-3 py-2">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-1" aria-hidden="true">
                  {displayName}
                </span>
              </span>
            </MenuButton>

            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'No email'}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">{displayRole}</p>
                </div>

                <MenuItem>
                  {({ active }) => (
                    <Link
                      to="/dashboard/admin/settings"
                      className={`${active ? 'bg-gray-50' : ''} flex items-center px-3 py-2 text-sm text-gray-700`}
                    >
                      <CogIcon className="mr-3 h-4 w-4 text-gray-400" />
                      Settings
                    </Link>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${active ? 'bg-gray-50' : ''} flex w-full items-center px-3 py-2 text-sm text-gray-700`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4 text-gray-400" />
                      Sign out
                    </button>
                  )}
                </MenuItem>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Header;
