import {
  markTeachersAbsent,
  getTeachersForAbsent,
} from "@/lib/action/absent.action";

async function autoMarkAbsent() {
  const teachers = await getTeachersForAbsent();
  const teacherIds = teachers.map((t) => t.id);

  if (teacherIds.length > 0) {
    await markTeachersAbsent(teacherIds);
    console.log("Absent marked for:", teacherIds.length, "teachers");
  } else {
    console.log("All teachers already marked");
  }
}

autoMarkAbsent();
