#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { createStore } from "./storage.mjs";
import { finiteNonnegative, validID } from "./estimator.mjs";

export const limitations = [
  "Estimates, not measurements or billing; bounds describe EcoLogits model uncertainty, not all real-world uncertainty.",
  "Generic EcoLogits hardware, batching and quantization assumptions; actual GPU/server hardware is unknown.",
  "Generation uses V2 visible output + reasoning once. Provider-hidden reasoning/usage cannot be recovered; V2 may normalize missing usage to zero.",
  "EcoLogits token/latency inference model does not explicitly account for input context or cache costs; not a full lifecycle footprint.",
  "Provider stream timing is preferred; absent that boundary, step latency includes tool settlement and may overestimate.",
  "Title/generate hooks count unsupported dispatch attempts, not completed requests (including plugin-supplied results); public usage.recorded is unavailable.",
  "Compaction completions/failures are unsupported; auxiliary calls outside session APIs, failures before step events, and events while the plugin is offline cannot be counted.",
  "All sessions seen by the server, including subagents and other locations, are included; --session selects an exact session, not descendants.",
  "ZAI is unsupported: GLM 5.3 author metadata is unverified; Mistral's catalogue entry is not evidence of ZAI hosting.",
  "Short-lived servers (e.g. `opencode --standalone run`) can exit before the final step end is delivered; such steps stay pending/interrupted.",
];

const empty = () => ({
  observed: 0, estimated: 0, unsupported: 0, reasons: {},
  co2eGrams: { min: 0, max: 0 }, energyKWh: { min: 0, max: 0 },
});
const validBounds = (b) => b && finiteNonnegative(b.min) && finiteNonnegative(b.max) && b.min <= b.max;
const validRecord = (r) => r && validID(r.key) && validID(r.sessionID) &&
  (r.status === "unsupported" ? validID(r.reason) :
    r.status === "estimated" && validBounds(r.co2eGrams) && validBounds(r.energyKWh));

export function aggregate(records) {
  const total = empty();
  const byProvider = new Map(), byModel = new Map(), bySession = new Map(), assumptions = new Map();
  let invalidRecords = 0;
  const seen = new Set();
  const add = (group, r) => {
    group.observed++;
    group[r.status === "estimated" ? "estimated" : "unsupported"]++;
    if (r.status === "unsupported") group.reasons[r.reason] = (group.reasons[r.reason] ?? 0) + 1;
    else for (const field of ["co2eGrams", "energyKWh"])
      for (const bound of ["min", "max"]) group[field][bound] += r[field][bound];
  };
  const group = (map, key, labels) => {
    if (!map.has(key)) map.set(key, { ...labels, ...empty() });
    return map.get(key);
  };
  for (const r of records) {
    if (!validRecord(r)) { invalidRecords++; continue; }
    if (seen.has(r.key)) continue;
    seen.add(r.key);
    const providerID = r.providerID ?? "(unattributed)";
    const modelID = r.modelID ?? "(unattributed)";
    add(total, r);
    add(group(byProvider, providerID, { providerID }), r);
    add(group(byModel, JSON.stringify([providerID, modelID]), { providerID, modelID }), r);
    add(group(bySession, r.sessionID, { sessionID: r.sessionID }), r);
    if (r.assumptions) assumptions.set(JSON.stringify(r.assumptions), { providerID, modelID, ...r.assumptions });
  }
  total.coveragePercent = total.observed ? total.estimated / total.observed * 100 : 0;
  return {
    total, byProvider: [...byProvider.values()], byModel: [...byModel.values()],
    bySession: [...bySession.values()], assumptions: [...assumptions.values()], invalidRecords,
  };
}

export async function buildReport({ store = createStore(), sessionID } = {}) {
  const saved = await store.list("records");
  const starts = await store.list("starts");
  const records = sessionID ? saved.records.filter((r) => r?.sessionID === sessionID) : saved.records;
  const result = aggregate(records);
  const completed = new Set(saved.records.filter(validRecord).map((r) => r.key));
  return {
    label: "Estimated LLM emissions (EcoLogits; not measured)", units: { co2e: "gCO2e", energy: "kWh" },
    coverageBasis: "Observed agent steps plus unsupported auxiliary dispatch attempts/completions; not all inference requests",
    sessionID: sessionID ?? null, ...result,
    pendingOrInterruptedSteps: starts.records.filter((r) => r && (!sessionID || r.sessionID === sessionID) && !completed.has(r.key)).length,
    unreadableFiles: saved.unreadable + starts.unreadable,
    limitations,
  };
}

export function formatReport(r) {
  const bounds = (b) => `${b.min.toPrecision(5)}–${b.max.toPrecision(5)}`;
  const line = (label, g) => `${label}: ${bounds(g.co2eGrams)} gCO2e; ${bounds(g.energyKWh)} kWh; ${g.estimated}/${g.observed} estimated`;
  return [
    r.label,
    r.coverageBasis,
    line("Total", r.total),
    `Coverage: ${r.total.coveragePercent.toFixed(1)}%; unsupported: ${r.total.unsupported}; pending/interrupted: ${r.pendingOrInterruptedSteps}`,
    ...Object.entries(r.total.reasons).map(([reason, count]) => `  ${reason}: ${count}`),
    "By provider/model:", ...r.byModel.map((g) => `  ${line(`${g.providerID}/${g.modelID}`, g)}`),
    "By session:", ...r.bySession.map((g) => `  ${line(g.sessionID, g)}`),
    "Assumptions:", ...r.assumptions.map((a) => `  ${a.providerID}/${a.modelID}: ${a.catalog}; zone=${a.zone}; PUE=${JSON.stringify(a.pue)}; WUE=${JSON.stringify(a.wue)}; ${a.notes.join("; ")}`),
    `Unreadable files: ${r.unreadableFiles}; invalid records: ${r.invalidRecords}`,
    ...r.limitations.map((s) => `Note: ${s}`),
  ].join("\n");
}

export async function main(args = process.argv.slice(2)) {
  let json = false, sessionID;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--json") json = true;
    else if (args[i] === "--session" && validID(args[i + 1]) && !args[i + 1].startsWith("--")) sessionID = args[++i];
    else throw new Error("Usage: oc-emissions [--json] [--session ID]");
  }
  const report = await buildReport({ sessionID });
  console.log(json ? JSON.stringify(report, null, 2) : formatReport(report));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch(() => { console.error("Unable to read emissions data. Usage: oc-emissions [--json] [--session ID]"); process.exitCode = 1; });
