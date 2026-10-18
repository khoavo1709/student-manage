import type { ClassItem, Schedule, Student, Tuition, TuitionStatus } from "../services/api";

// 1 dong hoc phi = 1 (hoc sinh, lop, thang). Thang nao chua co ban ghi thi mac dinh "chua dong".
export type TuitionRow = {
  key: string;
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  tuitionFee: number;
  year: number;
  month: number;
  status: TuitionStatus;
  paidDate: string | null;
  recordId: number | null;
};

export type YearMonth = { year: number; month: number };

export function monthKey({ year, month }: YearMonth) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function rowKey(studentId: number, classId: number, period: YearMonth) {
  return `${studentId}|${classId}|${monthKey(period)}`;
}

// Cac thang tu startDate den endDate ("YYYY-MM-DD"), tinh ca thang dau va thang cuoi.
export function monthsBetween(startDate: string, endDate: string): YearMonth[] {
  const [startYear, startMonth] = startDate.split("-").map(Number);
  const [endYear, endMonth] = endDate.split("-").map(Number);
  const months: YearMonth[] = [];
  for (let year = startYear, month = startMonth; year < endYear || (year === endYear && month <= endMonth); ) {
    months.push({ year, month });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return months;
}

// Khoang thoi gian hoc cua moi lop = tu ngay bat dau som nhat den ngay ket thuc muon nhat
// trong cac lich hoc cua lop do.
export function getClassMonths(schedules: Schedule[]): Map<number, YearMonth[]> {
  const ranges = new Map<number, { start: string; end: string }>();
  for (const schedule of schedules) {
    const range = ranges.get(schedule.classId);
    ranges.set(schedule.classId, {
      start: !range || schedule.startDate < range.start ? schedule.startDate : range.start,
      end: !range || schedule.endDate > range.end ? schedule.endDate : range.end,
    });
  }
  return new Map(
    [...ranges].map(([classId, range]) => [classId, monthsBetween(range.start, range.end)])
  );
}

export function buildTuitionRows(
  students: Student[],
  classes: ClassItem[],
  schedules: Schedule[],
  tuitions: Tuition[]
): TuitionRow[] {
  const classById = new Map(classes.map((item) => [item.id, item]));
  const classMonths = getClassMonths(schedules);
  const recordByKey = new Map(
    tuitions.map((item) => [rowKey(item.studentId, item.classId, item), item])
  );
  const rows = new Map<string, TuitionRow>();

  for (const student of students) {
    for (const classId of student.classIds) {
      const classItem = classById.get(classId);
      if (!classItem) continue;
      for (const period of classMonths.get(classId) ?? []) {
        const key = rowKey(student.id, classId, period);
        const record = recordByKey.get(key);
        rows.set(key, {
          key,
          studentId: student.id,
          studentName: student.fullName,
          classId,
          className: classItem.name,
          tuitionFee: classItem.tuitionFee,
          ...period,
          status: record?.status ?? "chua dong",
          paidDate: record?.paidDate ?? null,
          recordId: record?.id ?? null,
        });
      }
    }
  }

  // Ban ghi nam ngoai lich hoc (vd: hoc sinh da roi lop) van hien de khong mat lich su.
  for (const record of tuitions) {
    const key = rowKey(record.studentId, record.classId, record);
    if (rows.has(key)) continue;
    rows.set(key, {
      key,
      studentId: record.studentId,
      studentName: record.studentName,
      classId: record.classId,
      className: record.className,
      tuitionFee: record.tuitionFee,
      year: record.year,
      month: record.month,
      status: record.status,
      paidDate: record.paidDate,
      recordId: record.id,
    });
  }

  return [...rows.values()].sort(
    (a, b) =>
      a.studentName.localeCompare(b.studentName, "vi") ||
      a.className.localeCompare(b.className, "vi") ||
      a.year - b.year ||
      a.month - b.month
  );
}
