import { useState } from "react";
import { Toast } from "../components/Toast";

type Student = {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  className: string;
};

const demoStudents: Student[] = [
  {
    id: 1,
    fullName: "Nguyễn Văn An",
    dateOfBirth: "2012-03-15",
    gender: "Nam",
    phone: "0912345678",
    address: "Ninh Bình",
    className: "6A1",
  },
  {
    id: 2,
    fullName: "Trần Thị Bình",
    dateOfBirth: "2012-07-22",
    gender: "Nữ",
    phone: "0987654321",
    address: "Ninh Bình",
    className: "6A1",
  },
  {
    id: 3,
    fullName: "Lê Minh Đức",
    dateOfBirth: "2011-11-08",
    gender: "Nam",
    phone: "0901234567",
    address: "Ninh Bình",
    className: "7A1",
  },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(demoStudents);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredStudents = students.filter((student) =>
    student.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    const student = students.find((item) => item.id === id);

    if (!student) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa học sinh "${student.fullName}" không?`
    );

    if (!confirmed) return;

    setStudents((current) =>
      current.filter((student) => student.id !== id)
    );

    setToastMessage(`Xóa học sinh "${student.fullName}" thành công.`);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const fullName = String(formData.get("fullName") || "");
    const dateOfBirth = String(formData.get("dateOfBirth") || "");
    const gender = String(formData.get("gender") || "");
    const phone = String(formData.get("phone") || "");
    const address = String(formData.get("address") || "");
    const className = String(formData.get("className") || "");

    if (!fullName || !dateOfBirth || !gender || !className) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (editingStudent) {
      setStudents((current) =>
        current.map((student) =>
          student.id === editingStudent.id
            ? {
                ...student,
                fullName,
                dateOfBirth,
                gender,
                phone,
                address,
                className,
              }
            : student
        )
      );

      setToastMessage(`Cập nhật học sinh "${fullName}" thành công.`);
    } else {
      const newStudent: Student = {
        id: Date.now(),
        fullName,
        dateOfBirth,
        gender,
        phone,
        address,
        className,
      };

      setStudents((current) => [...current, newStudent]);

      setToastMessage(`Thêm học sinh "${fullName}" thành công.`);
    }

    handleCloseForm();
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
            Quản lý danh sách học sinh
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingStudent(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Thêm học sinh
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
              placeholder="Tìm kiếm theo tên học sinh..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600">
            Tổng: <strong>{filteredStudents.length}</strong> học sinh
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
                  Số điện thoại
                </th>

                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
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
                      {new Date(student.dateOfBirth).toLocaleDateString(
                        "vi-VN"
                      )}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {student.gender}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {student.className}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {student.phone || "-"}
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

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lớp <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="className"
                    defaultValue={editingStudent?.className || ""}
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
                    Số điện thoại
                  </label>

                  <input
                    name="phone"
                    defaultValue={editingStudent?.phone || ""}
                    placeholder="0912345678"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
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
                  {editingStudent ? "Lưu thay đổi" : "Thêm học sinh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}