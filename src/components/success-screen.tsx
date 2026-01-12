"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Share2, Copy } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";

interface SuccessScreenProps {
  onReset?: () => void;
  referralCode?: string | null;
}

export function SuccessScreen({ onReset, referralCode }: SuccessScreenProps) {
  const { user } = useUserStore();
  // console.log("SuccessScreen received referralCode:", referralCode);

  const generateReferralUrl = () => {
    const code = referralCode || user?.custom_code;
    if (!code) return null;
    const baseUrl = window.location.origin;
    return `${baseUrl}/review-form?ref=${encodeURIComponent(code)}`;
  };

  const handleCopyReferralUrl = async () => {
    const referralUrl = generateReferralUrl();
    if (referralUrl) {
      try {
        await navigator.clipboard.writeText(referralUrl);
        toast.success("Referral URL copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy referral URL:", err);
        toast.error("Failed to copy referral URL");
      }
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
          {(referralCode || user?.custom_code) && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-teal-800 mb-2">
                Your Referral Link
              </h3>

              {/* Referral URL Section */}
              <div className="mt-4 pt-4 border-t border-teal-200">
                <div className="bg-white border border-teal-300 rounded-md p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                    {generateReferralUrl()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyReferralUrl}
                    className="text-teal-700 border-teal-300 hover:bg-teal-50 shrink-0"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy URL
                  </Button>
                </div>
              </div>

              <p className="text-sm text-teal-700 mt-3">
                Share this link with friends! When they click it, they'll
                automatically get your referral code applied.
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
