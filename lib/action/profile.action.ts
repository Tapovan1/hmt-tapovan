"use server"


import { revalidatePath } from "next/cache"
import prisma from "../prisma"

interface ProfileData {
  userId: string
  mobileNumber?: string
  address?: string
  nativePlace?: string
  dateOfBirth?: Date
  degree?: string
  bloodGroup?: string
  aadharNumber?: string
  panNumber?: string
  bankAccountNumber?: string
  seriousIllness?: string
  fatherName?: string
  fatherMobile?: string
  spouseName?: string
  spouseMobile?: string
  relativeName?: string
  relativeMobile?: string
  relativeAddress?: string
  workExperience?: string
  legalProceedings?: string
}

export async function getUserProfile(userId?: string): Promise<ProfileData | null> {
  if (!userId) return null

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!profile) return null

    return {
      userId: profile.userId,
      mobileNumber: profile.mobileNumber || undefined,
      address: profile.address || undefined,
      nativePlace: profile.nativePlace || undefined,
      dateOfBirth: profile.dateOfBirth || undefined,
      degree: profile.degree || undefined,
      bloodGroup: profile.bloodGroup || undefined,
      aadharNumber: profile.aadharNumber || undefined,
      panNumber: profile.panNumber || undefined,
      bankAccountNumber: profile.bankAccountNumber || undefined,
      seriousIllness: profile.seriousIllness || undefined,
      fatherName: profile.fatherName || undefined,
      fatherMobile: profile.fatherMobile || undefined,
      spouseName: profile.spouseName || undefined,
      spouseMobile: profile.spouseMobile || undefined,
      relativeName: profile.relativeName || undefined,
      relativeMobile: profile.relativeMobile || undefined,
      relativeAddress: profile.relativeAddress || undefined,
      workExperience: profile.workExperience || undefined,
      legalProceedings: profile.legalProceedings || undefined
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export async function saveUserProfile(data: ProfileData): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: data.userId },
    })

    if (existingProfile) {
      // Update existing profile
      await prisma.userProfile.update({
        where: { userId: data.userId },
        data: {
          mobileNumber: data.mobileNumber,
          address: data.address,
          nativePlace: data.nativePlace,
          dateOfBirth: data.dateOfBirth,
          degree: data.degree,
          bloodGroup: data.bloodGroup,
          aadharNumber: data.aadharNumber,
          panNumber: data.panNumber,
          bankAccountNumber: data.bankAccountNumber,
          seriousIllness: data.seriousIllness,
          fatherName: data.fatherName,
          fatherMobile: data.fatherMobile,
          spouseName: data.spouseName,
          spouseMobile: data.spouseMobile,
          relativeName: data.relativeName,
          relativeMobile: data.relativeMobile,
          relativeAddress: data.relativeAddress,
          workExperience: data.workExperience,
          legalProceedings: data.legalProceedings,
        },
      })
    } else {
      // Create new profile
      await prisma.userProfile.create({
        data: {
          userId: data.userId,
          mobileNumber: data.mobileNumber,
          address: data.address,
          nativePlace: data.nativePlace,
          dateOfBirth: data.dateOfBirth,
          degree: data.degree,
          bloodGroup: data.bloodGroup,
          aadharNumber: data.aadharNumber,
          panNumber: data.panNumber,
          bankAccountNumber: data.bankAccountNumber,
          seriousIllness: data.seriousIllness,
          fatherName: data.fatherName,
          fatherMobile: data.fatherMobile,
          spouseName: data.spouseName,
          spouseMobile: data.spouseMobile,
          relativeName: data.relativeName,
          relativeMobile: data.relativeMobile,
          relativeAddress: data.relativeAddress,
          workExperience: data.workExperience,
          legalProceedings: data.legalProceedings,
        },
      })
    }

    // Revalidate the profile page
    revalidatePath("/profile")

    return { success: true }
  } catch (error) {
    console.error("Error saving user profile:", error)
    return { success: false, error: "Failed to save profile. Please try again." }
  }
}
