import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sua Loja",
  description: "Produtos digitais de alta qualidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
