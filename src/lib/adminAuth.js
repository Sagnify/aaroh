import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const adminAuthOptions = {
  cookies: {
    sessionToken: {
      name: `admin.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/admin',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: `admin.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/admin',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: `admin.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/admin',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
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

        if (isAdminEmail) {
          const { getAdmin2FASecret } = await import('@/lib/admin2fa')
          const admin = await getAdmin2FASecret()
          
          if (admin?.twoFactorEnabled && admin?.twoFactorSecret) {
            if (!credentials.token) {
              return null
            }
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
          } else {
            const crypto = require('crypto')
            const expectedPassword = process.env.ADMIN_PASSWORD || ''
            const providedPassword = credentials.password || ''
            
            // Use constant-time comparison to prevent timing attacks
            const expectedBuffer = Buffer.from(expectedPassword, 'utf8')
            const providedBuffer = Buffer.from(providedPassword, 'utf8')
            
            if (expectedBuffer.length === providedBuffer.length && 
                crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
              return {
                id: 'admin',
                email: process.env.ADMIN_EMAIL,
                name: 'Admin',
                role: 'ADMIN'
              }
            }
            return null
          }
        }
        
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.role = token.role
      return session
    }
  },
  pages: {
    signIn: '/admin/login'
  }
}

export default NextAuth(adminAuthOptions)
