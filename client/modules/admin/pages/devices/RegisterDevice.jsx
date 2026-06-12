import { useState } from "react";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { FormField } from "@/shared/components/Form/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/core/constants/routes";
import { Monitor, ArrowLeft } from "lucide-react";
import { useForm } from "@/core/hooks/useForm";

import { useQuery } from "@tanstack/react-query";
import { departmentService, deviceService } from "@/core/api/services";
import { FormSelect } from "@/shared/components/Form/FormField";
import { getAdminNav } from "@/core/constants/navigation";

const NAV = getAdminNav();

export default function RegisterDevice() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: depts } = useQuery({
    queryKey: ["depts-list"],
    queryFn: () => departmentService.getAll(),
  });

  const deptOptions = depts?.map(d => ({ value: d._id, label: `${d.name} (${d.code})` })) || [];

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setValue } =
    useForm({ hostname: "", ip: "", department: "", location: "", mac: "" },
      ({ hostname, ip, department }) => {
        const e = {};
        if (!hostname) e.hostname = "Required";
        if (!ip) e.ip = "Required";
        if (!department) e.department = "Required";
        return e;
      });

  const onSubmit = handleSubmit(async (vals) => {
    try {
      const payload = {
        hostname: vals.hostname,
        ipAddress: vals.ip,
        macAddress: vals.mac,
        department: vals.department,
        location: vals.location,
      };
      await deviceService.register(payload);
      toast({ title: "PC added", description: `${vals.hostname} added to lab network.` });
      navigate(ROUTES.ADMIN_DEVICES);
    } catch (err) {
      toast({ title: "Could not add PC", description: err.message, variant: "destructive" });
    }
  });

  return (
    <MainLayout navItems={NAV} title="Add New PC">
      <div className="max-w-xl mx-auto py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Go Back
        </button>
        <Card className="rounded-[40px] glass border-white/5 relative overflow-hidden shadow-2xl">
          <CardHeader className="flex flex-row items-center gap-4 border-b border-white/5 pb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/10">
              <Monitor className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-black italic uppercase">Add New PC</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary">Add a new computer to the lab</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField id="hostname" name="hostname" label="PC Name" required placeholder="LAB-PC-01"
                  value={values.hostname} onChange={handleChange} onBlur={handleBlur} error={errors.hostname} touched={touched.hostname} />
                <FormField id="ip" name="ip" label="IP" required placeholder="192.168.1.101"
                  value={values.ip} onChange={handleChange} onBlur={handleBlur} error={errors.ip} touched={touched.ip} />
                <FormSelect id="department" label="Department" required options={deptOptions}
                  value={values.department} onChange={(v) => setValue("department", v)} error={errors.department} touched={touched.department} />
                <FormField id="location" name="location" label="Area" placeholder="Block B, R201"
                  value={values.location} onChange={handleChange} onBlur={handleBlur} />
                <FormField id="mac" name="mac" label="PC Code" placeholder="AA:BB:CC:DD:EE:FF" className="sm:col-span-2"
                  value={values.mac} onChange={handleChange} onBlur={handleBlur} />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="ghost" className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-[10px]" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl h-12 px-10 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">Add PC</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
