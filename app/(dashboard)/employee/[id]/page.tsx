import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getEmployeeById } from "@/lib/action/admin.action"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Droplet,
  CreditCard,
  Heart,
  Users,
  Briefcase,
  AlertTriangle,
} from "lucide-react"

export default async function EmployeeProfilePage({ params }: { params: { id: string } }) {
  
    const param = await params;

  if(!param.id){
    notFound();
  }

  const employee = await getEmployeeById(param.id)
  const profile = employee?.profile

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#e6eef8] p-3 rounded-full">
            <User className="h-6 w-6 text-[#4285f4]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Employee Profile</h1>
        </div>
        <Button variant="outline" asChild className="border-gray-200">
          <Link href="/employee">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="w-full h-64 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-t-[#4285f4] border-[#e6eef8] rounded-full animate-spin"></div>
              <p className="text-gray-500">Loading employee data...</p>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-gray-100 shadow-sm lg:col-span-3">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="bg-[#e6eef8] h-24 w-24 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#4285f4]">{employee.name.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{employee.name.toUpperCase()}</h2>
                  <p className="text-gray-600">{employee.department}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="h-4 w-4 text-[#4285f4]" />
                    <span className="text-gray-600">{employee.email || "No email provided"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-[#4285f4]" />
                    <span className="text-gray-600">{profile?.mobileNumber || "No phone number provided"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-0">
              <div className="bg-[#4285f4] text-white py-3 px-6 font-medium">Personal Information</div>
              <div className="p-6 space-y-4">
                <ProfileItem icon={MapPin} label="Address" value={profile?.address} />
                <ProfileItem icon={MapPin} label="Native Place" value={profile?.nativePlace} />
                <ProfileItem
                  icon={Calendar}
                  label="Date of Birth"
                  value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : undefined}
                />
                <ProfileItem icon={Award} label="Degree" value={profile?.degree} />
                <ProfileItem icon={Droplet} label="Blood Group" value={profile?.bloodGroup} />
                <ProfileItem icon={Heart} label="Serious Illness" value={profile?.seriousIllness} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-0">
              <div className="bg-[#4285f4] text-white py-3 px-6 font-medium">ID and Bank Details</div>
              <div className="p-6 space-y-4">
                <ProfileItem icon={CreditCard} label="Aadhar Card Number" value={profile?.aadharNumber} />
                <ProfileItem icon={CreditCard} label="PAN Card Number" value={profile?.panNumber} />
                <ProfileItem icon={CreditCard} label="ICICI Bank Account" value={profile?.bankAccountNumber} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-0">
              <div className="bg-[#4285f4] text-white py-3 px-6 font-medium">Family & Emergency Contacts</div>
              <div className="p-6 space-y-4">
                <ProfileItem icon={Users} label="Father's Name" value={profile?.fatherName} />
                <ProfileItem icon={Phone} label="Father's Mobile" value={profile?.fatherMobile} />
                <ProfileItem icon={Users} label="Spouse's Name" value={profile?.spouseName} />
                <ProfileItem icon={Phone} label="Spouse's Mobile" value={profile?.spouseMobile} />
                <ProfileItem icon={Users} label="Relative's Name" value={profile?.relativeName} />
                <ProfileItem icon={Phone} label="Relative's Mobile" value={profile?.relativeMobile} />
                <ProfileItem icon={MapPin} label="Relative's Address" value={profile?.relativeAddress} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm lg:col-span-3">
            <CardContent className="p-0">
              <div className="bg-[#4285f4] text-white py-3 px-6 font-medium">Additional Information</div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-5 w-5 text-[#4285f4]" />
                    <h3 className="font-medium text-gray-800">Previous Work Experience</h3>
                  </div>
                  <p className="text-gray-600 pl-7">{profile?.workExperience || "No information provided"}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-[#4285f4]" />
                    <h3 className="font-medium text-gray-800">Legal Proceedings</h3>
                  </div>
                  <p className="text-gray-600 pl-7">
                    {profile?.legalProceedings === "yes"
                      ? "Yes, legal proceedings registered"
                      : "No legal proceedings registered"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Suspense>
    </div>
  )
}

function ProfileItem({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-[#4285f4]" />
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-gray-700 pl-6">{value || "Not provided"}</p>
    </div>
  )
}
