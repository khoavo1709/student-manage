const classScoreReport = [
  { className: "Toán lớp 6", studentName: "Nguyễn Văn An", averageScore: 8.75 },
  { className: "Toán lớp 6", studentName: "Trần Thị Bình", averageScore: 7.0 },
  { className: "Lý lớp 7", studentName: "Lê Minh Đức", averageScore: 6.8 },
];

const tuitionReport = [
  { month: 8, year: 2026, totalCollected: 1500000, totalPending: 3300000 },
  { month: 7, year: 2026, totalCollected: 4800000, totalPending: 0 },
];

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + " đ";
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Báo cáo</h1>

        <p className="mt-1 text-sm text-gray-500">
          Tổng hợp điểm số và học phí
        </p>
      </div>

      {/* Score report */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Điểm trung bình theo học sinh
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Học sinh
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">Lớp</th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Điểm trung bình
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {classScoreReport.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Chưa có dữ liệu điểm số.
                  </td>
                </tr>
              ) : (
                classScoreReport.map((row) => (
                  <tr
                    key={`${row.className}-${row.studentName}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.studentName}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {row.className}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.averageScore.toFixed(1)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tuition report */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Thống kê học phí theo tháng
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  Tháng/Năm
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Đã thu
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Chưa thu
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {tuitionReport.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Chưa có dữ liệu học phí.
                  </td>
                </tr>
              ) : (
                tuitionReport.map((row) => (
                  <tr key={`${row.month}-${row.year}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      {row.month}/{row.year}
                    </td>

                    <td className="px-4 py-3 font-medium text-emerald-600">
                      {formatCurrency(row.totalCollected)}
                    </td>

                    <td className="px-4 py-3 font-medium text-amber-600">
                      {formatCurrency(row.totalPending)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
