import { Db, MongoClient } from "mongodb";

type MongoCache = {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
  indexesEnsured: boolean;
};

// eslint-disable-next-line no-var
declare global {
  var __mongoCache: MongoCache | undefined;
}

const cache: MongoCache = global.__mongoCache ?? { client: null, promise: null, indexesEnsured: false };
global.__mongoCache = cache;

async function ensureIndexes(db: Db): Promise<void> {
  if (cache.indexesEnsured) return;
  cache.indexesEnsured = true;

  try {
    await Promise.all([
      db.collection("courses").createIndex({ slug: 1 }, { unique: true }),
      db.collection("courses").createIndex({ modality: 1, status: 1 }),
      db.collection("ementas").createIndex({ courseId: 1 }, { unique: true }),
      db.collection("enrollments").createIndex({ courseId: 1 }),
      db.collection("enrollments").createIndex({ sellerId: 1 }),
      db.collection("enrollments").createIndex({ paymentStatus: 1 }),
      db.collection("enrollments").createIndex({ mpPreferenceId: 1 }),
      db.collection("enrollments").createIndex({ mpPaymentId: 1 }),
      db.collection("enrollments").createIndex({ studentCpf: 1, studentPhone: 1 }),
      db.collection("sellers").createIndex({ userId: 1 }),
      db.collection("aiConversations").createIndex({ sessionId: 1 }),
    ]);
  } catch (error) {
    console.error("Falha ao criar índices do Mongo (não bloqueia a aplicação):", error);
  }
}

// Lazy (não no module scope) para não quebrar o build do Next, que carrega
// os route handlers pra coletar metadados antes de variáveis de ambiente de
// runtime existirem (ex: build do Docker).
async function getClient(): Promise<MongoClient> {
  if (cache.client) return cache.client;
  if (!cache.promise) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("Defina a variável de ambiente DATABASE_URL (.env)");
    }
    cache.promise = new MongoClient(databaseUrl).connect();
  }
  cache.client = await cache.promise;
  return cache.client;
}

export async function connectDB(dbName: string = process.env.DB ?? "simplifica_doctor_vendas"): Promise<Db> {
  const client = await getClient();
  const db = client.db(dbName);
  void ensureIndexes(db);
  return db;
}

export default connectDB;
