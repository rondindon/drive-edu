// src/pages/admin/AdminLayout.tsx
import React from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { Button } from "src/components/ui/button";
import { useAuth } from "src/context/AuthContext";

// Importing icons from lucide-react
import {
  Home,
  Users,
  List,
  HelpCircle,
  FileText,
  BarChart2,
  LogOut,
} from "lucide-react";

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout, username, role } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", icon: Home, href: "/admin" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Tests", icon: List, href: "/admin/tests" },
    { name: "Questions", icon: HelpCircle, href: "/admin/questions" },
    // { name: "Requests", icon: FileText, href: "/admin/requests" },
    { name: "Reports", icon: BarChart2, href: "/admin/reports" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-64 h-screen bg-main-darkBlue text-secondary-lightGray flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 font-bold text-xl border-b border-main-green flex items-center justify-between">
          <span>Admin Panel</span>
          {/* Home Link */}
          <NavLink
            to="/"
            className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors"
            aria-label="Home"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm">Home</span>
          </NavLink>
        </div>

        {/* Sidebar Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* User Info */}
          <div className="mb-4">
            <p className="text-sm">Logged in as:</p>
            <p className="font-semibold">{username || "Admin"}</p>
            <p className="text-xs italic">{role || "User"}</p>
          </div>

          {/* Navigation Links */}
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

        {/* Sidebar Footer */}
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

      {/* Main Content Area */}
      <main className="ml-64 flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;