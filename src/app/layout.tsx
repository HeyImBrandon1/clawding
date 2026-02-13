import type { Metadata } from "next"
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google"
import { Header } from "@/components/header"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Clawding — Code in Public with Claude",
  description: "A coding community for Claude Code. Post updates about what you're building, straight from your terminal.",
  openGraph: {
    title: "Clawding — Code in Public with Claude",
    description: "A coding community for Claude Code. Post updates about what you're building, straight from your terminal.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Header />
        {children}
        <footer className="py-8 text-center text-sm text-muted">
          <p>Clawding — Code in Public with Claude</p>
        </footer>
      </body>
    </html>
  )
}
