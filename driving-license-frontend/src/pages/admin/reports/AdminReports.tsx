// src/pages/admin/reports/AdminReports.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Card } from "src/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "src/components/ui/dropdown-menu";
import { useAuth } from "src/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "src/components/ui/select";
import { Skeleton } from "src/components/ui/skeleton";

import { Report, ReportStatus, ReportType } from "./ReportTypes";
import ReportDetailModal from "./ReportDetailModal";

// Example status/type arrays
const reportStatuses: ReportStatus[] = ["Pending", "Reviewed", "Resolved"];

// --- Skeleton Rows for loading state ---
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
  </tr>
);

const renderSkeletonRows = (count: number = 10) =>
  Array.from({ length: count }).map((_, index) => <SkeletonRow key={index} />);

// --- Admin Reports Component ---
const AdminReports: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  // 1) Ensure only Admin can access
  useEffect(() => {
    if (role !== "ADMIN") {
      navigate("/login");
    }
  }, [role, navigate]);

  // 2) State management
  const [reports, setReports] = useState<Report[]>([]); // must be an array
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const token = localStorage.getItem("supabaseToken");

  // Local cache key
  const cacheKey = "adminReportsCache";

  // === 3) Fetch Reports with caching ===
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

        // If cache is still valid, use it
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

    // If no valid cache, fetch from server
    try {
      // Here we call GET /api/report
      const response = await fetch("http://localhost:4444/api/admin/report", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      // Your server returns { reports: Report[] }, so we do:
      const data = await response.json();
      // data = { reports: [ { id, user, question, ... }, ... ] }

      if (!data || !Array.isArray(data.reports)) {
        throw new Error("Invalid response shape. Expected { reports: [...] }");
      }

      // We only want the array inside data.reports
      const fetchedReports = data.reports; // this is an array

      setReports(fetchedReports);

      // Save to cache
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

  // Run on mount
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // === 4) Filtering logic ===
  useEffect(() => {
    let temp = [...reports];

    // Filter by status
    if (statusFilter !== "All") {
      temp = temp.filter((report) => report.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== "All") {
      temp = temp.filter((report) => report.type === typeFilter);
    }

    // Search term
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
  }, [reports, statusFilter, typeFilter, searchTerm]);

  // === 5) Handlers for Approve, Resolve, Delete (like your old code) ===

  const handleApprove = async (reportId: number) => {
    try {
      const response = await fetch(
        `http://localhost:4444/api/admin/reports/${reportId}/review`,
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

      // Update local state
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, status: "Reviewed" } : report
        )
      );

      // Invalidate cache
      localStorage.removeItem(cacheKey);
    } catch (err) {
      console.error(err);
      setError("Failed to mark the report as reviewed.");
    }
  };

  const handleResolve = async (reportId: number) => {
    try {
      const response = await fetch(
        `http://localhost:4444/api/admin/reports/${reportId}/resolve`,
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

      // Update local state
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, status: "Resolved" } : report
        )
      );

      // Invalidate cache
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
        `http://localhost:4444/api/admin/reports/${reportId}`,
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

  // === 6) Detail Modal handling
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // === 7) Refresh button
  const handleRefresh = () => {
    localStorage.removeItem(cacheKey);
    fetchReports();
  };

  return (
    <>
      {/* Header and Action Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Reports</h1>
      </div>
      <div className="flex justify-between">
      {/* Filters and Search */}
      <div className="flex items-center space-x-4 mb-4 text-[hsl(var(--foreground))]">
        <Input
          placeholder="Search by user, report ID, or question ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-72"
        />

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span>Status:</span>
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val)}
          >
            <SelectTrigger className="w-32">
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
        <div className="flex space-x-2">
          <Button
            onClick={handleRefresh}
            className="bg-main-blue text-white hover:bg-main-blue/90"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Handling */}
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Reports Table */}
      <Card className="p-4">
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
            {/* Loading State */}
            {loading && reports.length === 0 ? (
              renderSkeletonRows()
            ) : (
              <>
                {/* Mapped Rows */}
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-2 px-4">{report.id}</td>
                    <td className="py-2 px-4">
                      {report.user?.username} ({report.user?.email})
                    </td>
                    <td className="py-2 px-4">
                      {/* Link to question detail? */}
                      <a
                        href={`/question/${report.question?.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {report.question?.text.slice(0, 50)}...
                      </a>
                    </td>
                    <td className="py-2 px-4">
                      {report.description?.slice(0, 100)}...
                    </td>
                    <td className="py-2 px-4">
                      {new Date(report.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 rounded ${
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
                    <td className="py-2 px-4 flex items-center pt-4">
                      {report.status === "Pending" && (
                        <>
                          <Button
                            variant="outline"
                            className="mr-2 bg-yellow-200 hover:bg-yellow-300"
                            onClick={() => handleApprove(report.id)}
                          >
                            Review
                          </Button>
                          <Button
                            variant="outline"
                            className="mr-2 bg-green-200 hover:bg-green-300"
                            onClick={() => handleResolve(report.id)}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(report.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                      {report.status === "Reviewed" && (
                        <>
                          <Button
                            variant="outline"
                            className="mr-2 bg-green-200 hover:bg-green-300 text-[hsl(var(--muted))]"
                            onClick={() => handleResolve(report.id)}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(report.id)}
                            className="text-[hsl(var(--foreground))]"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                      {report.status === "Resolved" && (
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(report.id)}
                          className="text-[hsl(var(--foreground))]"
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}

                {/* No Reports Found */}
                {filteredReports.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No reports found.
                    </td>
                  </tr>
                )}

                {/* Additional Loading */}
                {loading && reports.length > 0 && renderSkeletonRows()}
              </>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
};

export default AdminReports;