"use client";
import type React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  FlipHorizontal,
  Plus,
  Settings,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createStudentAbsence,
  updateStudentAbsence,
} from "@/lib/action/student-absence.action";
import Webcam from "react-webcam";
import { getStandards, type StandardKey } from "@/lib/utils/index";
import { SCHOOL, HONO } from "@/utils/env";

// Debug Step 1 - Check ENV

// Debug Step 2 - Check standards

const standards = getStandards(SCHOOL);

const formSchema = z.object({
  id: z.string().optional(),
  rollNo: z.string().min(1, "Roll number is required"),
  studentName: z.string().min(1, "Student name is required"),
  class: z.string().min(1, "Class is required"),
  standard: z.string().min(1, "Standard is required"),
  parentName: z.string().min(1, "Parent name is required"),
  reason: z.string().min(1, "Reason is required"),
  status: z.enum(["PENDING", "DONE"]).default("PENDING"),
  photo: z.string().optional(),
  date: z.string().optional(),
  studentId: z.number().optional(),
});

type StudentAbsenceFormValues = z.infer<typeof formSchema>;

interface Student {
  id: number;
  name: string;
  rollNo: string;
  currentStandard: number;
  currentClass: string;
  subClass: string;
}

const CAMERA_QUALITY = {
  low: { width: 320, height: 240 },
  medium: { width: 640, height: 480 },
  high: { width: 1280, height: 720 },
  veryHigh: { width: 1920, height: 1080 },
};

