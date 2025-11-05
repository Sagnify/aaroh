"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import SessionProvider from '@/components/SessionProvider'
import LoadingProvider from '@/components/LoadingProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <SessionProvider>
            <LoadingProvider>
              {!isAdminRoute && <Navbar />}
              <main>{children}</main>
              {!isAdminRoute && <Footer />}
            </LoadingProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}