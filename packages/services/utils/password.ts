import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "crypto";
import { promisify } from "util";
import { generateHash } from "./generateHash";

const scrypt = promisify(scryptCallback);
const SCRYPT_KEY_LENGTH = 64;

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scrypt(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;

  return ["scrypt", "v1", salt, derivedKey.toString("base64url")].join("$");
}

export async function verifyPassword({
  password,
  storedHash,
  legacySalt,
}: {
  password: string;
  storedHash: string;
  legacySalt?: string | null;
}) {
  if (storedHash.startsWith("scrypt$")) {
    const [, version, salt, hash] = storedHash.split("$");

    if (version !== "v1" || !salt || !hash) {
      return false;
    }

    const derivedKey = (await scrypt(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;

    return safeCompare(derivedKey.toString("base64url"), hash);
  }

  if (!legacySalt) {
    return false;
  }

  return safeCompare(generateHash(legacySalt, password), storedHash);
}

export function isLegacyPasswordHash(storedHash: string) {
  return !storedHash.startsWith("scrypt$");
}

export function createSecureToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
