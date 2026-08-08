import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invito Giada e Francesco",
  description: "L'invito digitale al matrimonio di Giada e Francesco.",
};

export default function InvitoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
