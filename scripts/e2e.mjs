import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);
const cli = path.resolve("dist/cli.js");
const fixture = await mkdtemp(path.join(tmpdir(), "oss-healthcheck-e2e-"));

try {
  const version = await execute(process.execPath, [cli, "--version"]);
  assert.match(version.stdout, /^0\.1\.0/);

  const initialized = await execute(process.execPath, [cli, "init", fixture]);
  assert.match(initialized.stdout, /Created 7 file/);

  await writeFile(path.join(fixture, "README.md"), "# Fixture\n", "utf8");
  try {
    await execute(process.execPath, [cli, fixture, "--format", "json", "--min-score", "100"]);
    assert.fail("An incomplete fixture must fail a 100-point threshold");
  } catch (error) {
    assert.equal(error.code, 1);
    const report = JSON.parse(error.stdout);
    assert.equal(report.passed, false);
    assert.equal(typeof report.score, "number");
  }
} finally {
  await rm(fixture, { recursive: true, force: true });
}
