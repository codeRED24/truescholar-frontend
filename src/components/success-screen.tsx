"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Share2 } from "lucide-react"

interface SuccessScreenProps {
  onReset?: () => void
}

export function SuccessScreen({ onReset }: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-12 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Review Submitted Successfully!</h1>
            <p className="text-lg text-gray-600 mb-2">Thank you for sharing your college experience</p>
            <p className="text-gray-500">
              Your review will help future students make informed decisions about their education.
            </p>
          </div>

          <div className="bg-green-50 border border-neutral-200 border-green-200 rounded-lg p-6 mb-8 dark:border-neutral-800">
            <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-green-700 space-y-1 text-left">
              <li>• Your review will be verified within 24-48 hours</li>
              <li>• You'll receive an email confirmation once approved</li>
              <li>• Cash rewards will be processed to your provided UPI ID</li>
              <li>• Your review will be published on our platform</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent" onClick={() => window.print()}>
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "College Review Submitted",
                    text: "I just submitted my college review to help future students!",
                  })
                }
              }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            {onReset && (
              <Button onClick={onReset} className="bg-teal-500 hover:bg-teal-600 text-white">
                Submit Another Review
              </Button>
            )}
          </div>

          <div className="mt-8 pt-6 border-t text-sm text-gray-500">
            <p>
              Need help? Contact us at{""}
              <a href="mailto:support@collegereview.com" className="text-teal-500 hover:underline">
                support@collegereview.com
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
