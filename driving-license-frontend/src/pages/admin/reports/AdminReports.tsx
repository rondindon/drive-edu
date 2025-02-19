import React, { useState, useEffect, useCallback, useContext } from "react";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Card } from "src/components/ui/card";
import { useAuth } from "src/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  BarChart as LucideBarChart,
  ExternalLink,
} from "lucide-react";
import { Skeleton } from "src/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "src/components/ui/select";

import { Report, ReportStatus } from "./ReportTypes";
import { ThemeContext } from "src/context/ThemeContext";
import AppHelmet from "src/components/AppHelmet";

const reportStatuses: ReportStatus[] = ["Pending", "Reviewed", "Resolved"];

const SkeletonRow: React.FC = () => (
  <tr className="border-b border-gray-200">
    <td className="py-2 px-4">
      <Skeleton className="w-6 h-4" />
    </td>
    <td className="py-2 px-4">
      <Skeleton className="w-24 h-4" />
    </td>
    <td className="py-2 px-4">
      <Skeleton className="w-32 h-4" />
    </td>
    <td className="py-2 px-4">
      <Skeleton className="w-24 h-4" />
    </td>
    <td className="py-2 px-4">
      <Skeleton className="w-16 h-4" />
    </td>
    <td className="py-2 px-4">
      <Skeleton className="w-8 h-4" />
    </td>
    <td className="py-2 px-4">
      <Skeleton className="w-24 h-6" />
    </td>
  </tr>
);

const renderSkeletonRows = (count: number = 10) =>
  Array.from({ length: count }).map((_, index) => <SkeletonRow key={index} />);

