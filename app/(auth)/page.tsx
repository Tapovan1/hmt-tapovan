import LoginForm from "./Form";
import { login } from "@/lib/action/user.action";

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
    <div className="flex flex-col p-4 lg:w-1/3 bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-gray-500 mt-2">
          Enter your credentials below to login to your account
        </p>
      </div>
      <div className="mt-6">
        <LoginForm loginAction={loginAction} />
      </div>
    </div>
  );
}
