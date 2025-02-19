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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "src/components/ui/select";
import { Skeleton } from "src/components/ui/skeleton"; // Import Skeleton
import { ThemeContext } from "src/context/ThemeContext";

interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  username?: string | null;
}
interface UserCache {
  users: User[];
  offset: number;
  hasMore: boolean;
  timestamp: number;
}

const SkeletonRow: React.FC = () => (
  <tr className="border-b border-gray-200">
    <td className="py-2 px-2 sm:px-4">
      <Skeleton className="w-6 h-4" />
    </td>
    <td className="py-2 px-2 sm:px-4">
      <Skeleton className="w-40 h-4" />
    </td>
    <td className="py-2 px-2 sm:px-4">
      <Skeleton className="w-32 h-4" />
    </td>
    <td className="py-2 px-2 sm:px-4">
      <Skeleton className="w-24 h-4" />
    </td>
    <td className="py-2 px-2 sm:px-4">
      <Skeleton className="w-32 h-4" />
    </td>
    <td className="py-2 px-2 sm:px-4">
      <Skeleton className="w-24 h-4" />
    </td>
  </tr>
);

const renderSkeletonRows = (count: number = 5) => {
  return Array.from({ length: count }).map((_, index) => (
    <SkeletonRow key={index} />
  ));
};

const roleOptions = ["All", "USER", "ADMIN"];

const AdminUsers: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "ADMIN") {
      navigate("/login");
    }
  }, [role, navigate]);

  // State Management
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState<string>("All");

  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const limit = 100;
  const token = localStorage.getItem("supabaseToken");
  const { theme } = useContext(ThemeContext);

  const getCacheKey = () => {
    return `adminUsersCache_${search}_${roleFilter}`;
  };

  const fetchUsers = useCallback(
    async (offsetVal: number = 0, append: boolean = false) => {
      setLoading(true);
      setError(null);

      const cacheKey = getCacheKey();
      const cachedData = localStorage.getItem(cacheKey);

      const cacheExpiry = 5 * 60 * 1000;
      const now = Date.now();

      if (cachedData) {
        try {
          const parsedCache: UserCache = JSON.parse(cachedData);
          if (now - parsedCache.timestamp < cacheExpiry) {
            setUsers(parsedCache.users);
            setOffset(parsedCache.offset);
            setHasMore(parsedCache.hasMore);
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
        const params = new URLSearchParams();
        params.set("limit", limit.toString());
        params.set("offset", offsetVal.toString());
        if (search.trim() !== "") params.set("search", search.trim());
        if (roleFilter !== "All") params.set("role", roleFilter);

        const response = await fetch(
          `https://drive-edu.onrender.com/api/admin/users?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data: User[] = await response.json();

        if (append) {
          setUsers((prev) => [...prev, ...data]);
        } else {
          setUsers(data);
        }

        if (data.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        const cacheData: UserCache = {
          users: append ? [...users, ...data] : data,
          offset: offsetVal,
          hasMore: data.length === limit,
          timestamp: now,
        };

        localStorage.setItem(cacheKey, JSON.stringify(cacheData));

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Could not fetch users. Please try again later.");
        setLoading(false);
      }
    },
    [search, roleFilter, limit, token, users]
  );

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    fetchUsers(0, false);
  }, [fetchUsers, search, roleFilter]);

  useEffect(() => {
    const sortedUsers = [...users].sort((a, b) => a.id - b.id);
    setFilteredUsers(sortedUsers);
  }, [users]);

  const loadMore = () => {
    if (!hasMore) return;
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchUsers(newOffset, true);
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(
        `https://drive-edu.onrender.com/api/admin/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      const updatedUser: User = await response.json();

      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );

      localStorage.removeItem(getCacheKey());
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  const handleUpdateUserUsername = async (
    userId: number,
    newUsername: string | null
  ) => {
    try {
      const response = await fetch(
        `https://drive-edu.onrender.com/api/admin/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: newUsername }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update username");
      }

      const updatedUser: User = await response.json();

      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );

      localStorage.removeItem(getCacheKey());
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(
        `https://drive-edu.onrender.com/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      localStorage.removeItem(getCacheKey());
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  const handleRefresh = () => {
    const cacheKey = getCacheKey();
    localStorage.removeItem(cacheKey);
    setOffset(0);
    setHasMore(true);
    fetchUsers(0, false);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Users</h1>
      {/* Responsive Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 text-[hsl(var(--foreground))]">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <Input
            placeholder="Search by email or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 text-[hsl(var(--foreground))]"
          />
          <div className="flex items-center space-x-2">
            <span className="whitespace-nowrap">Role:</span>
            <Select
              value={roleFilter}
              onValueChange={(val) => setRoleFilter(val)}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Refresh Button */}
        <Button
          onClick={handleRefresh}
          className="bg-main-green text-white hover:bg-main-green/90"
        >
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-main-green text-gray-800">
                <th className="py-2 px-2 sm:px-4 text-[hsl(var(--foreground))]">ID</th>
                <th className="py-2 px-2 sm:px-4 text-[hsl(var(--foreground))]">Email</th>
                <th className="py-2 px-2 sm:px-4 text-[hsl(var(--foreground))]">Username</th>
                <th className="py-2 px-2 sm:px-4 text-[hsl(var(--foreground))]">Role</th>
                <th className="py-2 px-2 sm:px-4 text-[hsl(var(--foreground))]">Created At</th>
                <th className="py-2 px-2 sm:px-4 text-[hsl(var(--foreground))]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                renderSkeletonRows()
              ) : (
                <>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className={`border-b border-gray-200 ${
                        theme === "light"
                          ? "hover:bg-gray-100"
                          : "hover:bg-green-300/50"
                      }`}
                    >
                      <td className="py-2 px-2 sm:px-4">{u.id}</td>
                      <td className="py-2 px-2 sm:px-4">{u.email}</td>
                      <td className="py-2 px-2 sm:px-4">
                        {u.username || "No username"}
                      </td>
                      <td className="py-2 px-2 sm:px-4">{u.role}</td>
                      <td className="py-2 px-2 sm:px-4">
                        {new Date(u.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-2 sm:px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {roleOptions
                              .filter((r) => r !== "All" && r !== u.role)
                              .map((r) => (
                                <DropdownMenuItem
                                  key={r}
                                  onClick={() => handleUpdateUserRole(u.id, r)}
                                >
                                  Set role to {r}
                                </DropdownMenuItem>
                              ))}
                            <DropdownMenuItem
                              onClick={() => {
                                const newUsername = window.prompt(
                                  "Enter new username (leave empty to remove username):",
                                  u.username || ""
                                );
                                if (newUsername !== null) {
                                  const trimmed = newUsername.trim();
                                  handleUpdateUserUsername(
                                    u.id,
                                    trimmed === "" ? null : trimmed
                                  );
                                }
                              }}
                            >
                              Set Username
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-500"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No users found.
                      </td>
                    </tr>
                  )}
                  {loading && users.length > 0 && renderSkeletonRows()}
                </>
              )}
            </tbody>
          </table>
        </div>

        {hasMore && filteredUsers.length > 0 && (
          <div className="mt-4 text-center">
            {loading && users.length > 0 ? (
              <Button disabled className="bg-main-green text-main-darkBlue opacity-50 cursor-not-allowed">
                Loading...
              </Button>
            ) : (
              <Button
                onClick={loadMore}
                className="bg-main-green text-main-darkBlue hover:bg-main-green/90"
              >
                Load More
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminUsers;