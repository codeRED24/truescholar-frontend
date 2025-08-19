"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Share2, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SuccessScreenProps {
  onReset?: () => void;
  referralCode?: string | null;
}

export function SuccessScreen({ onReset, referralCode }: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  // console.log("SuccessScreen received referralCode:", referralCode);

  const handleCopyReferralCode = async () => {
    if (referralCode) {
      try {
        await navigator.clipboard.writeText(referralCode);
        setCopied(true);
        toast.success("Referral code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy referral code:", err);
        toast.error("Failed to copy referral code");
      }
    }
  };

  const handleShare = () => {
    const shareText = referralCode
      ? `I just submitted my college review to help future students! Use my referral code: ${referralCode} to get started with your review!`
      : "I just submitted my college review to help future students!";

    if (navigator.share) {
      navigator.share({
        title: "College Review Submitted - TrueScholar",
        text: shareText,
        url: window.location.origin,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          toast.success("Share text copied to clipboard!");
        })
        .catch(() => {
          toast.error("Failed to copy share text");
        });
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-12 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Review Submitted Successfully!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Thank you for sharing your college experience
            </p>
            <p className="text-gray-500">
              Your review will help future students make informed decisions
              about their education.
            </p>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8 dark:border-neutral-800">
            <h3 className="font-semibold text-teal-800 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-teal-700 space-y-1 text-left">
              <li>• Your review will be verified within 24-48 hours</li>
              <li>• You'll receive an email confirmation once approved</li>
              <li>• Cash rewards will be processed to your provided UPI ID</li>
              <li>• Your review will be published on our platform</li>
            </ul>
          </div>

          {/* Referral Code Section */}
          {referralCode && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-teal-800 mb-2">
                Your Referral Code
              </h3>
              <div className="bg-white border border-teal-300 rounded-md p-3 mb-3 flex items-center justify-between">
                <code className="text-lg font-mono font-bold text-teal-900">
                  {referralCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyReferralCode}
                  className="ml-3 text-teal-700 border-teal-300 hover:bg-teal-50"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="text-sm text-teal-700">
                Share this code with friends to help them get started with their
                college reviews!
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            {onReset && (
              <Button
                onClick={onReset}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                Go to Home
              </Button>
            )}
          </div>

          <div className="mt-8 pt-6 border-t text-sm text-gray-500">
            <p>
              Need help? Contact us at{" "}
              <a
                href="mailto:support@truescholar.in"
                className="text-teal-500 hover:underline"
              >
                support@truescholar.in
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
