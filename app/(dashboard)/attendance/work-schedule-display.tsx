interface User {
  department: string;
}

export default async function WorkScheduleDisplay({ user }: { user: User }) {
  return <div></div>;
  // const workSchedule = await getSchedulesByDepartment(user.department);
  // console.log("workSchedule", workSchedule);

  // return (
  //   <div className="flex items-center space-x-2 text-sm text-muted-foreground">
  //     <Clock className="h-4 w-4" />
  //     <span>
  //       Allowed Time:{" "}
  //       {workSchedule
  //         ? formatTimeWindow({
  //             startTime: workSchedule.startTime,
  //             endTime: workSchedule.endTime,
  //             graceMinutes: workSchedule.graceMinutes,
  //           })
  //         : "No schedule available"}
  //     </span>
  //   </div>
  // );
}
