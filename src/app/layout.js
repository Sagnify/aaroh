"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import SessionProvider from '@/components/SessionProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { usePathname } from 'next/navigation'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Learn music online with Aaroh Music Academy. Expert-led courses in vocals, keyboard, and music theory. Join live classes or learn at your own pace with Kashmira Chakraborty." />
        <meta name="keywords" content="music academy, online music courses, vocal training, keyboard lessons, music theory, learn music online, Kashmira Chakraborty, music classes India, singing lessons" />
        <meta name="author" content="Kashmira Chakraborty" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Aaroh Music Academy" />
        <meta property="og:locale" content="en_IN" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        
        <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        {isAdminRoute && (
          <>
            <link rel="manifest" href="/manifest.json" />
            <meta name="theme-color" content="#000000" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black" />
            <meta name="apple-mobile-web-app-title" content="Aaroh Admin" />
          </>
        )}
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
          <QueryClientProvider client={queryClient}>
            <SessionProvider>
              {!isAdminRoute && <Navbar />}
              <main className={`flex-grow ${isAdminRoute ? 'bg-white' : ''}`}>{children}</main>
              {!isAdminRoute && <Footer />}
            </SessionProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}