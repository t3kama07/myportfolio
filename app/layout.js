import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  title: {
    default: "Manjula | Web Developer Portfolio",
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Manjula | Web Developer Portfolio",
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
  twitter: {
    card: "summary_large_image",
    title: "Manjula | Web Developer Portfolio",
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
