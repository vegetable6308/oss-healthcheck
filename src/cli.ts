#!/usr/bin/env node
import { runCli } from "./cli-core.js";

const code = await runCli(process.argv.slice(2), {
  stdout: (value) => process.stdout.write(value),
  stderr: (value) => process.stderr.write(value),
  isTTY: process.stdout.isTTY,
});
process.exitCode = code;
