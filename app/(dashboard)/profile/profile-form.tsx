"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Save, User, Phone, CreditCard, Users, Briefcase } from "lucide-react"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

const departments = [
  "Admin",
  "Computer Operator",
  "Clerk",
  "Primary",
  "SSC",
  "HSC",
  "Foundation",
  "HSC (Ahmd)",
  "GCI",
  "Peon",
  "Security",
  "Guest",
  "Accountant",
]

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  department: z.string().min(1, { message: "Please select a department." }),
  mobileNumber: z.string().min(10, { message: "Please enter a valid mobile number." }),
  address: z.string().min(5, { message: "Please enter your address." }),
  nativePlace: z.string().optional(),
  dateOfBirth: z.string().optional(),
  degree: z.string().optional(),
  bloodGroup: z.string().optional(),
  aadharNumber: z.string().optional(),
  panNumber: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  seriousIllness: z.string().optional(),
  fatherName: z.string().optional(),
  fatherMobile: z.string().optional(),
  spouseName: z.string().optional(),
  spouseMobile: z.string().optional(),
  relativeName: z.string().optional(),
  relativeMobile: z.string().optional(),
  relativeAddress: z.string().optional(),
  workExperience: z.string().optional(),
  legalProceedings: z.enum(["yes", "no"]).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ProfileFormProps {
  user?: any
  initialData?: any
}

// Custom label component for bilingual text
const BilingualLabel = ({
  english,
  gujarati,
  required = false,
}: { english: string; gujarati: string; required?: boolean }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2">
      <span className="font-medium text-gray-900">{english}</span>
      {required && <span className="text-red-500 text-sm">*</span>}
    </div>
    <div className="text-sm text-gray-600 font-medium" style={{ fontFamily: "Noto Sans Gujarati, sans-serif" }}>
      ( {gujarati} )
    </div>
  </div>
)

export default function ImprovedProfileForm({ user, initialData }: ProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  console.log("user", user);
  console.log("initialData", initialData);

  


  

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      department: user?.department || "",
      mobileNumber: initialData?.mobileNumber || "",
      address: initialData?.address || "",
      nativePlace: initialData?.nativePlace || "",
      dateOfBirth: initialData?.dateOfBirth
      ? (() => {
          const date = new Date(initialData.dateOfBirth)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, "0")
          const day = String(date.getDate()).padStart(2, "0")
          return `${year}-${month}-${day}`
        })()
      : "",
      degree: initialData?.degree || "",
      bloodGroup: initialData?.bloodGroup || "",
      aadharNumber: initialData?.aadharNumber || "",
      panNumber: initialData?.panNumber || "",
      bankAccountNumber: initialData?.bankAccountNumber || "",
      seriousIllness: initialData?.seriousIllness || "",
      fatherName: initialData?.fatherName || "",
      fatherMobile: initialData?.fatherMobile || "",
      spouseName: initialData?.spouseName || "",
      spouseMobile: initialData?.spouseMobile || "",
      relativeName: initialData?.relativeName || "",
      relativeMobile: initialData?.relativeMobile || "",
      relativeAddress: initialData?.relativeAddress || "",
      workExperience: initialData?.workExperience || "",
      legalProceedings: initialData?.legalProceedings || "no",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast.success("Profile updated successfully")
      router.refresh()
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-8xl mx-auto  space-y-8">
     
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card className="shadow-sm border-none">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-blue-600" />
                Basic Information
              
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Employee Name" gujarati="કર્મચારીનું નામ" required />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          disabled={true}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Department" gujarati="વિભાગ" required />
                      </FormLabel>
                      <Select disabled={true} onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Mobile Number" gujarati="મોબાઈલ નંબર" required />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your mobile number"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        <BilingualLabel english="Address" gujarati="સરનામું" required />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your current address"
                          {...field}
                          className="resize-none min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nativePlace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Native Place" gujarati="મૂળ વતન" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your native place"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Date of Birth" gujarati="જન્મ તારીખ" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Degree" gujarati="ડિગ્રી" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your highest degree"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Blood Group" gujarati="બ્લડ ગ્રુપ" />
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bloodGroups.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ID and Bank Details */}
          <Card className="shadow-sm border-none">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="h-5 w-5 text-green-600" />
                ID and Bank Details
                
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="aadharNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Aadhar Card Number" gujarati="આધારકાર્ડ નંબર" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your Aadhar number"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="panNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="PAN Card Number" gujarati="પાનકાર્ડ નંબર" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your PAN number"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="ICICI Bank Account Number" gujarati="ICICI બેન્ક ખાતા નંબર" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your bank account number"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seriousIllness"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        <BilingualLabel english="Any Serious Illness" gujarati="કોઈ ગંભીર બીમારી" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter details if any"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Family Details */}
          <Card className="shadow-sm border-none">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5 text-purple-600" />
                Family Details
             
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Father's Name" gujarati="પિતાનું નામ" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your father's name"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fatherMobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Father's Mobile Number" gujarati="પિતાનો મોબાઈલ નંબર" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your father's mobile number"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spouseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel
                          english="Husband / Spouse's Name (if applicable)"
                          gujarati="પતિ / પત્ની હોય તો તેમનું નામ"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your spouse's name"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="spouseMobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel
                          english="Husband / Spouse's Mobile Number"
                          gujarati="પતિ / પત્ની હોય તો મોબાઈલ નંબર"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your spouse's mobile number"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="shadow-sm border-none">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Phone className="h-5 w-5 text-red-600" />
                Emergency Contact
           
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="relativeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Close Relative's Name" gujarati="નજીકના સંબંધીનું નામ" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your relative's name"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relativeMobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Relative's Mobile Number" gujarati="સંબંધીનો મોબાઈલ નંબર" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your relative's mobile number"
                          {...field}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relativeAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        <BilingualLabel english="Relative's Address" gujarati="સંબંધીનું સરનામું" />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your relative's address"
                          {...field}
                          className="resize-none min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="shadow-sm border-none">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Briefcase className="h-5 w-5 text-orange-600" />
                Additional Information
               
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="workExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <BilingualLabel english="Previous Work Experience" gujarati="અગાઉ કરેલ કામનો અનુભવ" />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter details of your previous work experience"
                          {...field}
                          className="resize-none min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legalProceedings"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel>
                        <BilingualLabel
                          english="Any Legal Proceedings Registered"
                          gujarati="કોઈ કાનૂની કાર્યવાહી દફતરે નોંધાયેલ છે"
                        />
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="legal-yes" className="text-blue-600" />
                            <label
                              htmlFor="legal-yes"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Yes / હા
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="legal-no" className="text-blue-600" />
                            <label
                              htmlFor="legal-no"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              No / ના
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 h-auto text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
