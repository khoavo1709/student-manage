import { useState } from "react";
import { ClockTimePicker } from "../components/ClockTimePicker";
import { DatePickerField } from "../components/DatePickerField";
import { useApiData } from "../hooks/useApiData";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import {
  classApi,
  getErrorMessage,
  scheduleApi,
  type ClassItem,
  type Schedule,
} from "../services/api";
import { formatDateVN } from "../utils/date";

const dayOfWeekLabels = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];


export default function SchedulePage() {
  const {
    data: schedules,
    setData: setSchedules,
    loading: schedulesLoading,
    error: schedulesError,
  } = useApiData<Schedule[]>(scheduleApi.list, []);
  const {
    data: classes,
    loading: classesLoading,
    error: classesError,
  } = useApiData<ClassItem[]>(classApi.list, []);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  useLockBodyScroll(showForm);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(
    null
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const loading = schedulesLoading || classesLoading;
  const error = schedulesError ?? classesError;

  const getClassName = (classId: number) =>
    classes.find((item) => item.id === classId)?.name ?? `Lớp #${classId}`;

  const filteredSchedules = schedules.filter((item) =>
    getClassName(item.classId).toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    const schedule = schedules.find((item) => item.id === id);

    if (!schedule) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa lịch học lớp "${getClassName(schedule.classId)}" không?`
    );

    if (!confirmed) return;

    try {
      await scheduleApi.remove(id);
      setSchedules((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      console.log(`Delete schedule ${id} failed`, err);
      alert(`Xóa lịch học thất bại: ${getErrorMessage(err)}`);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setStartDate(schedule.startDate);
    setEndDate(schedule.endDate);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
    setStartTime("");
    setEndTime("");
    setStartDate("");
    setEndDate("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const classIdRaw = String(formData.get("classId") || "");
    const dayOfWeekRaw = String(formData.get("dayOfWeek") ?? "");
    const classId = Number(classIdRaw);
    const dayOfWeek = Number(dayOfWeekRaw);

    if (
      !classIdRaw ||
      Number.isNaN(classId) ||
      !dayOfWeekRaw ||
      Number.isNaN(dayOfWeek) ||
      !startTime ||
      !endTime ||
      !startDate ||
      !endDate
    ) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (startTime >= endTime) {
      alert("Giờ bắt đầu phải nhỏ hơn giờ kết thúc.");
      return;
    }

    if (startDate > endDate) {
      alert("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.");
      return;
    }

    const input = {
      classId,
      dayOfWeek,
      startTime,
      endTime,
      startDate,
      endDate,
    };

    setSaving(true);

    try {
      if (editingSchedule) {
        const updated = await scheduleApi.update(editingSchedule.id, input);

        setSchedules((current) =>
          current.map((item) =>
            item.id === editingSchedule.id ? updated : item
          )
        );
      } else {
        const created = await scheduleApi.create(input);

        setSchedules((current) => [...current, created]);
      }

      handleCloseForm();
    } catch (err) {
      console.log(
        editingSchedule
          ? `Update schedule ${editingSchedule.id} failed`
          : "Create schedule failed",
        err
      );
      alert(`Lưu lịch học thất bại: ${getErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Lịch học</h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý thời khóa biểu theo lớp
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingSchedule(null);
            setStartTime("");
            setEndTime("");
            setStartDate("");
            setEndDate("");
            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Thêm lịch học
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm theo tên lớp..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600">
            Tổng: <strong>{filteredSchedules.length}</strong> lịch học
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">
                  STT
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Lớp
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Thứ
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Thời gian
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Ngày bắt đầu
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Ngày kết thúc
                </th>

                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-red-600"
                  >
                    Không thể tải dữ liệu lịch học: {error}
                  </td>
                </tr>
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Không tìm thấy lịch học.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule, index) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {getClassName(schedule.classId)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {dayOfWeekLabels[schedule.dayOfWeek]}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {schedule.startTime} - {schedule.endTime}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {formatDateVN(schedule.startDate)}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {formatDateVN(schedule.endDate)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(schedule)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(schedule.id)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingSchedule ? "Chỉnh sửa lịch học" : "Thêm lịch học"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Nhập thông tin lịch học
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

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lớp <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="classId"
                    defaultValue={editingSchedule?.classId ?? ""}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Chọn lớp</option>
                    {classes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Thứ <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="dayOfWeek"
                    defaultValue={editingSchedule?.dayOfWeek ?? ""}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Chọn thứ</option>
                    {dayOfWeekLabels.map((label, value) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div />

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Giờ bắt đầu <span className="text-red-500">*</span>
                  </label>

                  <ClockTimePicker
                    name="startTime"
                    value={startTime}
                    onChange={setStartTime}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Giờ kết thúc <span className="text-red-500">*</span>
                  </label>

                  <ClockTimePicker
                    name="endTime"
                    value={endTime}
                    onChange={setEndTime}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>

                  <DatePickerField
                    name="startDate"
                    value={startDate}
                    onChange={setStartDate}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>

                  <DatePickerField
                    name="endDate"
                    value={endDate}
                    onChange={setEndDate}
                  />
                </div>
              </div>

              {/* Footer */}
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
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Đang lưu..."
                    : editingSchedule
                      ? "Lưu thay đổi"
                      : "Thêm lịch học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
