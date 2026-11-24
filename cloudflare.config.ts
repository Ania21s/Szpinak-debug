import { defineConfig } from "cf/config";
import * as entrypoint from "./_worker.js" with { type: "cf-worker" };

export default defineConfig({
  worker: {
    name: "szpinak-ai-assistant",
    entrypoint,
    compatibilityDate: "2026-11-17",
    observability: {
      enabled: true,
      logs: { enabled: true, headSamplingRate: 1 },
      traces: { enabled: true, headSamplingRate: 0.01 },
    },
  },
});
