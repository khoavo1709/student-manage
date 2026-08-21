import { useState } from "react";

type Subject = {
  id: number;
  name: string;
};

const demoSubjects: Subject[] = [
  { id: 1, name: "Toán" },
  { id: 2, name: "Ngữ văn" },
  { id: 3, name: "Tiếng Anh" },
];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(demoSubjects);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const filteredSubjects = subjects.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    const subject = subjects.find((item) => item.id === id);

    if (!subject) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa môn học "${subject.name}" không?`
    );

    if (!confirmed) return;

    setSubjects((current) => current.filter((item) => item.id !== id));
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSubject(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") || "");

    if (!name) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (editingSubject) {
      setSubjects((current) =>
        current.map((item) =>
          item.id === editingSubject.id
            ? {
                ...item,
                name,
              }
            : item
        )
      );
    } else {
      const newSubject: Subject = {
        id: Date.now(),
        name,
      };

      setSubjects((current) => [...current, newSubject]);
    }

    handleCloseForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Môn học</h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý danh sách môn học
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingSubject(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Thêm môn học
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
              placeholder="Tìm kiếm theo tên môn học..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600">
            Tổng: <strong>{filteredSubjects.length}</strong> môn học
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
                  Tên môn học
                </th>

                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Không tìm thấy môn học.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject, index) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {subject.name}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(subject)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(subject.id)}
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
                  {editingSubject ? "Chỉnh sửa môn học" : "Thêm môn học"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Nhập thông tin môn học
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
                    Tên môn học <span className="text-red-500">*</span>
                  </label>

                  <input
                    name="name"
                    defaultValue={editingSubject?.name || ""}
                    placeholder="Toán"
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
                  {editingSubject ? "Lưu thay đổi" : "Thêm môn học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
