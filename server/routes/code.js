import { executeCode } from "../utils/codeExecutor.js";
import { exec } from "child_process";

export const handleRunCode = async (req, res) => {
    try {
        const { language, code, input } = req.body;
        console.log(`🚀 [EXECUTOR] Request: ${language}`);

        if (!language || !code) {
            console.error("❌ [EXECUTOR] Missing required fields");
            return res.status(400).json({ message: "Language and code are required." });
        }

        // Basic Security: Block dangerous keywords
        const dangerousKeywords = [
            "child_process", "fs.readFileSync", "fs.writeFile", "fs.unlink", 
            "rm -rf", "format c:", "system(", "exec(", 
            "os.system", "shutil.", "subprocess.run", "subprocess.Popen",
            "process.exit", "eval(", "Function("
        ];

        for (const word of dangerousKeywords) {
            if (code.includes(word)) {
                return res.status(403).json({ 
                    output: "", 
                    error: `Security Alert: Dangerous keyword detected [${word}]. This execution is restricted.` 
                });
            }
        }

        console.log(`🛠️ [EXECUTOR] Running ${language} code block...`);
        const result = await executeCode(language, code, input || "");
        console.log(`✅ [EXECUTOR] Result: ${result.output?.length || 0} bytes output`);
        res.json(result);
    } catch (error) {
        console.error("🔥 [EXECUTOR] CRASH:", error);
        res.status(500).json({ message: "Internal server error during code execution." });
    }
};

export const handleCheckCompilers = async (req, res) => {
    try {
        const MINGW_PATH = "C:\\mingw64\\bin";
        const env = { ...process.env, PATH: `${process.env.PATH};${MINGW_PATH}` };
        const check = (cmd) => new Promise(r => exec(cmd, { env }, (err) => r(!err)));
        
        const results = {
            javascript: await check("node -v"),
            python: await check("python --version") || await check("py --version"),
            java: await check("javac -version"),
            rust: await check("rustc --version"),
            c: await check("gcc --version"),
            cpp: await check("g++ --version"),
            bash: await check("bash --version")
        };
        
        res.json({ compilers: results });
    } catch (error) {
        res.status(500).json({ message: "Failed to check compilers" });
    }
};
