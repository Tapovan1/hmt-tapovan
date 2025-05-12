"use client";
import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { toast } from "sonner";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEmployee } from "@/lib/action/user.action";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().optional(),
  department: z.string().min(1, { message: "Please select a domain." }),
  salary: z.number().optional(),
  role: z.string().min(1, { message: "Please select a role." }),
});

interface EditEmployeeDialogProps {
  employee: {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    salary?: number;
  };
}

const EditEmployeeDialog = ({ employee }: EditEmployeeDialogProps) => {
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
      name: employee.name,
      email: employee.email,
      password: "",
      department: employee.department,
      salary: employee.salary,
      role: employee.role,
    },
  });

  useEffect(() => {
    if (isDialogOpen) {
      reset({
        name: employee.name,
        email: employee.email,
        password: "",
        department: employee.department,
        salary: employee.salary,
        role: employee.role,
      });
    }
  }, [isDialogOpen, employee, reset]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const result = await updateEmployee({
        id: employee.id,
        name: data.name,
        email: data.email,
        password: data.password || undefined,
        department: data.department,
        salary: data.salary ?? 0,
        role: data.role as "SUPERADMIN" | "ADMIN" | "EMPLOYEE",
      });

      if (result.success) {
        setLoading(false);
        toast("Success", {
          description: "Employee updated successfully",
        });
        setIsDialogOpen(false);
        reset();
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast("Error", {
        description: "Failed to update employee",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
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
            <Label htmlFor="password">
              New Password (leave empty to keep current)
            </Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="domain">Domain</Label>
            <Controller
              name="department"
              control={control}
              defaultValue={employee.department}
              render={({ field }) => (
                <Select
                  value={field.value}
                  defaultValue={employee.department}
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
              {...register("salary", { valueAsNumber: true })}
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
              defaultValue={employee.role}
              render={({ field }) => (
                <Select
                  value={field.value}
                  defaultValue={employee.role}
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
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
