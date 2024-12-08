import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { useNavigate } from "react-router-dom";

// Replace these imports with actual icons/components from shadcn or Heroicons if integrated
import { User, ClipboardList, ClipboardCheck, BarChart } from "lucide-react";
import AdminLayout from "./AdminLayout";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data
  const totalUsers = 1200;
  const testsTaken = 3400;
  const passRate = "75%";
  const pendingRequests = 45;

  return (
    <AdminLayout>
      <div className="p-6 grid gap-4 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1">
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="text-main-green" />
              <span>Total Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="text-main-green" />
              <span>Tests Taken</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{testsTaken}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardCheck className="text-main-green" />
              <span>Pass Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{passRate}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="text-main-green" />
              <span>Pending Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingRequests}</p>
          </CardContent>
        </Card>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Button onClick={() => navigate("/admin/users")}>Manage Users</Button>
          <Button onClick={() => navigate("/admin/tests")} variant="outline">
            Manage Tests
          </Button>
          <Button onClick={() => navigate("/admin/questions")} variant="outline">
            Manage Questions
          </Button>
          <Button onClick={() => navigate("/admin/requests")} variant="outline">
            Review Requests
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;