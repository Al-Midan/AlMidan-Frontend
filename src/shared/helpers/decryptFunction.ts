import crypto from "crypto";

const algorithm = "aes-256-gcm";
const keyLength = 32;

export function decrypt(encryptedText: string): string {
  const password =
    process.env.NEXT_PUBLIC_ENCRYPTION_PASSWORD ||
    "dGVzdGtleWZvc3Rlc3RpbmcxMjM0NTY3ODkwMT123eX";
  if (!password) {
    throw new Error("ENCRYPTION_PASSWORD not set in environment variables");
  }

  const [saltHex, ivHex, encryptedHex, tagHex] = encryptedText.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const key = crypto.pbkdf2Sync(password, salt, 100000, keyLength, "sha256");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}
