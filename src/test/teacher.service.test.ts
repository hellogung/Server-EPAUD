import { describe, it, expect } from "bun:test";
import { TeacherService } from "../module/teacher/teacher.service";
import type { ITeacherRepository, CreateTeacherData, UpdateTeacherData } from "../module/teacher/ITeacherRepository";
import type { Teacher } from "../db/teacher.schema";
import { HTTPException } from "hono/http-exception";

class FakeTeacherRepository implements ITeacherRepository {
  public created: CreateTeacherData | null = null;
  public getAllArgs: { limit: number; offset: number; condition: unknown } | null = null;
  public teachersById: Record<string, Teacher | null> = {};
  public updated: { id: string; data: UpdateTeacherData } | null = null;
  public deletedIds: string[] = [];

  async create(data: CreateTeacherData): Promise<Teacher> {
    this.created = data;
    const teacher: Teacher = {
      id: "teacher-1",
      name: data.name,
      address: data.address ?? "",
      school_id: data.school_id ?? "school-1",
      kelurahan: data.kelurahan ?? "",
      kecamatan: data.kecamatan ?? "",
      kota: data.kota ?? "",
      provinsi: data.provinsi ?? "",
      id_attendance: data.id_attendance ?? null,
      academic: data.academic ?? null,
      gender: data.gender ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      birthday: null,
      joindate: null,
      exitdate: null,
      picture: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user_id: "user-1",
    };
    this.teachersById[teacher.id] = teacher;
    return teacher;
  }

  async getAll({ limit, offset, condition }: { limit: number; offset: number; condition: unknown }): Promise<{ data: Teacher[]; total: { count: number } }> {
    this.getAllArgs = { limit, offset, condition };
    const data = Object.values(this.teachersById).filter(Boolean) as Teacher[];
    return { data, total: { count: data.length } };
  }

  async findById(id: string): Promise<Teacher | null> {
    return this.teachersById[id] ?? null;
  }

  async update(id: string, data: UpdateTeacherData): Promise<Teacher> {
    this.updated = { id, data };
    const existing = this.teachersById[id];
    const updated: Teacher = {
      ...(existing as Teacher),
      ...data,
    };
    this.teachersById[id] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.deletedIds.push(id);
    delete this.teachersById[id];
  }
}

describe("TeacherService", () => {
  it("create should delegate to repository", async () => {
    const repo = new FakeTeacherRepository();
    const service = new TeacherService(repo);

    const input: CreateTeacherData = {
      name: "Guru A",
      address: "Alamat",
      school_id: "school-1",
      kelurahan: "Kel",
      kecamatan: "Kec",
      kota: "City",
      provinsi: "Prov",
    };

    const result = await service.create(input);

    expect(repo.created).toEqual(input);
    expect(result.id).toBeDefined();
    expect(result.name).toBe("Guru A");
  });

  it("getAll should pass search and pagination", async () => {
    const repo = new FakeTeacherRepository();
    const service = new TeacherService(repo);

    await service.getAll({
      search: "Guru",
      limit: 10,
      offset: 0,
      page: 1,
    });

    expect(repo.getAllArgs).not.toBeNull();
    expect(repo.getAllArgs?.limit).toBe(10);
    expect(repo.getAllArgs?.offset).toBe(0);
    expect(repo.getAllArgs?.condition).toBeDefined();
  });

  it("findById should return teacher when found", async () => {
    const repo = new FakeTeacherRepository();
    const service = new TeacherService(repo);

    // @ts-expect-error
    const existing: Teacher = { id: "teacher-1", name: "Guru A" };
    repo.teachersById["teacher-1"] = existing;

    const result = await service.findById("teacher-1");
    expect(result).toEqual(existing);
  });

  it("findById should throw HTTPException when not found", async () => {
    const repo = new FakeTeacherRepository();
    const service = new TeacherService(repo);

    await expect(service.findById("missing")).rejects.toBeInstanceOf(HTTPException);
  });

  it("update should require existing teacher and delegate", async () => {
    const repo = new FakeTeacherRepository();
    const service = new TeacherService(repo);

    // @ts-expect-error
    repo.teachersById["teacher-1"] = { id: "teacher-1", name: "Old" };

    const updateData: UpdateTeacherData = { name: "New" };
    const updated = await service.update("teacher-1", updateData);

    expect(repo.updated).toEqual({ id: "teacher-1", data: updateData });
    expect(updated.name).toBe("New");
  });

  it("update should throw HTTPException when teacher does not exist", async () => {
    const repo = new FakeTeacherRepository();
    const service = new TeacherService(repo);

    await expect(service.update("missing", { name: "New" })).rejects.toBeInstanceOf(HTTPException);
  });

  it("delete should require existing teacher and delegate", async () => {
    const repo = new FakeTeacherRepository();
    const service = new TeacherService(repo);

    // @ts-expect-error
    repo.teachersById["teacher-1"] = { id: "teacher-1", name: "To delete" };

    await service.delete("teacher-1");

    expect(repo.deletedIds).toContain("teacher-1");
  });

  it("delete should throw HTTPException when teacher does not exist", async () => {
    const repo = new FakeTeacherRepository();
    const service = new TeacherService(repo);

    await expect(service.delete("missing")).rejects.toBeInstanceOf(HTTPException);
  });
});

