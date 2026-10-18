import { useState } from "react";
import { ClockTimePicker } from "../components/ClockTimePicker";
import { DatePickerField } from "../components/DatePickerField";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";

type Schedule = {
  id: number;
  className: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
};

const dayOfWeekLabels = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

const demoSchedules: Schedule[] = [
  {
    id: 1,
    className: "Toán lớp 6",
    dayOfWeek: 2,
    startTime: "07:30",
    endTime: "09:00",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
  },
  {
    id: 2,
    className: "Toán lớp 6",
    dayOfWeek: 4,
    startTime: "09:15",
    endTime: "10:45",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
  },
  {
    id: 3,
    className: "Lý lớp 7",
    dayOfWeek: 3,
    startTime: "13:30",
    endTime: "15:00",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
  },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>(demoSchedules);
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

  const filteredSchedules = schedules.filter((item) =>
    item.className.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    const schedule = schedules.find((item) => item.id === id);

    if (!schedule) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa lịch học lớp "${schedule.className}" không?`
    );

    if (!confirmed) return;

    setSchedules((current) => current.filter((item) => item.id !== id));
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const className = String(formData.get("className") || "");
    const dayOfWeek = Number(formData.get("dayOfWeek"));

    if (
      !className ||
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

    if (editingSchedule) {
      setSchedules((current) =>
        current.map((item) =>
          item.id === editingSchedule.id
            ? {
                ...item,
                className,
                dayOfWeek,
                startTime,
                endTime,
                startDate,
                endDate,
              }
            : item
        )
      );
    } else {
      const newSchedule: Schedule = {
        id: Date.now(),
        className,
        dayOfWeek,
        startTime,
        endTime,
        startDate,
        endDate,
      };

      setSchedules((current) => [...current, newSchedule]);
    }

    handleCloseForm();
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
              {filteredSchedules.length === 0 ? (
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
                        {schedule.className}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {dayOfWeekLabels[schedule.dayOfWeek]}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {schedule.startTime} - {schedule.endTime}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(schedule.startDate)}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(schedule.endDate)}
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
                          onClick={() => handleDelete(schedule.id)}
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
                    name="className"
                    defaultValue={editingSchedule?.className || ""}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Chọn lớp</option>
                    <option value="Toán lớp 3">Toán lớp 3</option>
                    <option value="Toán lớp 6">Toán lớp 6</option>
                    <option value="Lý lớp 7">Lý lớp 7</option>
                    <option value="Văn lớp 8">Văn lớp 8</option>
                    <option value="Anh lớp 9">Anh lớp 9</option>
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
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {editingSchedule ? "Lưu thay đổi" : "Thêm lịch học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
