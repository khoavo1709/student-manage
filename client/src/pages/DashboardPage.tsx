import { useApiData } from "../hooks/useApiData";
import {
  classApi,
  scheduleApi,
  scoreApi,
  studentApi,
  tuitionApi,
  type ClassItem,
  type Schedule,
  type Score,
  type Student,
  type Tuition,
} from "../services/api";
import { formatDateVN } from "../utils/date";
import { buildTuitionRows, monthKey } from "../utils/tuition";

const dayOfWeekLabels = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

const UPCOMING_LIMIT = 5;

function currentMonthKey() {
  const now = new Date();
  return monthKey({ year: now.getFullYear(), month: now.getMonth() + 1 });
}

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Ghi chu cua dot kiem tra gan nhat (co ghi chu) theo tung hoc sinh.
function getRecentScoreNotes(scores: Score[]) {
  const latestByStudent = new Map<number, Score>();
  for (const score of scores) {
    if (!score.note) continue;
    const current = latestByStudent.get(score.studentId);
    if (!current || score.date > current.date) {
      latestByStudent.set(score.studentId, score);
    }
  }
  return [...latestByStudent.values()].sort((a, b) => b.date.localeCompare(a.date));
}

// Lich dang con hieu luc, sap theo ngay gan nhat tinh tu hom nay roi theo gio bat dau.
function getUpcomingSchedules(schedules: Schedule[], classes: ClassItem[]) {
  const today = todayIso();
  const todayDay = new Date().getDay();
  const classNameById = new Map(classes.map((item) => [item.id, item.name]));

  return schedules
    .filter((item) => item.startDate <= today && item.endDate >= today)
    .map((item) => ({
      ...item,
      className: classNameById.get(item.classId) ?? "-",
      daysAway: (item.dayOfWeek - todayDay + 7) % 7,
    }))
    .sort((a, b) => a.daysAway - b.daysAway || a.startTime.localeCompare(b.startTime))
    .slice(0, UPCOMING_LIMIT);
}

export default function DashboardPage() {
  const students = useApiData<Student[]>(studentApi.list, []);
  const classes = useApiData<ClassItem[]>(classApi.list, []);
  const scores = useApiData<Score[]>(scoreApi.list, []);
  const tuitions = useApiData<Tuition[]>(tuitionApi.list, []);
  const schedules = useApiData<Schedule[]>(scheduleApi.list, []);

  const sources = [students, classes, scores, tuitions, schedules];
  const loading = sources.some((source) => source.loading);
  const loadError = sources.find((source) => source.error)?.error ?? null;

  const summaryCards = [
    { label: "Tổng học sinh", value: students.data.length, accent: "text-blue-600" },
    { label: "Tổng lớp học", value: classes.data.length, accent: "text-emerald-600" },
    { label: "Điểm đã nhập", value: scores.data.length, accent: "text-purple-600" },
    {
      // Chỉ tính các tháng đã đến hạn (tới tháng hiện tại), không tính tháng tương lai.
      label: "Học phí chưa thu",
      value: buildTuitionRows(students.data, classes.data, schedules.data, tuitions.data).filter(
        (row) => row.status === "chua dong" && monthKey(row) <= currentMonthKey()
      ).length,
      accent: "text-amber-600",
    },
  ];
  const recentScoreNotes = getRecentScoreNotes(scores.data);
  const upcomingSchedules = getUpcomingSchedules(schedules.data, classes.data);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tổng quan</h1>

        <p className="mt-1 text-sm text-gray-500">
          Thống kê nhanh về tình hình lớp học
        </p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Không tải được dữ liệu: {loadError}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{card.label}</p>

            <p className={`mt-2 text-3xl font-semibold ${card.accent}`}>
              {loading ? "…" : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent score notes */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Ghi chú gần đây
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Ghi chú từ đợt kiểm tra gần nhất của mỗi học sinh
          </p>

          <div className="mt-4 space-y-3">
            {recentScoreNotes.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có ghi chú nào.</p>
            ) : (
              recentScoreNotes.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {item.studentName}
                      <span className="ml-1 font-normal text-gray-500">
                        ({item.examName})
                      </span>
                    </span>

                    <span className="text-xs text-gray-500">
                      {formatDateVN(item.date)}
                    </span>
                  </div>

                  <p
                    title={item.note}
                    className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm text-gray-600"
                  >
                    {item.note}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming schedules */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Lịch học sắp tới
          </h2>

          <div className="mt-4 space-y-2">
            {upcomingSchedules.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có lịch học nào.</p>
            ) : (
              upcomingSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:border-indigo-100 hover:bg-indigo-50/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {schedule.className}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {dayOfWeekLabels[schedule.dayOfWeek]}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200">
                    {schedule.startTime} - {schedule.endTime}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
