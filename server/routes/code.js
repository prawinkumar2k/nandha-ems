import mongoose from "mongoose";

export const handleRunCode = async (req, res) => {
    try {
        const { language, code, input } = req.body;
        console.log(`🚀 [WANDBOX] Request: ${language}`);

        if (!language || !code) {
            return res.status(400).json({ message: "Language and code are required." });
        }

        const languageMap = {
            javascript: "nodejs-20.17.0",
            python: "cpython-3.14.0",
            java: "openjdk-jdk-22+36",
            c: "gcc-head-c",
            cpp: "gcc-head",
            rust: "rust-1.82.0",
            bash: "bash"
        };

        const compilerName = languageMap[language];
        if (!compilerName) {
            return res.status(400).json({ message: "Unsupported language." });
        }

        const response = await fetch("https://wandbox.org/api/compile.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                compiler: compilerName,
                code: code,
                stdin: input || "",
                save: false
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ error: "Wandbox execution failed", details: data });
        }

        let output = "";
        let errorStr = "";

        if (data.status !== "0") {
            // Error states (Compilation Error, Runtime Error, etc)
            output = data.compiler_output || data.program_output || "";
            errorStr = data.compiler_error || data.program_error || "Execution failed";
        } else {
            output = data.program_output || "";
            errorStr = data.program_error || "";
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
        console.error("🔥 [WANDBOX] CRASH:", error);
        res.status(500).json({ message: "Internal server error connecting to Wandbox online compiler." });
    }
};

export const handleCheckCompilers = async (req, res) => {
    try {
        // Ping Wandbox to ensure it's alive
        const response = await fetch("https://wandbox.org/api/list.json");
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
        // If Wandbox is unreachable, fallback to false
        res.json({ 
            compilers: {
                javascript: false, python: false, java: false, 
                rust: false, c: false, cpp: false, bash: false
            } 
        });
    }
};
