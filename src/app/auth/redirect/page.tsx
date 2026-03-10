import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AuthRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  switch (session.user.role) {
    case "CANDIDATE":
      redirect("/candidate");
    case "INTERVIEWER":
      redirect("/dashboard");
    case "COMPANY_ADMIN":
      redirect("/dashboard");
    case "SCHOOL_ADMIN":
      redirect("/school");
    default:
      redirect("/dashboard");
  }
}
