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

// Send email function with robust error handling
export async function sendEmail({ to, subject, html, text }) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('❌ SMTP credentials not configured')
      throw new Error('SMTP credentials not configured')
    }

    if (!to) {
      console.error('❌ No recipient email provided')
      throw new Error('No recipient email provided')
    }

    console.log(`📧 Sending email to: ${to}`)
    console.log(`📧 Subject: ${subject}`)

    const info = await transporter.sendMail({
      from: `"Aaroh Music Academy" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })

    console.log('✅ Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Send email error:', error.message)
    console.error('❌ Full error:', error)
    return { success: false, error: error.message }
  }
}

// Get admin email - always use CONTACT_EMAIL for real notifications
export function getAdminEmail() {
  if (!process.env.CONTACT_EMAIL) {
    throw new Error('CONTACT_EMAIL environment variable is required')
  }
  return process.env.CONTACT_EMAIL
}

// Get contact email from database
export async function getContactEmail() {
  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: 'contactEmail' }
    })
    return content?.value || process.env.CONTACT_EMAIL
  } catch (error) {
    console.error('Failed to fetch contact email:', error)
    return process.env.CONTACT_EMAIL
  }
}

// Email templates - pass baseUrl dynamically
export const emailTemplates = (baseUrl) => ({
  // Welcome email
  welcome: (userName) => ({
    subject: 'Welcome to Aaroh Music Academy',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Aaroh</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your musical journey begins now</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi ${userName},</p>
          <p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Thank you for joining Aaroh Music Academy. We're excited to guide you on your musical journey with our expert instructors and comprehensive courses.</p>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${baseUrl}/courses" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Browse Courses</a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #E2E8F0; text-align: center;">
            <p style="color: #64748B; margin: 0; font-size: 14px;">Questions? Reply to this email or contact our support team.</p>
            <p style="color: #64748B; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">Aaroh Music Academy Team</p>
          </div>
        </div>
      </div>
    `,
    text: `Welcome to Aaroh Music Academy! Hi ${userName}, Thank you for joining us. Browse our courses at ${baseUrl}/courses`
  }),

  // Purchase confirmation
  purchaseConfirmation: (userName, courseName, amount) => ({
    subject: 'Course Purchase Confirmed',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Purchase Confirmed</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your course is now available</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi ${userName},</p>
          <p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Thank you for your purchase! Your payment has been successfully processed and you now have full access to your course.</p>
          
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Course Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Course:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">${courseName}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Amount Paid:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">₹${amount.toLocaleString()}</td></tr>
            </table>
          </div>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Access Your Course</a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #E2E8F0; text-align: center;">
            <p style="color: #64748B; margin: 0; font-size: 14px;">Happy learning! Questions? Reply to this email.</p>
            <p style="color: #64748B; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">Aaroh Music Academy Team</p>
          </div>
        </div>
      </div>
    `,
    text: `Course Purchase Confirmed! Hi ${userName}, Your payment for ${courseName} (₹${amount}) has been processed. Access your course at ${baseUrl}/dashboard`
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
        <a href="${baseUrl}/courses/${courseId}" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Get Your Certificate</a>
        <p>We're proud of your achievement and hope you continue your musical journey with us.</p>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `Congratulations ${userName}! You've completed ${courseName}. Get your certificate at ${baseUrl}/courses/${courseId}`
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
        <a href="${baseUrl}/admin/purchases" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">View in Admin Panel</a>
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
              <a href="${baseUrl}/admin/users" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; border: 1px solid #e5e7eb;">
                📊 View in Admin Panel
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
              <p style="margin: 0;">Aaroh Music Academy - Admin Notification</p>
            </div>
          </div>
        </div>
      `,
      text: `New ${classType} class application from ${userName}\n\nEmail: ${userEmail}\nPhone: ${phone}\n\nContact on WhatsApp: ${whatsappUrl}\nView in admin panel: ${baseUrl}/admin/users`
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
        <a href="${baseUrl}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Continue Learning</a>
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
        <a href="${baseUrl}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Resume Course</a>
        <p>Need help? Reply to this email and we'll assist you.</p>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `Hi ${userName}, It's been ${daysInactive} days since you accessed ${courseName}. Resume your course at ${baseUrl}/dashboard`
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
        <a href="${baseUrl}/courses" style="display: inline-block; padding: 12px 24px; background-color: #1f2937; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Try Again</a>
        <p>Best regards,<br>Aaroh Music Academy Team</p>
      </div>
    `,
    text: `Hi ${userName}, Your payment for ${courseName} (₹${amount}) failed. Please try again at ${baseUrl}/courses`
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

  // Custom song payment success
  customSongPaymentSuccess: (userName, order, isRepayment = false) => ({
    subject: `${isRepayment ? 'Repayment' : 'Payment'} Confirmed - Custom Song Order #${order.id.slice(0, 8)}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">${isRepayment ? 'Repayment' : 'Payment'} Confirmed</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">${isRepayment ? 'Thank you for completing the payment' : 'Your custom song is now in production'}</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Order ID:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">#${order.id.slice(0, 8)}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Occasion:</td><td style="padding: 6px 0; color: #1E293B;">${order.occasion}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Recipient:</td><td style="padding: 6px 0; color: #1E293B;">${order.recipientName}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Style:</td><td style="padding: 6px 0; color: #1E293B;">${order.style} • ${order.mood}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Delivery:</td><td style="padding: 6px 0; color: #1E293B;">${order.deliveryType === 'express' ? '3 days (Express)' : '7 days (Standard)'}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Amount:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">₹${order.amount.toLocaleString()}</td></tr>
            </table>
          </div>
          
          ${!isRepayment ? 
            `<div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
              <h3 style="color: #1E40AF; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">What happens next?</h3>
              <ul style="color: #1E40AF; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Our music team will craft your personalized song</li>
                <li>You'll receive a preview for approval via email</li>
                <li>Final song delivered within ${order.deliveryType === 'express' ? '3 days' : '7 days'}</li>
              </ul>
            </div>` : 
            `<div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
              <h3 style="color: #065F46; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Payment Complete!</h3>
              <p style="color: #065F46; margin: 0; line-height: 1.6;">Your payment has been successfully processed. You now have full access to your custom song.</p>
            </div>`
          }
          
          <div style="text-align: center;">
            <a href="${baseUrl}/shop/music-library" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Music Library</a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #E2E8F0; text-align: center;">
            <p style="color: #64748B; margin: 0; font-size: 14px;">Questions? Reply to this email or contact our support team.</p>
            <p style="color: #64748B; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">Aaroh Music Academy</p>
          </div>
        </div>
      </div>
    `,
    text: `${isRepayment ? 'Repayment' : 'Payment'} Confirmed - Custom Song Order #${order.id.slice(0, 8)}\n\nHi ${userName}, your ${isRepayment ? 'repayment has been confirmed and you now have full access to your custom song' : 'payment has been confirmed and your custom song is now in production. You\'ll receive a preview for approval within ' + (order.deliveryType === 'express' ? '3 days' : '7 days')}.`
  }),

  // Custom song payment failed
  customSongPaymentFailed: (userName, order, errorReason) => ({
    subject: `Payment Failed - Custom Song Order #${order.id.slice(0, 8)}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Payment Failed</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">We couldn't process your payment</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <h2 style="color: #991B1B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #7F1D1D; font-weight: 500;">Order ID:</td><td style="padding: 6px 0; color: #991B1B; font-weight: 600;">#${order.id.slice(0, 8)}</td></tr>
              <tr><td style="padding: 6px 0; color: #7F1D1D; font-weight: 500;">Amount:</td><td style="padding: 6px 0; color: #991B1B; font-weight: 600;">₹${order.amount.toLocaleString()}</td></tr>
              ${errorReason ? `<tr><td style="padding: 6px 0; color: #7F1D1D; font-weight: 500;">Reason:</td><td style="padding: 6px 0; color: #991B1B;">${errorReason}</td></tr>` : ''}
            </table>
          </div>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${baseUrl}/shop/custom-song" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Try Payment Again</a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #E2E8F0; text-align: center;">
            <p style="color: #64748B; margin: 0; font-size: 14px;">Need help? Reply to this email or contact our support team.</p>
            <p style="color: #64748B; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">Aaroh Music Academy</p>
          </div>
        </div>
      </div>
    `,
    text: `Payment Failed - Custom Song Order #${order.id.slice(0, 8)}\n\nHi ${userName}, we couldn't process your payment for ₹${order.amount.toLocaleString()}. ${errorReason ? 'Reason: ' + errorReason + '. ' : ''}Please try again.`
  }),

  // Admin custom song payment notification
  adminCustomSongPayment: (userName, userEmail, order, isRepayment = false) => ({
    subject: `${isRepayment ? 'Repayment' : 'Payment'} Received - Custom Song #${order.id.slice(0, 8)}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">${isRepayment ? 'Repayment' : 'Payment'} Received</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Custom Song Order #${order.id.slice(0, 8)}${isRepayment ? ' (Repayment)' : ''}</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #065F46; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Customer & Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #047857; font-weight: 500;">Customer:</td><td style="padding: 6px 0; color: #065F46; font-weight: 600;">${userName}</td></tr>
              <tr><td style="padding: 6px 0; color: #047857; font-weight: 500;">Email:</td><td style="padding: 6px 0; color: #065F46;">${userEmail}</td></tr>
              <tr><td style="padding: 6px 0; color: #047857; font-weight: 500;">Occasion:</td><td style="padding: 6px 0; color: #065F46;">${order.occasion}</td></tr>
              <tr><td style="padding: 6px 0; color: #047857; font-weight: 500;">Recipient:</td><td style="padding: 6px 0; color: #065F46;">${order.recipientName}</td></tr>
              <tr><td style="padding: 6px 0; color: #047857; font-weight: 500;">Style:</td><td style="padding: 6px 0; color: #065F46;">${order.style} • ${order.mood}</td></tr>
              <tr><td style="padding: 6px 0; color: #047857; font-weight: 500;">Deadline:</td><td style="padding: 6px 0; color: #065F46; font-weight: 600;">${order.deliveryType === 'express' ? '3 days (Express)' : '7 days (Standard)'}</td></tr>
              <tr><td style="padding: 6px 0; color: #047857; font-weight: 500;">Amount:</td><td style="padding: 6px 0; color: #065F46; font-weight: 600;">₹${order.amount.toLocaleString()}</td></tr>
            </table>
          </div>
          
          ${order.story ? `
            <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #92400E; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Story/Message:</h3>
              <p style="color: #92400E; margin: 0; font-style: italic; line-height: 1.6;">"${order.story}"</p>
            </div>
          ` : ''}
          
          <div style="text-align: center;">
            <a href="${baseUrl}/admin/shop" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Process in Admin Panel</a>
          </div>
        </div>
      </div>
    `,
    text: `${isRepayment ? 'Repayment' : 'Payment'} Received - Custom Song #${order.id.slice(0, 8)}\n\nCustomer: ${userName} (${userEmail})\nOccasion: ${order.occasion}\nRecipient: ${order.recipientName}\nStyle: ${order.style} • ${order.mood}\n${isRepayment ? 'Type: Repayment' : 'Deadline: ' + (order.deliveryType === 'express' ? '3 days (Express)' : '7 days (Standard)')}\nAmount: ₹${order.amount.toLocaleString()}`
  }),

  // Shop order status update
  orderStatusUpdate: (userName, orderId, status, trackingUrl) => {
    const statusConfig = {
      confirmed: { emoji: '✅', title: 'Order Confirmed', color: '#10b981', message: 'Your order has been confirmed and is being prepared.' },
      shipped: { emoji: '🚚', title: 'Order Shipped', color: '#3B82F6', message: 'Your order is on its way!' },
      delivered: { emoji: '🎉', title: 'Order Delivered', color: '#8B5CF6', message: 'Your order has been delivered. Enjoy!' },
      cancelled: { emoji: '❌', title: 'Order Cancelled', color: '#ef4444', message: 'Your order has been cancelled.' }
    }
    const config = statusConfig[status] || statusConfig.confirmed
    
    return {
      subject: `${config.title} - Order #${orderId.slice(0, 8)}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">${config.title}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Order #${orderId.slice(0, 8)}</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #1f2937; margin: 0 0 32px 0;">Hi ${userName},</p>
            <p style="font-size: 16px; color: #1f2937; margin: 0 0 32px 0;">${config.message}</p>
            
            ${trackingUrl ? `
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${trackingUrl}" style="display: inline-block; background: ${config.color}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Track Order</a>
              </div>
            ` : ''}
            
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="color: #64748B; margin: 0; font-size: 14px;">Thank you for shopping with us!</p>
              <p style="color: #64748B; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">Aaroh Story Shop Team</p>
            </div>
          </div>
        </div>
      `,
      text: `${config.title}: Order #${orderId.slice(0, 8)} - ${config.message} ${trackingUrl ? 'Track: ' + trackingUrl : ''}`
    }
  },
})
