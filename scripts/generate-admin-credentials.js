async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);

  const key = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 1000,
      hash: "SHA-512",
    },
    key,
    512
  );

  return Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function createHashedPassword(password) {
  const salt = crypto
    .getRandomValues(new Uint8Array(16))
    .reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
  const hash = await hashPassword(password, salt);
  return { hash, salt };
}

const username = "admin";
const password = process.argv[2];

if (!password) {
  console.error("Please provide a password as an argument");
  process.exit(1);
}

createHashedPassword(password).then(({ hash, salt }) => {
  console.log("Add these to your .env file:");
  console.log(`ADMIN_USERNAME=${username}`);
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log(`ADMIN_PASSWORD_SALT=${salt}`);
});
