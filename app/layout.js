import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles.css";
import { getSiteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Manjula | Fullstack Developer Portfolio",
    template: "%s | Manjula",
  },
  description:
    "Portfolio of Manjula, a web developer building user-friendly and performant web applications.",
  keywords: [
    "Manjula",
    "web developer",
    "portfolio",
    "Next.js developer",
    "frontend developer",
    "Helsinki",
  ],
  openGraph: {
    type: "website",
    url: "/",
    title: "Manjula | Fullstack Developer Portfolio",
    description:
      "Portfolio of Manjula, a web developer building user-friendly and performant web applications.",
    images: [
      {
        url: "/assets/profileimage.jpeg",
        width: 1200,
        height: 630,
        alt: "Manjula portfolio preview",
      },
    ],
  },
  icons: {
    icon: [{ url: "/assets/logo.webp", type: "image/webp" }],
    shortcut: ["/assets/logo.webp"],
    apple: [{ url: "/assets/logo.webp", type: "image/webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manjula | Fullstack Developer Portfolio",
    description:
      "Portfolio of Manjula, a web developer building user-friendly and performant web applications.",
    images: ["/assets/profileimage.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale === "fi" ? "fi" : "en";

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
