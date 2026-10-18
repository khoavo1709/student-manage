import axios from "axios";
import { apiClient } from "./apiClient";

// Moi response tu server deu co dang { success, data, error }.
interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

async function unwrap<T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  try {
    const { data } = await request;
    if (!data.success) {
      throw new Error(data.error ?? "Yêu cầu thất bại");
    }
    return data.data as T;
  } catch (error) {
    console.log("API request failed", error);
    if (axios.isAxiosError(error)) {
      const serverMessage = (error.response?.data as ApiEnvelope<unknown> | undefined)?.error;
      throw new Error(serverMessage ?? error.message);
    }
    throw error;
  }
}

// "2026-08-05T00:00:00.000Z" -> "2026-08-05"
function toDateOnly(value: string | null): string | null {
  return value ? value.slice(0, 10) : null;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Đã có lỗi xảy ra";
}

// ---------- Classes ----------

export type ClassItem = {
  id: number;
  name: string;
  tuitionFee: number;
  studentCount: number;
};

type ApiClass = {
  id: number;
  name: string;
  tuitionFee: number;
  students?: { studentId: number }[];
};

export type ClassInput = { name: string; tuitionFee: number };

function mapClass(item: ApiClass): ClassItem {
  return {
    id: item.id,
    name: item.name,
    tuitionFee: item.tuitionFee,
    studentCount: item.students?.length ?? 0,
  };
}

export const classApi = {
  async list(): Promise<ClassItem[]> {
    const items = await unwrap<ApiClass[]>(
      apiClient.get("/classes", { params: { includeStudents: "true" } })
    );
    return items.map(mapClass);
  },
  async create(input: ClassInput): Promise<ClassItem> {
    return mapClass(await unwrap<ApiClass>(apiClient.post("/classes", input)));
  },
  async update(id: number, input: ClassInput): Promise<ClassItem> {
    return mapClass(await unwrap<ApiClass>(apiClient.put(`/classes/${id}`, input)));
  },
  async remove(id: number): Promise<void> {
    await unwrap<null>(apiClient.delete(`/classes/${id}`));
  },
};

// ---------- Students ----------

export type Student = {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  classIds: number[];
  classNames: string[];
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
};

type ApiStudent = {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianRelation: string | null;
  classes: { class: { id: number; name: string } }[];
};

export type StudentInput = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  classIds: number[];
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
};

// Trang hoc sinh loc/tim kiem phia client nen lay toan bo danh sach.
const ALL_STUDENTS_LIMIT = 10000;

function mapStudent(item: ApiStudent): Student {
  return {
    id: item.id,
    fullName: item.fullName,
    dateOfBirth: toDateOnly(item.dateOfBirth) ?? "",
    gender: item.gender,
    address: item.address ?? "",
    classIds: item.classes.map((entry) => entry.class.id),
    classNames: item.classes.map((entry) => entry.class.name),
    guardianName: item.guardianName ?? "",
    guardianPhone: item.guardianPhone ?? "",
    guardianRelation: item.guardianRelation ?? "",
  };
}

export const studentApi = {
  async list(): Promise<Student[]> {
    const result = await unwrap<{ students: ApiStudent[] }>(
      apiClient.get("/students", { params: { page: 1, limit: ALL_STUDENTS_LIMIT } })
    );
    return result.students.map(mapStudent);
  },
  async create(input: StudentInput): Promise<Student> {
    return mapStudent(await unwrap<ApiStudent>(apiClient.post("/students", input)));
  },
  async update(id: number, input: StudentInput): Promise<Student> {
    return mapStudent(await unwrap<ApiStudent>(apiClient.put(`/students/${id}`, input)));
  },
  async remove(id: number): Promise<void> {
    await unwrap<null>(apiClient.delete(`/students/${id}`));
  },
};

// ---------- Scores ----------

export type Score = {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  examName: string;
  value: number;
  date: string;
  note: string;
};

type ApiScore = {
  id: number;
  studentId: number;
  classId: number;
  examName: string;
  value: number;
  date: string;
  note: string | null;
  student?: { id: number; fullName: string };
  class?: { id: number; name: string };
};

export type ScoreInput = {
  studentId: number;
  classId: number;
  examName: string;
  value: number;
  date: string;
  note: string;
};

