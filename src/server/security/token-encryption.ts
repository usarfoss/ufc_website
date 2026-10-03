import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";

const getEncryptionKey = () => {
  const value = process.env.TOKEN_ENCRYPTION_KEY;

  if (!value) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be configured for background GitHub sync.");
  }

  const key = Buffer.from(value, "base64");

  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  }

  return key;
};

export const encryptToken = (token: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [VERSION, iv.toString("base64"), authTag.toString("base64"), ciphertext.toString("base64")].join(".");
};

export const decryptToken = (payload: string) => {
  const [version, ivValue, authTagValue, ciphertextValue] = payload.split(".");

  if (version !== VERSION || !ivValue || !authTagValue || !ciphertextValue) {
    throw new Error("Stored GitHub token has an invalid encrypted format.");
  }

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivValue, "base64"));
  decipher.setAuthTag(Buffer.from(authTagValue, "base64"));

  return Buffer.concat([decipher.update(Buffer.from(ciphertextValue, "base64")), decipher.final()]).toString("utf8");
};
