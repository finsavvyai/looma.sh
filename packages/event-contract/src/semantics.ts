import { canonicalSha256 } from "./digest";
import type { EventEnvelope } from "./generated/event-envelope";
import type { JsonValue } from "./json";

export type SemanticIssue =
  "payload_digest_mismatch" | "stale" | "future" | "expired" | "invalid_time_order";

export function envelopeSemanticIssues(
  envelope: EventEnvelope,
  nowMs: number,
  maxAgeMs = 300_000,
  futureSkewMs = 30_000,
): SemanticIssue[] {
  const issues: SemanticIssue[] = [];
  const occurred = Date.parse(envelope.occurred_at);
  const expires = Date.parse(envelope.expires_at);
  if (canonicalSha256(envelope.payload as JsonValue) !== envelope.payload_digest) {
    issues.push("payload_digest_mismatch");
  }
  if (occurred < nowMs - maxAgeMs) issues.push("stale");
  if (occurred > nowMs + futureSkewMs) issues.push("future");
  if (expires <= nowMs) issues.push("expired");
  if (expires <= occurred) issues.push("invalid_time_order");
  return issues;
}
