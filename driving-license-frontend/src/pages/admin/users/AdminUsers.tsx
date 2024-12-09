import React, { useState, useEffect } from "react";
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
import AdminLayout from "src/pages/admin/AdminLayout";
import { MoreVertical } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "src/components/ui/select";

interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  username?: string | null;
}

const Spinner: React.FC = () => <div>Loading...</div>;

const roleOptions = ["All", "USER", "ADMIN"];

const AdminUsers: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  if (role !== "ADMIN") {
    navigate("/login");
  }

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState("All");

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 100;
  const token = localStorage.getItem("supabaseToken");

  const fetchUsers = async (offsetVal = 0, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("offset", offsetVal.toString());
      if (search) params.set("search", search);
      if (roleFilter !== "All") params.set("role", roleFilter);

      const response = await fetch(`http://localhost:4444/api/admin/users?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
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

      setLoading(false);
    } catch (err) {
      console.log(err);
      setError("Could not fetch users. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reload from scratch whenever search or role filter changes
    setOffset(0);
    fetchUsers(0, false);
  }, [search, roleFilter]);

  useEffect(() => {
    const sortedUsers = [...users].sort((a, b) => a.id - b.id);
    setFilteredUsers(sortedUsers);
  }, [users]);

  const loadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchUsers(newOffset, true);
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`http://localhost:4444/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (!response.ok) throw new Error("Failed to update user");
      const updatedUser: User = await response.json();
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdateUserUsername = async (userId: number, newUsername: string | null) => {
    try {
      const response = await fetch(`http://localhost:4444/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername })
      });
      if (!response.ok) throw new Error("Failed to update username");
      const updatedUser: User = await response.json();
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`http://localhost:4444/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading && users.length === 0) {
    return (
      <AdminLayout>
        <div className="p-6"><Spinner /></div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-500">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Users</h1>

        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search by email or username..."
            value={search}
            onChange={(e) => {setSearch(e.target.value);}}
            className="w-1/3"
          />

          <div className="flex items-center space-x-2">
            <span>Role:</span>
            <Select value={roleFilter} onValueChange={(val) => {setRoleFilter(val);}}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="p-4">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-main-green text-gray-800">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Username</th>
                <th className="py-2 px-4">Role</th>
                <th className="py-2 px-4">CreatedAt</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-2 px-4">{u.id}</td>
                  <td className="py-2 px-4">{u.email}</td>
                  <td className="py-2 px-4">{u.username || "No username"}</td>
                  <td className="py-2 px-4">{u.role}</td>
                  <td className="py-2 px-4">{new Date(u.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {roleOptions.filter((r) => r !== "All").map((r) => (
                          r !== u.role ? (
                            <DropdownMenuItem key={r} onClick={() => handleUpdateUserRole(u.id, r)}>
                              Set role to {r}
                            </DropdownMenuItem>
                          ) : null
                        ))}

                        <DropdownMenuItem
                          onClick={() => {
                            const newUsername = window.prompt("Enter new username (leave empty to remove username):", u.username || "");
                            if (newUsername !== null) {
                              const trimmed = newUsername.trim();
                              handleUpdateUserUsername(u.id, trimmed === "" ? null : trimmed);
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
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {hasMore && filteredUsers.length > 0 && (
            <div className="mt-4 text-center">
              <Button onClick={loadMore} className="bg-main-green text-main-darkBlue hover:bg-main-green/90">
                Load More
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;