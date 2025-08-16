"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Phone, CheckCircle, Clock } from "lucide-react"

interface OtpVerificationProps {
  type: "email" | "phone"
  value: string
  onVerify: (otp: string) => void
  onResend: () => void
  isVerified: boolean
  isLoading?: boolean
  error?: string
}

export function OtpVerification({
  type,
  value,
  onVerify,
  onResend,
  isVerified,
  isLoading = false,
  error,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState("")
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOtp = () => {
    onResend()
    setCountdown(30)
  }

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      onVerify(otp)
    }
  }

  const Icon = type === "email" ? Mail : Phone
  const label = type === "email" ? "Email" : "Phone"

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-neutral-200 border-green-200 rounded-lg dark:border-neutral-800">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-sm text-green-700 font-medium">{label} verified successfully</span>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4 border border-neutral-200 border-gray-200 rounded-lg bg-gray-50 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-teal-500" />
        <span className="text-sm font-medium text-gray-700">
          Verify {label}: {value}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSendOtp}
          disabled={countdown > 0 || isLoading}
          className="whitespace-nowrap"
        >
          {countdown > 0 ? (
            <>
              <Clock className="w-4 h-4 mr-1" />
              Resend in {countdown}s
            </>
          ) : (
            `Send OTP`
          )}
        </Button>

        <div className="flex-1">
          <Input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6)
              setOtp(value)
            }}
            maxLength={6}
            className="text-center tracking-widest"
          />
        </div>

        <Button
          type="button"
          onClick={handleVerifyOtp}
          disabled={otp.length !== 6 || isLoading}
          className="bg-teal-600 hover:bg-teal-700"
        >
          Verify
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
