import { describe, it, expect } from "bun:test";
import { SchoolService } from "../module/school/school.service";
import type { ISchoolRepository, UpdateSchoolData } from "../module/school/ISchoolRepository";
import type { School, CreateSchool } from "../db/school.schema";
import { HTTPException } from "hono/http-exception";

class FakeSchoolRepository implements ISchoolRepository {
  public created: CreateSchool | null = null;
  public schoolsById: Record<string, School | null> = {};
  public updated: { id: string; data: UpdateSchoolData } | null = null;

  async create(data: CreateSchool): Promise<School> {
    this.created = data;
    const school: School = {
      id: "school-1",
      school_name: data.school_name ?? "PAUD A",
      address: data.address ?? null,
      school_type: data.school_type ?? null,
      school_category: data.school_category ?? null,
      npsn: data.npsn ?? null,
      accreditation: data.accreditation ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.schoolsById[school.id] = school;
    return school;
  }

  async findById(id: string): Promise<School | null> {
    return this.schoolsById[id] ?? null;
  }

  async update(id: string, data: UpdateSchoolData): Promise<School> {
    this.updated = { id, data };
    const existing = this.schoolsById[id];
    const updated: School = {
      ...(existing as School),
      address: data.address ?? (existing as School).address,
      school_type: data.school_type ?? (existing as School).school_type,
      school_category: data.school_category ?? (existing as School).school_category,
      npsn: data.npsn ?? (existing as School).npsn,
      accreditation: data.accreditation ?? (existing as School).accreditation,
    };
    this.schoolsById[id] = updated;
    return updated;
  }
}

describe("SchoolService", () => {
  it("create should delegate to repository", async () => {
    const repo = new FakeSchoolRepository();
    const service = new SchoolService(repo);

    const input: CreateSchool = { school_name: "PAUD A", address: "Alamat" };

    const result = await service.create(input);

    expect(repo.created).toEqual(input);
    expect(result.id).toBeDefined();
    expect(result.school_name).toBe("PAUD A");
  });

  it("findById should return school when found", async () => {
    const repo = new FakeSchoolRepository();
    const service = new SchoolService(repo);

    const existing: School = {
      id: "school-1",
      school_name: "PAUD A",
      address: "Alamat",
      school_type: "negeri",
      school_category: "tk",
      npsn: "123",
      accreditation: "A",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repo.schoolsById["school-1"] = existing;

    const result = await service.findById("school-1");
    expect(result).toEqual(existing);
  });

  it("findById should throw HTTPException when not found", async () => {
    const repo = new FakeSchoolRepository();
    const service = new SchoolService(repo);

    await expect(service.findById("missing")).rejects.toBeInstanceOf(HTTPException);
  });

  it("update should require existing school and delegate", async () => {
    const repo = new FakeSchoolRepository();
    const service = new SchoolService(repo);

    repo.schoolsById["school-1"] = {
      id: "school-1",
      school_name: "Old",
      address: "Old addr",
      school_type: "negeri",
      school_category: "tk",
      npsn: "123",
      accreditation: "A",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateData: UpdateSchoolData = { address: "New addr" };
    const updated = await service.update("school-1", updateData);

    expect(repo.updated).toEqual({ id: "school-1", data: updateData });
    expect(updated.address).toBe("New addr");
  });

  it("update should throw HTTPException when school does not exist", async () => {
    const repo = new FakeSchoolRepository();
    const service = new SchoolService(repo);

    await expect(service.update("missing", { address: "New" })).rejects.toBeInstanceOf(HTTPException);
  });
});

