import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import envelopeSchema from "../schema/event-envelope.schema.json";
import receiptSchema from "../schema/event-receipt.schema.json";
import type { EventEnvelope } from "./generated/event-envelope";
import type { EventReceipt } from "./generated/event-receipt";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

export const validateEventEnvelope = ajv.compile<EventEnvelope>(envelopeSchema);
export const validateEventReceipt = ajv.compile<EventReceipt>(receiptSchema);

export const MAX_ENVELOPE_BYTES = 4096;

export function parseBoundedEnvelope(text: string): unknown {
  if (new TextEncoder().encode(text).byteLength > MAX_ENVELOPE_BYTES) {
    throw new RangeError("event envelope exceeds 4096 bytes");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new SyntaxError("event envelope is not valid JSON");
  }
}
