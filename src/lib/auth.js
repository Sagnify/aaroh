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
      async authorize(credentials, req) {
        if (!credentials?.email) {
          return null
        }

        // Check for admin credentials
        const isAdminEmail = credentials.email === process.env.ADMIN_EMAIL
        
        // Reject admin login on user pages
        const isUserLogin = credentials.loginType === 'user'
        if (isAdminEmail && isUserLogin) {
          return null
        }
        
        if (isAdminEmail && credentials.loginType === 'admin') {
          // Check if 2FA is enabled
          const { getAdmin2FASecret } = await import('@/lib/admin2fa')
          const admin = await getAdmin2FASecret()
          
          if (admin?.twoFactorEnabled && admin?.twoFactorSecret && credentials.token) {
            // Verify 2FA token
            const speakeasy = (await import('speakeasy')).default
            const verified = speakeasy.totp.verify({
              secret: admin.twoFactorSecret,
              encoding: 'base32',
              token: credentials.token,
              window: 2
            })
            
            if (verified) {
              return {
                id: 'admin',
                email: process.env.ADMIN_EMAIL,
                name: 'Admin',
                role: 'ADMIN'
              }
            }
            return null
          } else if (!admin?.twoFactorEnabled && credentials.password === process.env.ADMIN_PASSWORD) {
            // 2FA not enabled, use password
            return {
              id: 'admin',
              email: process.env.ADMIN_EMAIL,
              name: 'Admin',
              role: 'ADMIN'
            }
          }
          return null
        }

        // Check database for regular users
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
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
  }
}

export default NextAuth(authOptions)