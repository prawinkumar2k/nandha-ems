import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/core/api/client";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/core/constants/routes";
import { getFacultyNav } from "@/core/constants/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, BarChart3, Search, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const NAV = getFacultyNav();

export default function FacultyResults() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: results, isLoading } = useQuery({
    queryKey: ["faculty-results"],
    queryFn: () => apiClient.get("/api/reports/faculty/results"),
  });

  const safeResults = Array.isArray(results) ? results : [];

  const filtered = safeResults.filter(r => 
    r.student?.toLowerCase().includes(search.toLowerCase()) ||
    r.exam?.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <MainLayout navItems={NAV} title="Test Results">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              Score Board <BarChart3 className="w-8 h-8 text-primary" />
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Review and download student marks</p>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="SEARCH STUDENT OR TEST..." 
              className="pl-12 rounded-2xl h-12 bg-white/5 border-white/10 font-black text-[10px] uppercase tracking-widest"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Card className="rounded-[40px] glass border-white/5 overflow-hidden shadow-2xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="py-6 pl-10 text-[10px] font-black uppercase tracking-widest text-primary">Student</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Test Title</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary text-center">Score</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary text-center">Status</TableHead>
                  <TableHead className="pr-10 text-right text-[10px] font-black uppercase tracking-widest text-primary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <TableRow key={i} className="animate-pulse border-white/5">
                      <TableCell colSpan={5} className="h-20 bg-white/5" />
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} className="h-60 text-center opacity-20 font-black italic uppercase tracking-widest">No results found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id || r._id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="py-6 pl-10">
                        <p className="font-bold text-sm tracking-tight">{r.student}</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground/40">{r.roll}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-lg border-primary/20 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1">
                          {r.exam}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <p className={`text-lg font-black italic ${r.percentage >= 40 ? "text-emerald-500" : "text-rose-500"}`}>
                          {r.score} / {r.total || 100}
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase">{Math.round(r.percentage || 0)}%</p>
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge className={`rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border-none ${r.status === 'passed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                           {r.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="pr-10 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-10 px-4 rounded-xl border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary font-black uppercase tracking-widest text-[9px]"
                            onClick={() => navigate(`/faculty/evidence/${r.examId}/${r.studentId}`)}
                          >
                             <Play className="w-3.5 h-3.5 mr-2" /> Recording
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                            onClick={() => navigate(`/faculty/results/${r.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="w-10 h-10 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>

                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
