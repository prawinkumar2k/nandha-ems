# Offline LMS Execution Setup & LAN Guide

This guide ensures the code execution engine works in a restricted LAN environment without any internet access.

## 1. Compiler Installation (Host Server)

The server system (which hosts the Node.js backend) MUST have the following compilers installed and added to the **System PATH**.

### A. Python (Version 3.10+)
- Download the offline installer.
- Run it and ensure **"Add Python to PATH"** is checked.
- Verify: Open terminal and type `python --version`.

### B. C/C++ (MinGW-w64 / GCC)
- Install MinGW-w64 (e.g., via MSYS2 or standalone version).
- Add the `bin` folder (e.g., `C:\mingw64\bin`) to System Environmental Variables.
- Verify: Run `gcc --version` and `g++ --version`.

### C. Java (JDK 17+)
- Download and install OpenJDK or Oracle JDK.
- Set `JAVA_HOME` environment variable.
- Add `%JAVA_HOME%\bin` to PATH.
- Verify: Run `javac -version` and `java -version`.

### D. Node.js (Internal)
- Already required for the backend.
- Verify: Run `node -v` to ensure it is accessible via CLI.

---

## 2. LAN Network Configuration

To make the system accessible to all students in the lab:

1. **Find Server IP**:
   - Open CMD on the host and run `ipconfig`.
   - Note the IPv4 Address (e.g., `192.168.1.10`).
   
2. **Configure Firewall**:
   - Go to Windows Defender Firewall -> Advanced Settings.
   - Create a **New Inbound Rule**.
   - Rule Type: **Port**.
   - Protocol: TCP. Specific local port: **8080** (or your app port).
   - Action: **Allow the connection**.
   - Apply to Profile: Domain, Private, Public.

3. **Client Access**:
   - Students in the lab should connect to the server via browser: 
     `http://192.168.1.10:8080`

---

## 3. Security Notes (Offline Protection)

- **Timeouts**: Every execution is capped at **5 seconds** to prevent infinite loops from hanging the server.
- **Resource Limits**: The `child_process` execution uses basic OS limits. For maximum security in a high-stakes environment, consider running the Node.js server within a restricted user account with limited IO permissions.
- **Cleanup**: The system automatically generates and deletes temporary source files (`.py`, `.c`, `.java`) in the `server/temp_code` directory after each execution.

---

## 4. Stability for Multiple Students

- Node.js can handle hundreds of concurrent API requests.
- Each code execution spawns a new process. 
- In a lab with 50-100 students, a standard workstation (Core i5/i7, 16GB RAM) will handle simultaneous "Run" requests smoothly.
