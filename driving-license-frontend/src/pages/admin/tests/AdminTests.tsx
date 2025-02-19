import React, { useState, useEffect, useCallback, useContext } from "react";
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
import { Skeleton } from "src/components/ui/skeleton";
import TestDetailsDialog from "./TestDetailsDialog"; // Ensure the path is correct
import { ThemeContext } from "src/context/ThemeContext";
import AppHelmet from "src/components/AppHelmet";
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

export interface Test {
  id: number;
  userId: number;
  group: string;
  score: number;
  timeTaken: number; // Time taken in seconds
  isPassed: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

const AdminTests: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "ADMIN") {
      navigate("/login");
    }
  }, [role, navigate]);

  const [search, setSearch] = useState("");
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 100;

  const token = localStorage.getItem("supabaseToken");

  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { theme } = useContext(ThemeContext);

  const getCacheKey = () => {
    return `adminTestsCache_${search}`;
  };

  const fetchTests = useCallback(
    async (offsetVal = 0, srch = search, append = false) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();

      params.set("limit", limit.toString());
      params.set("offset", offsetVal.toString());

      if (srch && srch.trim().length > 0) {
        params.set("search", srch.trim());
      }

      try {
        const response = await fetch(
          `https://drive-edu.onrender.com/api/admin/tests?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tests");
        }
        const data: Test[] = await response.json();

        if (append) {
          setTests((prev) => [...prev, ...data]);
        } else {
          setTests(data);
        }

        if (data.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Could not fetch tests. Please try again later.");
        setLoading(false);
      }
    },
    [search, limit, token]
  );

  useEffect(() => {
    setOffset(0);
    fetchTests(0, search, false);
  }, [fetchTests, search]);

  useEffect(() => {
    const sortedTests = [...tests].sort((a, b) => a.id - b.id);

    let filtered = sortedTests.filter((t) => {
      const userName = t.user?.username || "";
      const email = t.user?.email || "";
      const group = t.group || "";
      const searchLower = search.toLowerCase();

      return (
        userName.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        group.toLowerCase().includes(searchLower)
      );
    });

    setFilteredTests(filtered);
  }, [tests, search]);

  const loadMore = () => {
    if (!hasMore) return;
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchTests(newOffset, search, true);
  };

  const handleDelete = async (testId: number) => {
    if (!window.confirm("Are you sure you want to delete this test?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://drive-edu.onrender.com/api/admin/tests/${testId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete test");
      }
      setTests((prev) => prev.filter((t) => t.id !== testId));
      localStorage.removeItem(getCacheKey());
    } catch (err) {
      console.error(err);
      setError("Failed to delete the test");
    }
  };

  const handleView = (test: Test) => {
    setSelectedTest(test);
    setOpenDetailsDialog(true);
  };

  // Reusable Skeleton Row Component
  const SkeletonRow: React.FC = () => {
    return (
      <tr className="border-b border-gray-200">
        <td className="py-2 px-4">
          <Skeleton className="w-6 h-4" />
        </td>
        <td className="py-2 px-4">
          <Skeleton className="w-24 h-4" />
        </td>
        <td className="py-2 px-4">
          <Skeleton className="w-24 h-4" />
        </td>
        <td className="py-2 px-4">
          <Skeleton className="w-16 h-4" />
        </td>
        <td className="py-2 px-4">
          <Skeleton className="w-12 h-4" />
        </td>
        <td className="py-2 px-4">
          <Skeleton className="w-24 h-4" />
        </td>
        <td className="py-2 px-4">
          <Skeleton className="w-24 h-4" />
        </td>
        <td className="py-2 px-4">
          <Skeleton className="w-8 h-4" />
        </td>
      </tr>
    );
  };

  // Render multiple Skeleton Rows
  const renderSkeletonRows = () => {
    const skeletonRows = Array.from({ length: 5 }).map((_, index) => (
      <SkeletonRow key={index} />
    ));
    return skeletonRows;
  };

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <AppHelmet title="DriveReady - Admin Tests" description="View and manage user tests." />
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          User Tests
        </h1>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4 mb-4">
        <Input
          placeholder="Search by username, email, or group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3"
        />
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              setOffset(0);
              fetchTests(0, search, false);
              localStorage.removeItem(getCacheKey());
            }}
            className="bg-main-green text-white hover:bg-main-green/90 cursor-pointer"
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-main-green text-gray-800">
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">ID</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">User</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">Email</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">Group</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">Score</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">Time Taken</th> 
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">Passed</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">Created At</th>
                <th className="py-2 px-4 text-[hsl(var(--foreground))]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && tests.length === 0 ? (
                renderSkeletonRows()
              ) : (
                <>
                  {filteredTests.map((t) => (
                    <tr
                      key={t.id}
                      className={`border-b border-gray-200 ${
                        theme === "light"
                          ? "hover:bg-gray-100"
                          : "hover:bg-green-300/50"
                      }`}
                    >
                      <td className="py-2 px-4">{t.id}</td>
                      <td className="py-2 px-4">
                        <span>{t.user.username}</span>
                      </td>
                      <td className="py-2 px-4">
                        <span>{t.user.email}</span>
                      </td>
                      <td className="py-2 px-4">{t.group}</td>
                      <td className="py-2 px-4">{t.score}</td>
                      <td className="py-2 px-4">
                        {Math.floor(t.timeTaken / 60)}m {t.timeTaken % 60}s
                      </td>
                      <td className="py-2 px-4">
                        {t.isPassed ? "Yes" : "No"}
                      </td>
                      <td className="py-2 px-4">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(t)}>
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(t.id)}
                              className="text-red-500"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}

                  {filteredTests.length === 0 && !loading && (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        No tests found.
                      </td>
                    </tr>
                  )}

                  {loading && tests.length > 0 && renderSkeletonRows()}
                </>
              )}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="mt-4 text-center">
            {loading && tests.length > 0 ? (
              <Button
                disabled
                className="bg-main-green text-main-darkBlue opacity-50 cursor-not-allowed"
              >
                Loading...
              </Button>
            ) : (
              <Button
                onClick={loadMore}
                className="bg-main-green text-main-darkBlue hover:bg-main-green/90 text-white"
              >
                Load More
              </Button>
            )}
          </div>
        )}
      </Card>

      {openDetailsDialog && selectedTest && (
        <TestDetailsDialog
          open={openDetailsDialog}
          onClose={() => setOpenDetailsDialog(false)}
          test={selectedTest}
        />
      )}
    </>
  );
};

export default AdminTests;