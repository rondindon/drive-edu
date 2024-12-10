import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button"; // Adjust the import path as needed
import { useAuth } from "../../context/AuthContext"; // Adjust the import path as needed

// Example icons (use your own or from shadcn/ui icons)
import { Home, Users, List, HelpCircle, FileText, BarChart2, LogOut } from "lucide-react";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { logout, user, username, role } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", icon: Home, href: "/admin" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Tests", icon: List, href: "/admin/tests" },
    { name: "Questions", icon: HelpCircle, href: "/admin/questions" },
    { name: "Requests", icon: FileText, href: "/admin/requests" },
    { name: "Reports", icon: BarChart2, href: "/admin/reports" },
  ];

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="w-64 bg-main-darkBlue text-secondary-lightGray flex flex-col flex-shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 font-bold text-xl border-b border-main-green">
          Admin Panel
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
                  `flex items-center space-x-2 px-2 py-2 rounded hover:bg-main-green hover:text-main-darkBlue transition-colors ${
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
      <main className="flex-1 overflow-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;