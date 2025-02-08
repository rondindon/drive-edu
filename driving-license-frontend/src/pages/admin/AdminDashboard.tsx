// src/pages/admin/AdminDashboard.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  ClipboardList, 
  ClipboardCheck, 
  BarChart as LucideBarChart, // Alias Lucide's BarChart
  RefreshCw 
} from "lucide-react";
import axios from "axios"; // Using Axios for data fetching
import { toast } from "react-toastify";
import PerformanceChart from "src/components/PerformanceChart";
import { Skeleton } from "src/components/ui/skeleton";
import {
  BarChart as RechartsBarChart, // Alias Recharts' BarChart
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface AdminTestStatsMonth {
  period: string; // YYYY-MM
  count: number;
}

interface TestPerformanceMonth {
  period: string; // YYYY-MM
  averageScore: number;
  passRate: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // State Variables
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [testsTaken, setTestsTaken] = useState<number>(0);
  const [passRate, setPassRate] = useState<string>("0%");
  const [pendingReports, setPendingReports] = useState<number>(0);
  const [testsTakenPerMonth, setTestsTakenPerMonth] = useState<AdminTestStatsMonth[]>([]);
  const [testPerformanceByMonth, setTestPerformanceByMonth] = useState<TestPerformanceMonth[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("supabaseToken"); // Ensure token is correctly stored

  // Cache key for the statistics
  const CACHE_KEY = "adminDashboardStats";

  // Fetch Statistics (and update cache)
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch Total Users
      const usersResponse = await axios.get("https://drive-edu.onrender.com/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const users = usersResponse.data as Array<any>;
      setTotalUsers(users.length);

      // Fetch Tests Taken
      const testsResponse = await axios.get("https://drive-edu.onrender.com/api/admin/tests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const tests = testsResponse.data as Array<any>;
      setTestsTaken(tests.length);

      // Fetch Test Summary for Pass Rate
      const summaryResponse = await axios.get("https://drive-edu.onrender.com/api/user/stats/test-summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const summary = summaryResponse.data;
      const rate = summary.testsTaken > 0 ? ((summary.testsPassed / summary.testsTaken) * 100).toFixed(2) : "0";
      setPassRate(`${rate}%`);

      // Fetch Pending Reports
      const reportsResponse = await axios.get("https://drive-edu.onrender.com/api/admin/report", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const reports = reportsResponse.data.reports as Array<any>;
      const pending = reports.length > 0 ? reports.filter(report => report.status === "Pending").length : 0;
      setPendingReports(pending);

      // Fetch Admin Test Stats
      const adminStatsResponse = await axios.get("https://drive-edu.onrender.com/api/admin/stats/tests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const adminStats = adminStatsResponse.data;

      // Set Tests Taken per Month
      const testsOverTimeMonth = adminStats.testsOverTimeMonth as AdminTestStatsMonth[];
      setTestsTakenPerMonth(testsOverTimeMonth);

      // Set Test Performance by Month
      const testPerformance = adminStats.testPerformanceByMonth as TestPerformanceMonth[];
      setTestPerformanceByMonth(testPerformance);

      // Build the cache object
      const statsCache = {
        totalUsers: users.length,
        testsTaken: tests.length,
        passRate: `${rate}%`,
        pendingReports: pending,
        testsTakenPerMonth: testsOverTimeMonth,
        testPerformanceByMonth: testPerformance,
      };

      // Update cache in localStorage
      localStorage.setItem(CACHE_KEY, JSON.stringify(statsCache));

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching statistics:", err);
      setError("Failed to load statistics.");
      toast.error("Failed to load statistics.");
      setLoading(false);
    }
  }, [token]);

  // On component mount, try to load cached stats (if available)
  useEffect(() => {
    const cachedStats = localStorage.getItem(CACHE_KEY);
    if (cachedStats) {
      const stats = JSON.parse(cachedStats);
      setTotalUsers(stats.totalUsers);
      setTestsTaken(stats.testsTaken);
      setPassRate(stats.passRate);
      setPendingReports(stats.pendingReports);
      setTestsTakenPerMonth(stats.testsTakenPerMonth);
      setTestPerformanceByMonth(stats.testPerformanceByMonth);
      setLoading(false);
    } else {
      fetchStatistics();
    }
  }, [fetchStatistics]);

  // Refresh function that always fetches new stats (and updates cache)
  const handleRefresh = () => {
    fetchStatistics();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Quick Actions Skeleton */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="w-1/6 h-8 rounded" />
            <Skeleton className="w-24 h-10 rounded" />
          </div>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="w-32 h-10 rounded" />
            <Skeleton className="w-32 h-10 rounded" />
            <Skeleton className="w-32 h-10 rounded" />
            <Skeleton className="w-32 h-10 rounded" />
          </div>
        </div>

        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="w-1/3 h-8 rounded" />
          <Skeleton className="w-24 h-10 rounded" />
        </div>

        {/* Dashboard Cards Skeleton */}
        <div className="grid gap-4 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="w-24 h-4 rounded" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="w-16 h-8 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-4 lg:grid-cols-2 sm:grid-cols-1">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="w-1/2 h-6 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-72 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
        <Button onClick={handleRefresh} className="mt-4 bg-main-green text-white hover:bg-main-green/90">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions at the Top */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-[hsl(var(--primary))]">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => navigate("/admin/users")}
            variant="outline"
            className="text-main-green hover:bg-main-green/10 flex items-center border-main-green"
          >
            <User className="mr-2" />
            Manage Users
          </Button>
          <Button
            onClick={() => navigate("/admin/tests")}
            variant="outline"
            className="text-main-green hover:bg-main-green/10 flex items-center border-main-green"
          >
            <ClipboardList className="mr-2" />
            Manage Tests
          </Button>
          <Button
            onClick={() => navigate("/admin/questions")}
            variant="outline"
            className="text-main-green hover:bg-main-green/10 flex items-center border-main-green"
          >
            <ClipboardCheck className="mr-2" />
            Manage Questions
          </Button>
          <Button
            onClick={() => navigate("/admin/reports")}
            variant="outline"
            className="text-main-green hover:bg-main-green/10 flex items-center border-main-green"
          >
            <LucideBarChart className="mr-2" />
            Review Reports
          </Button>
        </div>
      </div>

      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">Admin Dashboard</h1>
        <Button
          onClick={handleRefresh}
          className="bg-main-green text-white hover:bg-main-green/90 flex items-center"
        >
          <RefreshCw className="mr-2" />
          Refresh
        </Button>
      </div>

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
              <LucideBarChart className="text-main-green" />
              <span>Pending Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingReports}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Side by Side */}
      <div className="grid gap-4 lg:grid-cols-2 sm:grid-cols-1">
        {/* Tests Taken per Month Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tests Taken per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={testsTakenPerMonth} className="text-black">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Tests Taken" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Test Performance by Month Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Test Performance by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={testPerformanceByMonth} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;