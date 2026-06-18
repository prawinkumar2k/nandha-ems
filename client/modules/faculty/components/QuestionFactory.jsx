import { 
  Code2, Type, Hash, FileUp, ListChecks, Trash2, 
  Plus, ChevronDown, ChevronUp, AlertCircle, Sparkles,
  FunctionSquare, Sigma, Pi, Calculator, Variable, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormSelect, FormTextarea } from "@/shared/components/Form/FormField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice", icon: <ListChecks className="w-4 h-4" /> },
  { value: "coding", label: "Programming", icon: <Code2 className="w-4 h-4" /> },
  { value: "text", label: "Open Text (Theory)", icon: <Type className="w-4 h-4" /> },
  { value: "math", label: "Mathematics (LaTeX)", icon: <Hash className="w-4 h-4" /> },
  { value: "file", label: "File Submission", icon: <FileUp className="w-4 h-4" /> },
];

const MATH_PALETTE = [
  { label: "Fraction", latex: "\\frac{}{}", icon: <span className="text-[10px] font-bold">÷</span> },
  { label: "Root", latex: "\\sqrt{}", icon: <span className="text-[10px] font-bold">√</span> },
  { label: "Power", latex: "^{}", icon: <span className="text-[10px] font-bold">x²</span> },
  { label: "Pi", latex: "\\pi", icon: <Pi className="w-3 h-3" /> },
  { label: "Sigma", latex: "\\sum_{}^{}", icon: <Sigma className="w-3 h-3" /> },
  { label: "Integral", latex: "\\int_{}^{}", icon: <span className="text-[10px] font-bold">∫</span> },
  { label: "Theta", latex: "\\theta", icon: <span className="text-[10px] font-bold">θ</span> },
  { label: "Delta", latex: "\\Delta", icon: <span className="text-[10px] font-bold">Δ</span> },
];

