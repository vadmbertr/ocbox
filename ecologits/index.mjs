import { Plugin } from "@opencode/plugin";
import { randomUUID } from "node:crypto";
import { createCollector, eventTypes } from "./collector.mjs";

export function setupMonitoring(ctx, options = {}) {
  const controller = new AbortController();
  const warn = options.warn ?? (() => console.error("EcoLogits monitoring unavailable; emissions coverage may be incomplete."));
  const collect = createCollector({
    ...options, warn,
    context: ctx.session?.context ? (input) => ctx.session.context(input) : undefined,
  });
  const registrations = [];
  const task = (async () => {
    // Public V2 streams hide usage.recorded. Count title/generate dispatches as unsupported
    // attempts via hooks; do not read or retain their prompt, response, model or options.
    if (ctx.session?.hook) {
      for (const source of ["title", "generate"]) {
        try {
          registrations.push(await ctx.session.hook(source, async ({ sessionID }) => {
            await collect({ type: "session.usage.recorded", id: randomUUID(), data: { sessionID, source } });
          }));
        } catch { try { warn(); } catch {} }
      }
    }
    try {
      for await (const event of ctx.event.subscribe({ types: eventTypes, signal: controller.signal })) {
        if (controller.signal.aborted) break;
        await collect(event);
      }
    } catch { if (!controller.signal.aborted) { try { warn(); } catch {} } }
  })();
  return async () => {
    controller.abort();
    await task;
    for (const registration of registrations) {
      try { await registration.dispose(); } catch { /* monitoring must not break unload */ }
    }
  };
}

export default Plugin.define({
  id: "ocbox.ecologits",
  setup: setupMonitoring,
});
