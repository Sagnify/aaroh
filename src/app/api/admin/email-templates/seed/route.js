import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const defaultTemplates = [
  {
    name: 'courseCompletion',
    subject: 'Course Completed - {{courseName}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🎉 Course Completed!</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Congratulations on your achievement</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Congratulations! You have successfully completed <strong>{{courseName}}</strong>. Your certificate is now ready for download.</p><div style="text-align: center;"><a href="{{baseUrl}}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Download Certificate</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'courseName', example: 'Guitar Basics' },
      { name: 'baseUrl', example: 'https://aaroh.com' }
    ]
  },
  {
    name: 'classBookingConfirmation',
    subject: 'Class Booking Confirmed',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Class Booking Confirmed</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your class has been scheduled</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Your class booking for <strong>{{classType}}</strong> has been confirmed. We'll contact you soon to schedule your session.</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Booking Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Class Type:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{classType}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Phone:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{phone}}</td></tr></table></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'classType', example: 'Guitar Lessons' },
      { name: 'phone', example: '+91 9876543210' }
    ]
  },
  {
    name: 'adminPurchaseNotification',
    subject: 'New Course Purchase - {{courseName}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">New Purchase Alert</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">A student has purchased a course</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hello Admin,</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">A new course purchase has been made:</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Purchase Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Student:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{userName}} ({{userEmail}})</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Course:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{courseName}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Amount:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">₹{{amount}}</td></tr></table></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'userEmail', example: 'john@example.com' },
      { name: 'courseName', example: 'Guitar Basics' },
      { name: 'amount', example: '2999' }
    ]
  },
  {
    name: 'adminClassBooking',
    subject: 'New Class Booking - {{classType}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">New Class Booking</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">A student has booked a class</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hello Admin,</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">A new class booking has been made:</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Booking Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Student:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{userName}} ({{userEmail}})</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Class Type:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{classType}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Phone:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{phone}}</td></tr></table></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'userEmail', example: 'john@example.com' },
      { name: 'classType', example: 'Guitar Lessons' },
      { name: 'phone', example: '+91 9876543210' }
    ]
  },
  {
    name: 'progressMilestone',
    subject: 'Great Progress in {{courseName}}!',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🎯 Milestone Achieved!</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">You're making great progress</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Congratulations! You've reached {{progressPercentage}}% completion in <strong>{{courseName}}</strong>. Keep up the excellent work!</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><div style="background: #E5E7EB; border-radius: 8px; height: 8px; margin-bottom: 16px;"><div style="background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); height: 8px; border-radius: 8px; width: {{progressPercentage}}%;"></div></div><p style="color: #64748B; margin: 0; text-align: center;">{{progressPercentage}}% Complete</p></div><div style="text-align: center;"><a href="{{baseUrl}}/courses/{{courseId}}" style="display: inline-block; background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Continue Learning</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'courseName', example: 'Guitar Basics' },
      { name: 'progressPercentage', example: '75' },
      { name: 'courseId', example: 'course-123' },
      { name: 'baseUrl', example: 'https://aaroh.com' }
    ]
  },
  {
    name: 'paymentFailed',
    subject: 'Payment Failed - {{courseName}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Payment Failed</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">There was an issue with your payment</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Unfortunately, your payment for <strong>{{courseName}}</strong> could not be processed. Please try again or contact support.</p><div style="text-align: center;"><a href="{{retryUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Retry Payment</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'courseName', example: 'Guitar Basics' },
      { name: 'retryUrl', example: 'https://aaroh.com/checkout/course-123' }
    ]
  },
  {
    name: 'newCourseAnnouncement',
    subject: 'New Course Available - {{courseName}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🎵 New Course Available!</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Expand your musical skills</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><div style="text-align: center; margin-bottom: 24px;"><img src="{{courseThumbnail}}" alt="{{courseName}}" style="max-width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #E2E8F0;"/></div><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">We're excited to announce our new course: <strong>{{courseName}}</strong> for just <strong>₹{{coursePrice}}</strong>!</p><div style="text-align: center;"><a href="{{courseUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Course</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'courseName', example: 'Advanced Piano Techniques' },
      { name: 'courseThumbnail', example: 'https://via.placeholder.com/400x200/8B5CF6/FFFFFF?text=Course+Image' },
      { name: 'coursePrice', example: '2999' },
      { name: 'courseUrl', example: 'https://aaroh.com/courses/advanced-piano' }
    ]
  },
  {
    name: 'contactFormSubmission',
    subject: 'New Contact Form Submission',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #64748B 0%, #475569 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">New Contact Message</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Someone has contacted you</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hello Admin,</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">You have received a new contact form submission:</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Contact Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Name:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{name}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Email:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{email}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Phone:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{phone}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Message:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{message}}</td></tr></table></div></div></div>`,
    variables: [
      { name: 'name', example: 'John Doe' },
      { name: 'email', example: 'john@example.com' },
      { name: 'phone', example: '+91 9876543210' },
      { name: 'message', example: 'I am interested in guitar lessons.' }
    ]
  },
  {
    name: 'customSongOrderUpdate',
    subject: 'Custom Song Order Update - {{status}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🎵 Order Update</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your custom song order status</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi there,</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Your custom song order for <strong>{{recipientName}}</strong> has been updated to: <strong>{{status}}</strong></p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Recipient:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{recipientName}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Occasion:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{occasion}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Status:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{status}}</td></tr></table></div></div></div>`,
    variables: [
      { name: 'recipientName', example: 'Sarah' },
      { name: 'occasion', example: 'Birthday' },
      { name: 'status', example: 'In Progress' }
    ]
  },
  {
    name: 'orderStatusUpdate',
    subject: 'Order Status Update - {{orderStatus}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">📦 Order Update</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your order status has been updated</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{customerName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Your order <strong>#{{orderId}}</strong> status has been updated to: <strong>{{orderStatus}}</strong></p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Order ID:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">#{{orderId}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Status:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{orderStatus}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Amount:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">₹{{amount}}</td></tr></table></div><div style="text-align: center;"><a href="{{orderUrl}}" style="display: inline-block; background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Order</a></div></div></div>`,
    variables: [
      { name: 'customerName', example: 'John Doe' },
      { name: 'orderId', example: 'ORD-2024-001' },
      { name: 'orderStatus', example: 'Shipped' },
      { name: 'amount', example: '1999' },
      { name: 'orderUrl', example: 'https://aaroh.com/orders/ORD-2024-001' }
    ]
  },
  {
    name: 'newProductAnnouncement',
    subject: 'New Products Available!',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🎁 New Products!</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Check out our latest offerings</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">We're excited to introduce our new products:</p>{{productCards}}<div style="text-align: center;"><a href="{{shopUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Browse All Products</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'productCards', example: '<div>Product cards HTML</div>' },
      { name: 'shopUrl', example: 'https://aaroh.com/shop' }
    ]
  },
  {
    name: 'welcome',
    subject: 'Welcome to {{siteName}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to {{siteName}}</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your musical journey begins now</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Thank you for joining {{siteName}}. We're excited to guide you on your musical journey.</p><div style="text-align: center; margin-bottom: 32px;"><a href="{{baseUrl}}/courses" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Browse Courses</a></div></div></div>`,
    variables: [
      { name: 'siteName', example: 'Aaroh Music Academy' },
      { name: 'userName', example: 'John Doe' },
      { name: 'baseUrl', example: 'https://aaroh.com' }
    ]
  },
  {
    name: 'purchaseConfirmation',
    subject: 'Course Purchase Confirmed - {{courseName}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Purchase Confirmed</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your course is now available</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Course Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Course:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{courseName}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Amount Paid:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">₹{{amount}}</td></tr></table></div><div style="text-align: center;"><a href="{{baseUrl}}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Access Your Course</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'courseName', example: 'Guitar Basics' },
      { name: 'amount', example: '2999' },
      { name: 'baseUrl', example: 'https://aaroh.com' }
    ]
  },
  {
    name: 'certificateNotification',
    subject: 'Certificate Ready - {{courseName}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #a0303f 0%, #ff6b6b 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🎉 Certificate Ready!</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Congratulations on completing your course</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Congratulations! Your certificate for <strong>{{courseName}}</strong> is now ready for download.</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Certificate Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Course:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{courseName}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Certificate ID:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{certificateId}}</td></tr></table></div><div style="text-align: center;"><a href="{{baseUrl}}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #a0303f 0%, #ff6b6b 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Download Certificate</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'courseName', example: 'Guitar Basics' },
      { name: 'certificateId', example: 'CERT-2024-001' },
      { name: 'baseUrl', example: 'https://aaroh.com' }
    ]
  },
  {
    name: 'passwordReset',
    subject: 'Reset Your Password - {{siteName}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Password Reset</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Reset your account password</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">We received a request to reset your password. Click the button below to create a new password.</p><div style="text-align: center; margin-bottom: 32px;"><a href="{{resetUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a></div><p style="color: #64748B; font-size: 14px; line-height: 1.6;">If you didn't request this, please ignore this email. This link will expire in 1 hour.</p></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'resetUrl', example: 'https://aaroh.com/reset-password?token=abc123' },
      { name: 'siteName', example: 'Aaroh Music Academy' }
    ]
  },
  {
    name: 'courseReminder',
    subject: 'Continue Your Learning - {{courseName}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Continue Learning</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your course is waiting for you</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">We noticed you haven't continued with <strong>{{courseName}}</strong> lately. Don't lose momentum - keep learning!</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Your Progress</h2><p style="color: #64748B; margin: 0;">{{progressPercentage}}% completed</p></div><div style="text-align: center;"><a href="{{baseUrl}}/courses/{{courseId}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Continue Learning</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'courseName', example: 'Guitar Basics' },
      { name: 'progressPercentage', example: '65' },
      { name: 'courseId', example: 'course-123' },
      { name: 'baseUrl', example: 'https://aaroh.com' }
    ]
  },
  {
    name: 'adminClassBookingNotification',
    subject: 'New Class Booking - {{classType}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">New Class Booking</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">A student has booked a class</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hello Admin,</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">A new class booking has been made:</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Booking Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Student:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{userName}} ({{userEmail}})</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Class Type:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{classType}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Phone:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{phone}}</td></tr></table></div><div style="text-align: center;"><a href="{{adminUrl}}" style="display: inline-block; background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">View in Admin</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'userEmail', example: 'john@example.com' },
      { name: 'classType', example: 'Guitar Lessons' },
      { name: 'phone', example: '+91 9876543210' },
      { name: 'adminUrl', example: 'https://aaroh.com/admin/users' }
    ]
  },
  {
    name: 'certificateGenerated',
    subject: 'Certificate Ready - {{courseName}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #a0303f 0%, #ff6b6b 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🎉 Certificate Ready!</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Congratulations on completing your course</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Congratulations! Your certificate for <strong>{{courseName}}</strong> is now ready for download.</p><div style="text-align: center;"><a href="{{certificateUrl}}" style="display: inline-block; background: linear-gradient(135deg, #a0303f 0%, #ff6b6b 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Download Certificate</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'courseName', example: 'Guitar Basics' },
      { name: 'certificateUrl', example: 'https://aaroh.com/certificates/123' }
    ]
  },
  {
    name: 'courseCompletionReminder',
    subject: 'Continue Your Learning - {{courseName}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Continue Learning</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your course is waiting for you</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">We noticed you haven't continued with <strong>{{courseName}}</strong> for {{daysInactive}} days. Don't lose momentum - keep learning!</p><div style="text-align: center;"><a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Continue Learning</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'courseName', example: 'Guitar Basics' },
      { name: 'daysInactive', example: '7' },
      { name: 'dashboardUrl', example: 'https://aaroh.com/dashboard' }
    ]
  },
  {
    name: 'customSongPaymentSuccess',
    subject: 'Payment Confirmed - Custom Song Order',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Payment Confirmed!</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your custom song is in production</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Your payment has been confirmed! Your custom song for <strong>{{recipientName}}</strong> is now in production.</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Order ID:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">#{{orderId}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Recipient:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{recipientName}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Occasion:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{occasion}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Amount:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">₹{{amount}}</td></tr></table></div><div style="text-align: center;"><a href="{{musicLibraryUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Music Library</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'orderId', example: 'CS123' },
      { name: 'recipientName', example: 'Sarah' },
      { name: 'occasion', example: 'Birthday' },
      { name: 'amount', example: '2999' },
      { name: 'musicLibraryUrl', example: 'https://aaroh.com/shop/music-library' }
    ]
  },
  {
    name: 'adminCustomSongPayment',
    subject: 'Payment Received - Custom Song Order',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Payment Received!</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Custom Song Order Payment</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hello Admin,</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Payment received for custom song order:</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Customer:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{userName}} ({{userEmail}})</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Order ID:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">#{{orderId}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Recipient:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{recipientName}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Occasion:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{occasion}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Amount:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">₹{{amount}}</td></tr></table></div><div style="text-align: center;"><a href="{{adminUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Process in Admin</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'userEmail', example: 'john@example.com' },
      { name: 'orderId', example: 'CS123' },
      { name: 'recipientName', example: 'Sarah' },
      { name: 'occasion', example: 'Birthday' },
      { name: 'amount', example: '2999' },
      { name: 'adminUrl', example: 'https://aaroh.com/admin/shop' }
    ]
  },
  {
    name: 'shopOrderConfirmation',
    subject: 'Order Confirmed - {{orderId}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Order Confirmed!</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your order is being processed</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Your order has been confirmed and is being processed.</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Order ID:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">#{{orderId}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Payment ID:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{paymentId}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Amount:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">₹{{amount}}</td></tr></table></div><div style="text-align: center;"><a href="{{orderUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Track Order</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'orderId', example: 'ORD123' },
      { name: 'paymentId', example: 'pay_123' },
      { name: 'amount', example: '1999' },
      { name: 'orderUrl', example: 'https://aaroh.com/shop/orders/123' }
    ]
  },
  {
    name: 'adminShopOrderNotification',
    subject: 'New Shop Order - {{orderId}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">New Shop Order!</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Process immediately</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hello Admin,</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">A new shop order has been placed:</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Customer:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{customerName}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Order ID:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">#{{orderId}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Payment ID:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{paymentId}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Amount:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">₹{{amount}}</td></tr></table></div><div style="text-align: center;"><a href="{{adminUrl}}" style="display: inline-block; background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Process in Admin</a></div></div></div>`,
    variables: [
      { name: 'customerName', example: 'John Doe' },
      { name: 'orderId', example: 'ORD123' },
      { name: 'paymentId', example: 'pay_123' },
      { name: 'amount', example: '1999' },
      { name: 'adminUrl', example: 'https://aaroh.com/admin/shop' }
    ]
  },
  {
    name: 'customSongPaymentFailed',
    subject: 'Payment Failed - Custom Song Order',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Payment Failed</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">We couldn't process your payment</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi {{userName}},</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Unfortunately, your payment for the custom song order could not be processed.</p><div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #991B1B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Order Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #7F1D1D; font-weight: 500;">Order ID:</td><td style="padding: 6px 0; color: #991B1B; font-weight: 600;">#{{orderId}}</td></tr><tr><td style="padding: 6px 0; color: #7F1D1D; font-weight: 500;">Recipient:</td><td style="padding: 6px 0; color: #991B1B; font-weight: 600;">{{recipientName}}</td></tr><tr><td style="padding: 6px 0; color: #7F1D1D; font-weight: 500;">Occasion:</td><td style="padding: 6px 0; color: #991B1B; font-weight: 600;">{{occasion}}</td></tr><tr><td style="padding: 6px 0; color: #7F1D1D; font-weight: 500;">Amount:</td><td style="padding: 6px 0; color: #991B1B; font-weight: 600;">₹{{amount}}</td></tr><tr><td style="padding: 6px 0; color: #7F1D1D; font-weight: 500;">Reason:</td><td style="padding: 6px 0; color: #991B1B;">{{errorReason}}</td></tr></table></div><div style="text-align: center;"><a href="{{retryUrl}}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Try Payment Again</a></div></div></div>`,
    variables: [
      { name: 'userName', example: 'John Doe' },
      { name: 'orderId', example: 'CS123' },
      { name: 'recipientName', example: 'Sarah' },
      { name: 'occasion', example: 'Birthday' },
      { name: 'amount', example: '2999' },
      { name: 'errorReason', example: 'Card declined' },
      { name: 'retryUrl', example: 'https://aaroh.com/shop/custom-song' }
    ]
  },
  {
    name: 'otpVerification',
    subject: 'Email Verification - {{siteName}}',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #a0303f 0%, #ff6b6b 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Verify Your Email</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Enter the code below to continue</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Your verification code is:</p><div style="background: #F8FAFC; border: 2px solid #a0303f; border-radius: 12px; padding: 30px; text-align: center; margin: 32px 0;"><h2 style="color: #a0303f; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">{{otp}}</h2></div><p style="color: #64748B; font-size: 14px; line-height: 1.6; text-align: center;">This code will expire in 10 minutes.<br>If you didn't request this code, please ignore this email.</p><div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #E2E8F0; text-align: center;"><p style="color: #64748B; margin: 0; font-size: 14px; font-weight: 600;">{{siteName}} Team</p></div></div></div>`,
    variables: [
      { name: 'otp', example: '123456' },
      { name: 'siteName', example: 'Aaroh Music Academy' }
    ]
  },
  {
    name: 'customSongReady',
    subject: 'Your Custom Song is Ready! 🎵',
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;"><div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🎵 Your Song is Ready!</h1><p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your custom song has been created</p></div><div style="padding: 40px 30px;"><p style="color: #1E293B; font-size: 16px; margin: 0 0 24px 0;">Hi there,</p><p style="color: #64748B; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Great news! Your custom song for <strong>{{recipientName}}</strong> is now ready for download.</p><div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;"><h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Song Details</h2><table style="width: 100%; border-collapse: collapse;"><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Recipient:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{recipientName}}</td></tr><tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Occasion:</td><td style="padding: 6px 0; color: #1E293B; font-weight: 600;">{{occasion}}</td></tr></table></div><div style="text-align: center;"><a href="{{downloadUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Download Your Song</a></div></div></div>`,
    variables: [
      { name: 'recipientName', example: 'Sarah' },
      { name: 'occasion', example: 'Birthday' },
      { name: 'downloadUrl', example: 'https://aaroh.com/download/song-123' }
    ]
  }
]

export async function POST(request) {
  try {
    const { forceUpdate } = await request.json().catch(() => ({}))
    
    const createdTemplates = []
    const updatedTemplates = []
    const skippedTemplates = []
    
    // Create or update templates
    for (const template of defaultTemplates) {
      try {
        const existing = await prisma.emailTemplate.findUnique({
          where: { name: template.name }
        })
        
        if (existing && forceUpdate) {
          const updated = await prisma.emailTemplate.update({
            where: { name: template.name },
            data: template
          })
          updatedTemplates.push(updated)
        } else if (existing) {
          skippedTemplates.push(template.name)
        } else {
          const created = await prisma.emailTemplate.create({ data: template })
          createdTemplates.push(created)
        }
      } catch (err) {
        console.error(`Failed to process template ${template.name}:`, err)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Created ${createdTemplates.length} new, updated ${updatedTemplates.length}, skipped ${skippedTemplates.length} templates`,
      created: createdTemplates.length,
      updated: updatedTemplates.length,
      skipped: skippedTemplates.length
    })
  } catch (error) {
    console.error('Error seeding templates:', error)
    return NextResponse.json({ 
      error: 'Failed to seed templates', 
      details: error.message 
    }, { status: 500 })
  }
}