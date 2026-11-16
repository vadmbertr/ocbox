import {
  models, electricityMixes, PROVIDER_CONFIG_MAP, computeLlmImpacts,
  isParametersMoE, lowerBound, upperBound,
} from "@ecologits/ecologits.js";

// Checkpoint identities are assumptions from configured aliases, not deployment attestations.
export const alanModels = {
  "ILAAS/.mistral-medium-latest": ["mistralai", "mistral-medium-2604"],
  "ILAAS/.mistral-small-4-119b": ["mistralai", "mistral-small-2603"],
  "ILAAS/.qwen-3.6-35b-instruct": [35, 3],
  "ILAAS/.qwen-3.8-27b": [27, 27],
  "ILAAS/.gemma-4-31b": ["google_genai", "gemma-4-31b-it"],
  "ILAAS/.llama-3.1-8b": ["huggingface_hub", "meta-llama/Meta-Llama-3.1-8B-Instruct"],
  "ARES/gpt-oss-120b": ["huggingface_hub", "openai/gpt-oss-120b"],
  "mimo-v26-flash-mopd": [309, 15],
};

export const finiteNonnegative = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0;
export const validID = (s) => typeof s === "string" && s.length > 0 && s.length <= 512 && !/[\x00-\x1f\x7f]/.test(s);
const unsupported = (reason) => ({ status: "unsupported", reason });

export function resolveModel(providerID, modelID) {
  if (!validID(providerID) || !validID(modelID)) return unsupported("invalid-or-missing-model-attribution");
  let catalogProvider;
  let catalogName = modelID;
  let custom;
  let hosting;
  const notes = [];
  if (providerID === "alan") {
    const entry = alanModels[modelID];
    if (!entry) return unsupported("model-not-in-catalog");
    if (typeof entry[0] === "number") custom = { total: entry[0], active: entry[1] };
    else [catalogProvider, catalogName] = entry;
    hosting = { zone: "FRA", pue: 1.2, wue: 0.569 };
    notes.push("Alan France hosting confirmed; checkpoint identity assumed from configured alias; PUE 1.2 and WUE 0.569 generic assumptions, not measured");
  } else if (providerID === "openai" || providerID === "mistral") {
    catalogProvider = providerID === "mistral" ? "mistralai" : "openai";
    const defaults = PROVIDER_CONFIG_MAP[catalogProvider];
    hosting = { zone: defaults.datacenterLocation, pue: defaults.datacenterPue, wue: defaults.datacenterWue };
    notes.push("EcoLogits provider hosting defaults assumed, not verified for this request");
  } else if (providerID === "google-agy") {
    catalogProvider = modelID.startsWith("gemini-") ? "google_genai" : modelID.startsWith("claude-") ? "anthropic" : undefined;
    hosting = { zone: "WOR", pue: 1.2, wue: 0.569 };
    notes.push("Proxy hosting unknown: world electricity mix and generic PUE/WUE assumed; architecture only from model author catalogue");
  } else if (providerID === "zai-coding-plan") {
    return unsupported("zai-model-metadata-unverified");
  } else return unsupported("provider-not-supported");
  const model = custom ? undefined : models.findModel(catalogProvider, catalogName);
  if (!model && !custom) return unsupported("model-not-in-catalog");
  const parameters = custom ?? (isParametersMoE(model.architecture.parameters)
    ? model.architecture.parameters
    : { total: model.architecture.parameters, active: model.architecture.parameters });
  notes.push(...(model?.warnings.map((w) => w.code) ?? []));
  return { parameters, hosting, catalog: custom ? "custom configured model size (billions)" : `${catalogProvider}/${catalogName}`, notes };
}

export function estimate({ providerID, modelID, tokens, latencySeconds }) {
  if (!tokens || ![tokens.input, tokens.output, tokens.reasoning, tokens.cache?.read, tokens.cache?.write].every(finiteNonnegative))
    return unsupported("invalid-or-missing-token-usage");
  if (!finiteNonnegative(latencySeconds)) return unsupported("invalid-or-missing-timing");
  const outputTokenCount = tokens.output + tokens.reasoning;
  if (!Number.isFinite(outputTokenCount)) return unsupported("invalid-or-missing-token-usage");
  // V2 normalizes missing provider usage to zeros; zero cannot establish an actual request footprint.
  if (Object.values(tokens).filter((v) => typeof v === "number").every((v) => v === 0)
      && tokens.cache.read === 0 && tokens.cache.write === 0) return unsupported("zero-usage-may-be-missing");
  const resolved = resolveModel(providerID, modelID);
  if (resolved.status === "unsupported") return resolved;
  try {
    const { parameters, hosting } = resolved;
    const mix = electricityMixes.findElectricityMix(hosting.zone);
    const impacts = computeLlmImpacts({
      modelActiveParameterCount: parameters.active,
      modelTotalParameterCount: parameters.total,
      outputTokenCount, requestLatency: latencySeconds,
      ifElectricityMixGwp: mix.gwp, ifElectricityMixAdpe: mix.adpe,
      ifElectricityMixPe: mix.pe, ifElectricityMixWue: mix.wue,
      datacenterPue: hosting.pue, datacenterWue: hosting.wue,
    });
    const bound = (value, factor = 1) => ({ min: lowerBound(value) * factor, max: upperBound(value) * factor });
    const co2eGrams = bound(impacts.gwp.value, 1000);
    const energyKWh = bound(impacts.energy.value);
    if (![co2eGrams, energyKWh].every((b) => finiteNonnegative(b.min) && finiteNonnegative(b.max) && b.min <= b.max))
      return unsupported("invalid-estimator-result");
    return {
      status: "estimated", co2eGrams, energyKWh, generationTokens: outputTokenCount,
      assumptions: { catalog: resolved.catalog, parametersBillions: parameters, ...hosting, notes: resolved.notes },
      estimator: "@ecologits/ecologits.js@3.0.0",
    };
  } catch {
    return unsupported("estimator-failed");
  }
}
