import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/core/api/client";
import { getStudentNav } from "@/core/constants/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => apiClient.get("/api/profile")
  });

  return (
    <MainLayout navItems={getStudentNav()} title="My Profile">
      <div className="max-w-xl mx-auto space-y-5">
        <Card className="rounded-[40px] glass border-white/5 shadow-2xl overflow-hidden relative">
          <div className="h-24 bg-primary/20 absolute top-0 left-0 w-full" />
          <CardContent className="pt-12 relative">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="w-24 h-24 rounded-[32px] mx-auto" />
                <Skeleton className="w-48 h-8 mx-auto" />
                <Skeleton className="w-full h-64 rounded-[32px]" />
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-3xl font-black shrink-0 shadow-2xl border-4 border-background">
                    {profile?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="text-center mt-4">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">{profile?.name}</h2>
                    <p className="text-sm font-bold text-muted-foreground">{profile?.email}</p>
                    <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-black uppercase tracking-widest mt-2 inline-block">Student Account</span>
                  </div>
                </div>
                <div className="space-y-4 p-4 rounded-[32px] bg-white/5 border border-white/5">
                  {[
                    { label: "Roll Number", value: profile?.rollNumber || "N/A" },
                    { label: "Department", value: profile?.department?.name || profile?.department || "N/A" },
                    { label: "Semester", value: profile?.semester || "N/A" },
                    { label: "Academic Year", value: profile?.academicYear || "N/A" },
                    { label: "My CGPA", value: profile?.cgpa > 0 ? profile.cgpa : "N/A" },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 px-2">
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{f.label}</span>
                      <span className="text-sm font-black italic">{f.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
