import { useState } from "react";
import { Modal } from "@/shared/components/Modal/Modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, Upload, Download, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/core/api/client";

export function BulkOnboardingModal({ isOpen, onClose, targetRole, onComplete }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [allData, setAllData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const sampleHeaders = targetRole === "student" 
    ? "name,email,rollNumber,password" 
    : "name,email,employeeId,password";

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split("\n").filter(l => l.trim() !== "");
      if (lines.length < 2) return;
      
      const headers = lines[0].split(",").map(h => h.trim());
      const rows = lines.slice(1).map((line) => {
        const vals = line.split(",").map(v => v.trim());
        return headers.reduce((obj, h, i) => ({ ...obj, [h]: vals[i] || "" }), {});
      });
      
      setAllData(rows);
      setPreview(rows.slice(0, 3));
    };
    reader.readAsText(f);
  };

  const handleUpload = async () => {
    if (allData.length === 0) return;
    setUploading(true);
    try {
      const res = await apiClient.post("/api/hod/bulk", { 
        users: allData,
        role: targetRole 
      });
      setResult(res);
      toast.success("Intelligence Synchronization Complete", {
        description: `${res.success} profiles added to the department directory.`,
      });
      if (onComplete) onComplete();
    } catch (err) {
      toast.error("Process Halted", { description: err.message });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([sampleHeaders + "\nJohn Doe,john@nec.edu,ID_123,pass123"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetRole}_template.csv`;
    a.click();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bulk ${targetRole === 'student' ? 'Student' : 'Faculty'} Onboarding`}
      description={`Upload a CSV file to mass-populate the AI & DS department directory.`}
      size="lg"
    >
      <div className="space-y-6 pt-4">
        {!result ? (
          <>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                   <Download className="w-4 h-4" />
                </div>
                <p className="text-sm font-bold">Standardized Template</p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="rounded-xl font-bold h-9">
                Get CSV Structure
              </Button>
            </div>

            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-[32px] p-10 cursor-pointer transition-all ${file ? "border-primary bg-primary/5 shadow-inner" : "border-white/10 hover:border-primary/50"}`}>
              <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
              <FileSpreadsheet className={`w-12 h-12 mb-4 ${file ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
              {file ? (
                <div className="text-center">
                  <p className="font-black text-sm tracking-tight">{file.name}</p>
                  <p className="text-[10px] font-black uppercase text-muted-foreground mt-1 tracking-widest">{allData.length} records detected</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-bold text-sm leading-none">Drop CSV intelligence file here</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">or click to browse local storage</p>
                </div>
              )}
            </label>

            {preview.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Data Preview</p>
                <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/20">
                  <table className="w-full text-[10px]">
                    <thead className="bg-white/5 border-b border-white/5">
                      <tr>
                        {Object.keys(preview[0]).map(k => <th key={k} className="px-4 py-2 text-left font-black uppercase tracking-tighter opacity-50">{k}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {preview.map((row, i) => (
                         <tr key={i}>
                            {Object.values(row).map((v, j) => <td key={j} className="px-4 py-2 font-bold">{v}</td>)}
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Button 
               onClick={handleUpload} 
               disabled={!file || uploading} 
               className="w-full rounded-2xl h-14 font-black shadow-lg shadow-primary/20 text-lg"
            >
              {uploading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Synchronizing Core...</>
              ) : (
                <><Upload className="w-5 h-5 mr-2" /> Start Processing</>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-6 text-center py-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter">Directory Updated</h3>
              <p className="text-muted-foreground font-bold mt-1">Intelligence synchronized successfully.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-2xl font-black text-emerald-500">{result.success}</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">Success</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-2xl font-black text-red-500">{result.errors}</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">Errors</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-2xl font-black text-blue-500">{result.skipped}</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">Skipped</p>
              </div>
            </div>
            <Button onClick={onClose} className="w-full rounded-2xl h-12 font-bold">Return to Console</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
