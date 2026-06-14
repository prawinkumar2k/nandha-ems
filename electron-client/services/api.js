const axios = require('axios');
const store = require('../storage/store');
const { getDeviceFingerprint } = require('./hardware');

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api'; // In production, replace with actual LAN Server IP

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// Interceptor to automatically attach Device JWT
api.interceptors.request.use(async (config) => {
  const deviceToken = store.get('deviceToken');
  const fingerprint = await getDeviceFingerprint();

  if (deviceToken) {
    config.headers['x-device-authorization'] = `Bearer ${deviceToken}`;
  }
  config.headers['x-machine-fingerprint'] = fingerprint.machineFingerprint;
  
  return config;
});

async function registerDevice() {
  const hardware = await getDeviceFingerprint();
  try {
    const response = await api.post('/devices/register', hardware);
    return response.data;
  } catch (err) {
    console.error("Registration Error:", err.message);
    throw err;
  }
}

async function sendHeartbeat(data) {
  try {
    await api.post('/devices/heartbeat', data);
  } catch (err) {
    // Silent fail for heartbeats to avoid spam, or queue for offline sync
  }
}

module.exports = { api, registerDevice, sendHeartbeat };
