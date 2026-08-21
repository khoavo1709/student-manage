const summaryCards = [
  { label: "Tổng học sinh", value: 3, accent: "text-blue-600" },
  { label: "Tổng lớp học", value: 3, accent: "text-emerald-600" },
  { label: "Điểm đã nhập", value: 3, accent: "text-purple-600" },
  { label: "Học phí chưa thu", value: 2, accent: "text-amber-600" },
];

// Demo: ghi chú lấy từ note của đợt điểm gần nhất theo học sinh (nguồn: trang Điểm số).
const recentScoreNotes = [
  {
    id: 1,
    studentName: "Nguyễn Văn An",
    examName: "Đợt 2",
    note: "Tiến bộ rõ rệt",
    date: "2026-08-19",
  },
];

const dayOfWeekLabels = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

const upcomingSchedules = [
  { id: 1, className: "Toán lớp 6", dayOfWeek: 2, startTime: "07:30", endTime: "09:00" },
  { id: 2, className: "Lý lớp 7", dayOfWeek: 3, startTime: "13:30", endTime: "15:00" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tổng quan</h1>

        <p className="mt-1 text-sm text-gray-500">
          Thống kê nhanh về tình hình lớp học
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{card.label}</p>

            <p className={`mt-2 text-3xl font-semibold ${card.accent}`}>
              {card.value}
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
                      {new Date(item.date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-600">{item.note}</p>
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
