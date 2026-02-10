import type { Metadata } from "next"
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google"
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
  title: "SlashCast — Broadcast What You Build",
  description: "A terminal-native coding community. Post updates, join hackathons, compete in events — all from your CLI.",
  openGraph: {
    title: "SlashCast — Broadcast What You Build",
    description: "A terminal-native coding community. Post updates, join hackathons, compete in events — all from your CLI.",
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
        {children}
        <footer className="py-8 text-center text-sm text-muted">
          <p>SlashCast — Broadcast What You Build</p>
        </footer>
      </body>
    </html>
  )
}
