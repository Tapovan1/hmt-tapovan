import { login } from "@/lib/action/user.action";
import LoginForm from "./Form";


export default function LoginPage() {
  async function loginAction(prevState: unknown, formData: FormData) {
    "use server";
    const data = await login(formData);

    if (data?.success) {
      return { success: true, error: undefined };
    }

    return {
      error: "Login Failed. Please check your credentials and Try again",
      success: false,
    };
  }

  return (
    <div className="flex bg-[#f0f4f9]">
      {/* Left column - School branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#e6eef8] flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-[#3b82f6] mb-4">
            dummy 
          </h1>
          <div className="relative w-full h-45 my-6">
            {/* <Image
              src="/logo.png"
              alt="Teacher Attendance Portal"
              fill
              className="object-contain"
              priority
            /> */}
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Attendance Portal
          </h2>
          <p className="text-gray-600">
            Track attendance, manage leaves, and view history all in one place.
          </p>
        </div>
      </div>

      {/* Right column - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
              <div className="flex items-center justify-center mt-2">
                <div className="h-1 w-12 bg-[#3b82f6] rounded-full"></div>
              </div>
              <p className="text-gray-600 mt-4">
                Enter your credentials below to access your account
              </p>
            </div>

            {/* Mobile only school name */}
            <div className="lg:hidden text-center mb-6">
              <h2 className="text-xl font-semibold text-[#3b82f6]">
               
              </h2>
              <p className="text-sm text-gray-600">Attendance Portal</p>
            </div>

            <LoginForm loginAction={loginAction} />
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Need help? Contact your administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
