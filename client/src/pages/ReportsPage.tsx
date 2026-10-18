import { useApiData } from "../hooks/useApiData";
import {
  classApi,
  scheduleApi,
  scoreApi,
  studentApi,
  tuitionApi,
  type Score,
} from "../services/api";
import { buildTuitionRows, type TuitionRow } from "../utils/tuition";

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + " đ";
}

// Diem trung binh theo tung cap (hoc sinh, lop).
function buildClassScoreReport(scores: Score[]) {
  const groups = new Map<string, { className: string; studentName: string; total: number; count: number }>();
  for (const score of scores) {
    const key = `${score.studentId}-${score.classId}`;
    const group = groups.get(key) ?? {
      className: score.className,
      studentName: score.studentName,
      total: 0,
      count: 0,
    };
    group.total += score.value;
    group.count += 1;
    groups.set(key, group);
  }
  return [...groups.values()]
    .map(({ className, studentName, total, count }) => ({
      className,
      studentName,
      averageScore: total / count,
    }))
    .sort(
      (a, b) =>
        a.className.localeCompare(b.className, "vi") ||
        a.studentName.localeCompare(b.studentName, "vi")
    );
}

// Tong da thu / chua thu theo thang, thang moi nhat len dau.
function buildTuitionReport(tuitions: TuitionRow[]) {
  const groups = new Map<string, { month: number; year: number; totalCollected: number; totalPending: number }>();
  for (const tuition of tuitions) {
    const key = `${tuition.year}-${tuition.month}`;
    const group = groups.get(key) ?? {
      month: tuition.month,
      year: tuition.year,
      totalCollected: 0,
      totalPending: 0,
    };
    if (tuition.status === "da dong") {
      group.totalCollected += tuition.tuitionFee;
    } else {
      group.totalPending += tuition.tuitionFee;
    }
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.year - a.year || b.month - a.month);
}

export default function ReportsPage() {
  const scores = useApiData<Score[]>(scoreApi.list, []);
  const tuitionRecords = useApiData(tuitionApi.list, []);
  const students = useApiData(studentApi.list, []);
  const classes = useApiData(classApi.list, []);
  const schedules = useApiData(scheduleApi.list, []);
  // Gộp trạng thái tải của 4 nguồn để hiện 1 dòng loading/lỗi cho bảng học phí.
  const tuitionSources = [tuitionRecords, students, classes, schedules];
  const tuitions = {
    loading: tuitionSources.some((source) => source.loading),
    error: tuitionSources.find((source) => source.error)?.error ?? null,
    data: buildTuitionRows(students.data, classes.data, schedules.data, tuitionRecords.data),
  };
  const classScoreReport = buildClassScoreReport(scores.data);
  const tuitionReport = buildTuitionReport(tuitions.data);

  const statusRow = (source: { loading: boolean; error: string | null }) =>
    source.loading || source.error ? (
      <tr>
        <td
          colSpan={3}
          className={`px-4 py-10 text-center ${source.error ? "text-red-600" : "text-gray-500"}`}
        >
          {source.error
            ? `Không tải được dữ liệu: ${source.error}`
            : "Đang tải dữ liệu..."}
        </td>
      </tr>
    ) : null;

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
              {statusRow(scores) ?? (classScoreReport.length === 0 ? (
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
              ))}
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
              {statusRow(tuitions) ?? (tuitionReport.length === 0 ? (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
