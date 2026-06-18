import { exec } from 'child_process';
import os from 'os';

console.log("🔒 Launching NEC EMS in OS-Level Locked Kiosk Mode...");

let command = '';

if (os.platform() === 'win32') {
  // Launch Edge in strictly locked kiosk mode (Native OS level lock on Windows)
  command = 'start msedge --kiosk "http://localhost:8080" --edge-kiosk-type=fullscreen';
} else if (os.platform() === 'darwin') {
  // Mac OS Chrome Kiosk
  command = '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --kiosk "http://localhost:8080"';
} else {
  // Linux Chrome Kiosk
  command = 'google-chrome --kiosk "http://localhost:8080"';
}

exec(command, (error) => {
  if (error) {
    console.log("Failed to launch Edge Kiosk. Attempting Chrome Kiosk...");
    exec('start chrome --kiosk "http://localhost:8080"');
  }
});
