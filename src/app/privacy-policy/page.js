"use client"

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Shield } from 'lucide-react'

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy - Aaroh Music Academy'
    
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = 'Privacy Policy for Aaroh Music Academy. Learn how we collect, use, and protect your personal information.'
  }, [])

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-[#a0303f] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[#a0303f] mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 space-y-8">
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-green-900 font-medium">
                At Aaroh Music Academy, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">1. Information We Collect</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">1.1 Personal Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    When you register or use our services, we may collect:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Name and contact information (email, phone number)</li>
                    <li>Account credentials (username, password)</li>
                    <li>Payment information (processed securely through Razorpay)</li>
                    <li>Profile information (age, musical interests, skill level)</li>
                    <li>Communication preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">1.2 Usage Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We automatically collect information about your interaction with our platform:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Course enrollment and progress data</li>
                    <li>Video watch history and completion status</li>
                    <li>Quiz and assessment results</li>
                    <li>Class attendance and participation</li>
                    <li>Device information (browser type, operating system)</li>
                    <li>IP address and location data</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">1.3 Communication Data</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Messages sent through our platform</li>
                    <li>Customer support inquiries</li>
                    <li>Feedback and reviews</li>
                    <li>Email correspondence</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">2. How We Use Your Information</h2>
              
              <div className="space-y-3 text-gray-700">
                <p><strong>2.1 Service Delivery:</strong> To provide, maintain, and improve our educational services, including course access, live classes, and certificates.</p>
                
                <p><strong>2.2 Personalization:</strong> To customize your learning experience, recommend relevant courses, and track your progress.</p>
                
                <p><strong>2.3 Communication:</strong> To send you course updates, promotional offers, newsletters, and important service announcements.</p>
                
                <p><strong>2.4 Payment Processing:</strong> To process transactions, prevent fraud, and maintain billing records.</p>
                
                <p><strong>2.5 Analytics:</strong> To analyze usage patterns, improve our platform, and develop new features.</p>
                
                <p><strong>2.6 Legal Compliance:</strong> To comply with legal obligations, enforce our terms, and protect our rights.</p>
                
                <p><strong>2.7 Customer Support:</strong> To respond to your inquiries, resolve issues, and provide technical assistance.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">3. Information Sharing and Disclosure</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3.1 We DO NOT Sell Your Data</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3.2 Service Providers</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We may share information with trusted third-party service providers who assist us in:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Payment processing (Razorpay)</li>
                    <li>Email delivery services</li>
                    <li>Cloud hosting and storage</li>
                    <li>Analytics and performance monitoring</li>
                    <li>Customer support tools</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    These providers are contractually obligated to protect your data and use it only for specified purposes.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3.3 Legal Requirements</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We may disclose your information if required by law or in response to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Legal processes (court orders, subpoenas)</li>
                    <li>Government requests</li>
                    <li>Protection of our rights and safety</li>
                    <li>Prevention of fraud or illegal activities</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3.4 Business Transfers</h3>
                  <p className="text-gray-700 leading-relaxed">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity, subject to this Privacy Policy.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">4. Data Security</h2>
              
              <div className="space-y-3 text-gray-700">
                <p><strong>4.1 Security Measures:</strong> We implement industry-standard security measures including encryption, secure servers, and access controls to protect your data.</p>
                
                <p><strong>4.2 Payment Security:</strong> All payment information is processed through PCI-DSS compliant payment gateways. We do not store complete credit card details.</p>
                
                <p><strong>4.3 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials. Use strong passwords and enable two-factor authentication when available.</p>
                
                <p><strong>4.4 Data Breach:</strong> In the unlikely event of a data breach, we will notify affected users as required by law and take immediate steps to mitigate the impact.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">5. Your Rights and Choices</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">5.1 Access and Update</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You can access and update your personal information through your account settings or by contacting us.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">5.2 Data Deletion</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You can request deletion of your account and personal data by contacting support@aaroh.com. Some information may be retained for legal or legitimate business purposes.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">5.3 Marketing Communications</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You can opt-out of promotional emails by clicking the "unsubscribe" link in any marketing email or updating your communication preferences.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">5.4 Cookie Management</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You can control cookies through your browser settings. Note that disabling cookies may affect platform functionality.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">5.5 Data Portability</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You can request a copy of your personal data in a structured, machine-readable format.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">6. Cookies and Tracking Technologies</h2>
              
              <div className="space-y-3 text-gray-700">
                <p><strong>6.1 Essential Cookies:</strong> Required for platform functionality, authentication, and security.</p>
                
                <p><strong>6.2 Analytics Cookies:</strong> Help us understand how users interact with our platform to improve services.</p>
                
                <p><strong>6.3 Preference Cookies:</strong> Remember your settings and preferences for a personalized experience.</p>
                
                <p><strong>6.4 Third-Party Cookies:</strong> May be set by external services like YouTube (for video playback) and payment gateways.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">7. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately, and we will delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">8. Data Retention</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>8.1 Active Accounts:</strong> We retain your data as long as your account is active or as needed to provide services.</p>
                
                <p><strong>8.2 Deleted Accounts:</strong> After account deletion, we may retain certain information for legal, tax, or audit purposes for up to 7 years.</p>
                
                <p><strong>8.3 Course Data:</strong> Your course progress and certificates are retained indefinitely to maintain your learning history.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than India. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">10. Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform may contain links to third-party websites (e.g., YouTube, social media). We are not responsible for the privacy practices of these external sites. Please review their privacy policies before providing any information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">11. Changes to Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or prominent notice on our website. Your continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">12. Compliance with Indian Laws</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                This Privacy Policy complies with:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Information Technology Act, 2000</li>
                <li>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</li>
                <li>Other applicable Indian data protection laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">13. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
              </p>
              <div className="bg-[#a0303f]/5 p-6 rounded-lg space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> privacy@aaroh.com</p>
                <p className="text-gray-700"><strong>Support Email:</strong> support@aaroh.com</p>
                <p className="text-gray-700"><strong>Website:</strong> www.aaroh.com</p>
                <p className="text-gray-700"><strong>Response Time:</strong> Within 7 business days</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">14. Grievance Officer</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In accordance with Information Technology Act 2000 and rules made thereunder, the contact details of the Grievance Officer are provided below:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                <p className="text-gray-700"><strong>Name:</strong> Kashmira Chakraborty</p>
                <p className="text-gray-700"><strong>Email:</strong> grievance@aaroh.com</p>
                <p className="text-gray-700"><strong>Time:</strong> Monday to Saturday (10:00 AM to 6:00 PM IST)</p>
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-blue-900 text-sm">
            <strong>Your Privacy Matters:</strong> We are committed to transparency and protecting your personal information. If you have any concerns about how your data is handled, please don't hesitate to contact us.
          </p>
        </div>
      </div>
    </div>
  )
}
