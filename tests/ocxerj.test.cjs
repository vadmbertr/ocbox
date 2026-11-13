const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const launcher = path.resolve(__dirname, "../ocxerj");

for (const [indexEnabled, indexStatus, opencodeStatus] of [
  ["1", 0, 0],
  ["1", 0, 23],
  ["1", 17, 0],
  ["1", 17, 23],
  ["0", 17, 0],
]) {
  test(`index=${indexEnabled}, index status=${indexStatus}, OpenCode status=${opencodeStatus}`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "ocxerj-test-"));
    const bin = path.join(root, "bin");
    const workspace = path.join(root, "project with spaces");
    fs.mkdirSync(bin);
    fs.mkdirSync(workspace);
    const mocks = {
      xerj: `
if [[ "$1" == autoindex ]]; then
    printf '%s\\n' "$@" > "$TEST_ROOT/index-args"
    exit "$INDEX_STATUS"
fi
[[ "$1" == --data-dir ]] || exit 99
printf '%s\\n' "$$" > "$TEST_ROOT/server-pid"
printf 'test-key\\n' > "$2/admin.key"
exec sleep 300
`,
      curl: "printf 200\n",
      opencode: `
printf '%s\\n' "$@" > "$TEST_ROOT/opencode-args"
printf '%s\\n' "$PWD" "$XERJ_AUTH" "$XERJ_URL" > "$TEST_ROOT/opencode-env"
kill -0 "$(cat "$TEST_ROOT/server-pid")" || exit 98
exit "$OPENCODE_STATUS"
`,
      gh: "exit 97\n",
      git: "exit 97\n",
    };
    for (const [name, body] of Object.entries(mocks)) {
      fs.writeFileSync(path.join(bin, name), "#!/usr/bin/env bash\nset -euo pipefail\n" + body, { mode: 0o755 });
    }
    const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
    try {
      const result = spawnSync("bash", [launcher, "--agent", "test agent"], {
        cwd: workspace,
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          TEST_ROOT: root,
          XDG_DATA_HOME: path.join(root, "data"),
          GH_TOKEN: "",
          OC_XERJ_INDEX: indexEnabled,
          INDEX_STATUS: String(indexStatus),
          OPENCODE_STATUS: String(opencodeStatus),
        },
        encoding: "utf8",
        timeout: 10000,
      });
      assert.ifError(result.error);
      assert.throws(() => process.kill(Number(read("server-pid").trim()), 0), { code: "ESRCH" });
      assert.equal(result.status, opencodeStatus, result.stderr);
      assert.equal(read("opencode-args"), "--agent\ntest agent\n");
      assert.equal(read("opencode-env"), `${workspace}\nApiKey test-key\nhttp://127.0.0.1:9200\n`);
      if (indexEnabled === "1") {
        assert.equal(read("index-args"), `autoindex\n${workspace}\n`);
        if (indexStatus) {
          assert.match(result.stderr, new RegExp(`status ${indexStatus}`));
          assert.match(result.stderr, /continuing/);
        } else {
          assert.equal(result.stderr, "");
        }
      } else {
        assert.equal(fs.existsSync(path.join(root, "index-args")), false);
      }
    } finally {
      if (fs.existsSync(path.join(root, "server-pid"))) {
        try {
          process.kill(Number(read("server-pid").trim()), "SIGTERM");
        } catch (error) {
          if (error.code !== "ESRCH") throw error;
        }
      }
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}