export function StudentAbsenceDialog({
  children,
  absence,
}: {
  children?: React.ReactNode;
  absence?: any;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(
    absence?.photo || null
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraQuality, setCameraQuality] =
    useState<keyof typeof CAMERA_QUALITY>("high");
  const [showQualityOptions, setShowQualityOptions] = useState(false);
  const [Date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  const form = useForm<StudentAbsenceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rollNo: absence?.rollNo || "",
      studentName: absence?.studentName || "",
      class: absence?.class || "",
      standard: absence?.standard || "",
      parentName: absence?.parentName || "",
      reason: absence?.purpose || "",
      status: absence?.status || "PENDING",
      id: absence?.id,
      photo: absence?.photo || "",
      studentId: absence?.studentId,
    },
  });

  const fetchStudents = useCallback(
    async (standard: string, className: string) => {
      if (!standard || !className) return;

      setIsLoadingStudents(true);

      try {
        const baseUrl =
          SCHOOL === "talod"
            ? "https://talod-tapovan.vercel.app"
            : "https://tapovanmarks.vercel.app";

        const url = `${baseUrl}/api/students?standard=${standard}&class=${className}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch students");

        const data = await response.json();

        setStudents(data || []);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    },
    []
  );

  const handleStandardChange = useCallback(
    (value: string) => {
      setSelectedStandard(value);
      form.setValue("standard", value);

      const classesForStandard =
        standards?.[value as StandardKey]?.classes || [];
      setAvailableClasses(classesForStandard);

      setSelectedClass("");
      form.setValue("class", "");
      form.setValue("studentName", "");
      form.setValue("rollNo", "");
      form.setValue("studentId", undefined);
      setStudents([]);
    },
    [form]
  );

  const handleClassChange = useCallback(
    (value: string) => {
      setSelectedClass(value);
      form.setValue("class", value);

      form.setValue("studentName", "");
      form.setValue("rollNo", "");
      form.setValue("studentId", undefined);
      setStudents([]);

      if (selectedStandard && value) {
        fetchStudents(selectedStandard, value);
      }
    },
    [form, selectedStandard, fetchStudents]
  );

  const handleStudentChange = useCallback(
    (studentId: string) => {
      const student = students.find((s) => s.id.toString() === studentId);
      if (student) {
        form.setValue("studentId", student.id);
        form.setValue("studentName", student.name);
        form.setValue("rollNo", student.rollNo);
      }
    },
    [students, form]
  );

  useEffect(() => {
    if (absence && open) {
      const stdKey = absence.standard as keyof typeof standards;

      if (standards?.[stdKey]) {
        setSelectedStandard(absence.standard);
        setAvailableClasses(standards[stdKey].classes || []);
        setSelectedClass(absence.class || "");

        fetchStudents(absence.standard, absence.class);
      } else {
        console.warn("Invalid standard key or missing in standards:", stdKey);
      }
    }
  }, [absence, open, fetchStudents]);

  useEffect(() => {
    if (isCameraOpen) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter((d) => d.kind === "videoinput");
          setHasMultipleCameras(videoDevices.length > 1);
        })
        .catch((err) => console.error("Camera device error:", err));
    }
  }, [isCameraOpen]);

  useEffect(() => {
    if (!open && !absence) {
      form.reset({
        rollNo: "",
        studentName: "",
        class: "",
        standard: "",
        parentName: "",
        reason: "",
        status: "PENDING",
        photo: "",
      });
      setCapturedImage(null);
      setStudents([]);
      setSelectedStandard("");
      setSelectedClass("");
    }
  }, [open, form, absence]);

  const switchCamera = useCallback(() => {
    setIsFrontCamera(!isFrontCamera);
  }, [isFrontCamera]);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      setIsCapturing(true);
      setTimeout(() => {
        const imageSrc = webcamRef.current?.getScreenshot({
          width: CAMERA_QUALITY[cameraQuality].width,
          height: CAMERA_QUALITY[cameraQuality].height,
        });
        setCapturedImage(imageSrc);
        if (imageSrc) form.setValue("photo", imageSrc);
        setIsCapturing(false);
        setIsCameraOpen(false);
      }, 500);
    }
  }, [webcamRef, form, cameraQuality]);

  const clearPhoto = useCallback(() => {
    setCapturedImage(null);
    form.setValue("photo", "");
  }, [form]);

  async function onSubmit(data: StudentAbsenceFormValues) {
    try {
      setIsSubmitting(true); // start loading

      if (data.photo?.startsWith("data:image/")) {
        const response = await fetch(`${HONO}/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64: data.photo,
            project: SCHOOL,
          }),
        });

        if (!response.ok) throw new Error("Failed to upload image");

        const { filePath } = await response.json();
        data.photo = filePath;
      }

      if (data.id) {
        await updateStudentAbsence(data);
      } else {
        await createStudentAbsence(data);
      }

      setOpen(false);
      form.reset();
      router.refresh();
    } catch (err) {
      console.error("Failed to submit absence form:", err);
    } finally {
      setIsSubmitting(false); // stop loading
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Absence
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-4 sm:p-0 sticky top-0 bg-background z-10">
          <DialogTitle>
            {absence ? "Edit Student Absence" : "Record New Student Absence"}
          </DialogTitle>
          <DialogDescription>
            {absence
              ? "Update the student absence record with the latest information."
              : "Fill in the details to record a new student absence."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-4 sm:p-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Standard Selection */}
              <FormField
                control={form.control}
                name="standard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Standard</FormLabel>
                    <Select
                      onValueChange={handleStandardChange}
                      value={selectedStandard}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select standard" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(standards).map((standardKey) => (
                          <SelectItem key={standardKey} value={standardKey}>
                            Standard {standardKey}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Class Selection */}
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={handleClassChange}
                      value={selectedClass}
                      disabled={!selectedStandard}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedStandard
                                ? "Select standard first"
                                : "Select class"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableClasses.map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Student Selection */}
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select
                      onValueChange={handleStudentChange}
                      disabled={
                        !selectedStandard || !selectedClass || isLoadingStudents
                      }
                      value={
                        students
                          .find((s) => s.name === field.value)
                          ?.id.toString() || ""
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingStudents
                                ? "Loading students..."
                                : !selectedStandard || !selectedClass
                                ? "Select standard and class first"
                                : "Select student"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingStudents ? (
                          <SelectItem value="loading" disabled>
                            <div className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading students...
                            </div>
                          </SelectItem>
                        ) : students.length > 0 ? (
                          students.map((student) => (
                            <SelectItem
                              key={student.id}
                              value={student.id.toString()}
                            >
                              {student.name} (Roll: {student.rollNo})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-students" disabled>
                            No students found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Roll Number (Auto-populated, read-only) */}
              <FormField
                control={form.control}
                name="rollNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Auto-filled when student is selected"
                        {...field}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter parent name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Only show status field when editing and it's already set to DONE */}
              {absence && absence.status === "DONE" && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Absence</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter reason for absence"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Photo Verification</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {isCameraOpen ? (
                          <div className="relative">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <div className="text-sm text-muted-foreground">
                                  {isFrontCamera
                                    ? "Front Camera"
                                    : "Back Camera"}
                                </div>
                                <div className="relative">
                                  <Button
                                    type="button"
                                    onClick={() =>
                                      setShowQualityOptions(!showQualityOptions)
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                  >
                                    <Settings className="h-3.5 w-3.5 mr-1" />
                                    Quality: {cameraQuality}
                                  </Button>
                                  {showQualityOptions && (
                                    <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-md z-10 w-32">
                                      <div className="p-1">
                                        {Object.keys(CAMERA_QUALITY).map(
                                          (quality) => (
                                            <button
                                              key={quality}
                                              className={cn(
                                                "w-full text-left px-2 py-1 text-sm rounded-sm hover:bg-accent",
                                                quality === cameraQuality &&
                                                  "bg-accent"
                                              )}
                                              onClick={() => {
                                                setCameraQuality(
                                                  quality as keyof typeof CAMERA_QUALITY
                                                );
                                                setShowQualityOptions(false);
                                              }}
                                            >
                                              {quality}
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {hasMultipleCameras && (
                                <Button
                                  type="button"
                                  onClick={switchCamera}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 bg-transparent"
                                  title={
                                    isFrontCamera
                                      ? "Switch to back camera"
                                      : "Switch to front camera"
                                  }
                                >
                                  <FlipHorizontal className="h-4 w-4 mr-1" />
                                  Switch Camera
                                </Button>
                              )}
                            </div>
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              videoConstraints={{
                                width: CAMERA_QUALITY[cameraQuality].width,
                                height: CAMERA_QUALITY[cameraQuality].height,
                                facingMode: isFrontCamera
                                  ? "user"
                                  : "environment",
                              }}
                              className="border rounded-md w-full max-w-[320px] mx-auto"
                            />
                            {isCapturing && (
                              <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                                <div className="h-8 w-8 animate-ping rounded-full bg-primary/50"></div>
                              </div>
                            )}
                            <div className="flex gap-2 mt-2 justify-center">
                              <Button
                                type="button"
                                onClick={capturePhoto}
                                variant="secondary"
                                disabled={isCapturing}
                              >
                                <Camera className="mr-2 h-4 w-4" />
                                Capture
                              </Button>
                              <Button
                                type="button"
                                onClick={() => setIsCameraOpen(false)}
                                variant="outline"
                                disabled={isCapturing}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {capturedImage ? (
                              <div className="space-y-2">
                                <div className="relative w-full max-w-[320px] mx-auto">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={capturedImage || "placeholder.jpg"}
                                    alt="Captured student"
                                    className="border rounded-md w-full object-cover"
                                  />
                                  <Button
                                    type="button"
                                    onClick={clearPhoto}
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => setIsCameraOpen(true)}
                                  variant="outline"
                                  className="w-full max-w-[320px] mx-auto"
                                >
                                  Retake Photo
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                onClick={() => setIsCameraOpen(true)}
                                variant="secondary"
                                className="w-full max-w-[320px] mx-auto"
                              >
                                <Camera className="mr-2 h-4 w-4" />
                                Open Camera
                              </Button>
                            )}
                          </div>
                        )}
                        <input type="hidden" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 sm:pt-0 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto order-1 sm:order-2"
                disabled={isLoadingStudents || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {absence ? "Updating..." : "Submitting..."}
                  </>
                ) : absence ? (
                  "Update"
                ) : (
                  "Submit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
