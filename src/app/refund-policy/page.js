"use client"

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'

export default function RefundPolicy() {
  useEffect(() => {
    document.title = 'Cancellation & Refund Policy - Aaroh Music Academy'
    
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = 'Cancellation and Refund Policy for Aaroh Music Academy. Learn about our refund process for courses and live classes.'
  }, [])

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <RefreshCw className="w-16 h-16 text-[#a0303f] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[#a0303f] mb-4">Cancellation & Refund Policy</h1>
          <p className="text-gray-600">Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm mb-6">
          <CardContent className="p-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-blue-900 font-medium">
                At Aaroh Music Academy, we strive to provide the best learning experience. This policy outlines our cancellation and refund procedures for different services.
              </p>
            </div>

            <section className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#a0303f] mb-4">1. Pre-Recorded Video Courses</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">1.1 Refund Eligibility</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      We offer a <strong>7-day money-back guarantee</strong> for all pre-recorded video courses, subject to the following conditions:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Refund request must be made within 7 days of purchase</li>
                      <li>Less than 30% of course content has been accessed</li>
                      <li>No course materials have been downloaded</li>
                      <li>No certificate has been generated</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">1.2 Non-Refundable Situations</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">Refunds will NOT be provided if:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>More than 7 days have passed since purchase</li>
                      <li>More than 30% of course content has been accessed</li>
                      <li>Course completion certificate has been issued</li>
                      <li>The course was purchased during a promotional sale (unless legally required)</li>
                      <li>Technical issues on the user's end (device, internet connectivity)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">1.3 How to Request a Refund</h3>
                    <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                      <li>Email us at <strong>support@aaroh.com</strong> with your order details</li>
                      <li>Include your registered email address and course name</li>
                      <li>Provide a brief reason for the refund request</li>
                      <li>Our team will review and respond within 2-3 business days</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#a0303f] mb-4">2. Live Classes (One-on-One & Group)</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Cancellation by Student</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <p className="text-gray-700">
                        <strong>More than 24 hours before class:</strong> Full refund or free rescheduling
                      </p>
                      <p className="text-gray-700">
                        <strong>Less than 24 hours before class:</strong> 50% refund or one-time free rescheduling
                      </p>
                      <p className="text-gray-700">
                        <strong>No-show or cancellation after class start:</strong> No refund
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Cancellation by Instructor</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      If the instructor cancels a scheduled class:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Full refund will be processed immediately</li>
                      <li>OR free rescheduling to a mutually convenient time</li>
                      <li>Students will be notified at least 2 hours before class time</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">2.3 Technical Issues During Live Classes</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      If technical issues from our end disrupt the class:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Class will be rescheduled at no additional cost</li>
                      <li>OR proportional refund based on class time lost</li>
                      <li>Technical issues on student's end are not eligible for refunds</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#a0303f] mb-4">3. Offline Classes</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>3.1 Cancellation:</strong> Must be made at least 48 hours before the scheduled class for a full refund.</p>
                  <p><strong>3.2 Rescheduling:</strong> Free rescheduling available once per booking with 24 hours notice.</p>
                  <p><strong>3.3 Weather/Emergency:</strong> Full refund or rescheduling if class is cancelled due to unforeseen circumstances.</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#a0303f] mb-4">4. Refund Processing</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Processing Time</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Refund requests are reviewed within 2-3 business days</li>
                      <li>Approved refunds are processed within 5-7 business days</li>
                      <li>Bank/card credits may take an additional 5-10 business days</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Refund Method</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Refunds will be credited to the original payment method used during purchase. We do not provide refunds via cash, cheque, or alternative payment methods.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.3 Partial Refunds</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Partial refunds may be issued in the following cases:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Course content significantly differs from description</li>
                      <li>Technical issues prevent course access (after troubleshooting)</li>
                      <li>Instructor-related issues affecting class quality</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#a0303f] mb-4">5. Payment Gateway Charges</h2>
                <p className="text-gray-700 leading-relaxed">
                  Payment gateway charges (typically 2-3% of transaction amount) are non-refundable. Refunds will be processed for the net amount received after deducting gateway fees.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#a0303f] mb-4">6. Promotional Offers & Discounts</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>6.1 Sale Purchases:</strong> Courses purchased during promotional sales are generally non-refundable unless there are technical issues or content misrepresentation.</p>
                  <p><strong>6.2 Coupon Codes:</strong> If a refund is issued for a purchase made with a coupon code, the discount amount will be deducted from the refund.</p>
                  <p><strong>6.3 Bundle Offers:</strong> Refunds for bundled courses will be calculated based on individual course prices, not the bundle price.</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#a0303f] mb-4">7. Dispute Resolution</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>7.1 Contact First:</strong> Before initiating a chargeback, please contact us to resolve the issue.</p>
                  <p><strong>7.2 Chargebacks:</strong> Initiating a chargeback without contacting us may result in account suspension and legal action.</p>
                  <p><strong>7.3 Resolution Time:</strong> We aim to resolve all disputes within 7 business days.</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#a0303f] mb-4">8. Exceptions</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We reserve the right to make exceptions to this policy on a case-by-case basis for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Medical emergencies (with documentation)</li>
                  <li>Natural disasters or force majeure events</li>
                  <li>Significant technical issues on our platform</li>
                  <li>Content quality issues verified by our team</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#a0303f] mb-4">9. Contact for Refunds</h2>
                <div className="bg-[#a0303f]/5 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    For any refund or cancellation requests, please contact us:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-700"><strong>Email:</strong> support@aaroh.com</p>
                    <p className="text-gray-700"><strong>Subject Line:</strong> "Refund Request - [Your Order ID]"</p>
                    <p className="text-gray-700"><strong>Response Time:</strong> Within 2-3 business days</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#a0303f] mb-4">10. Policy Updates</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify this Cancellation & Refund Policy at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-yellow-900 text-sm">
            <strong>Note:</strong> This policy is in accordance with Indian consumer protection laws and regulations. For any legal disputes, the jurisdiction will be Kolkata, West Bengal, India.
          </p>
        </div>
      </div>
    </div>
  )
}
