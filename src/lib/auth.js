import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        const isAdminEmail = credentials.email === process.env.ADMIN_EMAIL
        const isAdminLogin = credentials.loginType === 'admin'
        
        if (isAdminEmail && isAdminLogin) {
          const { getAdmin2FASecret } = await import('@/lib/admin2fa')
          const admin = await getAdmin2FASecret()
          
          if (admin?.twoFactorEnabled && admin?.twoFactorSecret) {
            if (!credentials.token) return null
            const speakeasy = (await import('speakeasy')).default
            const verified = speakeasy.totp.verify({
              secret: admin.twoFactorSecret,
              encoding: 'base32',
              token: credentials.token,
              window: 2
            })
            if (!verified) return null
          } else {
            if (credentials.password !== process.env.ADMIN_PASSWORD) return null
          }
          
          return {
            id: 'admin',
            email: process.env.ADMIN_EMAIL,
            name: 'Admin',
            role: 'ADMIN'
          }
        }
        
        if (isAdminEmail && !isAdminLogin) return null
        if (!isAdminLogin && credentials.password) {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) return null

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role
          }
        }
        
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.role = token.role
      session.user.phone = token.phone
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
}