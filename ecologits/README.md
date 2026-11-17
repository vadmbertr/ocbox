# Local OpenCode V2 emissions estimates

Node 22+, `@opencode/plugin` **2.3.0**, `@ecologits/ecologits.js`
**3.0.0**, with a reproducible npm lock. No service, network inference
request, telemetry, API key or hosted EcoLogits API is used. Catalogue and
electricity data are bundled in the dependency.

```sh
npm ci --omit=dev --ignore-scripts
node report.mjs
node report.mjs --json
node report.mjs --session ses_example
```

Container integration: install this directory at `/opt/ocbox-ecologits`,
add `"file:///opt/ocbox-ecologits"` to global `plugins`, and provide
`oc-emissions` executing `node /opt/ocbox-ecologits/report.mjs "$@"`.
No optional configuration file is read. The only environment inputs are
`XDG_DATA_HOME` and the fallback `HOME`, for storage location.

### Options

`report.mjs` accepts only `--json` and `--session ID` (combinable, in either
order). Without `--json`, output is terminal text; without `--session`, it
includes all saved sessions. Invalid arguments exit with status 1.
Neither reporting mode contacts OpenCode or an external service.

There are currently **no deployment/hardware overrides**, environment-based
estimator settings or supported OpenCode plugin options. In particular,
setting `ctx.options` does not change zone, PUE, WUE, GPU, quantization or
batch size. The injectable arguments on exported helpers are test seams,
not user configuration. If verified facility metadata becomes available,
update the explicit mapping and tests before changing the estimates;
already persisted estimates are not recomputed.

## Collection, privacy and coverage

The default export uses `Plugin.define`. It subscribes to public V2
`session.step.started`, `session.step.streamed`, `session.step.ended`,
`session.step.failed` and compaction terminal events. Starts and endings
are joined by **session ID + assistant message ID**, never by the session's
current selected model. Stream completion timestamps are preferred to step
completion (which can include tool execution). Without a start, matching
assistant model recovery via `session.context` is best effort; missing
dispatch timing remains unsupported rather than inventing a latency.

**Important V2 limitation:** `session.usage.recorded` is internal, excluded
from the public event manifest in 2.3.0. The exportable collector handles it
when supplied in tests/future integrations, but does not subscribe to an
unknown public type. Public compaction completions/failures are counted
as unsupported. Title and generate session hooks count unsupported
**dispatch attempts**, not completed requests, and may include a result
supplied by another plugin without inference. We do not estimate these
auxiliary calls or infer their model from cumulative usage. Other
experimental generation outside session APIs is not observable here.

All observed sessions, including subagents and sessions at other server
locations, are included. Repeated events across plugin instances/processes
and restarts are deduplicated on disk. No chunks or cumulative
`session.usage.updated` figures are summed. `--session` filters one exact
session; it does not recursively select children. No historical backfill
or replay of calls made while monitoring was offline is claimed. A
short-lived server (for example `opencode --standalone run`) can exit
before the final step end is delivered; such steps stay
pending/interrupted in reports. The container's long-lived server is the
intended deployment.

Records live at
`${XDG_DATA_HOME:-$HOME/.local/share}/ocbox/emissions/{starts,streams,records}`.
Each is a complete fsynced temporary file published with an exclusive hard
link and directory fsync on the local filesystem. Existing IDs are never
overwritten. This requires a local filesystem supporting hard links.
Interrupted temporary files are ignored. Records accumulate until manually
removed; clearing them also clears deduplication history.

### Persisted format

Each file is a single UTF-8 JSON object, not JSONL. Its filename is the
lowercase SHA-256 hex digest of the UTF-8 deduplication key, followed by
`.json`. Step keys are exactly
`JSON.stringify(["step", sessionID, assistantMessageID])`; auxiliary keys
are `"aux:" + eventID`. The filename is a storage identifier, not an
anonymization guarantee: session/model identifiers remain in the JSON.

| Directory | Object fields |
| --- | --- |
| `starts/` | `key`, `sessionID`, `messageID`, `providerID`, `modelID`, `started` (dispatch epoch milliseconds) |
| `streams/` | `ended` (provider-stream completion epoch milliseconds); its filename uses the same step key |
| `records/` — estimated step | `version: 1`, `key`, `sessionID`, `messageID`, `providerID`, `modelID`, `timing`, `status: "estimated"`, `co2eGrams`, `energyKWh`, `generationTokens`, `assumptions`, `estimator` |
| `records/` — unsupported step | `version: 1`, `key`, `sessionID`, `messageID`, `status: "unsupported"`, `reason`; `providerID`, `modelID` and `timing` are present only when available |
| `records/` — auxiliary observation | `version: 1`, `key`, `sessionID`, `eventID`, `status: "unsupported"`, `reason` |

Both impact fields are `{ "min": number, "max": number }` with finite,
nonnegative bounds. `generationTokens` is output plus reasoning.
`timing` is `"provider-stream"` or
`"step-including-tool-settlement"`. `estimator` is
`"@ecologits/ecologits.js@3.0.0"`. `assumptions` contains `catalog`,
`parametersBillions: { total, active }`, `zone`, `pue`, `wue`, and `notes`
(an array of fixed assumption/warning strings). Parameter counts, PUE and
WUE can be numbers or `{ min, max }` ranges. Starts and streams currently
have no `version` field.

Reasons are fixed codes: `invalid-or-missing-model-attribution`,
`provider-not-supported`, `model-not-in-catalog`,
`zai-model-metadata-unverified`, `invalid-or-missing-token-usage`,
`invalid-or-missing-timing`, `zero-usage-may-be-missing`,
`invalid-estimator-result`, `estimator-failed`,
`failed-step-usage-incomplete`, `missing-step-start-and-model`,
`recovered-model-without-dispatch-timing`, and
`auxiliary-{title,compaction,generate}-not-estimated`.

