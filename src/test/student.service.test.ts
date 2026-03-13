import { describe, it, expect } from "bun:test";
import { StudentService } from "../module/student/student.service";
import type { IStudentRepository, CreateStudentData, UpdateStudentData } from "../module/student/IStudentRepository";
import type { Student } from "../db/student.schema";
import { HTTPException } from "hono/http-exception";

class FakeStudentRepository implements IStudentRepository {
  public created: CreateStudentData | null = null;
  public getAllArgs: { limit: number; offset: number; condition: unknown } | null = null;
  public studentsById: Record<string, Student | null> = {};
  public studentsByParentId: Record<string, Student[]> = {};
  public updated: { id: string; data: UpdateStudentData } | null = null;
  public deletedIds: string[] = [];

  async create(data: CreateStudentData): Promise<Student> {
    this.created = data;
    const student: Student = {
      id: "generated-id",
      parent_id: data.parent_id,
      school_id: data.school_id,
      nis: data.nis ?? null,
      name: data.name,
      nickname: data.nickname ?? null,
      gender: data.gender ?? null,
      birthday: (data.birthday as any) ?? null,
      birthplace: data.birthplace ?? null,
      address: data.address ?? null,
      picture: data.picture ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.studentsById[student.id] = student;
    return student;
  }

  async getAll({ limit, offset, condition }: { limit: number; offset: number; condition: unknown }): Promise<{ data: Student[]; total: { count: number } }> {
    this.getAllArgs = { limit, offset, condition };
    return { data: Object.values(this.studentsById).filter(Boolean) as Student[], total: { count: Object.values(this.studentsById).length } };
  }

  async findById(id: string): Promise<Student | null> {
    return this.studentsById[id] ?? null;
  }

  async findByParentId(parentId: string): Promise<Student[]> {
    return this.studentsByParentId[parentId] ?? [];
  }

  async update(id: string, data: UpdateStudentData): Promise<Student> {
    this.updated = { id, data };
    const existing = this.studentsById[id];
    const updated: Student = {
      ...(existing as Student),
      ...data,
    };
    this.studentsById[id] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.deletedIds.push(id);
    delete this.studentsById[id];
  }
}

describe("StudentService", () => {
  it("create should delegate to repository and return created student", async () => {
    const repo = new FakeStudentRepository();
    const service = new StudentService(repo);

    const input: CreateStudentData = {
      parent_id: "parent-1",
      school_id: "school-1",
      nis: "123",
      name: "John Doe",
      nickname: "John",
      gender: "laki-laki",
      birthday: "2024-01-01",
      birthplace: "City",
      address: "Street",
      picture: "pic.jpg",
    };

    const result = await service.create(input);

    expect(repo.created).toEqual(input);
    expect(result.id).toBeDefined();
    expect(result.name).toBe("John Doe");
  });

  it("getAll should pass pagination and filters to repository", async () => {
    const repo = new FakeStudentRepository();
    const service = new StudentService(repo);

    await service.getAll({
      search: "john",
      parent_id: "parent-1",
      limit: 10,
      offset: 0,
      page: 1,
    });

    expect(repo.getAllArgs).not.toBeNull();
    expect(repo.getAllArgs?.limit).toBe(10);
    expect(repo.getAllArgs?.offset).toBe(0);
    // We only assert condition is defined when filters are provided, without checking SQL internals
    expect(repo.getAllArgs?.condition).toBeDefined();
  });

  it("findById should return student when found", async () => {
    const repo = new FakeStudentRepository();
    const service = new StudentService(repo);

    // Seed repository
    // @ts-expect-error - partial student shape is enough for test
    const existing: Student = { id: "student-1", name: "Existing", parent_id: "parent-1" };
    repo.studentsById["student-1"] = existing;

    const result = await service.findById("student-1");
    expect(result).toEqual(existing);
  });

  it("findById should throw HTTPException when not found", async () => {
    const repo = new FakeStudentRepository();
    const service = new StudentService(repo);

    await expect(service.findById("unknown-id")).rejects.toBeInstanceOf(HTTPException);
  });

  it("update should require existing student and delegate to repository", async () => {
    const repo = new FakeStudentRepository();
    const service = new StudentService(repo);

    // Seed existing
    // @ts-expect-error - partial student shape is enough for test
    repo.studentsById["student-1"] = { id: "student-1", name: "Old Name", parent_id: "parent-1" };

    const updateData: UpdateStudentData = {
      name: "New Name",
    };

    const updated = await service.update("student-1", updateData);

    expect(repo.updated).toEqual({ id: "student-1", data: updateData });
    expect(updated.name).toBe("New Name");
  });

  it("update should throw HTTPException when student does not exist", async () => {
    const repo = new FakeStudentRepository();
    const service = new StudentService(repo);

    await expect(service.update("missing-id", { name: "New" } as UpdateStudentData)).rejects.toBeInstanceOf(HTTPException);
  });

  it("delete should require existing student and delegate to repository", async () => {
    const repo = new FakeStudentRepository();
    const service = new StudentService(repo);

    // Seed existing
    // @ts-expect-error - partial student shape is enough for test
    repo.studentsById["student-1"] = { id: "student-1", name: "To delete", parent_id: "parent-1" };

    await service.delete("student-1");

    expect(repo.deletedIds).toContain("student-1");
  });

  it("delete should throw HTTPException when student does not exist", async () => {
    const repo = new FakeStudentRepository();
    const service = new StudentService(repo);

    await expect(service.delete("missing-id")).rejects.toBeInstanceOf(HTTPException);
  });
});

