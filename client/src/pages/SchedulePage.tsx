import { useState } from "react";

type Schedule = {
  id: number;
  className: string;
  subjectName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
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
    className: "6A1",
    subjectName: "Toán",
    dayOfWeek: 2,
    startTime: "07:30",
    endTime: "09:00",
  },
  {
    id: 2,
    className: "6A1",
    subjectName: "Ngữ văn",
    dayOfWeek: 4,
    startTime: "09:15",
    endTime: "10:45",
  },
  {
    id: 3,
    className: "7A1",
    subjectName: "Tiếng Anh",
    dayOfWeek: 3,
    startTime: "13:30",
    endTime: "15:00",
  },
];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>(demoSchedules);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(
    null
  );

  const filteredSchedules = schedules.filter((item) =>
    item.className.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    const schedule = schedules.find((item) => item.id === id);

    if (!schedule) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa lịch học lớp "${schedule.className}" - ${schedule.subjectName} không?`
    );

    if (!confirmed) return;

    setSchedules((current) => current.filter((item) => item.id !== id));
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const className = String(formData.get("className") || "");
    const subjectName = String(formData.get("subjectName") || "");
    const dayOfWeek = Number(formData.get("dayOfWeek"));
    const startTime = String(formData.get("startTime") || "");
    const endTime = String(formData.get("endTime") || "");

    if (
      !className ||
      !subjectName ||
      Number.isNaN(dayOfWeek) ||
      !startTime ||
      !endTime
    ) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (startTime >= endTime) {
      alert("Giờ bắt đầu phải nhỏ hơn giờ kết thúc.");
      return;
    }

    if (editingSchedule) {
      setSchedules((current) =>
        current.map((item) =>
          item.id === editingSchedule.id
            ? {
                ...item,
                className,
                subjectName,
                dayOfWeek,
                startTime,
                endTime,
              }
            : item
        )
      );
    } else {
      const newSchedule: Schedule = {
        id: Date.now(),
        className,
        subjectName,
        dayOfWeek,
        startTime,
        endTime,
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
                  Môn học
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Thứ
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Thời gian
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
                    colSpan={6}
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
                      {schedule.subjectName}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {dayOfWeekLabels[schedule.dayOfWeek]}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {schedule.startTime} - {schedule.endTime}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
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
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lớp <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="className"
                    defaultValue={editingSchedule?.className || ""}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Chọn lớp</option>
                    <option value="6A1">6A1</option>
                    <option value="6A2">6A2</option>
                    <option value="7A1">7A1</option>
                    <option value="7A2">7A2</option>
                    <option value="8A1">8A1</option>
                    <option value="9A1">9A1</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Môn học <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="subjectName"
                    defaultValue={editingSchedule?.subjectName || ""}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Chọn môn học</option>
                    <option value="Toán">Toán</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Giờ bắt đầu <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="time"
                      name="startTime"
                      defaultValue={editingSchedule?.startTime || ""}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Giờ kết thúc <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="time"
                      name="endTime"
                      defaultValue={editingSchedule?.endTime || ""}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
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
