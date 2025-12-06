"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import SessionProvider from '@/components/SessionProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            const originalError = console.error;
            console.error = (...args) => {
              if (args[0]?.message?.includes('Access to storage is not allowed')) return;
              originalError.apply(console, args);
            };
          `
        }} />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ErrorBoundary>
          <SessionProvider>
            {!isAdminRoute && <Navbar />}
            <main className={`flex-grow ${isAdminRoute ? 'bg-white' : ''}`}>{children}</main>
            {!isAdminRoute && <Footer />}
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}