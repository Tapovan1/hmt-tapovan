import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEmployeeById } from "@/lib/action/admin.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Building2,
  Shield,
  FileText,
} from "lucide-react";

export default async function EmployeeProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const param = await params;

  if (!param.id) {
    notFound();
  }

  const employee = await getEmployeeById(param.id);
  if (!employee) {
    notFound();
  }
  const profile = employee?.profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Employee Profile
              </h1>
              <p className="text-slate-600 mt-1">
                Comprehensive employee information
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            asChild
            className="border-slate-200 hover:bg-slate-50 w-fit"
          >
            <Link href="/employee">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Employees
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-slate-200 hover:bg-slate-50 w-fit"
          >
            <Link href={`/employee/${employee.id}/history`}>View History</Link>
          </Button>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <div className="space-y-6">
            {/* Profile Header Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl sm:text-3xl font-bold text-white">
                        {employee?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 h-6 w-6 rounded-full border-4 border-white"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">
                        {employee.name}
                      </h2>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 w-fit"
                      >
                        <Building2 className="h-3 w-3 mr-1" />
                        {employee?.department}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ContactItem
                        icon={Mail}
                        value={employee.email || "No email provided"}
                        href={
                          employee.email
                            ? `mailto:${employee.email}`
                            : undefined
                        }
                      />
                      <ContactItem
                        icon={Phone}
                        value={profile?.mobileNumber || "No phone provided"}
                        href={
                          profile?.mobileNumber
                            ? `tel:${profile.mobileNumber}`
                            : undefined
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Personal Information */}
              <InfoCard
                title="Personal Information"
                icon={User}
                items={[
                  {
                    icon: MapPin,
                    label: "Address",
                    value: profile?.address ?? undefined,
                  },
                  {
                    icon: MapPin,
                    label: "Native Place",
                    value: profile?.nativePlace ?? undefined,
                  },
                  {
                    icon: Calendar,
                    label: "Date of Birth",
                    value: profile?.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : undefined,
                  },
                  {
                    icon: Award,
                    label: "Degree",
                    value: profile?.degree ?? undefined,
                  },
                  {
                    icon: Droplet,
                    label: "Blood Group",
                    value: profile?.bloodGroup ?? undefined,
                  },
                  {
                    icon: Heart,
                    label: "Medical Conditions",
                    value: profile?.seriousIllness ?? undefined,
                  },
                ]}
              />

              {/* ID and Bank Details */}
              <InfoCard
                title="ID & Bank Details"
                icon={Shield}
                items={[
                  {
                    icon: CreditCard,
                    label: "Aadhar Number",
                    value: profile?.aadharNumber ?? undefined,
                    sensitive: true,
                  },
                  {
                    icon: CreditCard,
                    label: "PAN Number",
                    value: profile?.panNumber ?? undefined,
                    sensitive: true,
                  },
                  {
                    icon: CreditCard,
                    label: "Bank Account",
                    value: profile?.bankAccountNumber ?? undefined,
                    sensitive: true,
                  },
                ]}
              />

              {/* Family & Emergency Contacts */}
              <InfoCard
                title="Emergency Contacts"
                icon={Users}
                items={[
                  {
                    icon: Users,
                    label: "Father's Name",
                    value: profile?.fatherName ?? undefined,
                  },
                  {
                    icon: Phone,
                    label: "Father's Mobile",
                    value: profile?.fatherMobile ?? undefined,
                  },
                  {
                    icon: Users,
                    label: "Spouse's Name",
                    value: profile?.spouseName ?? undefined,
                  },
                  {
                    icon: Phone,
                    label: "Spouse's Mobile",
                    value: profile?.spouseMobile ?? undefined,
                  },
                  {
                    icon: Users,
                    label: "Relative's Name",
                    value: profile?.relativeName ?? undefined,
                  },
                  {
                    icon: Phone,
                    label: "Relative's Mobile",
                    value: profile?.relativeMobile ?? undefined,
                  },
                  {
                    icon: MapPin,
                    label: "Relative's Address",
                    value: profile?.relativeAddress ?? undefined,
                  },
                ]}
              />
            </div>

            {/* Additional Information */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-900">
                  <div className="bg-gradient-to-br from-slate-500 to-slate-600 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">
                      Previous Work Experience
                    </h3>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 ml-11">
                    <p className="text-slate-700 leading-relaxed">
                      {profile?.workExperience ||
                        "No previous work experience information provided"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">
                      Legal Proceedings
                    </h3>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 ml-11">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          profile?.legalProceedings === "yes"
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <p className="text-slate-700">
                        {profile?.legalProceedings === "yes"
                          ? "Legal proceedings registered"
                          : "No legal proceedings registered"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Suspense>
      </div>
    </div>
  );
}

function ContactItem({
  icon: Icon,
  value,
  href,
}: {
  icon: any;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
      <div className="bg-blue-100 p-2 rounded-lg">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <span className="text-slate-700 text-sm font-medium truncate">
        {value}
      </span>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:scale-[1.02] transition-transform">
        {content}
      </a>
    );
  }

  return content;
}

function InfoCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: any;
  items: Array<{
    icon: any;
    label: string;
    value?: string;
    sensitive?: boolean;
  }>;
}) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-slate-900">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
            <Icon className="h-5 w-5 text-white" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <ProfileItem
            key={index}
            icon={item.icon}
            label={item.label}
            value={item.value}
            sensitive={item.sensitive}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function ProfileItem({
  icon: Icon,
  label,
  value,
  sensitive = false,
}: {
  icon: any;
  label: string;
  value?: string;
  sensitive?: boolean;
}) {
  const displayValue = value || "Not provided";

  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-slate-100 group-hover:bg-blue-100 p-1.5 rounded-md transition-colors">
          <Icon className="h-3.5 w-3.5 text-slate-600 group-hover:text-blue-600 transition-colors" />
        </div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={`text-slate-700 pl-7 font-medium ${
          !value ? "text-slate-400 italic" : ""
        } ${sensitive && value ? "font-mono text-sm" : ""}`}
      >
        {sensitive && value ? "••••••••••" : displayValue}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Header Skeleton */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="bg-slate-200 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl animate-pulse"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="border-0 shadow-lg bg-white/80 backdrop-blur-sm"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-200 p-2 rounded-lg w-9 h-9 animate-pulse"></div>
                <div className="h-6 bg-slate-200 rounded w-32 animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 p-1.5 rounded-md w-6 h-6 animate-pulse"></div>
                    <div className="h-3 bg-slate-100 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-full ml-7 animate-pulse"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info Skeleton */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-200 p-2 rounded-lg w-9 h-9 animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded w-40 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-lg w-8 h-8 animate-pulse"></div>
              <div className="h-5 bg-slate-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 ml-11">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
