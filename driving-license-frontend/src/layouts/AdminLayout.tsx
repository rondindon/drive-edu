import React, { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { Button } from "src/components/ui/button";
import { useAuth } from "src/context/AuthContext";

import {
  Home,
  Users,
  List,
  HelpCircle,
  BarChart2,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout, username, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", icon: Home, href: "/admin" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Tests", icon: List, href: "/admin/tests" },
    { name: "Questions", icon: HelpCircle, href: "/admin/questions" },
    { name: "Reports", icon: BarChart2, href: "/admin/reports" },
  ];

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      <aside className="hidden md:flex fixed top-0 left-0 w-64 h-screen bg-main-darkBlue text-secondary-lightGray flex-col">
        <div className="p-4 font-bold text-xl border-b border-main-green flex items-center justify-between">
          <span>Admin Panel</span>
          <NavLink
            to="/"
            className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors"
            aria-label="Home"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm">Home</span>
          </NavLink>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-4">
            <p className="text-sm">Logged in as:</p>
            <p className="font-semibold">{username || "Admin"}</p>
            <p className="text-xs italic">{role || "User"}</p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/admin"}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors ${
                    isActive ? "bg-main-green text-main-darkBlue" : ""
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-main-green">
          <Button
            variant="outline"
            className="w-full text-gray-400 flex items-center justify-center space-x-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header with Hamburger */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-main-darkBlue text-secondary-lightGray z-50 shadow-md">
        <div className="flex items-center justify-between p-4">
          <div className="text-xl font-bold font-inclusive tracking-wider">
            DriveReady
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-main-darkBlue text-secondary-lightGray flex flex-col">
            <div className="p-4 font-bold text-xl border-b border-main-green flex items-center justify-between">
              <span>Admin Panel</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors"
                aria-label="Close Menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="mb-4">
                <p className="text-sm">Logged in as:</p>
                <p className="font-semibold">{username || "Admin"}</p>
                <p className="text-xs italic">{role || "User"}</p>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === "/admin"}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3 py-2 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors ${
                        isActive ? "bg-main-green text-main-darkBlue" : ""
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t border-main-green">
              <Button
                variant="outline"
                className="w-full text-gray-400 flex items-center justify-center space-x-2"
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </div>
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>
        </div>
      )}

      <main className="md:ml-64 flex-1 overflow-y-auto p-6 mt-16 md:mt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;