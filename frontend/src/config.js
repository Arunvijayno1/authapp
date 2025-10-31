// src/config.js
// Return a single BASE_URL that works for localhost (dev), phone via LAN, and docker (host.docker.internal)
const LOCALHOST = 'http://localhost:5000';
const DEFAULT_LAN = 'http://10.173.51.213:5000'; // replace with your computer IP if different

export const getBaseURL = () => {
  const hostname = window.location.hostname;

  // When running on the dev machine (localhost)
  if (hostname === 'localhost' || hostname === '127.0.0.1') return LOCALHOST;

  // If in Docker on the host machine, container may see host as host.docker.internal
  if (hostname === 'host.docker.internal') return 'http://host.docker.internal:5000';

  // Mobile or other LAN device: use the computer's IP (default)
  // If your computer IP changes, replace DEFAULT_LAN or make it dynamic in build.
  if (hostname.startsWith('10.') || hostname.startsWith('172.') || hostname.startsWith('192.168.')) {
    return `http://${hostname}:5000`;
  }

  // fallback to your LAN address
  return DEFAULT_LAN;
};

export const BASE_URL = getBaseURL();
