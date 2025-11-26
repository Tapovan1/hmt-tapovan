"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, User, ArrowRight } from "lucide-react"

interface ProfileReminderDialogProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
}

export default function ProfileReminderDialog({
  isOpen,
  onClose,
  userName,
}: ProfileReminderDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-100 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Profile Submission Reminder
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-600 pt-2">
            {userName ? (
              <>
                Hi <span className="font-medium">{userName}</span>, you haven't
                submitted your employee profile yet.
              </>
            ) : (
              "You haven't submitted your employee profile yet."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  Complete Your Profile
                </p>
                <p className="text-sm text-blue-700">
                  Please submit your employee profile to ensure all your
                  information is up to date. This helps us maintain accurate
                  records and provide better support.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium">Your profile should include:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500 ml-2">
              <li>Personal information</li>
              <li>Contact details</li>
              <li>Emergency contacts</li>
              <li>Professional details</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Remind Me Later
          </Button>
          <Button asChild className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            <Link href="/profile" onClick={onClose}>
              Go to Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

