import * as CryptoJS from "crypto-js";

export function encrypt(
  text: string,
  secretKey: string = process.env.ENCRYPTION_KEY as string,
): string {
  const encrypted = CryptoJS.AES.encrypt(text, secretKey);
  return encrypted.toString();
}

export function decrypt(
  text: string,
  secretKey: string = process.env.ENCRYPTION_KEY as string,
): string {
  const decrypted = CryptoJS.AES.decrypt(text, secretKey);
  return decrypted.toString(CryptoJS.enc.Utf8);
}
