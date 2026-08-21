const summaryCards = [
  { label: "Tổng học sinh", value: 3, accent: "text-blue-600" },
  { label: "Tổng lớp học", value: 3, accent: "text-emerald-600" },
  { label: "Môn học", value: 3, accent: "text-purple-600" },
  { label: "Học phí chưa thu", value: 2, accent: "text-amber-600" },
];

const recentRemarks = [
  {
    id: 1,
    studentName: "Nguyễn Văn An",
    content: "Tích cực phát biểu trong giờ Toán.",
    date: "2026-08-18",
  },
  {
    id: 2,
    studentName: "Trần Thị Bình",
    content: "Cần cải thiện bài tập về nhà môn Ngữ văn.",
    date: "2026-08-17",
  },
];

const upcomingSchedules = [
  { id: 1, className: "6A1", subjectName: "Toán", startTime: "07:30", endTime: "09:00" },
  { id: 2, className: "7A1", subjectName: "Tiếng Anh", startTime: "13:30", endTime: "15:00" },
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
        {/* Recent remarks */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Nhận xét gần đây
          </h2>

          <div className="mt-4 space-y-3">
            {recentRemarks.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có nhận xét nào.</p>
            ) : (
              recentRemarks.map((remark) => (
                <div
                  key={remark.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {remark.studentName}
                    </span>

                    <span className="text-xs text-gray-500">
                      {new Date(remark.date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-600">
                    {remark.content}
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

          <div className="mt-4 space-y-3">
            {upcomingSchedules.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có lịch học nào.</p>
            ) : (
              upcomingSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {schedule.className}
                    </span>

                    <span className="ml-2 text-sm text-gray-700">
                      {schedule.subjectName}
                    </span>
                  </div>

                  <span className="text-xs text-gray-500">
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
