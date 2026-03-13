import { describe, it, expect } from "bun:test";
import { AttendanceService } from "../module/attendance/attendance.service";
import type {
  IAttendanceRepository,
  CreateAttendanceUserInput,
  CreateScheduleInput,
  UpdateScheduleInput,
} from "../module/attendance/IAttendanceRepository";
import type { Attendance, AttendanceUser, ScheduleAttendanceSchool } from "../db/attendance.schema";
import { HTTPException } from "hono/http-exception";

class FakeAttendanceRepository implements IAttendanceRepository {
  public usersById: Record<string, AttendanceUser | null> = {};
  public attendancesById: Record<string, Attendance | null> = {};
  public schedulesById: Record<string, ScheduleAttendanceSchool | null> = {};

  public createdUsers: CreateAttendanceUserInput[] = [];
  public deletedUserIds: string[] = [];

  public getAttendancesArgs: { limit: number; offset: number; condition: unknown } | null = null;
  public deletedAttendanceIds: string[] = [];

  public createdSchedules: CreateScheduleInput[] = [];
  public scheduleSchoolIds: string[] = [];
  public updatedSchedules: { id: string; data: UpdateScheduleInput }[] = [];
  public deletedScheduleIds: string[] = [];

  async createAttendanceUser(data: CreateAttendanceUserInput): Promise<AttendanceUser> {
    this.createdUsers.push(data);
    const user: AttendanceUser = {
      id: "au-1",
      attendance_user_id: data.attendance_user_id,
      teacher_id: data.teacher_id ?? null,
      student_id: data.student_id ?? null,
    };
    this.usersById[data.attendance_user_id] = user;
    return user;
  }

  async findAttendanceUserById(attendanceUserId: string): Promise<AttendanceUser | null> {
    return this.usersById[attendanceUserId] ?? null;
  }

  async findAttendanceUserByTeacherId(_teacherId: string): Promise<AttendanceUser | null> {
    return null;
  }

  async findAttendanceUserByStudentId(_studentId: string): Promise<AttendanceUser | null> {
    return null;
  }

  async deleteAttendanceUser(id: string): Promise<void> {
    this.deletedUserIds.push(id);
    delete this.usersById[id];
  }

  async createAttendance(_data: any): Promise<Attendance> {
    throw new Error("Not used directly in service");
  }

  async getAttendances({
    limit,
    offset,
    condition,
  }: {
    limit: number;
    offset: number;
    condition: unknown;
  }): Promise<{ data: Attendance[]; total: { count: number } }> {
    this.getAttendancesArgs = { limit, offset, condition };
    const data = Object.values(this.attendancesById).filter(Boolean) as Attendance[];
    return { data, total: { count: data.length } };
  }

  async findAttendanceById(id: string): Promise<Attendance | null> {
    return this.attendancesById[id] ?? null;
  }

  async updateAttendance(id: string, _data: any): Promise<Attendance> {
    const existing = this.attendancesById[id];
    if (!existing) {
      throw new Error("Attendance not found");
    }
    return existing;
  }

  async deleteAttendance(id: string): Promise<void> {
    this.deletedAttendanceIds.push(id);
    delete this.attendancesById[id];
  }

  async checkIn(attendanceUserId: string): Promise<Attendance> {
    const attendance: Attendance = {
      id: "att-1",
      attendance_id: attendanceUserId,
      datetime_in: new Date(),
      datetime_out: null,
    };
    this.attendancesById[attendance.id] = attendance;
    return attendance;
  }

  async checkOut(id: string): Promise<Attendance> {
    const existing = this.attendancesById[id];
    if (!existing) {
      throw new Error("Attendance not found");
    }
    const updated: Attendance = {
      ...(existing as Attendance),
      datetime_out: new Date(),
    };
    this.attendancesById[id] = updated;
    return updated;
  }

  async createSchedule(data: CreateScheduleInput): Promise<ScheduleAttendanceSchool> {
    this.createdSchedules.push(data);
    const schedule: ScheduleAttendanceSchool = {
      id: "sch-1",
      school_id: data.school_id,
      type: data.type,
      day: data.day,
      in: data.in as any,
      out: data.out as any,
    };
    this.schedulesById[schedule.id] = schedule;
    return schedule;
  }

  async getSchedulesBySchoolId(schoolId: string): Promise<ScheduleAttendanceSchool[]> {
    this.scheduleSchoolIds.push(schoolId);
    return Object.values(this.schedulesById).filter(
      (s) => s && s.school_id === schoolId,
    ) as ScheduleAttendanceSchool[];
  }

  async findScheduleById(id: string): Promise<ScheduleAttendanceSchool | null> {
    return this.schedulesById[id] ?? null;
  }

  async updateSchedule(id: string, data: UpdateScheduleInput): Promise<ScheduleAttendanceSchool> {
    this.updatedSchedules.push({ id, data });
    const existing = this.schedulesById[id];
    const updated: ScheduleAttendanceSchool = {
      ...(existing as ScheduleAttendanceSchool),
      day: data.day ?? (existing as ScheduleAttendanceSchool).day,
      in: (data.in as any) ?? (existing as ScheduleAttendanceSchool).in,
      out: (data.out as any) ?? (existing as ScheduleAttendanceSchool).out,
    };
    this.schedulesById[id] = updated;
    return updated;
  }

