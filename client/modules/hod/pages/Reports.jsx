import { useState } from "react";
import { MainLayout } from "@/shared/layouts/MainLayout";
import { getHODNav } from "@/core/constants/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, FileText, FileSpreadsheet, FileJson, Printer, BarChart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NAV = getHODNav();

const REPORT_TYPES = [
  "Exam Summary Report",
  "Student Answer Report",
  "Student Performance Report",
  "Student Violation Report",
  "Student Risk Report",
  "Faculty Monitoring Report",
  "Faculty Evaluation Report",
  "Department Performance Report",
  "Department Violation Report",
  "Exam Attendance Report",
  "Exam Completion Report",
  "Question Analysis Report",
  "Question Difficulty Report",
  "Coding Evaluation Report",
  "Evidence Report"
];

export default function HODReportingEngine() {
  const [selectedReport, setSelectedReport] = useState(REPORT_TYPES[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = (format) => {
    setIsGenerating(true);
    // Simulate data fetch and generate actual file
    setTimeout(() => {
      setIsGenerating(false);
      try {
        const dummyData = [
          { studentName: "John Doe", rollNumber: "21CS101", testTitle: "Advanced Python Lab", marks: "85/100", status: "Passed", date: new Date().toLocaleDateString() },
          { studentName: "Jane Smith", rollNumber: "21CS102", testTitle: "Advanced Python Lab", marks: "92/100", status: "Passed", date: new Date().toLocaleDateString() },
          { studentName: "Alice Johnson", rollNumber: "21CS103", testTitle: "Advanced Python Lab", marks: "45/100", status: "Failed", date: new Date().toLocaleDateString() },
          { studentName: "Bob Wilson", rollNumber: "21CS104", testTitle: "Advanced Python Lab", marks: "78/100", status: "Passed", date: new Date().toLocaleDateString() },
          { studentName: "Charlie Brown", rollNumber: "21CS105", testTitle: "Advanced Python Lab", marks: "88/100", status: "Passed", date: new Date().toLocaleDateString() }
        ];

        let blob, filename;

        if (format === "json") {
          blob = new Blob([JSON.stringify(dummyData, null, 2)], { type: "application/json" });
          filename = `${selectedReport.replace(/\s+/g, "_")}.json`;
        } else if (format === "csv" || format === "excel") {
          const headers = Object.keys(dummyData[0]).join(",");
          const rows = dummyData.map(obj => Object.values(obj).join(",")).join("\n");
          blob = new Blob([`${headers}\n${rows}`], { type: format === "excel" ? "application/vnd.ms-excel" : "text/csv;charset=utf-8;" });
          filename = `${selectedReport.replace(/\s+/g, "_")}.${format === "excel" ? "xls" : "csv"}`;
        }

        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success(`${selectedReport} exported and downloaded successfully`);
        } 
        
        if (format === "pdf" || format === "print") {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
          
          const doc = iframe.contentWindow.document;
          const reportHTML = `
            <html>
              <head>
                <title>${selectedReport}</title>
                <style>
                  body { font-family: system-ui, sans-serif; padding: 40px; color: #000; }
                  h1 { text-align: center; text-transform: uppercase; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                  th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                  th { background-color: #f8f9fa; text-transform: uppercase; font-weight: bold; }
                  tr:nth-child(even) { background-color: #f8f9fa; }
                  .header { display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; font-size: 12px; color: #666; }
                </style>
              </head>
              <body>
                <div class="header">
                  <span>DEPARTMENT: COMPUTER SCIENCE</span>
                  <span>DATE: ${new Date().toLocaleDateString()}</span>
                </div>
                <h1>${selectedReport}</h1>
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Roll Number</th>
                      <th>Test Title</th>
                      <th>Marks</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>John Doe</td><td>21CS101</td><td>Advanced Python Lab</td><td>85/100</td><td>Passed</td><td>${new Date().toLocaleDateString()}</td></tr>
                    <tr><td>Jane Smith</td><td>21CS102</td><td>Advanced Python Lab</td><td>92/100</td><td>Passed</td><td>${new Date().toLocaleDateString()}</td></tr>
                    <tr><td>Alice Johnson</td><td>21CS103</td><td>Advanced Python Lab</td><td>45/100</td><td>Failed</td><td>${new Date().toLocaleDateString()}</td></tr>
                    <tr><td>Bob Wilson</td><td>21CS104</td><td>Advanced Python Lab</td><td>78/100</td><td>Passed</td><td>${new Date().toLocaleDateString()}</td></tr>
                    <tr><td>Charlie Brown</td><td>21CS105</td><td>Advanced Python Lab</td><td>88/100</td><td>Passed</td><td>${new Date().toLocaleDateString()}</td></tr>
                  </tbody>
                </table>
              </body>
            </html>
          `;
          
          doc.open();
          doc.write(reportHTML);
          doc.close();

          setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            document.body.removeChild(iframe);
            toast.success("Opening print dialog for PDF export");
          }, 500);
        }
      } catch (err) {
        toast.error("Export failed: " + err.message);
      }
    }, 1000);
  };

  return (
    <MainLayout navItems={NAV} title="Department Reports">
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
             Reporting Engine <BarChart className="w-10 h-10 text-primary" />
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-2">
            Department analytics and data exports
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Report Selection */}
          <Card className="md:col-span-2 glass rounded-[40px] border-white/5 shadow-2xl">
            <CardHeader className="p-8 border-b border-white/5">
               <CardTitle className="text-xl font-black uppercase italic tracking-widest">Select Report Type</CardTitle>
               <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60 tracking-widest">
                  Choose from standard department reports
               </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger className="w-full h-14 rounded-2xl bg-white/5 border-white/10 font-black text-sm uppercase tracking-widest px-6 focus:ring-primary">
                  <SelectValue placeholder="Select Report..." />
                </SelectTrigger>
                <SelectContent className="bg-black border border-white/10 rounded-2xl">
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="font-bold text-xs uppercase tracking-widest py-3 hover:bg-primary/20">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20">
                <h4 className="font-black uppercase tracking-widest text-primary text-[10px] mb-2">Selected Report Overview</h4>
                <p className="text-sm font-bold text-foreground/80">
                  This report will generate comprehensive metrics and historical data for {selectedReport.toLowerCase()}.
                  The output will include full data columns, aggregations, and visual summaries. Data is scoped strictly to your assigned department.
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Export Formats */}
          <Card className="glass rounded-[40px] border-white/5 shadow-2xl">
            <CardHeader className="p-8 border-b border-white/5">
               <CardTitle className="text-xl font-black uppercase italic tracking-widest text-center">Export Format</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
               <div className="flex flex-col gap-4">
                  <Button 
                    onClick={() => handleExport("pdf")} 
                    disabled={isGenerating}
                    className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest justify-start px-6 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all"
                  >
                    <FileText className="w-5 h-5 mr-4" /> Export as PDF
                  </Button>
                  
                  <Button 
                    onClick={() => handleExport("excel")} 
                    disabled={isGenerating}
                    className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest justify-start px-6 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all"
                  >
                    <FileSpreadsheet className="w-5 h-5 mr-4" /> Export as Excel
                  </Button>

                  <Button 
                    onClick={() => handleExport("csv")} 
                    disabled={isGenerating}
                    className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest justify-start px-6 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 transition-all"
                  >
                    <FileText className="w-5 h-5 mr-4" /> Export as CSV
                  </Button>

                  <Button 
                    onClick={() => handleExport("json")} 
                    disabled={isGenerating}
                    className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest justify-start px-6 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20 transition-all"
                  >
                    <FileJson className="w-5 h-5 mr-4" /> Export as JSON
                  </Button>

                  <div className="my-2 border-t border-white/5" />

                  <Button 
                    onClick={() => handleExport("print")} 
                    variant="outline"
                    className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest justify-start px-6 border-white/10 hover:bg-white/10 transition-all"
                  >
                    <Printer className="w-5 h-5 mr-4" /> Print View
                  </Button>
               </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </MainLayout>
  );
}
