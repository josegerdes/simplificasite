import "dotenv/config";

import { connectDB } from "@/server/db/client";
import { seedInitialAdmin, syncDefaultRolePermissions } from "@/server/db/seed-admin";
import { seedSiteContent } from "@/server/db/seed-content";

async function main() {
  const db = await connectDB();
  await seedInitialAdmin(db);
  await syncDefaultRolePermissions(db);
  await seedSiteContent(db);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
