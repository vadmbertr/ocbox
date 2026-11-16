import { estimate, finiteNonnegative, validID } from "./estimator.mjs";
import { createStore } from "./storage.mjs";

export const eventTypes = [
  "session.step.started", "session.step.streamed", "session.step.ended", "session.step.failed",
  "session.compaction.ended", "session.compaction.failed",
];
export const stepKey = (sessionID, messageID) => JSON.stringify(["step", sessionID, messageID]);

export function createCollector({ store = createStore(), context, warn = () => {} } = {}) {
  return async function collect(event) {
    try {
      const d = event.data;
      if (!d || !validID(d.sessionID)) return;
      if (["session.usage.recorded", "session.compaction.ended", "session.compaction.failed"].includes(event.type)) {
        if (!validID(event.id)) return;
        const source = event.type === "session.usage.recorded" ? d.source : "compaction";
        if (!["title", "compaction", "generate"].includes(source)) return;
        await store.put("records", `aux:${event.id}`, {
          version: 1, key: `aux:${event.id}`, sessionID: d.sessionID, eventID: event.id,
          status: "unsupported", reason: `auxiliary-${source}-not-estimated`,
        });
        return;
      }
      if (!eventTypes.includes(event.type) || !validID(d.assistantMessageID)) return;
      const key = stepKey(d.sessionID, d.assistantMessageID);
      if (event.type === "session.step.streamed") {
        if (finiteNonnegative(event.created)) await store.put("streams", key, { ended: event.created });
        return;
      }
      if (event.type === "session.step.started") {
        if (!validID(d.model?.providerID) || !validID(d.model?.id) || !finiteNonnegative(d.started)) return;
        await store.put("starts", key, {
          key, sessionID: d.sessionID, messageID: d.assistantMessageID,
          providerID: d.model.providerID, modelID: d.model.id, started: d.started,
        });
        return;
      }
      if (await store.get("records", key)) return;
      let start = await store.get("starts", key);
      let recovered = false;
      if (!start && context) {
        try {
          const messages = await context({ sessionID: d.sessionID });
          const m = messages.find((m) => m.type === "assistant" && m.id === d.assistantMessageID);
          // Only the matching assistant's immutable model is attribution evidence.
          if (validID(m?.model?.providerID) && validID(m?.model?.id)) {
            start = { providerID: m.model.providerID, modelID: m.model.id };
            recovered = true;
          }
        } catch { /* context recovery is best effort; never infer from the current session model */ }
      }
      const stream = await store.get("streams", key);
      const ended = stream?.ended ?? event.created;
      const result = event.type === "session.step.failed"
        ? { status: "unsupported", reason: "failed-step-usage-incomplete" }
        : !start ? { status: "unsupported", reason: "missing-step-start-and-model" }
        : recovered ? { status: "unsupported", reason: "recovered-model-without-dispatch-timing" }
        : estimate({
          providerID: start.providerID, modelID: start.modelID, tokens: d.tokens,
          latencySeconds: finiteNonnegative(ended) ? (ended - start.started) / 1000 : undefined,
        });
      await store.put("records", key, {
        version: 1, key, sessionID: d.sessionID, messageID: d.assistantMessageID,
        ...(start && { providerID: start.providerID, modelID: start.modelID }),
        ...(start && !recovered && { timing: stream ? "provider-stream" : "step-including-tool-settlement" }),
        ...result,
      });
    } catch { try { warn("EcoLogits monitoring could not record an event (details suppressed)."); } catch {} }
  };
}