  async deleteSchedule(id: string): Promise<void> {
    this.deletedScheduleIds.push(id);
    delete this.schedulesById[id];
  }
}

describe("AttendanceService", () => {
  it("registerAttendanceUser should fail if id already exists", async () => {
    const repo = new FakeAttendanceRepository();
    const service = new AttendanceService(repo);

    // @ts-expect-error
    repo.usersById["A-1"] = { id: "au-1", attendance_user_id: "A-1" };

    const input: CreateAttendanceUserInput = { attendance_user_id: "A-1" };

    await expect(service.registerAttendanceUser(input)).rejects.toBeInstanceOf(HTTPException);
  });

  it("registerAttendanceUser should create user when id is unique", async () => {
    const repo = new FakeAttendanceRepository();
    const service = new AttendanceService(repo);

    const input: CreateAttendanceUserInput = { attendance_user_id: "A-1" };
    const user = await service.registerAttendanceUser(input);

    expect(user.attendance_user_id).toBe("A-1");
    expect(repo.createdUsers[0]).toEqual(input);
  });

  it("getAttendances should build condition based on filters", async () => {
    const repo = new FakeAttendanceRepository();
    const service = new AttendanceService(repo);

    await service.getAttendances({
      attendance_id: "A-1",
      date_from: "2025-01-01",
      date_to: "2025-01-31",
      limit: 10,
      offset: 0,
    });

    expect(repo.getAttendancesArgs).not.toBeNull();
    expect(repo.getAttendancesArgs?.limit).toBe(10);
    expect(repo.getAttendancesArgs?.offset).toBe(0);
    expect(repo.getAttendancesArgs?.condition).toBeDefined();
  });

  it("getAttendanceUserById should throw when not found", async () => {
    const repo = new FakeAttendanceRepository();
    const service = new AttendanceService(repo);

    await expect(service.getAttendanceUserById("unknown")).rejects.toBeInstanceOf(HTTPException);
  });

  it("findAttendanceById should throw when not found", async () => {
    const repo = new FakeAttendanceRepository();
    const service = new AttendanceService(repo);

    await expect(service.findAttendanceById("unknown")).rejects.toBeInstanceOf(HTTPException);
  });

  it("checkIn should verify user exists", async () => {
    const repo = new FakeAttendanceRepository();
    const service = new AttendanceService(repo);

    // @ts-expect-error
    repo.usersById["A-1"] = { id: "au-1", attendance_user_id: "A-1" };

    const att = await service.checkIn("A-1");
    expect(att.attendance_id).toBe("A-1");
  });

  it("checkOut should fail when already checked out", async () => {
    const repo = new FakeAttendanceRepository();
    const service = new AttendanceService(repo);

    // @ts-expect-error
    repo.attendancesById["att-1"] = { id: "att-1", datetime_in: new Date(), datetime_out: new Date() };

    await expect(service.checkOut("att-1")).rejects.toBeInstanceOf(HTTPException);
  });

  it("deleteAttendance should verify existence first", async () => {
    const repo = new FakeAttendanceRepository();
    const service = new AttendanceService(repo);

    // @ts-expect-error
    repo.attendancesById["att-1"] = { id: "att-1", datetime_in: new Date() };

    await service.deleteAttendance("att-1");
    expect(repo.deletedAttendanceIds).toContain("att-1");
  });

  it("createSchedule and getSchedulesBySchoolId should delegate to repository", async () => {
    const repo = new FakeAttendanceRepository();
    const service = new AttendanceService(repo);

    const input: CreateScheduleInput = {
      school_id: "school-1",
      type: "teacher",
      day: "monday",
      in: "07:00",
      out: "12:00",
    };

    await service.createSchedule(input);

    const schedules = await service.getSchedulesBySchoolId("school-1");

    expect(repo.createdSchedules[0]).toEqual(input);
    expect(schedules.length).toBeGreaterThanOrEqual(1);
    expect(schedules[0].school_id).toBe("school-1");
  });

  it("updateSchedule should verify existence first", async () => {
    const repo = new FakeAttendanceRepository();
    const service = new AttendanceService(repo);

    repo.schedulesById["sch-1"] = {
      id: "sch-1",
      school_id: "school-1",
      type: "teacher",
      day: "monday",
      in: "07:00",
      out: "12:00",
    };

    const updated = await service.updateSchedule("sch-1", { day: "tuesday" });

    expect(updated.day).toBe("tuesday");
  });

  it("updateSchedule should throw when schedule does not exist", async () => {
    const repo = new FakeAttendanceRepository();
    const service = new AttendanceService(repo);

    await expect(service.updateSchedule("missing", { day: "tuesday" })).rejects.toBeInstanceOf(HTTPException);
  });

  it("deleteSchedule should verify existence first", async () => {
    const repo = new FakeAttendanceRepository();
    const service = new AttendanceService(repo);

    repo.schedulesById["sch-1"] = {
      id: "sch-1",
      school_id: "school-1",
      type: "teacher",
      day: "monday",
      in: "07:00",
      out: "12:00",
    };

    await service.deleteSchedule("sch-1");
    expect(repo.deletedScheduleIds).toContain("sch-1");
  });
});

