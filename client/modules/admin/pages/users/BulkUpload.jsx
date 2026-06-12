import { useState } from "react";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/shared/components/Alerts/Alert";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/core/constants/routes";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { userService } from "@/core/api/services";

import { getAdminNav } from "@/core/constants/navigation";

const NAV = getAdminNav();

const SAMPLE_DATA = `name,email,role,department
Alice Johnson,alice@example.com,student,CSE
Bob Smith,bob@example.com,faculty,ECE
Carol White,carol@example.com,student,ME`;

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [allData, setAllData] = useState([]);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    // Parse CSV
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
      setPreview(rows.slice(0, 5)); // Show first 5 for preview
    };
    reader.readAsText(f);
  };

  const handleUpload = async () => {
    if (allData.length === 0) return;
    setUploading(true);
    try {
      const res = await userService.bulkUpload(allData);
      setResult(res);
      toast({ 
        title: "Done", 
        description: `${res.success} people added successfully.` 
      });
    } catch (err) {
      toast({ title: "Could not upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_DATA], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "users_template.csv"; a.click();
  };

  return (
    <MainLayout navItems={NAV} title="Add Many Users">
      <div className="max-w-2xl mx-auto space-y-5">
        <Alert variant="info" title="File Needed"
          message="Download the example file below and fill in info. Each row is one person." />

        {/* Template Download */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 1: Download Example File</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={downloadTemplate} className="gap-2">
              <Download className="w-4 h-4" /> Save Example File
            </Button>
          </CardContent>
        </Card>

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 2: Upload File</CardTitle>
            <CardDescription>Upload the file here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
              <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
              <FileSpreadsheet className={`w-10 h-10 mb-3 ${file ? "text-primary" : "text-muted-foreground"}`} />
              {file ? (
                <div className="text-center">
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-medium text-sm"><span className="text-primary">Click to upload</span> or drag & drop</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Excel files only</p>
                </div>
              )}
            </label>

            {/* Preview */}
            {preview.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Look (first 3 rows)</p>
                <div className="overflow-x-auto rounded-lg border border-border text-xs">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>{Object.keys(preview[0]).map((k) => <th key={k} className="text-left px-3 py-2 font-semibold">{{
                        name: "Name",
                        email: "Email",
                        role: "Work Role",
                        department: "Department"
                      }[k] || k}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {preview.map((row, i) => (
                        <tr key={i}>{Object.values(row).map((v, j) => <td key={j} className="px-3 py-2">{v}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Adding People…" : "Add People Now"}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-success" />
                <div>
                  <p className="font-bold uppercase tracking-tight italic">All Done</p>
                  <p className="text-sm text-muted-foreground font-medium">
                    {result.success} added · {result.errors} errors · {result.skipped} didn't add
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
