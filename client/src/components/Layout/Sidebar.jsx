import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Home,
  BookOpen,
  BarChart3,
  Users,
  MessageSquare,
  Clock,
  Settings,
  Shield,
} from "lucide-react";
import getAvatarUrl from "../../hooks/useGetAvatarUrl";

const Sidebar = ({ open, setOpen }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Courses", href: "courses", icon: BookOpen },
    { name: "Results", href: "exam-result/:resultId", icon: BarChart3 },
    { name: "Discussion", href: "discussion", icon: MessageSquare },
    { name: "Activities", href: "activities", icon: Clock },
  ];

  const adminNavigation = [
    { name: "Admin Dashboard", href: "admin", icon: Shield },
    { name: "Manage Courses", href: "admin/courses", icon: BookOpen },
    { name: "Manage Users", href: "admin/users", icon: Users },
    { name: "Settings", href: "admin/settings", icon: Settings },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 flex z-40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-dark-900 dark:bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 flex flex-col z-50 lg:static lg:inset-0
        transform transition duration-300 ease-in-out lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
        w-64 bg-white border-r border-gray-200 dark:bg-dark-800 dark:border-dark-600
      `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-dark-600">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
              LearnHub
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {/* Show Main Navigation ONLY IF USER IS NOT ADMIN */}
          {!isAdmin && (
            <>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
              ${
                active
                  ? "bg-primary-50 text-primary-700 border-r-2 border-primary-700 dark:bg-primary-900 dark:text-primary-200 dark:border-primary-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-dark-700 dark:hover:text-gray-200"
              }
            `}
                  >
                    <Icon
                      className={`h-5 w-5 mr-3 ${
                        active
                          ? "text-primary-700 dark:text-primary-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}

          {/* Admin Navigation */}
          {isAdmin && (
            <>
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-dark-600">
                <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Admin
                </div>
              </div>

              {adminNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
              ${
                active
                  ? "bg-primary-50 text-primary-700 border-r-2 border-primary-700 dark:bg-primary-900 dark:text-primary-200 dark:border-primary-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-dark-700 dark:hover:text-gray-200"
              }
            `}
                  >
                    <Icon
                      className={`h-5 w-5 mr-3 ${
                        active
                          ? "text-primary-700 dark:text-primary-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User section */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 dark:border-dark-600">
          <Link to="profile" className="flex items-center space-x-3 group">
            <img
              src={getAvatarUrl(user?.profile?.avatar)}
              alt={user?.username}
              className="h-8 w-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 truncate dark:text-gray-100 dark:group-hover:text-gray-300">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-xs text-gray-500 group-hover:text-gray-400 truncate dark:text-gray-400 dark:group-hover:text-gray-500">
                @{user?.username}
              </p>
            </div>
            {/* Show settings icon only for admins */}
            {isAdmin && (
              <Settings className="h-4 w-4 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
            )}
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
