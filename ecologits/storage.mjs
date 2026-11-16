import { mkdir, open, link, unlink, readFile, readdir } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { join } from "node:path";
import { homedir } from "node:os";

export const dataDirectory = (env = process.env) =>
  join(env.XDG_DATA_HOME || join(env.HOME || homedir(), ".local", "share"), "ocbox", "emissions");
const hash = (key) => createHash("sha256").update(key).digest("hex");

export function createStore(directory = dataDirectory()) {
  const path = (kind, key) => join(directory, kind, `${hash(key)}.json`);
  return {
    directory,
    async put(kind, key, record) {
      const dir = join(directory, kind);
      await mkdir(dir, { recursive: true, mode: 0o700 });
      const temporary = join(dir, `.${randomUUID()}.tmp`);
      // Publish a complete, fsynced file with an exclusive hard link: no partial JSON or overwrites.
      try {
        const file = await open(temporary, "wx", 0o600);
        try { await file.writeFile(JSON.stringify(record)); await file.sync(); }
        finally { await file.close(); }
        try { await link(temporary, path(kind, key)); }
        catch (error) { if (error.code === "EEXIST") return false; throw error; }
        const folder = await open(dir, "r");
        try { await folder.sync(); } finally { await folder.close(); }
        return true;
      } finally { await unlink(temporary).catch(() => {}); }
    },
    async get(kind, key) {
      try { return JSON.parse(await readFile(path(kind, key), "utf8")); }
      catch (error) { if (error.code === "ENOENT") return undefined; throw error; }
    },
    async list(kind) {
      let names;
      try { names = await readdir(join(directory, kind)); }
      catch (error) { if (error.code === "ENOENT") return { records: [], unreadable: 0 }; throw error; }
      const records = [];
      let unreadable = 0;
      for (const name of names.filter((n) => /^[a-f0-9]{64}\.json$/.test(n))) {
        try { records.push(JSON.parse(await readFile(join(directory, kind, name), "utf8"))); }
        catch { unreadable++; }
      }
      return { records, unreadable };
    },
  };
}
