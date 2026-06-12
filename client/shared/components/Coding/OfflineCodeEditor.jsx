import React, { useState, useEffect } from "react";
import Editor, { loader } from "@monaco-editor/react";
import { Play, Terminal, Trash2, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/core/api/client";
import { useToast } from "@/hooks/use-toast";

// ─── Configure Monaco for OFFLINE usage ──────────────────────────────────────
// This prevents it from trying to fetch the worker scripts from jsDelivr/CDN
loader.config({
  paths: {
    vs: "/monaco/vs", // Point to local assets in public folder
  },
});

const DEFAULT_CODE = {
  python: 'print("Hello from Python!")',
  javascript: 'console.log("Hello from JavaScript!");',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
  rust: 'fn main() {\n    println!("Hello from Rust!");\n}',
  bash: 'echo "Hello from Bash!"'
};

export const OfflineCodeEditor = ({ initialValue, language: initialLang, onCodeChange }) => {
  const [language, setLanguage] = useState(initialLang || "python");
  const [code, setCode] = useState(initialValue || DEFAULT_CODE[language]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [compilers, setCompilers] = useState({
      javascript: true, python: true, java: true, rust: true, c: false, cpp: false, bash: true
  });
  const { toast } = useToast();

  useEffect(() => {
    // Probe server for available compilers
    apiClient.get("/api/code/check").then(res => {
        if (res.compilers) setCompilers(res.compilers);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!initialValue) {
      setCode(DEFAULT_CODE[language]);
    }
  }, [language]);

  const handleRun = async () => {
    try {
      setIsRunning(true);
      setOutput("Connecting to execution node...");
      setError("");
      console.log("🚀 [Terminal] Initiating run request...");

      const response = await apiClient.post("/api/code/run", {
        language,
        code,
        input
      });

      console.log("✅ [Terminal] Execution complete:", response);
      setOutput(response.output || "");
      if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      toast.error("Execution failed: " + (err.response?.data?.message || err.message));
      setError("Network Error: Ensure the LAN server is reachable.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Select value={language} onValueChange={setLanguage}>
             <SelectTrigger className="w-[180px] bg-white/5 border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest text-primary">
               <SelectValue placeholder="Language" />
             </SelectTrigger>
             <SelectContent className="glass border-white/5 rounded-2xl">
               <SelectItem value="python">Python 3 {compilers.python ? "✅" : "⚠️"}</SelectItem>
               <SelectItem value="javascript">Node.js {compilers.javascript ? "✅" : "⚠️"}</SelectItem>
               <SelectItem value="c">C (GCC) {compilers.c ? "✅" : "⚠️"}</SelectItem>
               <SelectItem value="cpp">C++ (G++) {compilers.cpp ? "✅" : "⚠️"}</SelectItem>
               <SelectItem value="java">Java (JDK) {compilers.java ? "✅" : "⚠️"}</SelectItem>
               <SelectItem value="rust">Rust (rustc) {compilers.rust ? "✅" : "⚠️"}</SelectItem>
               <SelectItem value="bash">Bash (Git) {compilers.bash ? "✅" : "⚠️"}</SelectItem>
             </SelectContent>
           </Select>
           
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl">
              <Cpu className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Offline Engine Active</span>
           </div>
        </div>

        <Button 
          onClick={handleRun} 
          disabled={isRunning}
          className="bg-primary hover:bg-primary/80 text-white rounded-xl px-8 font-black uppercase italic transition-all shadow-lg shadow-primary/20"
        >
          {isRunning ? "Running..." : <><Play className="w-4 h-4 mr-2" /> Run Code</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Editor */}
        <Card className="lg:col-span-2 rounded-[32px] overflow-hidden border-white/5 bg-[#1e1e1e] shadow-2xl">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === "cpp" ? "cpp" : language}
            value={code}
            onChange={(val) => {
                setCode(val);
                if (onCodeChange) onCodeChange(val);
            }}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: "JetBrains Mono, Fira Code, monospace",
              padding: { top: 20, bottom: 20 }
            }}
          />
        </Card>

        {/* Input/Output */}
        <div className="flex flex-col space-y-6">
          <Card className="rounded-[32px] p-6 bg-white/5 border-white/5 shadow-xl flex flex-col h-1/3">
             <div className="flex items-center justify-between mb-4">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Standard Input</h4>
               <Terminal className="w-4 h-4 text-muted-foreground" />
             </div>
             <textarea 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               className="flex-1 w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-sm font-mono focus:border-primary/50 outline-none transition-all resize-none"
               placeholder="Pass inputs if any..."
             />
          </Card>

          <Card className="rounded-[32px] p-6 bg-black/40 border-white/5 shadow-xl flex flex-col flex-1 overflow-hidden relative">
             <div className="flex items-center justify-between mb-4">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Output Console</h4>
               <Button variant="ghost" size="icon" onClick={() => setOutput("")} className="h-8 w-8 hover:bg-white/5">
                 <Trash2 className="w-4 h-4 text-muted-foreground" />
               </Button>
             </div>
             <div className="flex-1 overflow-auto font-mono text-sm space-y-2 pr-2">
               {output && (
                 <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">{output}</pre>
               )}
               {error && (
                 <pre className="text-rose-500 whitespace-pre-wrap leading-relaxed bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">{error}</pre>
               )}
               {!output && !error && (
                 <p className="text-muted-foreground/30 italic">Console is empty. Run your code to see results.</p>
               )}
             </div>
             
             {isRunning && (
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-black italic uppercase text-xs tracking-widest text-primary animate-pulse">Computing...</p>
                 </div>
               </div>
             )}
          </Card>
        </div>
      </div>
    </div>
  );
};
