import { useMemo, useState } from "react";
import { MissingScheduleNotice } from "../components/MissingScheduleNotice";
import { Toast } from "../components/Toast";
import { useApiData } from "../hooks/useApiData";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import {
  classApi,
  getErrorMessage,
  scheduleApi,
  studentApi,
  tuitionApi,
  type Tuition,
  type TuitionStatus,
} from "../services/api";
import { formatDateVN } from "../utils/date";
import {
  buildTuitionRows,
  getClassMonths,
  monthKey,
  type TuitionRow,
  type YearMonth,
} from "../utils/tuition";

const statusLabels: Record<TuitionStatus, string> = {
  "da dong": "Đã đóng",
  "chua dong": "Chưa đóng",
};

type StatusFilter = "all" | TuitionStatus;

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + " đ";
}

function formatMonth({ year, month }: YearMonth) {
  return `${String(month).padStart(2, "0")}/${year}`;
}

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function pairKey(studentId: number, classId: number) {
  return `${studentId}|${classId}`;
}

// Gộp các bản ghi server trả về vào state: thay bản ghi cùng id, thêm bản ghi mới.
function mergeTuitions(current: Tuition[], updated: Tuition[]) {
  const updatedById = new Map(updated.map((item) => [item.id, item]));
  const merged = current.map((item) => updatedById.get(item.id) ?? item);
  const existingIds = new Set(current.map((item) => item.id));
  return [...merged, ...updated.filter((item) => !existingIds.has(item.id))];
}

