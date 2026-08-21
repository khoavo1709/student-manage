import { useState } from "react";

type Tuition = {
  id: number;
  studentName: string;
  amount: number;
  year: number;
  month: number;
  status: "da dong" | "chua dong";
  paidDate: string | null;
};

const statusLabels: Record<Tuition["status"], string> = {
  "da dong": "Đã đóng",
  "chua dong": "Chưa đóng",
};

const demoTuitions: Tuition[] = [
  {
    id: 1,
    studentName: "Nguyễn Văn An",
    amount: 1500000,
    year: 2026,
    month: 8,
    status: "da dong",
    paidDate: "2026-08-05",
  },
  {
    id: 2,
    studentName: "Trần Thị Bình",
    amount: 1500000,
    year: 2026,
    month: 8,
    status: "chua dong",
    paidDate: null,
  },
  {
    id: 3,
    studentName: "Lê Minh Đức",
    amount: 1800000,
    year: 2026,
    month: 8,
    status: "chua dong",
    paidDate: null,
  },
];

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + " đ";
}

export default function TuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>(demoTuitions);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTuition, setEditingTuition] = useState<Tuition | null>(null);

  const filteredTuitions = tuitions.filter((item) =>
    item.studentName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    const tuition = tuitions.find((item) => item.id === id);

    if (!tuition) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa học phí của "${tuition.studentName}" tháng ${tuition.month}/${tuition.year} không?`
    );

    if (!confirmed) return;

    setTuitions((current) => current.filter((item) => item.id !== id));
  };

  const handleEdit = (tuition: Tuition) => {
    setEditingTuition(tuition);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTuition(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const studentName = String(formData.get("studentName") || "");
    const amount = Number(formData.get("amount"));
    const year = Number(formData.get("year"));
    const month = Number(formData.get("month"));
    const status = String(formData.get("status") || "") as Tuition["status"];
    const paidDate = String(formData.get("paidDate") || "") || null;

    if (
      !studentName ||
      !amount ||
      !year ||
      !month ||
      !status
    ) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (month < 1 || month > 12) {
      alert("Tháng phải nằm trong khoảng 1-12.");
      return;
    }

    const isDuplicate = tuitions.some(
      (item) =>
        item.studentName === studentName &&
        item.year === year &&
        item.month === month &&
        item.id !== editingTuition?.id
    );

    if (isDuplicate) {
      alert("Học sinh này đã có bản ghi học phí cho tháng/năm này.");
      return;
    }

    if (editingTuition) {
      setTuitions((current) =>
        current.map((item) =>
          item.id === editingTuition.id
            ? {
                ...item,
                studentName,
                amount,
                year,
                month,
                status,
                paidDate,
              }
            : item
        )
      );
    } else {
      const newTuition: Tuition = {
        id: Date.now(),
        studentName,
        amount,
        year,
        month,
        status,
        paidDate,
      };

      setTuitions((current) => [...current, newTuition]);
    }

    handleCloseForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Học phí</h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý học phí theo tháng
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingTuition(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Thêm học phí
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
            Tổng: <strong>{filteredTuitions.length}</strong> bản ghi
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
                  Học sinh
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Tháng/Năm
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Số tiền
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Trạng thái
                </th>

                <th className="px-4 py-3 font-semibold text-gray-600">
                  Ngày đóng
                </th>

                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredTuitions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Không tìm thấy bản ghi học phí.
                  </td>
                </tr>
              ) : (
                filteredTuitions.map((tuition, index) => (
                  <tr key={tuition.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {tuition.studentName}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {tuition.month}/{tuition.year}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {formatCurrency(tuition.amount)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          tuition.status === "da dong"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {statusLabels[tuition.status]}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {tuition.paidDate
                        ? new Date(tuition.paidDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(tuition)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(tuition.id)}
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
                  {editingTuition ? "Chỉnh sửa học phí" : "Thêm học phí"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Nhập thông tin học phí
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
                    Học sinh <span className="text-red-500">*</span>
                  </label>

                  <input
                    name="studentName"
                    defaultValue={editingTuition?.studentName || ""}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Số tiền <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    name="amount"
                    min={0}
                    defaultValue={editingTuition?.amount ?? ""}
                    placeholder="1500000"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="status"
                    defaultValue={editingTuition?.status || ""}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Chọn trạng thái</option>
                    <option value="da dong">Đã đóng</option>
                    <option value="chua dong">Chưa đóng</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tháng <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    name="month"
                    min={1}
                    max={12}
                    defaultValue={editingTuition?.month ?? ""}
                    placeholder="8"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Năm <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    name="year"
                    min={2000}
                    defaultValue={editingTuition?.year ?? ""}
                    placeholder="2026"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ngày đóng
                  </label>

                  <input
                    type="date"
                    name="paidDate"
                    defaultValue={editingTuition?.paidDate || ""}
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
                  {editingTuition ? "Lưu thay đổi" : "Thêm học phí"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
