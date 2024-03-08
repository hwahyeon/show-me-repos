import { Providers } from "./providers";

export const metadata = {
  title: "Show me repos",
  description: "Show me repos by Next.js 14",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
