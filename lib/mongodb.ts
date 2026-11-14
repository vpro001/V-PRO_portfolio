import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

export const hasDatabase = Boolean(uri);

function connect(): Promise<MongoClient> {
  if (!uri) {
    return Promise.reject(
      new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).")
    );
  }
  // Reuse one client across hot reloads and across route handlers.
  if (!globalWithMongo._mongoClientPromise) {
    const promise = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 }).connect();
    // Don't cache a failed connection — let the next request try again.
    promise.catch(() => {
      if (globalWithMongo._mongoClientPromise === promise) {
        globalWithMongo._mongoClientPromise = undefined;
      }
    });
    globalWithMongo._mongoClientPromise = promise;
  }
  return globalWithMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  return (await connect()).db();
}

/** Thenable kept for scripts and older imports: `const client = await clientPromise`. */
const clientPromise = {
  then<T1 = MongoClient, T2 = never>(
    onfulfilled?: ((value: MongoClient) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null
  ) {
    return connect().then(onfulfilled, onrejected);
  },
} as PromiseLike<MongoClient>;

export default clientPromise;
