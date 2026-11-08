import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const git = (args, input) => execFileSync("git", args, { encoding: "utf8", input, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] }).trim();
const lines = (value) => value.split(/\r?\n/).filter(Boolean);

try {
  const suppliedBase = process.env.DEVELOPMENT_LOG_BASE;
  const suppliedHead = process.env.DEVELOPMENT_LOG_HEAD;
  if ([suppliedBase, suppliedHead].some((value) => value && !/^[a-f0-9]{40,64}$/.test(value))) throw new Error("Development-log refs must be full commit hashes.");
  const base = suppliedBase && !/^0+$/.test(suppliedBase) ? suppliedBase : suppliedBase ? git(["mktree"], "") : "HEAD";
  const head = suppliedBase ? suppliedHead || "HEAD" : null;
  const range = head ? [base, head] : [base];
  const changed = new Set(lines(git(["diff", "--name-only", ...range])));
  if (!head) for (const name of lines(git(["ls-files", "--others", "--exclude-standard"]))) changed.add(name);
  if (![...changed].some((name) => name !== "development.md")) {
    console.log("PASS: no project changes outside development.md require a new entry.");
    process.exit(0);
  }
  if (!changed.has("development.md")) throw new Error("Update development.md in this change before delivery.");

  const current = (head ? git(["show", `${head}:development.md`]) : readFileSync("development.md", "utf8")).replaceAll("\r\n", "\n");
  let previous = "";
  try { previous = git(["show", `${base}:development.md`]).replaceAll("\r\n", "\n"); }
  catch { git(["cat-file", "-e", base]); /* A new log has no previous file. */ }
  const newEntries = [...current.matchAll(/^### \d{4}-\d{2}-\d{2} — .+$/gm)]
    .filter(([heading]) => !previous.includes(heading))
    .map((match) => current.slice(match.index).split(/\n(?=#{1,3} )/)[0]);
  const fields = ["Author", "Request", "Changes", "Decisions", "Validation", "Release"];
  const complete = newEntries.some((entry) => fields.every((field) => new RegExp(`^- \\*\\*${field}:\\*\\* \\S.+`, "m").test(entry)));
  if (!complete) throw new Error("Add a new '### YYYY-MM-DD — Description' entry with nonempty Author, Request, Changes, Decisions, Validation and Release fields. Record failures and pending work honestly.");
  console.log(`PASS: ${changed.size} changed paths include a new complete development entry.`);
} catch (error) {
  console.error(`Development log check failed: ${error.message}`);
  process.exitCode = 1;
}
