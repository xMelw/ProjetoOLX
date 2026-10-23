import { spawn, execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

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

console.log("A iniciar frontend e API. Prima Ctrl+C para terminar ambos.");
start("Frontend", ["run", "dev"], frontendDir);
start("Backend", ["start"], backendDir);

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));