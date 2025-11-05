"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Home, MessageCircle } from "lucide-react"

export default function BookingSuccess() {
  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-[#a0303f] mb-4">
              Booking Request Submitted!
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Thank you for your interest in our live classes. Our team will get back to you ASAP with class schedules and next steps.
            </p>
            
            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full bg-[#a0303f] hover:bg-[#a0303f]/90 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              
              <p className="text-sm text-gray-500 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                We'll contact you within 24 hours
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}