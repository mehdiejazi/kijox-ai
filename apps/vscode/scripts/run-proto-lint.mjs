#!/usr/bin/env node

import { spawnSync } from "child_process"

const bashCheck = spawnSync("bash", ["--version"], { stdio: "ignore", shell: true })

if (bashCheck.status !== 0) {
	console.warn("Skipping proto lint because bash is unavailable in this environment.")
	process.exit(0)
}

const lint = spawnSync("bash", ["./scripts/proto-lint.sh"], {
	stdio: "inherit",
	shell: true,
})

process.exit(lint.status ?? 1)
