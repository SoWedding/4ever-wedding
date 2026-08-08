import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type ChatGPTUser = { displayName: string; email: string; fullName: string | null };

const SIGN_IN_PATH = "/signin-with-chatgpt";

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  if (!email) return null;

  const encodedName = requestHeaders.get("oai-authenticated-user-full-name");
  let fullName: string | null = null;
  if (encodedName && requestHeaders.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8") {
    try { fullName = decodeURIComponent(encodedName); } catch { fullName = null; }
  }
  return { email, fullName, displayName: fullName ?? email };
}

export async function requireChatGPTUser(returnTo: string): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;
  redirect(`${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo(returnTo))}`);
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  return `/signout-with-chatgpt?return_to=${encodeURIComponent(safeReturnTo(returnTo))}`;
}

function safeReturnTo(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, "https://app.local");
    return url.origin === "https://app.local" ? `${url.pathname}${url.search}${url.hash}` : "/";
  } catch {
    return "/";
  }
}
