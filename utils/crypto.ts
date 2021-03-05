import crypto from "crypto-js";

export function base64ToHex(str: string) {
  const raw = atob(str);
  let result = "";
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += hex.length === 2 ? hex : "0" + hex;
  }
  return result.toUpperCase();
}

// TODO fix this
// @ts-ignore
export function hexToBase64(str) {
  return btoa(
    String.fromCharCode.apply(
      null,
      str
        .replace(/\r|\n/g, "")
        .replace(/([\da-fA-F]{2}) ?/g, "0x$1 ")
        .replace(/ +$/, "")
        .split(" ")
    )
  );
}

export function isHex (str: string) {
  const re = /[0-9A-Fa-f]{6}/g;
  return re.test(str)
}

export function isBase64(str: string) {
  if (str === "" || str.trim() === "") return false;
  if (isHex(str)) return false
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

export function decryptString({
  encrypted,
  password,
}: {
  encrypted: string;
  password: string;
}): { decrypted: string; error: string } {
  try {
    const decrypted = crypto.AES.decrypt(encrypted || "", password).toString(
      crypto.enc.Base64
    );
    const decryptResult = atob(decrypted);
    if (isBase64(decryptResult)) {
      return { decrypted: decryptResult, error: "" };
    } else {
      return { decrypted: "", error: "Incorrect password" };
    }
  } catch (e) {
    console.error("cipher mismatch, macaroon decryption failed");
    console.error(e);
    return { decrypted: "", error: e.toString() };
  }
}
