/**
 * Android Access — DeliKreol
 * 
 * Connecte-toi à un appareil Android via ADB sans fil.
 * 
 * Prérequis :
 * 1. Téléphone : Settings → Developer Options → USB Debugging ON
 * 2. Téléphone : Settings → Developer Options → Wireless Debugging ON
 * 3. Note l'IP du téléphone (Settings → À propos → Adresse IP)
 * 
 * Usage :
 *   node scripts/android-connect.mjs <IP>
 *   node scripts/android-screenshot.mjs
 *   node scripts/android-pull.mjs <chemin_distant> <chemin_local>
 */

export async function getAndroidClient() {
  const { default: adb } = await import('adbkit');
  return adb.createClient();
}

export async function connectDevice(ip) {
  const client = await getAndroidClient();
  return client.connect(ip, 5555);
}

export async function listDevices() {
  const client = await getAndroidClient();
  return client.listDevices();
}

export async function takeScreenshot(deviceId, outputPath) {
  const client = await getAndroidClient();
  const screen = await client.screencap(deviceId);
  const fs = await import('fs');
  const ws = fs.createWriteStream(outputPath);
  screen.pipe(ws);
  return new Promise((resolve) => ws.on('finish', resolve));
}

export async function pullFile(deviceId, remotePath, localPath) {
  const client = await getAndroidClient();
  const transfer = await client.pull(deviceId, remotePath);
  const fs = await import('fs');
  const ws = fs.createWriteStream(localPath);
  transfer.pipe(ws);
  return new Promise((resolve) => ws.on('finish', resolve));
}

export async function pushFile(deviceId, localPath, remotePath) {
  const client = await getAndroidClient();
  await client.push(deviceId, localPath, remotePath);
}