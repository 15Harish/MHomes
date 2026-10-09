import "./globals.css";
import { LoaderProvider } from "@/components/Loader";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { Cormorant_Garamond, DM_Sans, Montserrat } from "next/font/google";
import { BookingProvider } from "@/context/BookingContext";
import { RootLayoutClient } from "./_layout-client";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-label",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MHOMES - Luxury Resorts" ,
  description:
    "https://www.mhomesresort.com",
  keywords: "MHOMES Resort, resort near Alagar Temple, hotel near Alagar Kovil, Alagarkoil Road accommodation, Madurai resort",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorantGaramond.variable} ${dmSans.variable} ${montserrat.variable}`}
    >
      <body
        className={`min-h-screen bg-background antialiased ${dmSans.className}`}
      >
        <LoaderProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <BookingProvider>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
            <Toaster />
          </BookingProvider>
        </ThemeProvider>
        </LoaderProvider>
      </body>
    </html>
  );
}
