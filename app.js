"use strict";

const configInput = document.getElementById("configInput");
const fileInput = document.getElementById("fileInput");
const validateBtn = document.getElementById("validateBtn");
const result = document.getElementById("result");
const serverInfo = document.getElementById("serverInfo");
const status = document.getElementById("status");

function showResult(message, success = false) {
  result.textContent = message;
  result.style.color = success ? "#19d49b" : "#ff7373";
}

function getOutbound(config) {
  if (config.outbounds && Array.isArray(config.outbounds)) {
    return config.outbounds.find(
      item => item.protocol === "vmess"
    );
  }

  if (config.protocol === "vmess") {
    return config;
  }

  return null;
}

function validateConfig() {
  const raw = configInput.value.trim();

  if (!raw) {
    showResult("Masukkan konfigurasi VMess terlebih dahulu.");
    return;
  }

  let config;

  try {
    config = JSON.parse(raw);
  } catch (error) {
    showResult("Format JSON tidak valid. Periksa kembali konfigurasi.");
    return;
  }

  if (!config || typeof config !== "object" || Array.isArray(config)) {
    showResult("Struktur konfigurasi tidak valid.");
    return;
  }

  const outbound = getOutbound(config);

  if (!outbound) {
    showResult("Outbound VMess tidak ditemukan.");
    return;
  }

  const settings = outbound.settings || {};
  const servers = settings.vnext;

  if (!Array.isArray(servers) || !servers.length) {
    showResult("Data server VMess tidak ditemukan.");
    return;
  }

  const server = servers[0];
  const user = server.users?.[0];
  const stream = outbound.streamSettings || {};

  if (!server.address || !server.port || !user?.id) {
    showResult("Alamat server, port, atau UUID belum lengkap.");
    return;
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
    showResult("Format UUID tidak valid.");
    return;
  }

  if (Number(server.port) < 1 || Number(server.port) > 65535) {
    showResult("Nomor port tidak valid.");
    return;
  }

  const network = stream.network || "tcp";
  const security = stream.security || "none";

  if (network !== "ws") {
    showResult("Transport belum sesuai. RX DualNet saat ini memeriksa WebSocket (WS).");
    return;
  }

  if (security !== "tls") {
    showResult("Keamanan koneksi belum sesuai. TLS diperlukan.");
    return;
  }

  const ws = stream.wsSettings || {};
  const tls = stream.tlsSettings || {};

  const host =
    ws.headers?.Host ||
    ws.headers?.host ||
    server.address;

  const path = ws.path || "/";
  const sni = tls.serverName || server.address;

  serverInfo.replaceChildren();

  const details = [
    ["Server", server.address],
    ["Port", server.port],
    ["Protocol", "VMess"],
    ["TLS", "Aktif"],
    ["Transport", "WebSocket"],
    ["Host", host],
    ["Path", path],
    ["SNI", sni]
  ];

  details.forEach(([label, value]) => {
    const line = document.createElement("p");
    line.textContent = `${label}: ${value}`;
    serverInfo.appendChild(line);
  });

  status.textContent = "CONFIG VALID";
  showResult(
    "Konfigurasi berhasil dibaca dan lolos pemeriksaan dasar. UUID disembunyikan.",
    true
  );
}

validateBtn.addEventListener("click", validateConfig);

fileInput.addEventListener("change", event => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".json")) {
    showResult("Pilih file dengan format .json");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    configInput.value = String(reader.result || "");
    validateConfig();
  };

  reader.onerror = () => {
    showResult("File gagal dibaca.");
  };

  reader.readAsText(file);
});

status.textContent = "SYSTEM READY";
