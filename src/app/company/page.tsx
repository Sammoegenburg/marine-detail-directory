import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CompanyApp from "@/components/dashboard/CompanyApp";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <CompanyApp />;
}
