import { exec, spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, "..", "temp_code");
const MINGW_PATH = "C:\\mingw64\\bin";

// Ensure temp directory exists
const ensureTempDir = async () => {
    try {
        await fs.access(TEMP_DIR);
    } catch {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    }
};

/**
 * Validate code safety against a strict regex blocklist per language.
 */
export const validateCodeSecurity = (language, code) => {
    const rules = {
        javascript: [
            /require\s*\(/,
            /import\s+.*from/,
            /\bprocess\b/,
            /\bglobal\b/,
            /\beval\s*\(/,
            /\bFunction\s*\(/,
            /\bconstructor\b/,
            /\bchild_process\b/,
            /\bfs\b/,
            /\bpath\b/,
            /\bos\b/,
            /\bcluster\b/,
            /\bhttp\b/,
            /\bnet\b/,
            /\bdns\b/,
            /\bdgram\b/
        ],
        python: [
            /\bimport\s+os\b/,
            /\bimport\s+sys\b/,
            /\bimport\s+subprocess\b/,
            /\bimport\s+shutil\b/,
            /\bimport\s+socket\b/,
            /\bimport\s+urllib\b/,
            /\bimport\s+requests\b/,
            /\bimport\s+pty\b/,
            /\bimport\s+platform\b/,
            /\bfrom\s+\w+\s+import\s+.*os\b/,
            /\b__import__\b/,
            /\beval\s*\(/,
            /\bexec\s*\(/,
            /\bopen\s*\(/,
            /\bgetattr\b/,
            /\bsetattr\b/,
            /\bglobals\s*\(/,
            /\blocals\s*\(/
        ],
        c: [
            /#include\s*<stdlib\.h>/,
            /#include\s*<unistd\.h>/,
            /#include\s*<sys\//,
            /\bsystem\s*\(/,
            /\bpopen\s*\(/,
            /\bfork\s*\(/,
            /\bexec\w*\s*\(/,
            /\bremove\s*\(/,
            /\brename\s*\(/,
            /\bfopen\s*\(/
        ],
        cpp: [
            /#include\s*<stdlib\.h>/,
            /#include\s*<unistd\.h>/,
            /#include\s*<sys\//,
            /#include\s*<fstream>/,
            /#include\s*<filesystem>/,
            /\bsystem\s*\(/,
            /\bpopen\s*\(/,
            /\bfork\s*\(/,
            /\bexec\w*\s*\(/,
            /\bremove\s*\(/,
            /\brename\s*\(/,
            /\bfopen\s*\(/,
            /\bstd::filesystem\b/
        ],
        rust: [
            /\bstd::process\b/,
            /\bstd::fs\b/,
            /\bstd::net\b/,
            /\bstd::thread\b/,
            /\bCommand::new\b/,
            /\bstd::panic\b/
        ],
        bash: [
            /\brm\b/,
            /\bmv\b/,
            /\bcp\b/,
            /\bwget\b/,
            /\bcurl\b/,
            /\bchmod\b/,
            /\bchown\b/,
            /\bkill\b/,
            /\bpkill\b/,
            /\/dev\//,
            /&&/,
            /\|/,
            /\bsudo\b/,
            /\bsu\b/
        ]
    };

    const langRules = rules[language.toLowerCase()];
    if (!langRules) return { safe: true };

    for (const rule of langRules) {
        if (rule.test(code)) {
            return {
                safe: false,
                reason: `Security Constraint Violation: Dangerous pattern detected [${rule.toString()}]`
            };
        }
    }
    return { safe: true };
};

/**
 * Execute code in a specified language.
 * @param {string} language - Language ID (python, javascript, c, cpp, java)
 * @param {string} code - The source code
 * @param {string} input - Standard input for the program
 * @returns {Promise<{output: string, error?: string}>}
 */
export const executeCode = async (language, code, input = "") => {
    // Run security check first
    const securityCheck = validateCodeSecurity(language, code);
    if (!securityCheck.safe) {
        return { output: "", error: securityCheck.reason };
    }

    if (process.env.JUDGE0_URL) {
        // JUDGE0 CE INTEGRATION
        const langMap = {
            c: 50,
            cpp: 54,
            java: 62,
            javascript: 63,
            python: 71,
            rust: 73,
            bash: 46
        };
        
        const languageId = langMap[language];
        if (!languageId) {
            return { output: "", error: `Unsupported Judge0 language: ${language}` };
        }

        try {
            const fetch = (await import("node-fetch")).default;
            const response = await fetch(`${process.env.JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source_code: code,
                    language_id: languageId,
                    stdin: input || ""
                })
            });
            
            const data = await response.json();
            
            if (data.status && data.status.id > 3) {
               return { 
                   output: data.stdout || "", 
                   error: data.stderr || data.compile_output || data.message || "Execution failed"
               };
            }
            return { output: data.stdout || "", error: data.stderr || "" };
        } catch (err) {
            return { output: "", error: `Judge0 Connection Error: ${err.message}` };
        }
    }

    await ensureTempDir();
    const sessionId = uuidv4();
    let fileName = "";
    let compileCmd = "";
    let runCmd = "";
    let workDir = TEMP_DIR;

    const isWindows = process.platform === "win32";

    switch (language) {
        case "python":
            fileName = `${sessionId}.py`;
            // Check for python vs py command in Windows without leaking environment
            const cleanPathEnv = { PATH: process.env.PATH };
            const hasPython = await new Promise(r => exec("where python", { env: cleanPathEnv }, (err) => r(!err)));
            runCmd = hasPython ? `python ${fileName}` : `py ${fileName}`;
            break;
        case "javascript":
            fileName = `${sessionId}.js`;
            runCmd = `node ${fileName}`;
            break;
        case "c":
            fileName = `${sessionId}.c`;
            compileCmd = `gcc ${fileName} -o ${sessionId}.exe`;
            runCmd = isWindows ? `.\\${sessionId}.exe` : `./${sessionId}`;
            break;
        case "cpp":
            fileName = `${sessionId}.cpp`;
            compileCmd = `g++ ${fileName} -o ${sessionId}.exe`;
            runCmd = isWindows ? `.\\${sessionId}.exe` : `./${sessionId}`;
            break;
        case "java":
            fileName = `Main_${sessionId.replace(/-/g, '_')}.java`;
            const className = fileName.replace(".java", "");
            code = code.replace(/public\s+class\s+\w+/g, `public class ${className}`);
            compileCmd = `javac ${fileName}`;
            runCmd = `java ${className}`;
            break;
        case "rust":
            fileName = `${sessionId}.rs`;
            compileCmd = `rustc ${fileName} -o ${sessionId}.exe`;
            runCmd = `${sessionId}.exe`;
            break;
        case "bash":
            fileName = `${sessionId}.sh`;
            runCmd = `bash ${fileName}`;
            break;
        default:
            throw new Error(`Unsupported language: ${language}`);
    }

    const filePath = path.join(TEMP_DIR, fileName);
    await fs.writeFile(filePath, code);

    return new Promise((resolve) => {
        const timeout = 5000; // 5 seconds limit

        const cleanup = async () => {
            try {
                const files = await fs.readdir(TEMP_DIR);
                for (const file of files) {
                    if (file.includes(sessionId) || (language === "java" && file.includes(sessionId.replace(/-/g, '_')))) {
                        await fs.unlink(path.join(TEMP_DIR, file)).catch(() => {});
                    }
                }
            } catch (err) {
                console.error("Cleanup error:", err);
            }
        };

        const runExecution = () => {
            const cleanEnv = {
                PATH: `${process.env.PATH || ""};${MINGW_PATH}`,
                TEMP: TEMP_DIR,
                TMP: TEMP_DIR,
                SystemRoot: process.env.SystemRoot,
                System32: process.env.System32,
                WINDIR: process.env.WINDIR,
                USERPROFILE: process.env.USERPROFILE,
                HOMEPATH: process.env.HOMEPATH,
                HOMEDRIVE: process.env.HOMEDRIVE
            };
            const proc = exec(runCmd, { cwd: TEMP_DIR, timeout, env: cleanEnv }, async (error, stdout, stderr) => {
                await cleanup();
                if (error && error.killed) {
                    resolve({ output: "", error: "Execution Timed Out (5s limit)" });
                } else {
                    resolve({ 
                        output: stdout, 
                        error: stderr || (error ? error.message : undefined) 
                    });
                }
            });

            if (input && proc.stdin) {
                proc.stdin.write(input);
                proc.stdin.end();
            }
        };



        if (compileCmd) {
            const cleanEnv = {
                PATH: `${process.env.PATH || ""};${MINGW_PATH}`,
                TEMP: TEMP_DIR,
                TMP: TEMP_DIR,
                SystemRoot: process.env.SystemRoot,
                System32: process.env.System32,
                WINDIR: process.env.WINDIR,
                USERPROFILE: process.env.USERPROFILE,
                HOMEPATH: process.env.HOMEPATH,
                HOMEDRIVE: process.env.HOMEDRIVE
            };
            exec(compileCmd, { cwd: TEMP_DIR, env: cleanEnv }, async (error, stdout, stderr) => {
                if (error) {
                    await cleanup();
                    resolve({ output: stdout, error: `Compilation Error: ${stderr || error.message}` });
                } else {
                    runExecution();
                }
            });
        } else {
            runExecution();
        }
    });
};
