import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Shield, Check, X, Trash2, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AVAILABLE_DEPARTMENTS } from "@/hooks/useAuth";

interface UserWithDepts {
  id: string;
  email: string;
  full_name: string;
  departments: { id: string; department: string; is_approved: boolean }[];
  roles: string[];
}

export const UsersManager = () => {
  const [users, setUsers] = useState<UserWithDepts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email");
      
      // Get all departments
      const { data: depts } = await (supabase as any).from("admin_departments").select("*");
      
      // Get all roles
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");

      const userMap: UserWithDepts[] = (profiles || []).map((p: any) => ({
        id: p.id,
        email: p.email || "",
        full_name: p.full_name || "",
        departments: (depts || []).filter((d: any) => d.user_id === p.id).map((d: any) => ({ id: d.id, department: d.department, is_approved: d.is_approved })),
        roles: (roles || []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role),
      }));

      setUsers(userMap);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load users");
    } finally { setLoading(false); }
  };

  const assignDepartment = async (userId: string, department: string) => {
    try {
      const { error } = await (supabase as any).from("admin_departments").insert({
        user_id: userId,
        department,
        is_approved: true,
      });
      if (error) {
        if (error.code === "23505") toast.info("User already has this department");
        else throw error;
      } else {
        toast.success("Department assigned!");
        fetchUsers();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to assign");
    }
  };

  const toggleApproval = async (deptId: string, currentState: boolean) => {
    try {
      const { error } = await (supabase as any).from("admin_departments").update({ is_approved: !currentState }).eq("id", deptId);
      if (error) throw error;
      toast.success(currentState ? "Access revoked" : "Access approved");
      fetchUsers();
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const removeDepartment = async (deptId: string) => {
    try {
      const { error } = await (supabase as any).from("admin_departments").delete().eq("id", deptId);
      if (error) throw error;
      toast.success("Department removed");
      fetchUsers();
    } catch (e) {
      toast.error("Failed to remove");
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" } as any);
      if (error) {
        if (error.code === "23505") toast.info("Already an admin");
        else throw error;
      } else {
        toast.success("Promoted to admin!");
        fetchUsers();
      }
    } catch (e: any) { toast.error(e.message); }
  };

  const removeAdmin = async (userId: string) => {
    try {
      const { error } = await (supabase as any).from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) throw error;
      toast.success("Admin role removed");
      fetchUsers();
    } catch (e) { toast.error("Failed"); }
  };

  const getDeptLabel = (value: string) => AVAILABLE_DEPARTMENTS.find(d => d.value === value)?.label || value;

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />User & Department Management</CardTitle>
          <CardDescription>Assign department access to users. Each user can only edit content in their assigned departments.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick assign */}
          <div className="flex flex-wrap gap-3 mb-6 p-4 bg-muted/50 rounded-lg">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select user" /></SelectTrigger>
              <SelectContent>
                {users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {AVAILABLE_DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => { if (selectedUserId && selectedDept) assignDepartment(selectedUserId, selectedDept); }} disabled={!selectedUserId || !selectedDept}>
              <UserPlus className="w-4 h-4 mr-2" />Assign
            </Button>
          </div>

          {/* Users table */}
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Departments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{user.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.roles.includes("admin") ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20">Admin</Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.departments.length === 0 ? (
                          <span className="text-xs text-muted-foreground">No departments</span>
                        ) : (
                          user.departments.map(d => (
                            <div key={d.id} className="inline-flex items-center gap-1">
                              <Badge variant={d.is_approved ? "default" : "outline"} className="text-xs gap-1">
                                {getDeptLabel(d.department)}
                                <button onClick={() => toggleApproval(d.id, d.is_approved)} className="ml-1 hover:opacity-70">
                                  {d.is_approved ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                </button>
                                <button onClick={() => removeDepartment(d.id)} className="hover:opacity-70">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.roles.includes("admin") ? (
                        <Button size="sm" variant="outline" onClick={() => removeAdmin(user.id)} className="text-xs">Remove Admin</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => promoteToAdmin(user.id)} className="text-xs">Make Admin</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