const AdminReports: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "ADMIN") {
      navigate("/login");
    }
  }, [role, navigate]);

  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const token = localStorage.getItem("supabaseToken");
  const { theme } = useContext(ThemeContext);

  const cacheKey = "adminReportsCache";

  // Fetch Reports with caching
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    const cachedData = localStorage.getItem(cacheKey);
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();

    if (cachedData) {
      try {
        const parsedCache = JSON.parse(cachedData) as {
          reports: Report[];
          timestamp: number;
        };

        if (now - parsedCache.timestamp < cacheExpiry) {
          setReports(parsedCache.reports);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem(cacheKey);
        }
      } catch (e) {
        console.error("Failed to parse cache:", e);
        localStorage.removeItem(cacheKey);
      }
    }

    try {
      const response = await fetch("https://drive-edu.onrender.com/api/admin/report", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.reports)) {
        throw new Error("Invalid response shape. Expected { reports: [...] }");
      }

      const fetchedReports = data.reports;
      fetchedReports.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setReports(fetchedReports);

      const cacheData = {
        reports: fetchedReports,
        timestamp: now,
      };

      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (e) {
        if ((e as DOMException).name === "QuotaExceededError") {
          console.warn("LocalStorage quota exceeded. Cannot cache reports.");
        } else {
          console.error("Failed to set cache:", e);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Could not fetch reports. Please try again later.");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    let temp = [...reports];

    if (statusFilter !== "All") {
      temp = temp.filter((report) => report.status === statusFilter);
    }

    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      temp = temp.filter(
        (report) =>
          report.user.name.toLowerCase().includes(search) ||
          report.user.email.toLowerCase().includes(search) ||
          report.id.toString() === search ||
          report.question.id.toString() === search
      );
    }

    setFilteredReports(temp);
  }, [reports, statusFilter, searchTerm]);

  const handleApprove = async (reportId: number) => {
    try {
      const response = await fetch(
        `https://drive-edu.onrender.com/api/admin/reports/${reportId}/review`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark report as reviewed");
      }

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, status: "Reviewed" } : report
        )
      );

      localStorage.removeItem(cacheKey);
    } catch (err) {
      console.error(err);
      setError("Failed to mark the report as reviewed.");
    }
  };

  const handleResolve = async (reportId: number) => {
    try {
      const response = await fetch(
        `https://drive-edu.onrender.com/api/admin/reports/${reportId}/resolve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resolve report");
      }

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, status: "Resolved" } : report
        )
      );

      localStorage.removeItem(cacheKey);
    } catch (err) {
      console.error(err);
      setError("Failed to resolve the report.");
    }
  };

  const handleDelete = async (reportId: number) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://drive-edu.onrender.com/api/admin/reports/${reportId}/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete report");
      }

      setReports((prev) => prev.filter((r) => r.id !== reportId));
      localStorage.removeItem(cacheKey);
    } catch (err) {
      console.error(err);
      setError("Failed to delete the report.");
    }
  };

  const handleRefresh = () => {
    localStorage.removeItem(cacheKey);
    fetchReports();
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <AppHelmet title="DriveReady - Admin Reports" description="View and manage reports submitted by users." />
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Reports</h1>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button
            onClick={handleRefresh}
            className="bg-main-green text-white hover:bg-main-green/90 transition-colors duration-200 shadow-sm w-full md:w-24"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-x-4 text-[hsl(var(--foreground))] w-full">
          <Input
            placeholder="Search by user, report ID, or question ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72"
          />
          <div className="flex items-center space-x-2">
            <span>Status:</span>
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val)}
            >
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {reportStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {error}
        </div>
      )}

      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-main-green text-gray-800">
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">ID</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">User</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">Question</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">Description</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">Date Submitted</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">Status</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && reports.length === 0 ? (
                renderSkeletonRows()
              ) : (
                <>
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className={`border-b border-gray-200 ${
                        theme === "light" ? "hover:bg-gray-100" : "hover:bg-green-300/50"
                      }`}
                    >
                      <td className="py-2 px-4">{report.id}</td>
                      <td className="py-2 px-4">
                        {report.user?.username} ({report.user?.email})
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex items-center space-x-4">
                          <span className="w-40 text-gray-700 dark:text-gray-300">
                            {report.question?.text.slice(0, 30)}...
                          </span>
                          <a
                            href={`/question/${report.question?.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-main-green hover:text-main-green/80"
                            aria-label="View Question"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        {report.description?.slice(0, 100)}...
                      </td>
                      <td className="py-2 px-4">
                        {new Date(report.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 block text-center w-24 rounded ${
                            report.status === "Resolved"
                              ? "bg-green-200 text-green-800"
                              : report.status === "Reviewed"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                        {report.status === "Pending" && (
                          <>
                            <Button
                              variant="outline"
                              className="bg-yellow-200 hover:bg-yellow-400 text-black transition-colors duration-200 w-full md:w-24 shadow-sm"
                              onClick={() => handleApprove(report.id)}
                            >
                              Review
                            </Button>
                            <Button
                              variant="outline"
                              className="bg-green-200 hover:bg-green-400 text-black transition-colors duration-200 w-full md:w-24 shadow-sm"
                              onClick={() => handleResolve(report.id)}
                            >
                              Resolve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(report.id)}
                              className="bg-red-200 hover:bg-red-400 text-black transition-colors duration-200 w-full md:w-24 shadow-sm"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                        {report.status === "Reviewed" && (
                          <>
                            <Button
                              variant="outline"
                              className="bg-green-200 hover:bg-green-400 text-black transition-colors duration-200 w-full md:w-24 shadow-sm"
                              onClick={() => handleResolve(report.id)}
                            >
                              Resolve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(report.id)}
                              className="bg-red-200 hover:bg-red-400 text-black transition-colors duration-200 w-full md:w-24 shadow-sm"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                        {report.status === "Resolved" && (
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(report.id)}
                            className="bg-red-200 hover:bg-red-400 text-black transition-colors duration-200 w-full md:w-24 shadow-sm"
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No reports found.
                      </td>
                    </tr>
                  )}
                  {loading && reports.length > 0 && renderSkeletonRows()}
                </>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
};

export default AdminReports;