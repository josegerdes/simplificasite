export async function register() {
  // Seed só faz sentido em runtime Node.js (não no Edge).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { connectDB } = await import("@/server/db/client");
    const { seedInitialAdmin, syncDefaultRolePermissions } = await import("@/server/db/seed-admin");
    const { seedSiteContent, backfillCourseEmentas } = await import("@/server/db/seed-content");
    try {
      const db = await connectDB();
      await seedInitialAdmin(db);
      await syncDefaultRolePermissions(db);
      await seedSiteContent(db);
      await backfillCourseEmentas(db);
    } catch (error) {
      console.error("[seed] falha ao rodar o seed inicial no boot:", error);
    }
  }
}
