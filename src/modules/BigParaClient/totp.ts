import CryptoJS from "crypto-js";

const TOTP_INTERVAL = 60;
const TOTP_DIGITS = 6;

function base32Decode(input: string): CryptoJS.lib.WordArray {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let buffer = 0;
  const bytes: number[] = [];

  for (const char of input.toUpperCase()) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    buffer = (buffer << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((buffer >> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return CryptoJS.lib.WordArray.create(new Uint8Array(bytes) as any);
}

function generateHOTP(secret: CryptoJS.lib.WordArray, counter: number): string {
  const counterBytes = [];
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = c & 0xff;
    c = Math.floor(c / 256);
  }
  const counterWordArray = CryptoJS.lib.WordArray.create(
    new Uint8Array(counterBytes) as any
  );

  const hmac = CryptoJS.HmacSHA1(counterWordArray, secret);
  const hmacHex = hmac.toString(CryptoJS.enc.Hex);

  const hash = [];
  for (let i = 0; i < hmacHex.length; i += 2) {
    hash.push(parseInt(hmacHex.substring(i, i + 2), 16));
  }

  const offset = hash[hash.length - 1] & 0x0f;
  const truncated =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = truncated % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, "0");
}

export function generateTOTP(secretKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / TOTP_INTERVAL);
  const key = base32Decode(secretKey);
  return generateHOTP(key, counter);
}
