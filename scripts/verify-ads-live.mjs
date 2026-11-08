import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

// Read-only production diagnostic. curl respects the environment's proxy/CA
// settings. This checks delivery, not Google's crawler access or approval.
const canonical = "https://vihar.online/ads.txt";
const expected = "google.com, pub-6693217545827146, DIRECT, f08c47fec0942fa0";
const cases = [
  [canonical, "Vihar-AdsTxt-Check/1.0"],
  ["https://www.vihar.online/ads.txt", "Vihar-AdsTxt-Check/1.0"],
  ["http://vihar.online/ads.txt", "Vihar-AdsTxt-Check/1.0"],
  ["http://www.vihar.online/ads.txt", "Vihar-AdsTxt-Check/1.0"],
  [canonical, "Google-adstxt"],
  [canonical, "Mediapartners-Google"],
];

try {
  for (const [url, agent] of cases) {
    const output = execFileSync("curl", [
      "--silent", "--show-error", "--location", "--max-redirs", "5",
      "--connect-timeout", "10", "--max-time", "25",
      "--proto", "=http,https", "--proto-redir", "=http,https",
      "--user-agent", agent, "--write-out", "\n%{json}", url,
    ], { encoding: "utf8", maxBuffer: 1024 * 1024 });
    const boundary = output.lastIndexOf("\n");
    const body = output.slice(0, boundary);
    const result = JSON.parse(output.slice(boundary + 1));
    assert.equal(result.http_code, 200, `${url}: HTTP status`);
    assert.equal(result.url_effective, canonical, `${url}: canonical destination`);
    assert.match(result.content_type || "", /^text\/plain(?:;|$)/i, `${url}: plain-text response`);
    assert.equal(body.trim(), expected, `${url}: publisher declaration`);
    console.log(`PASS: ${url} (${agent}), ${result.num_redirects} redirect(s)`);
  }
  console.log("Delivery checks passed. This does not confirm AdSense recrawling, authorization status or site approval.");
} catch (error) {
  console.error(`Live ads.txt check failed: ${error.message}`);
  process.exitCode = 1;
}
