#!/usr/bin/env node
/**
 * One-time database setup. Safe to run again at any time.
 *
 *   bun run init-db
 *
 * - creates the indexes the app relies on
 * - removes an old index that blocked more than one Flutterwave payment
 * - creates the admin account if there isn't one yet
 *
 * Reads MONGODB_URI (and optionally ADMIN_USERNAME / ADMIN_EMAIL /
 * ADMIN_PASSWORD) from the environment or from .env.local.
 */
const fs = require("fs");
const path = require("path");
const { randomBytes, scryptSync } = require("crypto");
const { MongoClient } = require("mongodb");

for (const file of [".env.local", ".env"]) {
  const full = path.join(__dirname, "..", file);
  if (!fs.existsSync(full)) continue;
  for (const line of fs.readFileSync(full, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

// Must match lib/password.ts.
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

async function index(collection, keys, options = {}) {
  try {
    await collection.createIndex(keys, options);
  } catch (error) {
    console.warn(
      `  ! could not create index on ${collection.collectionName} ${JSON.stringify(keys)}: ${error.message}`
    );
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to .env.local first (see .env.example).");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  console.log(`Connected to "${db.databaseName}".`);

  console.log("Creating indexes…");
  await index(db.collection("courses"), { isPublished: 1, createdAt: -1 });
  await index(db.collection("enrollments"), { userId: 1, courseId: 1 }, { unique: true });
  await index(db.collection("enrollments"), { enrolledAt: -1 });
  await index(db.collection("progress"), { userId: 1, courseId: 1, lessonId: 1 }, { unique: true });
  await index(db.collection("students"), { username: 1 }, { unique: true });
  await index(db.collection("students"), { email: 1 }, { unique: true });
  await index(db.collection("users"), { username: 1 }, { unique: true });
  await index(db.collection("payment_initializations"), { txRef: 1 });
  await index(db.collection("payments"), { createdAt: -1 });
  await index(
    db.collection("payments"),
    { txRef: 1 },
    { unique: true, partialFilterExpression: { txRef: { $type: "string" } } }
  );
  await index(db.collection("projects"), { featured: -1, createdAt: -1 });
  await index(db.collection("messages"), { createdAt: -1 });

  // Earlier versions made `paymentId` unique, but Flutterwave payments never
  // set it — so the second payment ever made was rejected as a duplicate.
  const paymentIndexes = await db
    .collection("payments")
    .indexes()
    .catch(() => []);
  if (paymentIndexes.some((i) => i.name === "paymentId_1")) {
    await db.collection("payments").dropIndex("paymentId_1");
    console.log("  replaced old unique index payments.paymentId_1");
  }

  const admins = await db.collection("users").countDocuments();
  if (admins > 0) {
    console.log(`Admin account already exists (${admins}). Nothing to create.`);
  } else {
    const username = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || randomBytes(9).toString("base64url");
    const now = new Date();
    await db.collection("users").insertOne({
      username,
      email: (process.env.ADMIN_EMAIL || "").toLowerCase(),
      password: hashPassword(password),
      role: "admin",
      profile: {},
      createdAt: now,
      updatedAt: now,
    });
    console.log("\nAdmin account created. Sign in at /admin/signin with:");
    console.log(`  username: ${username}`);
    console.log(
      process.env.ADMIN_PASSWORD
        ? "  password: the ADMIN_PASSWORD you provided"
        : `  password: ${password}   <- shown once; change it under Admin → Settings`
    );
  }

  await client.close();
  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
