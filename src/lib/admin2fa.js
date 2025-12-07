import { prisma } from './prisma'

export async function getAdmin2FASecret() {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: 'admin' },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    })
    return admin
  } catch (error) {
    console.error('Error getting 2FA secret:', error)
    return null
  }
}

export async function setAdmin2FASecret(secret) {
  try {
    await prisma.admin.upsert({
      where: { id: 'admin' },
      update: {
        twoFactorSecret: secret,
        twoFactorEnabled: true
      },
      create: {
        id: 'admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        twoFactorSecret: secret,
        twoFactorEnabled: true
      }
    })
    return true
  } catch (error) {
    console.error('Error setting 2FA secret:', error)
    return false
  }
}

export async function disableAdmin2FA() {
  try {
    await prisma.admin.update({
      where: { id: 'admin' },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false
      }
    })
    return true
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return false
  }
}
