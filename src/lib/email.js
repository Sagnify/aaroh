import nodemailer from 'nodemailer'
import { prisma } from './prisma'

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Verify transporter configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify()
    console.log('Email service is ready')
    return true
  } catch (error) {
    console.error('Email service error:', error)
    return false
  }
}

// Send email function
export async function sendEmail({ to, subject, html, text }) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP credentials not configured')
    }

    const info = await transporter.sendMail({
      from: `"Aaroh Music Academy" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Send email error:', error)
    return { success: false, error: error.message }
  }
}

// Get contact email from database
export async function getContactEmail() {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: 'contactEmail' }
    })
    return content?.value || process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL
  } catch (error) {
    console.error('Failed to fetch contact email:', error)
    return process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL
  }
}

// Email templates
export const emailTemplates = {
  // Welcome email
  welcome: (userName) => ({
    subject: 'Welcome to Aaroh Music Academy!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">Welcome to Aaroh Music Academy!</h1>
        <p>Hi ${userName},</p>
        <p>Thank you for joining Aaroh Music Academy. We're excited to have you on your musical journey!</p>
        <p>You can now browse our courses and start learning.</p>
        <a href="${process.env.NEXTAUTH_URL}/courses" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Browse Courses</a>
        <p>If you have any questions, feel free to reach out to us.</p>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `Welcome to Aaroh Music Academy! Hi ${userName}, Thank you for joining us. Browse our courses at ${process.env.NEXTAUTH_URL}/courses`
  }),

  // Purchase confirmation
  purchaseConfirmation: (userName, courseName, amount) => ({
    subject: 'Purchase Confirmation - Aaroh Music Academy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">Purchase Confirmed!</h1>
        <p>Hi ${userName},</p>
        <p>Thank you for your purchase! Your payment has been successfully processed.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #1f2937;">Course Details</h2>
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Amount Paid:</strong> ₹${amount.toLocaleString()}</p>
        </div>
        <p>You can now access your course from your dashboard.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Go to Dashboard</a>
        <p>Happy learning!</p>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `Purchase Confirmed! Hi ${userName}, Your payment for ${courseName} (₹${amount}) has been processed. Access your course at ${process.env.NEXTAUTH_URL}/dashboard`
  }),

  // Certificate generated
  certificateGenerated: (userName, courseName, certificateUrl) => ({
    subject: 'Your Course Certificate - Aaroh Music Academy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">Congratulations! 🎉</h1>
        <p>Hi ${userName},</p>
        <p>Congratulations on completing <strong>${courseName}</strong>!</p>
        <p>Your certificate of completion is now ready.</p>
        <a href="${certificateUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Download Certificate</a>
        <p>We're proud of your achievement and hope you continue your musical journey with us.</p>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `Congratulations ${userName}! You've completed ${courseName}. Download your certificate: ${certificateUrl}`
  }),

  // Course completion (without certificate)
  courseCompletion: (userName, courseName, courseId) => ({
    subject: 'Course Completed! Get Your Certificate - Aaroh Music Academy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">Congratulations! 🎉</h1>
        <p>Hi ${userName},</p>
        <p>Amazing work! You've successfully completed <strong>${courseName}</strong>!</p>
        <p>Your certificate of completion is ready to be generated. Click the button below to view your course and download your certificate.</p>
        <a href="${process.env.NEXTAUTH_URL}/courses/${courseId}" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Get Your Certificate</a>
        <p>We're proud of your achievement and hope you continue your musical journey with us.</p>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `Congratulations ${userName}! You've completed ${courseName}. Get your certificate at ${process.env.NEXTAUTH_URL}/courses/${courseId}`
  }),

  // Password reset
  passwordReset: (userName, resetUrl) => ({
    subject: 'Reset Your Password - Aaroh Music Academy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">Reset Your Password</h1>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `Reset your password: ${resetUrl}. Link expires in 1 hour.`
  }),

  // Class booking confirmation
  classBookingConfirmation: (userName, classType) => ({
    subject: 'Class Booking Request Received - Aaroh Music Academy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">Booking Request Received!</h1>
        <p>Hi ${userName},</p>
        <p>We've received your request for <strong>${classType}</strong> classes.</p>
        <p>Our team will review your request and contact you within 24-48 hours to discuss the schedule and next steps.</p>
        <p>Thank you for choosing Aaroh Music Academy!</p>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `Hi ${userName}, We've received your ${classType} class booking request. We'll contact you within 24-48 hours.`
  }),

  // Admin notification for new purchase
  adminPurchaseNotification: (userName, userEmail, courseName, amount) => ({
    subject: 'New Course Purchase - Aaroh Admin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">New Course Purchase</h1>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Student:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Amount:</strong> ₹${amount.toLocaleString()}</p>
        </div>
        <a href="${process.env.NEXTAUTH_URL}/admin/purchases" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">View in Admin Panel</a>
      </div>
    `,
    text: `New purchase: ${userName} (${userEmail}) bought ${courseName} for ₹${amount}`
  }),

  // Admin notification for new class booking
  adminClassBookingNotification: (userName, userEmail, phone, classType) => {
    const whatsappMessage = encodeURIComponent(`Hello ${userName}! Thank you for your interest in ${classType} classes at Aaroh Music Academy. I'd like to discuss the schedule and next steps with you. When would be a good time to talk?`)
    const whatsappUrl = `https://wa.me/${phone}?text=${whatsappMessage}`
    
    return {
      subject: `🎵 New ${classType} Class Application - ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎵 New Class Application</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #1f2937;">
              <h2 style="color: #1f2937; margin-top: 0; font-size: 18px;">Student Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Name:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${userEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Phone:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Class Type:</td>
                  <td style="padding: 8px 0;">
                    <span style="background-color: #1f2937; color: white; padding: 4px 12px; border-radius: 16px; font-size: 14px; font-weight: 600;">${classType}</span>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background-color: #ecfdf5; padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #10b981;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">
                ⏰ <strong>Action Required:</strong> Please contact the student within 24-48 hours.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${whatsappUrl}" style="display: inline-block; background-color: #25D366; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 211, 102, 0.3);">
                💬 Contact on WhatsApp
              </a>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <a href="${process.env.NEXTAUTH_URL}/admin/users" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; border: 1px solid #e5e7eb;">
                📊 View in Admin Panel
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
              <p style="margin: 0;">Aaroh Music Academy - Admin Notification</p>
            </div>
          </div>
        </div>
      `,
      text: `New ${classType} class application from ${userName}\n\nEmail: ${userEmail}\nPhone: ${phone}\n\nContact on WhatsApp: ${whatsappUrl}\nView in admin panel: ${process.env.NEXTAUTH_URL}/admin/users`
    }
  },

  // Course progress milestone
  progressMilestone: (userName, courseName, progress) => ({
    subject: `You're ${progress}% through ${courseName}! - Aaroh`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">Great Progress! 🎵</h1>
        <p>Hi ${userName},</p>
        <p>You've completed <strong>${progress}%</strong> of <strong>${courseName}</strong>!</p>
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 4px; margin: 20px 0;">
          <div style="background-color: #1f2937; height: 24px; border-radius: 6px; width: ${progress}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${progress}%</div>
        </div>
        <p>Keep up the excellent work! You're doing amazing.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Continue Learning</a>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `Hi ${userName}, You've completed ${progress}% of ${courseName}! Keep going!`
  }),

  // Course completion reminder
  courseCompletionReminder: (userName, courseName, daysInactive) => ({
    subject: `We miss you! Complete ${courseName} - Aaroh`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">We Miss You! 🎶</h1>
        <p>Hi ${userName},</p>
        <p>It's been ${daysInactive} days since you last accessed <strong>${courseName}</strong>.</p>
        <p>Don't let your progress go to waste! Continue your musical journey today.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Resume Course</a>
        <p>Need help? Reply to this email and we'll assist you.</p>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `Hi ${userName}, It's been ${daysInactive} days since you accessed ${courseName}. Resume your course at ${process.env.NEXTAUTH_URL}/dashboard`
  }),

  // Payment failed notification
  paymentFailed: (userName, courseName, amount) => ({
    subject: 'Payment Failed - Aaroh Music Academy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">Payment Failed</h1>
        <p>Hi ${userName},</p>
        <p>Unfortunately, your payment for <strong>${courseName}</strong> could not be processed.</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Amount:</strong> ₹${amount.toLocaleString()}</p>
        </div>
        <p>Please try again or contact us if you need assistance.</p>
        <a href="${process.env.NEXTAUTH_URL}/courses" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Try Again</a>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `Hi ${userName}, Your payment for ${courseName} (₹${amount}) failed. Please try again at ${process.env.NEXTAUTH_URL}/courses`
  }),

  // New course announcement
  newCourseAnnouncement: (userName, courseName, courseDescription, courseUrl) => ({
    subject: `New Course Available: ${courseName} - Aaroh`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">New Course Alert! 🎉</h1>
        <p>Hi ${userName},</p>
        <p>We're excited to announce a new course: <strong>${courseName}</strong></p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>${courseDescription}</p>
        </div>
        <p>Enroll now and start your learning journey!</p>
        <a href="${courseUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Course</a>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `New course available: ${courseName}. ${courseDescription} View at ${courseUrl}`
  }),

  // Contact form submission
  contactFormSubmission: (name, email, phone, message) => ({
    subject: 'New Contact Form Submission - Aaroh Admin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">New Contact Form Submission</h1>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `,
    text: `Contact form: ${name} (${email}, ${phone}) - ${message}`
  }),
}
