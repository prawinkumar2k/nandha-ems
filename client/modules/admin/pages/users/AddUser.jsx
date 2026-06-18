import { motion } from "framer-motion";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { FormField, FormSelect } from "@/shared/components/Form/FormField";
import { useForm } from "@/core/hooks/useForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/core/constants/routes";
import { validateUserForm } from "@/core/utils/helpers";
import { ArrowLeft, UserPlus, Shield, Sparkles } from "lucide-react";
import { getAdminNav } from "@/core/constants/navigation";

const NAV = getAdminNav();

import { useQuery } from "@tanstack/react-query";
import { departmentService, userService } from "@/core/api/services";

const ROLE_OPTIONS = ["admin", "hod", "faculty", "student"].map((r) => ({ value: r, label: r.toUpperCase() }));

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

export default function AddUser() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: depts } = useQuery({
    queryKey: ["depts-list"],
    queryFn: () => departmentService.getAll(),
  });

  const deptOptions = Array.isArray(depts) 
    ? depts.map(d => ({ value: d._id, label: `${d.name} (${d.code})` })) 
    : [];

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setValue } =
    useForm({ name: "", email: "", role: "student", department: "", rollNumber: "", employeeId: "", password: "" }, validateUserForm);

  const onSubmit = handleSubmit(async (vals) => {
    try {
      await userService.create(vals);
      toast({ title: "User Saved", description: `${vals.name} has been added successfully.` });
      navigate(ROUTES.ADMIN_USERS);
    } catch (err) {
      toast({ title: "Could not add user", description: err.message, variant: "destructive" });
    }
  });

  return (
    <MainLayout navItems={NAV} title="Add New User">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto py-8"
      >
        <motion.button 
          variants={itemVariants}
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary mb-8 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Go Back
        </motion.button>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[40px] glass border-white/5 relative overflow-hidden shadow-2xl">
            <CardHeader className="flex flex-row items-center gap-6 border-b border-white/5 pb-8 lg:px-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/10">
                <UserPlus className="w-7 h-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black italic uppercase">Add New Person</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">Fill in user information</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8 lg:p-10">
              <form onSubmit={onSubmit} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <FormField id="name" name="name" label="Name" required placeholder="e.g. John Doe"
                      className="rounded-2xl border-white/10 bg-white/5"
                      value={values.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} touched={touched.name} />
                  </div>
                  <div className="space-y-2">
                    <FormField id="email" name="email" label="Email" type="email" required placeholder="user@example.com"
                      className="rounded-2xl border-white/10 bg-white/5"
                      value={values.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} touched={touched.email} />
                  </div>
                  <div className="space-y-2">
                    <FormField id="password" name="password" label="Password" type="password" required placeholder="Temporary password"
                      className="rounded-2xl border-white/10 bg-white/5"
                      value={values.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} touched={touched.password} />
                  </div>
                  <div className="space-y-2">
                    <FormSelect id="role" label="Work Role" required options={ROLE_OPTIONS}
                      className="rounded-2xl border-white/10 bg-white/5"
                      value={values.role} onChange={(v) => setValue("role", v)} error={errors.role} touched={touched.role} />
                  </div>
                  <div className="space-y-2">
                    <FormSelect id="department" label="Department" required options={deptOptions}
                      className="rounded-2xl border-white/10 bg-white/5"
                      value={values.department} onChange={(v) => setValue("department", v)} error={errors.department} touched={touched.department} />
                  </div>
                  {(values.role === 'student' || values.role === 'client') && (
                    <div className="space-y-2">
                      <FormField id="rollNumber" name="rollNumber" label="Register No (Student/Client)" placeholder="e.g. 21BCE001"
                        className="rounded-2xl border-white/10 bg-white/5"
                        value={values.rollNumber} onChange={handleChange} onBlur={handleBlur} />
                    </div>
                  )}
                  {['faculty', 'hod', 'admin'].includes(values.role) && (
                    <div className="space-y-2">
                      <FormField id="employeeId" name="employeeId" label="Employee ID (Staff)" placeholder="e.g. FAC001"
                        className="rounded-2xl border-white/10 bg-white/5"
                        value={values.employeeId} onChange={handleChange} onBlur={handleBlur} />
                    </div>
                  )}
                </div>

                <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/10 relative overflow-hidden group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight flex items-center gap-2">
                         Login Info <Sparkles className="w-3 h-3 text-accent" />
                      </p>
                      <p className="text-muted-foreground text-xs leading-relaxed mt-1 font-medium">
                        The user must use the password specified above to login. They will be required to change it upon their first successful login.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="ghost" className="rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-widest hover:bg-white/5" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="rounded-2xl h-14 px-10 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20">
                    {isSubmitting ? "Adding..." : "Add Person"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
