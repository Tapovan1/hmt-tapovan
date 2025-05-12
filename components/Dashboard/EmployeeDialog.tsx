"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Input } from "../ui/input";
import { z } from "zod";
import { toast } from "sonner";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addEmployee } from "@/lib/action/user.action";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  salary: z.string().min(1, { message: "Salary must be at least 1." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  department: z.string().min(1, { message: "Please select a domain." }),

  role: z.string().min(1, { message: "Please select a role." }),
});

const EmploteeDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      department: "",
      salary: "",
      role: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const result = await addEmployee({
        name: data.name,
        email: data.email,
        password: data.password,
        salary: data.salary,
        department: data.department,
        role: data.role.toUpperCase() as "SUPERADMIN" | "ADMIN" | "EMPLOYEE",
      });
      if (result.success) {
        setLoading(false);
        toast("Success", {
          description: "Employee added successfully",
        });
        setIsDialogOpen(false);

        reset();
      }
    } catch (error) {
      setLoading(false);
      console.log(error);

      toast("Error", {
        description: "Failed to add employee",
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Employees</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => setValue("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Accountant">Accountant</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Computer Operator">
                        Computer Operator
                      </SelectItem>
                      <SelectItem value="Clerk">Clerk</SelectItem>
                      <SelectItem value="Primary">Primary</SelectItem>
                      <SelectItem value="SSC">SSC</SelectItem>
                      <SelectItem value="HSC">HSC</SelectItem>
                      <SelectItem value="Foundation">Foundation</SelectItem>
                      <SelectItem value="HSC (Ahmd)">HSC (Ahmd)</SelectItem>
                      <SelectItem value="GCI">GCI</SelectItem>
                      <SelectItem value="Peon">Peon</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Guest">Guest</SelectItem>
                      <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && (
                <p className="text-sm text-red-500">
                  {errors.department.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                type="number"
                placeholder="1000"
                {...register("salary")}
              />
              {errors.salary && (
                <p className="text-sm text-red-500">{errors.salary.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => setValue("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEACHER">TEACHER</SelectItem>
                      <SelectItem value="TEACHERE">TEACHERE</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="SUPERADMIN">SUPERADMIN</SelectItem>
                      <SelectItem value="SECURITY">SECURITY</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              {}
              <Button type="submit" disabled={loading}>
                {loading ? "Loading..." : "Add Employee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmploteeDialog;