export function QuestionFactory({ question, index, onChange, onRemove, onImportSource }) {
  const updateField = (field, value) => onChange(index, field, value);

  const insertLatex = (latex) => {
    const currentText = question.questionText || "";
    // If it's a math question, we might want to wrap in $$ automatically if not there
    updateField("questionText", currentText + latex);
  };

  return (
    <Card className="rounded-[32px] glass border-white/5 overflow-hidden group transition-all hover:shadow-2xl hover:shadow-primary/5">
      <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/20 text-primary font-black rounded-lg px-3">Q{index + 1}</Badge>
          <FormSelect 
            options={QUESTION_TYPES} 
            value={question.type} 
            onChange={(val) => updateField("type", val)}
            className="w-48 h-9 border-none bg-transparent font-black uppercase text-[10px] tracking-widest"
          />
        </div>
        <div className="flex items-center gap-1">
          {onImportSource && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onImportSource}
              className="text-primary hover:bg-primary/10 rounded-xl transition-colors h-8 gap-2 px-3"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Vault</span>
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onRemove(index)}
            className="text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-5">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Question Intelligence Statement</p>
            {question.type === "math" && (
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                {MATH_PALETTE.map((item) => (
                  <Button 
                    key={item.label}
                    variant="ghost" 
                    size="sm" 
                    onClick={() => insertLatex(item.latex)}
                    className="h-7 px-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-all group/math"
                    title={item.label}
                  >
                    {item.icon}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <FormTextarea 
            placeholder="Analyze the following scenario..."
            value={question.questionText}
            onChange={(e) => updateField("questionText", e.target.value)}
            className="rounded-2xl min-h-[100px] font-bold focus:ring-primary/20 transition-all border-white/10"
          />
        </div>

        {/* Dynamic Fields Based on Type */}
        {question.type === "mcq" && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-2 gap-4">
              {['A', 'B', 'C', 'D'].map(opt => (
                <FormField 
                  key={opt}
                  label={`Option ${opt}`}
                  value={question.options?.[opt] || ""}
                  onChange={(e) => updateField("options", { ...(question.options || {}), [opt]: e.target.value })}
                  className="rounded-xl border-white/10"
                />
              ))}
            </div>
            <FormSelect 
              label="Verified Correct Key" 
              options={['A','B','C','D'].map(l => ({ value: l, label: `Option ${l}` }))}
              value={question.correctAnswer}
              onChange={(v) => updateField("correctAnswer", v)}
            />
          </div>
        )}

        {question.type === "coding" && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <FormSelect 
              label="Standard Runtime Environment" 
              options={[
                { value: "python", label: "Python 3.10" },
                { value: "javascript", label: "Node.js 18" },
                { value: "cpp", label: "C++ 20" },
                { value: "c", label: "C (GCC 11)" },
                { value: "java", label: "Java (OpenJDK 17)" },
                { value: "rust", label: "Rust (1.40)" },
                { value: "bash", label: "Bash (Script)" }
              ]}
              value={question.language}
              onChange={(v) => updateField("language", v)}
            />
            <div className="space-y-3 p-4 rounded-3xl bg-black/20 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Unit Test Cases</p>
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => updateField("testCases", [...(question.testCases || []), { input: "", output: "" }])}
                   className="h-7 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 px-4 rounded-lg"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Case
                </Button>
              </div>
              {(question.testCases || []).map((tc, tci) => (
                <div key={tci} className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 relative group/tc">
                   <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase text-muted-foreground ml-2">Input</span>
                      <FormField 
                        value={tc.input} 
                        onChange={(e) => {
                          const newTC = [...question.testCases];
                          newTC[tci].input = e.target.value;
                          updateField("testCases", newTC);
                        }}
                        className="text-[10px] h-9 rounded-xl glass border-white/10"
                      />
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase text-muted-foreground ml-2">Expected Output</span>
                      <FormField 
                        value={tc.output}
                        onChange={(e) => {
                          const newTC = [...question.testCases];
                          newTC[tci].output = e.target.value;
                          updateField("testCases", newTC);
                        }}
                        className="text-[10px] h-9 rounded-xl glass border-white/10"
                      />
                   </div>
                   <button 
                     onClick={() => updateField("testCases", question.testCases.filter((_, idx) => idx !== tci))}
                     className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover/tc:opacity-100 transition-all hover:scale-110 shadow-lg shadow-red-500/20"
                   >
                     <Trash2 className="w-3 h-3" />
                   </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {question.type === "text" && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <FormSelect 
              label="Response Payload Size" 
              options={[{value: "short", label: "Short Answer (One Word/Sentence)"}, {value: "long", label: "Descriptive (Full Analysis)"}]}
              value={question.answerType}
              onChange={(v) => updateField("answerType", v)}
            />
            {question.answerType === "short" && (
              <FormField 
                 label="Validation Keyword" 
                 placeholder="Expected answer for auto-grading..."
                 value={question.correctAnswer}
                 onChange={(e) => updateField("correctAnswer", e.target.value)}
                 className="rounded-xl border-white/10"
              />
            )}
          </div>
        )}

        {question.type === "math" && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
             <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex gap-3 text-orange-500/80">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-[10px] font-bold">Equation engine supports standard LaTeX syntax. Surround formulas with double dollars, e.g., <code className="bg-orange-500/10 px-1 rounded">$$E=mc^2$$</code>. Use the palette above to build your formula.</p>
             </div>
             <FormField 
                 label="Numerical Solution" 
                 placeholder="Result value..."
                 value={question.correctAnswer}
                 onChange={(e) => updateField("correctAnswer", e.target.value)}
                 className="rounded-xl border-white/10"
             />
          </div>
        )}

        {question.type === "file" && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
             <FormField 
                 label="Permitted Extensions (Comma separated)" 
                 placeholder="pdf, jpg, zip"
                 value={question.allowedExtensions?.join(", ")}
                 onChange={(e) => updateField("allowedExtensions", e.target.value.split(",").map(ext => ext.trim()))}
                 className="rounded-xl border-white/10"
             />
             <div className="p-10 rounded-[32px] border-2 border-dashed border-white/5 text-center bg-white/5 group-hover:border-primary/20 transition-all">
                <FileUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Student Drop Zone Preview</p>
                <p className="text-[9px] mt-2 opacity-40 italic">Accepts: {question.allowedExtensions?.join(", ") || "Any file"}</p>
             </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-white/10">
           <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Point Value</span>
              <input 
                type="number" 
                value={question.marks}
                onChange={(e) => updateField("marks", parseInt(e.target.value))}
                className="w-16 h-8 bg-transparent border-none text-center font-black text-sm text-primary focus:outline-none"
              />
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
