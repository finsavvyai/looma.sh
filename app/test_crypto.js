import { ed25519 } from "@noble/curves/ed25519.js";
import { randomBytes } from "@noble/hashes/utils.js";

// Generate a proper key pair
const privateKey = randomBytes(32);
const publicKey = ed25519.getPublicKey(privateKey);

console.log("Private Key (hex):", Buffer.from(privateKey).toString('hex'));
console.log("Public Key (hex):", Buffer.from(publicKey).toString('hex'));

// Create a test payload with GPS coordinates
const payload = {
  type: "ping",
  text: "Real V2V message with GPS location!",
  _gps: {
    lat: 32.089830689616186,
    lng: 34.81684907372303,
    accuracy: 10
  }
};

// Sign the payload
const messageBytes = new TextEncoder().encode(JSON.stringify(payload));
const signature = ed25519.sign(messageBytes, privateKey);

console.log("Signature (hex):", Buffer.from(signature).toString('hex'));

// Verify the signature (test)
const isValid = ed25519.verify(signature, messageBytes, publicKey);
console.log("Signature valid:", isValid);

// Create the full message that would be sent to relay
const v2vMessage = {
  device_id: `device_${Buffer.from(publicKey).toString('hex').substring(0, 16)}`,
  public_key: Buffer.from(publicKey).toString('hex'),
  signature: Buffer.from(signature).toString('hex'),
  payload: payload,
  timestamp: Date.now()
};

console.log("V2V Message:", JSON.stringify(v2vMessage, null, 2));