import { Suspense } from "react"
import { getUser } from "@/lib/action/getUser"
import { getUserProfile } from "@/lib/action/profile.action"
import ProfileForm from "./profile-form"
import { User } from "lucide-react"

export default async function ProfilePage() {
  const user = await getUser()
  const profile = await getUserProfile(user?.id)

  return (
    <div className="max-w-7xl mx-auto p-4">
       <div className="text-center space-y-2 mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Employee Profile Form</h1>
        
      </div>


      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="bg-[#4285f4] text-white py-3 px-6 rounded-t-lg font-medium">Personal Information</div>
        <div className="p-6">
          <Suspense
            fallback={
              <div className="w-full h-64 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 border-4 border-t-[#4285f4] border-[#e6eef8] rounded-full animate-spin"></div>
                  <p className="text-gray-500">Loading profile data...</p>
                </div>
              </div>
            }
          >
            <ProfileForm user={user} initialData={profile} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