export default function TuitionsPage() {
  const tuitionsData = useApiData(tuitionApi.list, []);
  const studentsData = useApiData(studentApi.list, []);
  const classesData = useApiData(classApi.list, []);
  const schedulesData = useApiData(scheduleApi.list, []);
  const sources = [tuitionsData, studentsData, classesData, schedulesData];
  const loading = sources.some((source) => source.loading);
  const loadError = sources.find((source) => source.error)?.error ?? null;

  const { data: tuitions, setData: setTuitions } = tuitionsData;
  const students = studentsData.data;
  const classes = classesData.data;
  const schedules = schedulesData.data;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form đóng học phí
  const [showForm, setShowForm] = useState(false);
  useLockBodyScroll(showForm);
  const [selectedPair, setSelectedPair] = useState("");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [paidDate, setPaidDate] = useState(todayIso());
  const [saving, setSaving] = useState(false);

  const rows = useMemo(
    () => buildTuitionRows(students, classes, schedules, tuitions),
    [students, classes, schedules, tuitions]
  );

  const classMonths = useMemo(() => getClassMonths(schedules), [schedules]);

  const monthOptions = useMemo(
    () =>
      [...new Map(rows.map((row) => [monthKey(row), { year: row.year, month: row.month }]))]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, period]) => ({ key, label: formatMonth(period) })),
    [rows]
  );

  const filteredRows = rows.filter(
    (row) =>
      row.studentName.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "all" || row.status === statusFilter) &&
      (!monthFilter || monthKey(row) === monthFilter)
  );

  const unpaidRows = filteredRows.filter((row) => row.status === "chua dong");
  const unpaidAmount = unpaidRows.reduce((total, row) => total + row.tuitionFee, 0);

  const studentClassOptions = useMemo(() => {
    const classById = new Map(classes.map((item) => [item.id, item]));
    return students.flatMap((student) =>
      student.classIds
        .filter((classId) => classById.has(classId))
        .map((classId) => {
          const classItem = classById.get(classId)!;
          return {
            key: pairKey(student.id, classId),
            studentId: student.id,
            classId,
            label: `${student.fullName} (${classItem.name} - ${formatCurrency(classItem.tuitionFee)})`,
            tuitionFee: classItem.tuitionFee,
          };
        })
    );
  }, [students, classes]);

  // Lop dang co hoc sinh nhung chua co lich hoc -> chua tinh duoc hoc phi.
  const classesMissingSchedule = useMemo(() => {
    const enrolledClassIds = new Set(students.flatMap((student) => student.classIds));
    return classes
      .filter((item) => enrolledClassIds.has(item.id) && !classMonths.has(item.id))
      .map((item) => item.name);
  }, [students, classes, classMonths]);

  const selectedOption = studentClassOptions.find((item) => item.key === selectedPair);

  // Các tháng của cặp đang chọn, kèm trạng thái hiện tại.
  const pairMonthRows = selectedOption
    ? rows.filter(
        (row) =>
          row.studentId === selectedOption.studentId &&
          row.classId === selectedOption.classId
      )
    : [];
  const pairUnpaidKeys = pairMonthRows
    .filter((row) => row.status === "chua dong")
    .map((row) => monthKey(row));

  const openPayForm = (row?: TuitionRow) => {
    setSelectedPair(row ? pairKey(row.studentId, row.classId) : "");
    setSelectedMonths(row ? [monthKey(row)] : []);
    setPaidDate(todayIso());
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPair("");
    setSelectedMonths([]);
  };

  const toggleMonth = (key: string) => {
    setSelectedMonths((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

  const handlePay = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    if (!selectedOption || selectedMonths.length === 0 || !paidDate) {
      alert("Vui lòng chọn học sinh - lớp, ít nhất 1 tháng và ngày đóng.");
      return;
    }

    const months = selectedMonths.map((key) => {
      const [year, month] = key.split("-").map(Number);
      return { year, month };
    });

    setSaving(true);
    try {
      const paid = await tuitionApi.pay({
        studentId: selectedOption.studentId,
        classId: selectedOption.classId,
        months,
        paidDate,
      });
      setTuitions((current) => mergeTuitions(current, paid));
      setToastMessage(`Đã ghi nhận đóng học phí ${paid.length} tháng.`);
      handleCloseForm();
    } catch (error) {
      console.log("Pay tuitions failed", selectedOption, months, error);
      alert(`Đóng học phí thất bại: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  // Hủy đóng = xóa bản ghi, tháng đó quay về mặc định "Chưa đóng".
  const handleUndoPayment = async (row: TuitionRow) => {
    if (row.recordId === null) return;

    const confirmed = window.confirm(
      `Hủy trạng thái đã đóng học phí tháng ${formatMonth(row)} của "${row.studentName}" (${row.className})?`
    );
    if (!confirmed) return;

    try {
      await tuitionApi.remove(row.recordId);
      setTuitions((current) => current.filter((item) => item.id !== row.recordId));
      setToastMessage(`Đã hủy đóng học phí tháng ${formatMonth(row)} của "${row.studentName}".`);
    } catch (error) {
      console.log(`Undo tuition payment ${row.recordId} failed`, error);
      alert(`Hủy đóng học phí thất bại: ${getErrorMessage(error)}`);
    }
  };

  const hasActiveFilters = Boolean(search || statusFilter !== "all" || monthFilter);

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Học phí</h1>

          <p className="mt-1 text-sm text-gray-500">
            Các tháng tính theo lịch học của lớp — tháng chưa ghi nhận mặc định là chưa đóng
          </p>
        </div>

        <button
          type="button"
          onClick={() => openPayForm()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Đóng học phí
        </button>
      </div>

      {!loading && (
        <MissingScheduleNotice
          classNames={classesMissingSchedule}
          message="Các lớp chưa có lịch học nên chưa tính được học phí"
        />
      )}

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Tên học sinh
            </label>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm theo tên học sinh..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="lg:w-40">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Tháng
            </label>
            <select
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Tất cả</option>
              {monthOptions.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:w-40">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả</option>
              <option value="chua dong">Chưa đóng</option>
              <option value="da dong">Đã đóng</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setMonthFilter("");
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Xóa lọc
            </button>
          )}

          <div className="whitespace-nowrap rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-600 lg:ml-auto">
            Chưa đóng: <strong className="text-amber-700">{unpaidRows.length}</strong> tháng ·{" "}
            <strong className="text-amber-700">{formatCurrency(unpaidAmount)}</strong>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">STT</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Học sinh</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Lớp</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Tháng/Năm</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Số tiền</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Ngày đóng</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-red-600">
                    Không tải được dữ liệu: {loadError}
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    {rows.length === 0
                      ? "Chưa có học phí nào. Hãy thêm lịch học (ngày bắt đầu - kết thúc) cho lớp để hệ thống tính các tháng cần đóng."
                      : "Không tìm thấy học phí phù hợp."}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr key={row.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{row.studentName}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {row.className}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">{formatMonth(row)}</td>

                    <td className="px-4 py-3 text-gray-600">
                      {formatCurrency(row.tuitionFee)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          row.status === "da dong"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {statusLabels[row.status]}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {row.paidDate ? formatDateVN(row.paidDate) : "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {row.status === "chua dong" ? (
                          <button
                            type="button"
                            onClick={() => openPayForm(row)}
                            className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            Đóng
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUndoPayment(row)}
                            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Hủy đóng
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Đóng học phí</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Có thể chọn nhiều tháng để đóng cùng lúc
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="text-xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePay}>
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Học sinh - Lớp <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPair}
                    onChange={(event) => {
                      setSelectedPair(event.target.value);
                      setSelectedMonths([]);
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Chọn học sinh - lớp</option>
                    {studentClassOptions.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedOption && (
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Tháng đóng <span className="text-red-500">*</span>
                      </label>

                      {pairUnpaidKeys.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedMonths(
                              selectedMonths.length === pairUnpaidKeys.length
                                ? []
                                : pairUnpaidKeys
                            )
                          }
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          {selectedMonths.length === pairUnpaidKeys.length
                            ? "Bỏ chọn tất cả"
                            : "Chọn tất cả tháng chưa đóng"}
                        </button>
                      )}
                    </div>

                    {!classMonths.has(selectedOption.classId) ? (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        Lớp này chưa có lịch học. Hãy thêm lịch học (ngày bắt đầu - kết thúc) để
                        tính các tháng cần đóng.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 rounded-lg border border-gray-300 p-3 sm:grid-cols-4">
                        {pairMonthRows.map((row) => {
                          const key = monthKey(row);
                          const isPaid = row.status === "da dong";
                          return (
                            <label
                              key={key}
                              className={`flex items-center gap-1.5 text-sm ${
                                isPaid ? "text-gray-400" : "text-gray-700"
                              }`}
                              title={isPaid ? "Đã đóng" : undefined}
                            >
                              <input
                                type="checkbox"
                                checked={isPaid || selectedMonths.includes(key)}
                                disabled={isPaid}
                                onChange={() => toggleMonth(key)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              {formatMonth(row)}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Ngày đóng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={paidDate}
                      onChange={(event) => setPaidDate(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Tổng tiền
                    </label>
                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                      {selectedMonths.length} tháng ×{" "}
                      {formatCurrency(selectedOption?.tuitionFee ?? 0)} ={" "}
                      {formatCurrency(selectedMonths.length * (selectedOption?.tuitionFee ?? 0))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving || selectedMonths.length === 0}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : `Xác nhận đóng (${selectedMonths.length} tháng)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
