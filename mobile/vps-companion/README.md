# DELIKREOL VPS Companion

Android client for a small, fixed set of DELIKREOL VPS checks over SSH. It does not expose a general shell or include VPS credentials.

## First connection

1. Install the APK on Android and tap **Créer une clé sécurisée sur ce téléphone**. The private key is encrypted with Android Keystore; it is never uploaded to GitHub.
2. Copy the displayed public key and add it to the selected VPS in Hostinger's SSH key settings. Keep SSH password login disabled where possible.
3. Obtain the server host-key fingerprint through Hostinger's console or another trusted channel. Compare it with `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub -E sha256` on the VPS, then enter the full `SHA256:...` value in the app. Do not accept a fingerprint sent over an untrusted connection.
4. Test SSH. The app pins that SHA-256 fingerprint and refuses mismatches.

The initial host is the DELIKREOL server (`srv1729857.hstgr.cloud`). You can edit it for another VPS. The predefined DELIKREOL container, repository and Ollama checks only apply to the VPS where those services are installed. SSH access for the second Hostinger VPS must first be authorized in Hostinger; this app cannot bypass that requirement.

## Actions and network

The app provides fixed checks for the public site, the DELIKREOL container, local Ollama models, and project tests. Checks execute through SSH and need the phone to have a network path to the VPS. The app does not yet queue/synchronize work while offline and does not run an on-device AI model. Ollama on the VPS can provide local inference to server-side applications, but the phone needs connectivity to reach it.

## Build

Run `gradle assembleDebug` from this directory with Android SDK platform 35 and Java 17 installed. The GitHub Actions workflow builds the debug APK and uploads it as a 30-day artifact.
