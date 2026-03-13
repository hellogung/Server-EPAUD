import { describe, it, expect } from "bun:test";
import { ClassService } from "../module/class/class.service";
import type { IClassRepository, CreateClassInput, UpdateClassData, AssignmentPeriod } from "../module/class/IClassRepository";
import type { ClassData, TeacherClass, StudentClass } from "../db/class.schema";
import { HTTPException } from "hono/http-exception";

class FakeClassRepository implements IClassRepository {
  public created: CreateClassInput | null = null;
  public getAllArgs: { limit: number; offset: number; condition: unknown } | null = null;
  public classesById: Record<string, ClassData | null> = {};
  public updated: { id: string; data: UpdateClassData } | null = null;
  public deletedIds: string[] = [];

  public teacherAssignments: TeacherClass[] = [];
  public studentAssignments: StudentClass[] = [];

  async create(data: CreateClassInput): Promise<ClassData> {
    this.created = data;
    const cls: ClassData = {
      id: "class-1",
      school_id: data.school_id,
      name: data.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.classesById[cls.id] = cls;
    return cls;
  }

  async getAll({ limit, offset, condition }: { limit: number; offset: number; condition: unknown }): Promise<{ data: ClassData[]; total: { count: number } }> {
    this.getAllArgs = { limit, offset, condition };
    const data = Object.values(this.classesById).filter(Boolean) as ClassData[];
    return { data, total: { count: data.length } };
  }

  async findById(id: string): Promise<ClassData | null> {
    return this.classesById[id] ?? null;
  }

  async update(id: string, data: UpdateClassData): Promise<ClassData> {
    this.updated = { id, data };
    const existing = this.classesById[id];
    const updated: ClassData = {
      ...(existing as ClassData),
      name: data.name ?? (existing as ClassData).name,
    };
    this.classesById[id] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.deletedIds.push(id);
    delete this.classesById[id];
  }

  async assignTeacher(classId: string, teacherId: string, period: AssignmentPeriod): Promise<TeacherClass> {
    // @ts-expect-error - minimal shape
    const assignment: TeacherClass = { id: "tc-1", class_id: classId, teacher_id: teacherId, ...period };
    this.teacherAssignments.push(assignment);
    return assignment;
  }

  async bulkAssignTeachers(classId: string, teacherIds: string[], period: AssignmentPeriod): Promise<TeacherClass[]> {
    const result: TeacherClass[] = [];
    for (const tId of teacherIds) {
      // @ts-expect-error
      const assignment: TeacherClass = { id: `tc-${tId}`, class_id: classId, teacher_id: tId, ...period };
      this.teacherAssignments.push(assignment);
      result.push(assignment);
    }
    return result;
  }

  async removeTeacher(classId: string, teacherId: string): Promise<void> {
    this.teacherAssignments = this.teacherAssignments.filter(
      (t) => !(t.class_id === classId && t.teacher_id === teacherId),
    );
  }

  async getTeachersByClassId(classId: string, _period?: AssignmentPeriod): Promise<TeacherClass[]> {
    return this.teacherAssignments.filter((t) => t.class_id === classId);
  }

  async assignStudent(classId: string, studentId: string, period: AssignmentPeriod): Promise<StudentClass> {
    // @ts-expect-error
    const sc: StudentClass = { id: "sc-1", class_id: classId, student_id: studentId, ...period };
    this.studentAssignments.push(sc);
    return sc;
  }

  async bulkAssignStudents(classId: string, studentIds: string[], period: AssignmentPeriod): Promise<StudentClass[]> {
    const result: StudentClass[] = [];
    for (const sId of studentIds) {
      // @ts-expect-error
      const sc: StudentClass = { id: `sc-${sId}`, class_id: classId, student_id: sId, ...period };
      this.studentAssignments.push(sc);
      result.push(sc);
    }
    return result;
  }

  async removeStudent(classId: string, studentId: string): Promise<void> {
    this.studentAssignments = this.studentAssignments.filter(
      (s) => !(s.class_id === classId && s.student_id === studentId),
    );
  }

  async getStudentsByClassId(classId: string, _period?: AssignmentPeriod): Promise<StudentClass[]> {
    return this.studentAssignments.filter((s) => s.class_id === classId);
  }
}

describe("ClassService", () => {
  it("create should delegate to repository", async () => {
    const repo = new FakeClassRepository();
    const service = new ClassService(repo);

    const input: CreateClassInput = {
      school_id: "school-1",
      name: "Kelas A",
    };

    const result = await service.create(input);

    expect(repo.created).toEqual(input);
    expect(result.id).toBeDefined();
    expect(result.name).toBe("Kelas A");
  });

  it("getAll should pass filters to repository", async () => {
    const repo = new FakeClassRepository();
    const service = new ClassService(repo);

    await service.getAll({
      search: "A",
      school_id: "school-1",
      limit: 20,
      offset: 0,
      page: 1,
    });

    expect(repo.getAllArgs).not.toBeNull();
    expect(repo.getAllArgs?.limit).toBe(20);
    expect(repo.getAllArgs?.offset).toBe(0);
    expect(repo.getAllArgs?.condition).toBeDefined();
  });

  it("findById should return class when found", async () => {
    const repo = new FakeClassRepository();
    const service = new ClassService(repo);

    // @ts-expect-error
    const existing: ClassData = { id: "class-1", school_id: "school-1", name: "Kelas A" };
    repo.classesById["class-1"] = existing;

    const result = await service.findById("class-1");
    expect(result).toEqual(existing);
  });

  it("findById should throw HTTPException when not found", async () => {
    const repo = new FakeClassRepository();
    const service = new ClassService(repo);

    await expect(service.findById("missing")).rejects.toBeInstanceOf(HTTPException);
  });

  it("update should require existing class and delegate to repository", async () => {
    const repo = new FakeClassRepository();
    const service = new ClassService(repo);

    // @ts-expect-error
    repo.classesById["class-1"] = { id: "class-1", school_id: "school-1", name: "Old" };

    const updateData: UpdateClassData = { name: "New" };
    const updated = await service.update("class-1", updateData);

    expect(repo.updated).toEqual({ id: "class-1", data: updateData });
    expect(updated.name).toBe("New");
  });

  it("update should throw HTTPException when class does not exist", async () => {
    const repo = new FakeClassRepository();
    const service = new ClassService(repo);

    await expect(service.update("missing", { name: "New" })).rejects.toBeInstanceOf(HTTPException);
  });

  it("delete should require existing class and delegate to repository", async () => {
    const repo = new FakeClassRepository();
    const service = new ClassService(repo);

    // @ts-expect-error
    repo.classesById["class-1"] = { id: "class-1", school_id: "school-1", name: "To delete" };

    await service.delete("class-1");

    expect(repo.deletedIds).toContain("class-1");
  });

  it("delete should throw HTTPException when class does not exist", async () => {
    const repo = new FakeClassRepository();
    const service = new ClassService(repo);

    await expect(service.delete("missing")).rejects.toBeInstanceOf(HTTPException);
  });

  it("assignTeacher should require existing class then delegate", async () => {
    const repo = new FakeClassRepository();
    const service = new ClassService(repo);

    // @ts-expect-error
    repo.classesById["class-1"] = { id: "class-1", school_id: "school-1", name: "A" };

    const period: AssignmentPeriod = { academic_year: "2025-2026", semester: 1 };
    const assignment = await service.assignTeacher("class-1", "teacher-1", period);

    expect(assignment.class_id).toBe("class-1");
    expect(assignment.teacher_id).toBe("teacher-1");
  });

  it("getTeachers should call repository after existence check", async () => {
    const repo = new FakeClassRepository();
    const service = new ClassService(repo);

    // @ts-expect-error
    repo.classesById["class-1"] = { id: "class-1", school_id: "school-1", name: "A" };
    // @ts-expect-error
    repo.teacherAssignments.push({ id: "tc-1", class_id: "class-1", teacher_id: "teacher-1", academic_year: "2025-2026", semester: 1 });

    const teachers = await service.getTeachers("class-1");
    expect(teachers.length).toBe(1);
    expect(teachers[0].teacher_id).toBe("teacher-1");
  });

  it("assignStudent and getStudents should work with existence check", async () => {
    const repo = new FakeClassRepository();
    const service = new ClassService(repo);

    // @ts-expect-error
    repo.classesById["class-1"] = { id: "class-1", school_id: "school-1", name: "A" };

    const period: AssignmentPeriod = { academic_year: "2025-2026", semester: 1 };
    await service.assignStudent("class-1", "student-1", period);

    const students = await service.getStudents("class-1");
    expect(students.length).toBe(1);
    expect(students[0].student_id).toBe("student-1");
  });
});

