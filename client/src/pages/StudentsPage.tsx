import { useState } from "react";
import { Toast } from "../components/Toast";
import { MissingScheduleNotice } from "../components/MissingScheduleNotice";
import { MultiSelectFilter } from "../components/MultiSelectFilter";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useApiData } from "../hooks/useApiData";
import {
  classApi,
  getErrorMessage,
  scheduleApi,
  studentApi,
  type ClassItem,
  type Student,
  type StudentInput,
} from "../services/api";
import { formatDateVN } from "../utils/date";

export default function StudentsPage() {
  const {
    data: students,
    setData: setStudents,
    loading,
    error: loadError,
  } = useApiData<Student[]>(studentApi.list, []);
  const { data: classes } = useApiData<ClassItem[]>(classApi.list, []);
  const availableClasses = classes.map((item) => item.name);
  const { data: schedules } = useApiData(scheduleApi.list, []);
  const scheduledClassIds = new Set(schedules.map((item) => item.classId));
  // Lớp đang được tick trong form, để nhắc nếu lớp chưa có lịch học.
  const [formClassIds, setFormClassIds] = useState<number[]>([]);
  const checkedClassesMissingSchedule = classes
    .filter((item) => formClassIds.includes(item.id) && !scheduledClassIds.has(item.id))
    .map((item) => item.name);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  useLockBodyScroll(showForm);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.fullName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesClass =
      classFilters.length === 0 ||
      student.classNames.some((className) => classFilters.includes(className));
    return matchesSearch && matchesClass;
  });

  const hasActiveFilters = Boolean(search || classFilters.length > 0);

  const handleClearFilters = () => {
    setSearch("");
    setClassFilters([]);
  };

  const handleDelete = async (id: number) => {
    const student = students.find((item) => item.id === id);

    if (!student) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa học sinh "${student.fullName}" không? Điểm số và học phí của học sinh này cũng sẽ bị xóa.`
    );

    if (!confirmed) return;

    try {
      await studentApi.remove(id);
      setStudents((current) =>
        current.filter((student) => student.id !== id)
      );
      setToastMessage(`Xóa học sinh "${student.fullName}" thành công.`);
    } catch (error) {
      console.log("Delete student failed", id, error);
      alert(`Xóa học sinh thất bại: ${getErrorMessage(error)}`);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormClassIds(student.classIds);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const input: StudentInput = {
      fullName: String(formData.get("fullName") || "").trim(),
      dateOfBirth: String(formData.get("dateOfBirth") || ""),
      gender: String(formData.get("gender") || ""),
      address: String(formData.get("address") || ""),
      classIds: formData.getAll("classIds").map(Number),
      guardianName: String(formData.get("guardianName") || ""),
      guardianPhone: String(formData.get("guardianPhone") || ""),
      guardianRelation: String(formData.get("guardianRelation") || ""),
    };

    if (!input.fullName || !input.dateOfBirth || !input.gender || input.classIds.length === 0) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc (chọn ít nhất 1 lớp).");
      return;
    }

    setSaving(true);
    try {
      if (editingStudent) {
        const updated = await studentApi.update(editingStudent.id, input);
        setStudents((current) =>
          current.map((student) =>
            student.id === updated.id ? updated : student
          )
        );
        setToastMessage(`Cập nhật học sinh "${updated.fullName}" thành công.`);
      } else {
        const created = await studentApi.create(input);
        setStudents((current) => [...current, created]);
        setToastMessage(`Thêm học sinh "${created.fullName}" thành công.`);
      }
      handleCloseForm();
    } catch (error) {
      console.log("Save student failed", input, error);
      alert(`Lưu học sinh thất bại: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Học sinh
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý danh sách học sinh (1 học sinh có thể học nhiều lớp)
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingStudent(null);
            setFormClassIds([]);
            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Thêm học sinh
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Tên học sinh
            </label>

            <div className="flex items-center rounded-lg border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <span className="flex shrink-0 items-center pl-3 text-gray-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên học sinh..."
                className="w-full rounded-lg bg-transparent px-2.5 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="sm:w-56">
            <MultiSelectFilter
              label="Lớp"
              options={availableClasses}
              selected={classFilters}
              onChange={setClassFilters}
              placeholder="Tất cả các lớp"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:w-auto"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Xóa lọc
            </button>
          )}

          <div className="whitespace-nowrap rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-600 sm:ml-auto">
            Tổng: <strong className="text-gray-900">{filteredStudents.length}</strong> học sinh
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
                  Họ và tên
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Ngày sinh
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Giới tính
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Lớp
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Người thân
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Số điện thoại
                </th>

                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading || loadError ? (
                <tr>
                  <td
                    colSpan={8}
                    className={`px-4 py-10 text-center ${loadError ? "text-red-600" : "text-gray-500"}`}
                  >
                    {loadError
                      ? `Không tải được dữ liệu: ${loadError}`
                      : "Đang tải dữ liệu..."}
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Không tìm thấy học sinh.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {student.fullName}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {formatDateVN(student.dateOfBirth)}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {student.gender}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {student.classNames.length === 0 ? (
                          "-"
                        ) : (
                          student.classNames.map((className) => (
                            <span
                              key={className}
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                            >
                              {className}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {student.guardianName ? (
                        <div className="font-medium text-gray-900">
                          {student.guardianName}
                          {student.guardianRelation && (
                            <span className="ml-1 font-normal text-gray-500">
                              ({student.guardianRelation})
                            </span>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {student.guardianPhone || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(student)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(student.id)}
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
                  {editingStudent
                    ? "Chỉnh sửa học sinh"
                    : "Thêm học sinh"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Nhập thông tin học sinh
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
                    Họ và tên <span className="text-red-500">*</span>
                  </label>

                  <input
                    name="fullName"
                    defaultValue={editingStudent?.fullName || ""}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    defaultValue={editingStudent?.dateOfBirth || ""}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Giới tính <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="gender"
                    defaultValue={editingStudent?.gender || ""}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lớp <span className="text-red-500">*</span>{" "}
                    <span className="font-normal text-gray-400">
                      (có thể chọn nhiều lớp)
                    </span>
                  </label>

                  <div className="flex flex-wrap gap-3 rounded-lg border border-gray-300 px-3 py-2">
                    {classes.length === 0 && (
                      <span className="text-sm text-gray-400">
                        Chưa có lớp nào, hãy tạo lớp trước.
                      </span>
                    )}
                    {classes.map((classItem) => (
                      <label
                        key={classItem.id}
                        className="flex items-center gap-1.5 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          name="classIds"
                          value={classItem.id}
                          defaultChecked={editingStudent?.classIds.includes(
                            classItem.id
                          )}
                          onChange={(event) =>
                            setFormClassIds((current) =>
                              event.target.checked
                                ? [...current, classItem.id]
                                : current.filter((id) => id !== classItem.id)
                            )
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {classItem.name}
                        {!scheduledClassIds.has(classItem.id) && (
                          <span className="text-xs text-amber-600">
                            (chưa có lịch)
                          </span>
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="mt-2">
                    <MissingScheduleNotice
                      classNames={checkedClassesMissingSchedule}
                      message="Lớp chưa có lịch học nên chưa tính được học phí cho học sinh này"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Địa chỉ
                  </label>

                  <textarea
                    name="address"
                    defaultValue={editingStudent?.address || ""}
                    placeholder="Nhập địa chỉ..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2 mt-2 border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Thông tin người thân
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Họ tên người thân
                  </label>

                  <input
                    name="guardianName"
                    defaultValue={editingStudent?.guardianName || ""}
                    placeholder="Nguyễn Văn B"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Quan hệ với học sinh
                  </label>

                  <select
                    name="guardianRelation"
                    defaultValue={editingStudent?.guardianRelation || ""}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Chọn quan hệ</option>
                    <option value="Bố">Bố</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Người giám hộ">Người giám hộ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Số điện thoại người thân
                  </label>

                  <input
                    name="guardianPhone"
                    defaultValue={editingStudent?.guardianPhone || ""}
                    placeholder="0912000001"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                    : editingStudent
                      ? "Lưu thay đổi"
                      : "Thêm học sinh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}