import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import RsvpSync from "./rsvp-sync";
import RsvpSubmitBridge from "./rsvp-submit-bridge";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  return {
    title: "4Ever Wedding — Il vostro matrimonio, con leggerezza",
    description: "La wedding companion elegante e semplice per organizzare ogni dettaglio del vostro giorno.",
    applicationName: "4Ever Wedding",
    manifest: "/manifest.webmanifest",
    icons: { icon: [{ url: "/app-icon-192.png", sizes: "192x192", type: "image/png" }], apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }] },
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "4Ever Wedding" },
    formatDetection: { telephone: false },
    openGraph: { title: "4Ever Wedding", description: "Il vostro matrimonio, con leggerezza", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: "4Ever Wedding", description: "Il vostro matrimonio, con leggerezza", images: [image] },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#6d7762" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="it"><body><RsvpSync /><RsvpSubmitBridge />{children}</body></html>;
}
