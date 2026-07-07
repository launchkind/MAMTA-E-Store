/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type Employee = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: "employee";
  employee_role:
    | "packer"
    | "deliveryman"
    | "accounts"
    | "incharge"
    | "call_center";
  createdAt: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [total, setTotal] = useState(0);

  const { toast } = useToast();

  const totalPages = Math.ceil(total / perPage);

  useEffect(() => {
    fetchEmployees();
  }, [page, searchTerm, employeeRoleFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('role', 'employee')
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

      if (employeeRoleFilter && employeeRoleFilter !== 'all')
        query = query.eq('employee_role', employeeRoleFilter);
      if (searchTerm.trim())
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);

      const { data, count, error } = await query;
      if (error) throw error;

      setEmployees((data ?? []).map(u => ({ ...u, _id: u.id, createdAt: u.created_at })));
      setTotal(count ?? 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEmployees();
    setRefreshing(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const getEmployeeRoleColor = (role: string) => {
    switch (role) {
      case "packer":
        return "bg-blue-500/90 hover:bg-blue-600 text-white";
      case "deliveryman":
        return "bg-green-500/90 hover:bg-green-600 text-white";
      case "accounts":
        return "bg-yellow-500/90 hover:bg-yellow-600 text-white";
      case "incharge":
        return "bg-purple-500/90 hover:bg-purple-600 text-white";
      case "call_center":
        return "bg-pink-500/90 hover:bg-pink-600 text-white";
      default:
        return "bg-gray-500/90 hover:bg-gray-600 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Employees Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all employee information and roles
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
            {loading || refreshing ? (
              <RefreshCw className="h-5 w-5 md:h-6 md:w-6 text-purple-600 animate-spin" />
            ) : (
              <span className="text-xl md:text-2xl font-bold text-purple-600">
                {total}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-lg shadow-sm border space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500 shrink-0" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Employee Role Filter */}
          <Select
            value={employeeRoleFilter}
            onValueChange={setEmployeeRoleFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by employee role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employee Roles</SelectItem>
              <SelectItem value="call_center">Call Center</SelectItem>
              <SelectItem value="packer">Packer</SelectItem>
              <SelectItem value="deliveryman">Delivery Person</SelectItem>
              <SelectItem value="accounts">Accounts</SelectItem>
              <SelectItem value="incharge">Incharge</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Employees Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
      >
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="font-semibold">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="font-semibold">
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead className="font-semibold">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="font-semibold">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(perPage)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Avatar</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <TableRow key={employee._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold shadow-sm overflow-hidden">
                        {employee.avatar ? (
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">
                            {employee.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {employee.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {employee.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "capitalize text-xs",
                          getEmployeeRoleColor(employee.employee_role)
                        )}
                      >
                        {employee.employee_role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Users className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          No employees found
                        </p>
                        <p className="text-sm text-gray-500">
                          {searchTerm || employeeRoleFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Employees will appear here"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Pagination */}
      {!loading && total > perPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between bg-white rounded-lg border px-4 py-3"
        >
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">{(page - 1) * perPage + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(page * perPage, total)}
            </span>{" "}
            of <span className="font-medium">{total}</span> employees
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
