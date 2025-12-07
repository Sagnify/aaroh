"use client"

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function TermsOfService() {
  useEffect(() => {
    document.title = 'Terms of Service - Aaroh Music Academy'
    
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = 'Terms of Service for Aaroh Music Academy. Read our terms and conditions for using our online music courses and services.'
  }, [])

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <FileText className="w-16 h-16 text-[#a0303f] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[#a0303f] mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Aaroh Music Academy's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">2. Services Description</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Aaroh Music Academy provides online music education services including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Pre-recorded video courses</li>
                <li>Live one-on-one music classes</li>
                <li>Group music sessions</li>
                <li>Offline classes (where available)</li>
                <li>Course materials and resources</li>
                <li>Certificates of completion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">3. User Accounts</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>3.1 Registration:</strong> You must create an account to access our courses. You agree to provide accurate, current, and complete information during registration.</p>
                <p><strong>3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
                <p><strong>3.3 Account Sharing:</strong> Accounts are for individual use only. Sharing login credentials is strictly prohibited and may result in account termination.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">4. Course Access and Usage</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>4.1 License:</strong> Upon purchase, you receive a non-exclusive, non-transferable license to access course content for personal, non-commercial use.</p>
                <p><strong>4.2 Lifetime Access:</strong> Purchased courses include lifetime access to course materials, subject to these terms and our continued operation.</p>
                <p><strong>4.3 Content Updates:</strong> We may update course content at our discretion. Updates are provided at no additional cost.</p>
                <p><strong>4.4 Restrictions:</strong> You may not download, reproduce, distribute, modify, or create derivative works from our content without written permission.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">5. Payment Terms</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>5.1 Pricing:</strong> All prices are listed in Indian Rupees (INR) and are subject to change without notice.</p>
                <p><strong>5.2 Payment Methods:</strong> We accept payments through Razorpay, including credit/debit cards, UPI, net banking, and wallets.</p>
                <p><strong>5.3 Payment Processing:</strong> All payments are processed securely through third-party payment gateways.</p>
                <p><strong>5.4 Taxes:</strong> Prices include applicable taxes as per Indian law.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">6. Live Classes</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>6.1 Booking:</strong> Live class bookings are subject to instructor availability and must be scheduled in advance.</p>
                <p><strong>6.2 Attendance:</strong> Students are expected to attend scheduled classes on time. Late arrivals may result in reduced class time.</p>
                <p><strong>6.3 Rescheduling:</strong> Rescheduling requests must be made at least 24 hours before the scheduled class time.</p>
                <p><strong>6.4 Conduct:</strong> Students must maintain respectful behavior during live sessions.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">7. Intellectual Property</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>7.1 Ownership:</strong> All content, including videos, text, graphics, logos, and course materials, is owned by Aaroh Music Academy or its licensors.</p>
                <p><strong>7.2 Copyright:</strong> All content is protected by Indian and international copyright laws.</p>
                <p><strong>7.3 Trademarks:</strong> Aaroh Music Academy name and logo are trademarks and may not be used without permission.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">8. User Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Upload malicious code or viruses</li>
                <li>Harass, abuse, or harm other users or instructors</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use our services for commercial purposes without permission</li>
                <li>Record, download, or redistribute course content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">9. Certificates</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>9.1 Eligibility:</strong> Certificates are issued upon successful completion of all course requirements.</p>
                <p><strong>9.2 Verification:</strong> Each certificate includes a unique ID for verification purposes.</p>
                <p><strong>9.3 Usage:</strong> Certificates are for personal use and may be shared on professional platforms.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">10. Disclaimers</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>10.1 No Guarantees:</strong> While we strive for excellence, we do not guarantee specific learning outcomes or career advancement.</p>
                <p><strong>10.2 Technical Issues:</strong> We are not liable for technical issues, internet connectivity problems, or device compatibility issues.</p>
                <p><strong>10.3 Third-Party Links:</strong> Our website may contain links to third-party websites. We are not responsible for their content or practices.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, Aaroh Music Academy shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">12. Termination</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>12.1 By You:</strong> You may terminate your account at any time by contacting us.</p>
                <p><strong>12.2 By Us:</strong> We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</p>
                <p><strong>12.3 Effect:</strong> Upon termination, your right to access courses will cease, except for purchased courses subject to our refund policy.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of our services after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">14. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Kolkata, West Bengal, India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">15. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> support@aaroh.com</p>
                <p className="text-gray-700"><strong>Website:</strong> www.aaroh.com</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
