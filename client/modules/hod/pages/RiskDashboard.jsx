import { useState, useEffect } from "react";
import { AlertTriangle, Activity, RefreshCw, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { apiClient as api } from "@/core/api/client";
import { MainLayout } from "@/shared/layouts/MainLayout";

export default function RiskDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/analytics/risk-dashboard");
      setProfiles(Array.isArray(res) ? res : (res.data || []));
    } catch (err) {
      toast.error("Failed to load risk dashboard");
    }
  };

  const handleRecalculate = async () => {
    setIsCalculating(true);
    try {
      const res = await api.post("/analytics/calculate-risk");
      toast.success(res.message || res.data?.message || "Metrics recalculated");
      fetchDashboard();
    } catch (err) {
      toast.error("Calculation failed");
    } finally {
      setIsCalculating(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case "critical": return "bg-red-100 text-red-700 border-red-200";
      case "high": return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const criticalCount = profiles.filter(p => p.riskLevel === "critical" || p.riskLevel === "high").length;

  return (
    <MainLayout title="Risk Analytics">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Predictive Intelligence</h1>
          <p className="text-muted-foreground">Proactive identification of at-risk students based on exams, engagement, and violations.</p>
        </div>
        <Button onClick={handleRecalculate} disabled={isCalculating} variant="outline" className="bg-background">
          <RefreshCw className={`w-4 h-4 mr-2 ${isCalculating ? "animate-spin" : ""}`} />
          {isCalculating ? "Crunching Data..." : "Run Analysis"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-100">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">High Risk Students</p>
              <h2 className="text-3xl font-bold text-red-700">{criticalCount}</h2>
            </div>
            <div className="h-12 w-12 bg-red-200/50 rounded-full flex items-center justify-center">
              <UserX className="text-red-600 w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>At-Risk Student Roster</CardTitle>
          <CardDescription>Top 50 students sorted by calculated risk probability.</CardDescription>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No risk profiles generated. Run an analysis to populate data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Student</th>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="px-4 py-3">Risk Level</th>
                    <th className="px-4 py-3">Probability Score</th>
                    <th className="px-4 py-3 rounded-tr-lg">Primary Factors (AI Logic)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {profiles.map((p) => (
                    <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-foreground">
                        {p.student?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                        {p.student?.rollNumber || "N/A"}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getRiskColor(p.riskLevel)}`}>
                          {p.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{p.riskScore}%</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className={`h-full ${p.riskScore >= 75 ? 'bg-red-500' : p.riskScore >= 50 ? 'bg-orange-500' : 'bg-green-500'}`} 
                              style={{ width: `${p.riskScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {p.primaryFactors.length === 0 ? (
                            <span className="text-muted-foreground italic text-xs">No specific flags</span>
                          ) : (
                            p.primaryFactors.map((factor, idx) => (
                              <span key={idx} className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">
                                {factor}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  );
}
