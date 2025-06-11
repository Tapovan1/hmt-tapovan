"use server";
import { comparePassword, saltAndHashPassword } from "@/utils/password";
import { signInSchema } from "../validation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createSession } from "../session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const validatedFields = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const errorMessage = { message: "Invalid credentials" };

  if (!validatedFields.success) {
    throw new Error("Invalid credentials");
  }

  const user = await prisma?.user.findUnique({
    where: {
      email: validatedFields.data.email,
    },
  });

  if (!user) {
    return {
      success: false,
      message: errorMessage,
    };
  }

  const isValidPassword = await comparePassword(
    validatedFields.data.password,
    user.password
  );

  if (!isValidPassword) {
    return {
      success: false,
      message: errorMessage,
    };
  }

  const userId = user.id;

  await createSession(userId);
}

export interface DeleteUserParams {
  id: string;
}

export const getEmployees = async (department:string) => {

  const where = {
    department: department,
  }
  try {
    const getEmployeeData = await prisma?.user.findMany({
      where,
    })

    return getEmployeeData;
  } catch (error) {
    console.log(error);
  }
};

export const deleteUser = async (id: DeleteUserParams) => {
  try {
    // Delete related Attendance records first
    await prisma?.attendance.deleteMany({
      where: {
        userId: id.id,
      },
    });

    // Delete the user
    const deleteEmployeeData = await prisma?.user.delete({
      where: {
        id: id.id,
      },
    });

    revalidatePath("/employees");

    return deleteEmployeeData;
  } catch (error) {
    console.log(error);

    throw new Error("Failed to delete user");
  }
};

interface IFormData {
  name: string;
  email: string;
  role: string;
  password: string;
  salary: number;
  department: string;
}

export const addEmployee = async (formData: IFormData) => {
  const { name, email, role, password, salary, department } = formData;

  const hashedPassword = await saltAndHashPassword(password);

  try {
    const addEmployeeData = await prisma?.user.create({
      data: {
        name,
        email,
        role,
        salary: Number(salary),
        password: hashedPassword,
        department,
      },
    });

    if (!addEmployeeData) {
      return {
        success: false,
        message: "Failed to add employee",
      };
    }

    revalidatePath("/employees");
    return {
      success: true,
      message: "Employee added successfully",
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

interface IUpdateFormData {
  id: string;
  name: string;
  email: string;
  role: string;
  salary: number;
  password?: string;
  department: string;
}

export const updateEmployee = async (formData: IUpdateFormData) => {
  const { id, name, email, role, password, salary, department } = formData;

  try {
    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
      salary: Number(salary),
      department,
    };

    // Only hash and update password if provided
    if (password) {
      const hashedPassword = await saltAndHashPassword(password);
      updateData.password = hashedPassword;
    }

    const updatedEmployee = await prisma?.user.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    if (!updatedEmployee) {
      return {
        success: false,
        message: "Failed to update employee",
      };
    }

    revalidatePath("/employees");
    return {
      success: true,
      message: "Employee updated successfully",
    };
  } catch (error) {
    console.error("Update error:", error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export async function logout() {
  (await cookies()).delete("session");
  redirect("/");
}
