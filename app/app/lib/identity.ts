import { ed25519 } from "@noble/curves/ed25519.js";
import { randomBytes } from "@noble/hashes/utils.js";
import { getLocation } from "./location";

const STORAGE_KEY = "looma_identity_v1";

export type LoomaIdentity = {
  deviceId: string;
  publicKeyHex: string;
  privateKeyHex: string;
  carModel?: string;
  nickname?: string;
};

type RegisterResponse = {
  device_id: string;
  public_key: string;
  car_model?: string;
  nickname?: string;
};

// Environment-safe values
const AI_BASE = process.env.NEXT_PUBLIC_AI_BASE || "";
const RELAY_BASE = process.env.NEXT_PUBLIC_RELAY_BASE || "";

/* ---------------------------------------------
   Identity Creation / Loading
--------------------------------------------- */

export async function loadOrCreateIdentity(): Promise<LoomaIdentity> {
  if (typeof window !== "undefined") {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      const identity = JSON.parse(existing);
      // Check if it's the old hardcoded identity and regenerate if needed
      if (identity.nickname === "Shachar Dev Car") {
        console.log("🔄 Detected old hardcoded identity, regenerating...");
        window.localStorage.removeItem(STORAGE_KEY);
        // Fall through to create new identity
      } else {
        return identity;
      }
    }
  }

  // Generate private seed
  const privateKey = randomBytes(32);
  const publicKey = ed25519.getPublicKey(privateKey);

  const privateKeyHex = Buffer.from(privateKey).toString("hex");
  const publicKeyHex = Buffer.from(publicKey).toString("hex");

  // Register with AI identity service
  const res = await fetch(`${AI_BASE}/api/identity/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      public_key: publicKeyHex,
      car_model: "Connected Vehicle",
      nickname: `Driver-${publicKeyHex.substring(0, 8)}`,
    }),
  });

  if (!res.ok) throw new Error("Failed identity registration");

  const data: RegisterResponse = await res.json();

  const identity: LoomaIdentity = {
    deviceId: data.device_id,
    publicKeyHex,
    privateKeyHex,
    carModel: data.car_model,
    nickname: data.nickname,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  }

  return identity;
}

/* ---------------------------------------------
   Signing
--------------------------------------------- */

export function signMessage(identity: LoomaIdentity, payload: any) {
  const msgBytes = new TextEncoder().encode(JSON.stringify(payload));
  const privBytes = Buffer.from(identity.privateKeyHex, "hex");

  const sig = ed25519.sign(msgBytes, privBytes);
  return Buffer.from(sig).toString("hex");
}

/* ---------------------------------------------
   V2V Sending (with GPS enrichment)
--------------------------------------------- */

export async function sendV2VMessage(identity: LoomaIdentity, payload: any) {
  const gps = await getLocation().catch(() => null);

  const enrichedPayload = {
    ...payload,
    _gps: gps || null,
  };

  const signature = signMessage(identity, enrichedPayload);

  const res = await fetch(`${RELAY_BASE}/v2v/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device_id: identity.deviceId,
      public_key: identity.publicKeyHex,
      signature,
      payload: enrichedPayload,
      timestamp: Date.now(),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error("Relay rejected: " + body);
  }

  return res.json();
}

/* ---------------------------------------------
   GPS-Aware Feed Fetch (Phase A+B)
--------------------------------------------- */

export async function fetchV2VFeed(lat: number, lng: number, radius: number) {
  const url = `${RELAY_BASE}/v2v/feed?lat=${lat}&lng=${lng}&radius=${radius}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Feed fetch failed");

  return res.json();
}