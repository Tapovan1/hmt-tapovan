"use client"

import { useEffect, useState } from "react"
import ProfileReminderDialog from "./ProfileReminderDialog"

interface ProfileReminderWrapperProps {
  hasProfile: boolean
  userName?: string
}

export default function ProfileReminderWrapper({
  hasProfile,
  userName,
}: ProfileReminderWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Only show dialog if profile doesn't exist and we haven't shown it yet
    if (!hasProfile && !hasShown) {
      // Small delay to ensure smooth page load
      const timer = setTimeout(() => {
        setIsOpen(true)
        setHasShown(true)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [hasProfile, hasShown])

  const handleClose = () => {
    setIsOpen(false)
  }

  // Don't render anything if profile exists
  if (hasProfile) return null

  return (
    <ProfileReminderDialog
      isOpen={isOpen}
      onClose={handleClose}
      userName={userName}
    />
  )
}

