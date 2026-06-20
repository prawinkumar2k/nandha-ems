import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { DataTableWrapper } from "@/shared/components/Table/DataTableWrapper";
import { Modal, ConfirmModal } from "@/shared/components/Modal/Modal";
import { FormField, FormSelect } from "@/shared/components/Form/FormField";
import { useForm } from "@/core/hooks/useForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/core/constants/routes";
import { validateUserForm } from "@/core/utils/helpers";
import { Edit, Trash2, Plus, UserPlus, Upload, Shield, Users, Search, Filter} from "lucide-react";
import { ROLE_COLORS } from "@/core/constants/roles";
import { getAdminNav } from "@/core/constants/navigation";

const NAV = getAdminNav();

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const EMPTY = { name: "", email: "", role: "student", department: "", status: "Active", rollNumber: "", employeeId: "", phone: "", office: "", designation: "", specialization: "" };

import { useQuery } from "@tanstack/react-query";
import { userService, departmentService } from "@/core/api/services";
import { format } from "date-fns";

export default function UserList() {
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: () => userService.getAll({ limit: 1000 }),
  });

  const { data: depts } = useQuery({
    queryKey: ["admin-depts"],
    queryFn: () => departmentService.getAll(),
  });


  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setValue, reset } =
    useForm(EMPTY, validateUserForm);

  const openEdit = (user) => {
    reset();
    Object.entries(user).forEach(([k, v]) => setValue(k, v));
    setValue("status", user.isActive !== false ? "Active" : "Inactive");
    setEditTarget(user);
    setEditOpen(true);
  };

  const onSave = handleSubmit(async (vals) => {
    try {
      if (editTarget) {
        const payload = {
          ...vals,
          isActive: vals.status === "Active",
        };
        delete payload.status;
        await userService.update(editTarget._id, payload);
        toast({ title: "User Saved", description: "The user information has been saved successfully." });
      }
      setEditOpen(false);
      setEditTarget(null);
      refetch();
    } catch (err) {
      toast({ title: "Could not save", description: err.message, variant: "destructive" });
    }
  });

  const handleDelete = async () => {
    try {
      await userService.delete(deleteTarget._id);
      toast({ title: "User Removed", variant: "destructive", description: "The user has been removed from the database." });
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast({ title: "Could not remove", description: err.message, variant: "destructive" });
    }
  };

  const cols = [
    { key: "name", header: "Name", sortable: true, render: (r) => (
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg ${ROLE_COLORS[r.role]?.badge || "bg-primary"}`}>
          {r.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold tracking-tight">{r.name}</p>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">
            {r.rollNumber || r.employeeId || "---"}
          </p>
        </div>
      </div>

    )},
    { key: "email", header: "Email", sortable: true, render: (r) => (
      <p className="text-xs font-medium text-muted-foreground">{r.email}</p>
    )},
    { key: "role", header: "Work Role", sortable: true, render: (r) => (
      <Badge variant="outline" className={`rounded-lg py-1 px-3 font-black text-[10px] uppercase tracking-widest border-none ${ROLE_COLORS[r.role]?.badge || "bg-white/5"} bg-opacity-10`}>
        {r.role}
      </Badge>
    )},
    { key: "department", header: "Department", render: (r) => {
      let code = "---";
      if (r.department && r.department.code) {
        code = r.department.code;
      } else if (r.department && Array.isArray(depts)) {
        const found = depts.find(d => d._id === r.department);
        if (found) code = found.code;
      }
      return (
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {code}
        </span>
      );
    }},
    { key: "status", header: "Status", render: (r) => (
      <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${r.isActive !== false ? "text-emerald-500" : "text-muted-foreground/40"}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${r.isActive !== false ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"}`} />
        {r.isActive !== false ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: "joined", header: "Date Joined", sortable: true, render: (r) => r.createdAt ? format(new Date(r.createdAt), "yyyy-MM-dd") : "N/A" },
    { key: "actions", header: "", render: (r) => (
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => openEdit(r)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all" onClick={() => setDeleteTarget(r)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    )},
  ];

  return (
    <MainLayout navItems={NAV} title="User List">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground uppercase">
              User List 
            </h2>
            <p className="text-xs text-primary font-black uppercase tracking-[0.2em]">Control all users</p>
          </motion.div>
          <motion.div variants={itemVariants} className="flex gap-3">
            <Button variant="outline" className="rounded-2xl h-12 px-6 border-white/10 hover:bg-white/5 font-black text-xs uppercase tracking-widest" onClick={() => navigate(ROUTES.ADMIN_USERS_BULK)}>
              <Upload className="w-4 h-4 mr-2" /> Add Many Users
            </Button>
            <Button className="rounded-2xl h-12 px-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform group" onClick={() => navigate(ROUTES.ADMIN_USERS_ADD)}>
              <UserPlus className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" /> Add One Person
            </Button>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[40px] glass border-white/5 relative overflow-hidden shadow-2xl shadow-black/10">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-8 lg:px-8">
              <div>
                <CardTitle className="text-xl font-black italic uppercase">All Users</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">List of all students and staff</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="p-2 rounded-xl bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Filter className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 lg:p-4">
              <DataTableWrapper 
                columns={cols} 
                data={Array.isArray(users?.data) ? users.data : (Array.isArray(users) ? users : [])} 
                isLoading={isLoading}
                searchKeys={["name", "email", "role"]} 
                searchPlaceholder="Search users…" 
                pageSize={10} 
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Person" size="md"
        footer={<div className="flex gap-3 w-full justify-end">
          <Button variant="ghost" onClick={() => setEditOpen(false)} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
          <Button onClick={onSave} disabled={isSubmitting} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-8">Save Changes</Button>
        </div>}>
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField id="name" name="name" label="Name" required placeholder="Full Name"
              value={values.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} touched={touched.name} />
            <FormField id="email" name="email" label="Email Address" type="email" required placeholder="user@example.com"
              value={values.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} touched={touched.email} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormSelect id="department" name="department" label="Department" required 
              options={Array.isArray(depts) ? depts.map(d => ({ value: d._id, label: `${d.name} (${d.code})` })) : []}
              value={values.department?._id || values.department} onChange={(v) => setValue("department", v)} error={errors.department} touched={touched.department} />
            <FormSelect id="role" label="Work Role" required options={[
              { value: "admin", label: "Admin" },
              { value: "hod", label: "HOD" },
              { value: "faculty", label: "Faculty" },
              { value: "student", label: "Student" },
            ]} value={values.role} onChange={(v) => setValue("role", v)} error={errors.role} touched={touched.role} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="rollNumber" name="rollNumber" label="Register No (Student)" placeholder="e.g. 21BCE001"
              value={values.rollNumber} onChange={handleChange} onBlur={handleBlur} />
            <FormField id="employeeId" name="employeeId" label="Employee ID (Staff)" placeholder="e.g. FAC001"
              value={values.employeeId} onChange={handleChange} onBlur={handleBlur} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="phone" name="phone" label="Phone Number" placeholder="e.g. 9876543210"
              value={values.phone} onChange={handleChange} onBlur={handleBlur} />
            <FormField id="office" name="office" label="Room / Office (Staff)" placeholder="e.g. Block A, 102"
              value={values.office} onChange={handleChange} onBlur={handleBlur} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="designation" name="designation" label="Designation (Staff)" placeholder="e.g. Assistant Professor"
              value={values.designation} onChange={handleChange} onBlur={handleBlur} />
            <FormField id="specialization" name="specialization" label="Specialization (Staff)" placeholder="e.g. Cyber Security"
              value={values.specialization} onChange={handleChange} onBlur={handleBlur} />
          </div>
          <FormSelect id="status" label="Status" options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]}
            value={values.status} onChange={(v) => setValue("status", v)} />

        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete User" message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="destructive" />
    </MainLayout>
  );
}
