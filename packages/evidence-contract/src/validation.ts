import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import manifestSchema from "../schema/evidence-manifest.schema.json";
import type { EvidenceManifest } from "./generated/evidence-manifest";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

export const validateEvidenceManifest = ajv.compile<EvidenceManifest>(manifestSchema);
