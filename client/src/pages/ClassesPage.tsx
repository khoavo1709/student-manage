import { useState } from "react";
import { MultiSelectFilter } from "../components/MultiSelectFilter";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";

type Class = {
  id: number;
  name: string;
  tuitionFee: number;
  studentCount: number;
};

const demoClasses: Class[] = [
  { id: 1, name: "Toán lớp 6", tuitionFee: 1500000, studentCount: 2 },
  { id: 2, name: "Lý lớp 7", tuitionFee: 1800000, studentCount: 1 },
  { id: 3, name: "Anh lớp 9", tuitionFee: 2000000, studentCount: 0 },
];

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + " đ";
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>(demoClasses);
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  useLockBodyScroll(showForm);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const filteredClasses = classes.filter(
    (item) => classFilters.length === 0 || classFilters.includes(item.name)
  );

  const hasActiveFilters = classFilters.length > 0;

  const handleClearFilters = () => {
    setClassFilters([]);
  };

  const handleDelete = (id: number) => {
    const classItem = classes.find((item) => item.id === id);

    if (!classItem) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa lớp "${classItem.name}" không?`
    );

    if (!confirmed) return;

    setClasses((current) => current.filter((item) => item.id !== id));
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClass(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") || "");
    const tuitionFee = Number(formData.get("tuitionFee"));

    if (!name || Number.isNaN(tuitionFee)) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (tuitionFee < 0) {
      alert("Học phí không được nhỏ hơn 0.");
      return;
    }

    if (editingClass) {
      setClasses((current) =>
        current.map((item) =>
          item.id === editingClass.id
            ? {
                ...item,
                name,
                tuitionFee,
              }
            : item
        )
      );
    } else {
      const newClass: Class = {
        id: Date.now(),
        name,
        tuitionFee,
        studentCount: 0,
      };

      setClasses((current) => [...current, newClass]);
    }

    handleCloseForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Lớp học</h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý danh sách lớp học (mỗi lớp gồm 1 môn + khối, VD: Toán lớp 3)
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingClass(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Thêm lớp học
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-64">
            <MultiSelectFilter
              label="Lớp"
              options={classes.map((item) => item.name)}
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
            Tổng: <strong className="text-gray-900">{filteredClasses.length}</strong> lớp
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
                  Tên lớp
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Sĩ số
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Học phí/tháng
                </th>

                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Không tìm thấy lớp học.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((classItem, index) => (
                  <tr key={classItem.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {classItem.name}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {classItem.studentCount} học sinh
                      </span>
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(classItem.tuitionFee)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(classItem)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(classItem.id)}
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
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingClass ? "Chỉnh sửa lớp học" : "Thêm lớp học"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Nhập thông tin lớp học
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
              <div className="grid grid-cols-1 gap-4 p-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tên lớp <span className="text-red-500">*</span>
                  </label>

                  <input
                    name="name"
                    defaultValue={editingClass?.name || ""}
                    placeholder="Toán lớp 3"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Học phí/tháng (đ) <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    name="tuitionFee"
                    min={0}
                    step={10000}
                    defaultValue={editingClass?.tuitionFee ?? ""}
                    placeholder="1500000"
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
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {editingClass ? "Lưu thay đổi" : "Thêm lớp học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
