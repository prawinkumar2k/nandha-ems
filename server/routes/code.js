import mongoose from "mongoose";

export const handleRunCode = async (req, res) => {
    try {
        const { language, code, input } = req.body;
        console.log(`🚀 [JUDGE0] Request: ${language}`);

        if (!language || !code) {
            return res.status(400).json({ message: "Language and code are required." });
        }

        const languageMap = {
            javascript: 63,
            python: 71,
            java: 62,
            c: 50,
            cpp: 54,
            rust: 73,
            bash: 46
        };

        const language_id = languageMap[language];
        if (!language_id) {
            return res.status(400).json({ message: "Unsupported language." });
        }

        const response = await fetch("http://judge0-server:2358/submissions?base64_encoded=false&wait=true", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                source_code: code,
                language_id,
                stdin: input || ""
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ error: "Judge0 execution failed", details: data });
        }

        let output = "";
        let errorStr = "";

        if (data.status && data.status.id > 3) {
            // Error states (Compilation Error, Runtime Error, etc)
            output = data.compile_output || data.message || "";
            errorStr = data.stderr || data.status.description || "Execution failed";
        } else {
            output = data.stdout || "";
            errorStr = data.stderr || "";
        }

        // Save to Database asynchronously (non-blocking)
        if (req.user && req.user.id) {
            const CodeSnippet = mongoose.model("CodeSnippet");
            CodeSnippet.create({
                student: req.user.id,
                language,
                code,
                input,
                output,
                error: errorStr
            }).catch(e => console.error("Failed to save code snippet to DB", e));
        }

        res.json({ output, error: errorStr });
    } catch (error) {
        console.error("🔥 [JUDGE0] CRASH:", error);
        res.status(500).json({ message: "Internal server error connecting to Judge0." });
    }
};

export const handleCheckCompilers = async (req, res) => {
    try {
        // Ping Judge0 to ensure it's alive
        const response = await fetch("http://judge0-server:2358/languages");
        const isAlive = response.ok;

        res.json({ 
            compilers: {
                javascript: isAlive,
                python: isAlive,
                java: isAlive,
                rust: isAlive,
                c: isAlive,
                cpp: isAlive,
                bash: isAlive
            } 
        });
    } catch (error) {
        // If Judge0 is unreachable, fallback to false
        res.json({ 
            compilers: {
                javascript: false, python: false, java: false, 
                rust: false, c: false, cpp: false, bash: false
            } 
        });
    }
};
