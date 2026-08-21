import { useState } from "react";

type Class = {
  id: number;
  name: string;
  studentCount: number;
};

const demoClasses: Class[] = [
  { id: 1, name: "6A1", studentCount: 2 },
  { id: 2, name: "6A2", studentCount: 0 },
  { id: 3, name: "7A1", studentCount: 1 },
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>(demoClasses);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const filteredClasses = classes.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

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

    if (!name) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (editingClass) {
      setClasses((current) =>
        current.map((item) =>
          item.id === editingClass.id
            ? {
                ...item,
                name,
              }
            : item
        )
      );
    } else {
      const newClass: Class = {
        id: Date.now(),
        name,
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
            Quản lý danh sách lớp học
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
            Tổng: <strong>{filteredClasses.length}</strong> lớp
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

                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
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
                    placeholder="6A1"
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
