const si = require('systeminformation');
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');

let cachedFingerprint = null;

async function getDeviceFingerprint() {
  if (cachedFingerprint) return cachedFingerprint;

  try {
    const [networkInterfaces, cpu, baseboard, diskLayout] = await Promise.all([
      si.networkInterfaces(),
      si.cpu(),
      si.baseboard(),
      si.diskLayout()
    ]);

    // Find active ethernet or wifi MAC
    const activeInterface = Array.isArray(networkInterfaces) 
      ? networkInterfaces.find(i => i.mac && i.mac !== '00:00:00:00:00:00') 
      : networkInterfaces;
      
    const macAddress = activeInterface ? activeInterface.mac : 'UNKNOWN';
    const cpuId = `${cpu.manufacturer}-${cpu.brand}-${cpu.cores}`;
    const motherboardSerial = baseboard.serial || 'UNKNOWN';
    const diskSerial = diskLayout.length > 0 ? diskLayout[0].serialNum : 'UNKNOWN';
    
    // Fallback native OS machine ID
    const nativeMachineId = machineIdSync(true);

    const rawString = `${macAddress}|${cpuId}|${motherboardSerial}|${diskSerial}|${nativeMachineId}`;
    
    // Generate SHA-256 Fingerprint
    const machineFingerprint = crypto.createHash('sha256').update(rawString).digest('hex');

    cachedFingerprint = {
      deviceId: require('os').hostname(),
      macAddress,
      cpuId,
      motherboardSerial,
      machineFingerprint,
      nativeMachineId
    };

    return cachedFingerprint;
  } catch (error) {
    console.error("Hardware Fingerprint Error:", error);
    throw new Error("Failed to generate secure hardware fingerprint.");
  }
}

module.exports = { getDeviceFingerprint };
