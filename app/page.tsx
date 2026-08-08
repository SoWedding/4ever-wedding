import { env } from "cloudflare:workers";
import DashboardClient from "./dashboard-client";
import { chatGPTSignOutPath, requireChatGPTUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";

function allowedDashboardEmails(): Set<string> {
  const value = (env as unknown as { DASHBOARD_ALLOWED_EMAILS?: string }).DASHBOARD_ALLOWED_EMAILS ?? "";
  return new Set(value.split(",").map(email => email.trim().toLowerCase()).filter(Boolean));
}

export default async function DashboardPage() {
  const user = await requireChatGPTUser("/");
  const allowed = allowedDashboardEmails();

  if (!allowed.has(user.email.toLowerCase())) {
    return (
      <main style={{ maxWidth: 620, margin: "12vh auto", padding: 32, fontFamily: "Georgia, serif" }}>
        <h1>Accesso riservato</h1>
        <p>Questa dashboard è accessibile soltanto agli sposi autorizzati.</p>
        <a href={chatGPTSignOutPath("/")}>Esci</a>
      </main>
    );
  }

  return <DashboardClient />;
}