function mapScore(item: ApiScore): Score {
  return {
    id: item.id,
    studentId: item.studentId,
    studentName: item.student?.fullName ?? "",
    classId: item.classId,
    className: item.class?.name ?? "",
    examName: item.examName,
    value: item.value,
    date: toDateOnly(item.date) ?? "",
    note: item.note ?? "",
  };
}

export const scoreApi = {
  async list(): Promise<Score[]> {
    return (await unwrap<ApiScore[]>(apiClient.get("/scores"))).map(mapScore);
  },
  async create(input: ScoreInput): Promise<Score> {
    return mapScore(await unwrap<ApiScore>(apiClient.post("/scores", input)));
  },
  async update(id: number, input: ScoreInput): Promise<Score> {
    return mapScore(await unwrap<ApiScore>(apiClient.put(`/scores/${id}`, input)));
  },
  async remove(id: number): Promise<void> {
    await unwrap<null>(apiClient.delete(`/scores/${id}`));
  },
};

// ---------- Tuitions ----------

export type TuitionStatus = "da dong" | "chua dong";

export type Tuition = {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  tuitionFee: number;
  year: number;
  month: number;
  status: TuitionStatus;
  paidDate: string | null;
};

type ApiTuition = {
  id: number;
  studentId: number;
  classId: number;
  year: number;
  month: number;
  status: string;
  paidDate: string | null;
  student?: { id: number; fullName: string };
  class?: { id: number; name: string; tuitionFee: number };
};

export type TuitionInput = {
  studentId: number;
  classId: number;
  year: number;
  month: number;
  status: TuitionStatus;
  paidDate: string | null;
};

export type PayTuitionsInput = {
  studentId: number;
  classId: number;
  months: { year: number; month: number }[];
  paidDate: string;
};

function mapTuition(item: ApiTuition): Tuition {
  return {
    id: item.id,
    studentId: item.studentId,
    studentName: item.student?.fullName ?? "",
    classId: item.classId,
    className: item.class?.name ?? "",
    tuitionFee: item.class?.tuitionFee ?? 0,
    year: item.year,
    month: item.month,
    status: item.status === "da dong" ? "da dong" : "chua dong",
    paidDate: toDateOnly(item.paidDate),
  };
}

export const tuitionApi = {
  async list(): Promise<Tuition[]> {
    return (await unwrap<ApiTuition[]>(apiClient.get("/tuitions"))).map(mapTuition);
  },
  async create(input: TuitionInput): Promise<Tuition> {
    return mapTuition(await unwrap<ApiTuition>(apiClient.post("/tuitions", input)));
  },
  async update(id: number, input: Partial<TuitionInput>): Promise<Tuition> {
    return mapTuition(await unwrap<ApiTuition>(apiClient.put(`/tuitions/${id}`, input)));
  },
  async remove(id: number): Promise<void> {
    await unwrap<null>(apiClient.delete(`/tuitions/${id}`));
  },
  // Đánh dấu đã đóng nhiều tháng cùng lúc (tạo mới hoặc cập nhật).
  async pay(input: PayTuitionsInput): Promise<Tuition[]> {
    return (await unwrap<ApiTuition[]>(apiClient.post("/tuitions/pay", input))).map(mapTuition);
  },
};

// ---------- Schedules ----------

export type Schedule = {
  id: number;
  classId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
};

type ApiSchedule = Omit<Schedule, "startDate" | "endDate"> & {
  startDate: string;
  endDate: string;
};

export type ScheduleInput = Omit<Schedule, "id">;

function mapSchedule(item: ApiSchedule): Schedule {
  return {
    ...item,
    startDate: toDateOnly(item.startDate) ?? "",
    endDate: toDateOnly(item.endDate) ?? "",
  };
}

export const scheduleApi = {
  async list(): Promise<Schedule[]> {
    return (await unwrap<ApiSchedule[]>(apiClient.get("/schedules"))).map(mapSchedule);
  },
  async create(input: ScheduleInput): Promise<Schedule> {
    return mapSchedule(await unwrap<ApiSchedule>(apiClient.post("/schedules", input)));
  },
  async update(id: number, input: ScheduleInput): Promise<Schedule> {
    return mapSchedule(await unwrap<ApiSchedule>(apiClient.put(`/schedules/${id}`, input)));
  },
  async remove(id: number): Promise<void> {
    await unwrap<null>(apiClient.delete(`/schedules/${id}`));
  },
};
