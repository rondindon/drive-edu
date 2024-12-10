// src/pages/admin/AdminDashboard.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, ClipboardList, ClipboardCheck, BarChart } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data
  const totalUsers = 1200;
  const testsTaken = 3400;
  const passRate = "75%";
  const pendingRequests = 45;

  return (
    <div className="space-y-6">
      {/* Dashboard Cards */}
      <div className="grid gap-4 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1">
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

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => navigate("/admin/users")}
            className="bg-main-green text-main-darkBlue hover:bg-main-green/90"
          >
            Manage Users
          </Button>
          <Button
            onClick={() => navigate("/admin/tests")}
            variant="outline"
            className="text-main-green hover:bg-main-green/10"
          >
            Manage Tests
          </Button>
          <Button
            onClick={() => navigate("/admin/questions")}
            variant="outline"
            className="text-main-green hover:bg-main-green/10"
          >
            Manage Questions
          </Button>
          <Button
            onClick={() => navigate("/admin/requests")}
            variant="outline"
            className="text-main-green hover:bg-main-green/10"
          >
            Review Requests
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;