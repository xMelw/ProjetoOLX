import { spawn, execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = path.resolve(frontendDir, "..", "Projecto_2S_Back_End");
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const children = [];
let stopping = false;

function stopChild(child) {
  if (!child?.pid) return;
  if (isWindows) {
    execFile("taskkill", ["/pid", String(child.pid), "/T", "/F"], () => {});
  } else {
    child.kill("SIGTERM");
  }
}

function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) stopChild(child);
  process.exitCode = exitCode;
}

function start(name, args, cwd) {
  const child = spawn(npmCommand, args, {
    cwd,
    stdio: "inherit",
    shell: isWindows,
    env: process.env,
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(`[${name}] Não foi possível iniciar: ${error.message}`);
    stopAll(1);
  });
  child.on("exit", (code, signal) => {
    if (stopping) return;
    if (signal) console.log(`[${name}] terminou (${signal}).`);
    else console.log(`[${name}] terminou com código ${code ?? 0}.`);
    stopAll(code && code !== 0 ? code : 0);
  });
  return child;
}

async function isApiReady(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForApi(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (!stopping && Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
      lastError = new Error(`A API respondeu HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!stopping) throw new Error(`A API não ficou pronta em ${timeoutMs / 1000} segundos. ${lastError?.message || ""}`);
}

async function main() {
  const healthUrl = "http://localhost:5000/health";
  if (await isApiReady(healthUrl)) {
    console.log("A API já está ativa.");
  } else {
    console.log("A iniciar a API e a aguardar pela base de dados.");
    start("Backend", ["start"], backendDir);
    await waitForApi(healthUrl);
  }
  if (stopping) return;
  console.log("API pronta. A iniciar o frontend. Prima Ctrl+C para terminar ambos.");
  start("Frontend", ["run", "dev"], frontendDir);
}

main().catch((error) => {
  console.error(error.message);
  stopAll(1);
});

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));