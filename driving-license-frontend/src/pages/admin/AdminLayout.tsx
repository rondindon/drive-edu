import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "src/components/ui/button";
import { useAuth } from "src/context/AuthContext";

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
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-main-darkBlue text-secondary-lightGray flex flex-col">
        <div className="p-4 font-bold text-xl border-b border-main-green">
          Admin Panel
        </div>
        <div className="p-4 flex-1 overflow-auto">
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
        <div className="p-4 border-t border-main-green">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;