First published content wins for each key, including unsupported results;
a late start does not upgrade an already recorded unsupported ending.
Starts/stream boundaries are retained after completion. Public auxiliary
events deduplicate by their durable event ID. Title/generate hook attempts
instead receive a UUID per hook invocation: these are attempt observations,
not a durable replay/backfill of otherwise hidden usage events.

Only allowlisted session/message/event IDs, provider/model IDs, timing,
generation-token count, computed bounds, assumption metadata and fixed
reason codes are saved. **No prompts, response/reasoning text, tool content,
authorization, project paths or raw event payloads are stored.**
Context recovery reads matching metadata but persists no content.
New directories/files request modes 0700/0600. Failures are caught and
produce only a generic warning, never a raw error with potentially secret
details. Storage/subscription failure can lose coverage; reports cannot
reconstruct events never saved. Pending/interrupted starts, invalid records
and unreadable files are reported separately.

## Model and hosting assumptions

Model parameters are **billions**, not raw parameter counts. Provider and
model IDs remain original in records/reports; catalogue architecture and
hosting assumptions are separate.

| Actual provider | Architecture lookup | Hosting assumption |
| --- | --- | --- |
| `openai` | exact bundled `openai` name/alias | EcoLogits OpenAI defaults (USA) |
| `mistral` | exact bundled `mistralai` name/alias | EcoLogits Mistral defaults (SWE), including `zai-glm-5-3` if selected through Mistral |
| `google-agy` | exact `gemini-*` → `google_genai`; exact `claude-*` → `anthropic` | proxy deployment unknown: **WOR**, generic PUE 1.2, WUE 0.569; never model author's hosting |
| `zai-coding-plan` | unsupported | no reliable deployment/model metadata; Mistral's GLM 5.3 entry (744/40B) is not proof of ZAI's public 753B checkpoint or hosting |
| `alan` | explicit table below | France confirmed by user; **FRA** mix (0.04144 kgCO2e/kWh), generic assumed PUE 1.2/WUE 0.569, **not measured Alan facility values** |

Unknown models (including Gemini 4 Argon) are unsupported, never zero-impact
estimates. Provider aliases are not fuzzily matched. Mutable catalogue aliases
are used as bundled and may be stale; Alan's medium mapping deliberately
avoids EcoLogits' stale `mistral-medium-latest` alias.

Alan checkpoint identity is **assumed from configured aliases, not verified
against the actual deployment**:

| Configured ID | Catalogue / custom size (total / active B) |
| --- | --- |
| `ILAAS/.mistral-medium-latest` | `mistralai/mistral-medium-2604` (128 / 128) |
| `ILAAS/.mistral-small-4-119b` | `mistralai/mistral-small-2603` (119 / 8) |
| `ILAAS/.qwen-3.6-35b-instruct` | custom (35 / 3) |
| `ILAAS/.qwen-3.8-27b` | custom (27 / 27) |
| `ILAAS/.gemma-4-31b` | `google_genai/gemma-4-31b-it` (31 / 31) |
| `ILAAS/.llama-3.1-8b` | `huggingface_hub/meta-llama/Meta-Llama-3.1-8B-Instruct` (8.03 / 8.03) |
| `ARES/gpt-oss-120b` | `huggingface_hub/openai/gpt-oss-120b` (117 / 5.1) |
| `mimo-v26-flash-mopd` | custom (309 / 15) |

The five catalogue-derived entries use the dependency's parameter metadata
and warnings. The three custom entries are explicit alias-size assumptions.
No particular GPU, batch size, quantization or measured server power is
claimed; EcoLogits generic hardware coefficients remain unchanged.
Proxy/Alan deployments do not inherit catalogue-author deployment speed.

## Interpretation

Reports sum **lower bounds and upper bounds separately**, in grams CO2e and
kWh, with counts/reasons, estimated/observed coverage, provider/model and
session breakdowns and assumption metadata. GWP includes EcoLogits'
operational and allocated embodied contributions; energy is its modeled
inference electricity. These are **estimates, not measurements**, and
catalogue bounds do not cover all deployment uncertainty.

V2 `TokenUsage.output` is visible output, **excluding reasoning**.
Generation count is therefore `output + reasoning` exactly once, not input
or cache tokens. Provider-hidden usage/reasoning is still missing. V2
normalizes unavailable usage to zero; all-zero usage is recorded as
unsupported because it cannot distinguish missing reporting from zero
work. EcoLogits' generation/latency model does not explicitly account for
input-context/prefill or cache costs and is not a full lifecycle footprint.

Exportable test seams: `estimate`/`resolveModel` in `estimator.mjs`,
`createCollector` in `collector.mjs`, `createStore` in `storage.mjs`,
`setupMonitoring` in `index.mjs`, `aggregate`/`buildReport` in `report.mjs`.

Evidence: [official V2 plugin API](https://opencode.ai/docs/build/plugins/server),
installed `@opencode/schema/dist/session-event.js` (public vs internal
events), `session-message.js` (context recovery), and
`token-usage.js` (disjoint token categories);
[V2 normalization](https://github.com/anomalyco/opencode/blob/dev/packages/core/src/session/usage.ts)
uses `visibleOutputTokens` and `reasoningTokens` separately.
Catalogue model provenance is bundled as `Model.sources`, including
[Mistral Medium 3.5](https://huggingface.co/mistralai/Mistral-Medium-3.5-128B)
and [GPT OSS 120B](https://huggingface.co/openai/gpt-oss-120b).
