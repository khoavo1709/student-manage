import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Toast } from "../components/Toast";
import { ColumnFilterHeader } from "../components/ColumnFilterHeader";
import { ExcelActionsMenu } from "../components/ExcelActionsMenu";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";

type Score = {
  id: number;
  studentName: string;
  className: string;
  examName: string;
  value: number;
  date: string;
  note: string;
};

// Demo tra cứu lớp mà mỗi học sinh đang học — 1 học sinh có thể học nhiều lớp.
const studentClassOptions: Record<string, string[]> = {
  "Nguyễn Văn An": ["Toán lớp 6", "Lý lớp 7"],
  "Trần Thị Bình": ["Toán lớp 6"],
  "Lê Minh Đức": ["Lý lớp 7"],
};

const demoScores: Score[] = [
  {
    id: 1,
    studentName: "Nguyễn Văn An",
    className: "Toán lớp 6",
    examName: "Đợt 1",
    value: 8,
    date: "2026-08-05",
    note: "",
  },
  {
    id: 2,
    studentName: "Nguyễn Văn An",
    className: "Lý lớp 7",
    examName: "Đợt 2",
    value: 9.5,
    date: "2026-08-19",
    note: "Tiến bộ rõ rệt",
  },
  {
    id: 3,
    studentName: "Trần Thị Bình",
    className: "Toán lớp 6",
    examName: "Đợt 1",
    value: 7,
    date: "2026-08-05",
    note: "",
  },
];

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const VN_DATE_REGEX = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

function isValidDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// Chấp nhận: ô ngày thật của Excel (Date object, đã bật cellDates khi đọc file),
// chuỗi "YYYY-MM-DD", hoặc chuỗi "DD/MM/YYYY". Trả về null nếu không parse được.
function parseExcelDate(rawValue: unknown): string | null {
  if (rawValue instanceof Date && !Number.isNaN(rawValue.getTime())) {
    const year = rawValue.getFullYear();
    const month = String(rawValue.getMonth() + 1).padStart(2, "0");
    const day = String(rawValue.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const text = String(rawValue ?? "").trim();
  if (!text) return null;

  const isoMatch = text.match(ISO_DATE_REGEX);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    if (!isValidDate(Number(year), Number(month), Number(day))) return null;
    return `${year}-${month}-${day}`;
  }

  const vnMatch = text.match(VN_DATE_REGEX);
  if (vnMatch) {
    const [, day, month, year] = vnMatch;
    const dayNum = Number(day);
    const monthNum = Number(month);
    const yearNum = Number(year);
    if (!isValidDate(yearNum, monthNum, dayNum)) return null;
    return `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
  }

  return null;
}

const TEMPLATE_HEADERS = [
  "Học sinh",
  "Lớp",
  "Đợt kiểm tra",
  "Điểm",
  "Ngày kiểm tra (YYYY-MM-DD hoặc DD/MM/YYYY)",
  "Ghi chú",
];

type ColumnFilters = {
  studentName: string;
  className: string;
  examName: string;
  value: string;
  date: string;
  note: string;
};

const emptyFilters: ColumnFilters = {
  studentName: "",
  className: "",
  examName: "",
  value: "",
  date: "",
  note: "",
};

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>(demoScores);
  const [filters, setFilters] = useState<ColumnFilters>(emptyFilters);
  const [showForm, setShowForm] = useState(false);
  useLockBodyScroll(showForm);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState("");

  const classNameOptions = useMemo(
    () => Array.from(new Set(scores.map((item) => item.className))),
    [scores]
  );
  const examNameOptions = useMemo(
    () => Array.from(new Set(scores.map((item) => item.examName))),
    [scores]
  );

  const filteredScores = scores.filter((item) => {
    return (
      item.studentName.toLowerCase().includes(filters.studentName.toLowerCase()) &&
      item.className.toLowerCase().includes(filters.className.toLowerCase()) &&
      item.examName.toLowerCase().includes(filters.examName.toLowerCase()) &&
      String(item.value).includes(filters.value) &&
      item.date.includes(filters.date) &&
      item.note.toLowerCase().includes(filters.note.toLowerCase())
    );
  });

  const updateFilter = (key: keyof ColumnFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleDelete = (id: number) => {
    const score = scores.find((item) => item.id === id);

    if (!score) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa điểm "${score.examName}" của "${score.studentName}" không?`
    );

    if (!confirmed) return;

    setScores((current) => current.filter((item) => item.id !== id));

    setToastMessage(`Xóa điểm của "${score.studentName}" thành công.`);
  };

  const handleEdit = (score: Score) => {
    setEditingScore(score);
    setSelectedStudent(score.studentName);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingScore(null);
    setSelectedStudent("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const studentName = String(formData.get("studentName") || "");
    const className = String(formData.get("className") || "");
    const examName = String(formData.get("examName") || "");
    const value = Number(formData.get("value"));
    const date = String(formData.get("date") || "");
    const note = String(formData.get("note") || "");

    if (
      !studentName ||
      !className ||
      !examName ||
      Number.isNaN(value) ||
      !date
    ) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }

    if (value < 0 || value > 10) {
      alert("Điểm phải nằm trong khoảng 0-10.");
      return;
    }

    if (editingScore) {
      setScores((current) =>
        current.map((item) =>
          item.id === editingScore.id
            ? {
                ...item,
                studentName,
                className,
                examName,
                value,
                date,
                note,
              }
            : item
        )
      );

      setToastMessage(`Cập nhật điểm của "${studentName}" thành công.`);
    } else {
      const newScore: Score = {
        id: Date.now(),
        studentName,
        className,
        examName,
        value,
        date,
        note,
      };

      setScores((current) => [...current, newScore]);

      setToastMessage(`Thêm điểm cho "${studentName}" thành công.`);
    }

    handleCloseForm();
  };

  const handleExport = () => {
    const rows = filteredScores.map((item) => ({
      "Học sinh": item.studentName,
      "Lớp": item.className,
      "Đợt kiểm tra": item.examName,
      "Điểm": item.value,
      // Xuất cùng định dạng DD/MM/YYYY đang hiển thị trên UI, tránh lệch với ISO lưu trong state.
      "Ngày kiểm tra": new Date(item.date).toLocaleDateString("vi-VN"),
      "Ghi chú": item.note,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Điểm số");
    XLSX.writeFile(workbook, "diem-so.xlsx");

    setToastMessage("Export điểm số ra Excel thành công.");
  };

  const handleDownloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mau diem so");
    XLSX.writeFile(workbook, "mau-import-diem-so.xlsx");
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary", cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        if (rows.length === 0) {
          alert("File Excel không có dữ liệu.");
          return;
        }

        const dateErrors: number[] = [];

        const imported: Score[] = rows.map((row, index) => {
          const rawDate =
            row["Ngày kiểm tra"] ??
            row["Ngày kiểm tra (YYYY-MM-DD)"] ??
            row["Ngày kiểm tra (YYYY-MM-DD hoặc DD/MM/YYYY)"];
          const parsedDate = parseExcelDate(rawDate);

          if (rawDate && !parsedDate) {
            dateErrors.push(index + 2); // +2: dòng 1 là header, dữ liệu bắt đầu từ dòng 2
          }

          return {
            id: Date.now() + index,
            studentName: String(row["Học sinh"] ?? "").trim(),
            className: String(row["Lớp"] ?? "").trim(),
            examName: String(row["Đợt kiểm tra"] ?? "").trim(),
            value: Number(row["Điểm"] ?? 0),
            date: parsedDate ?? "",
            note: String(row["Ghi chú"] ?? "").trim(),
          };
        });

        if (dateErrors.length > 0) {
          alert(
            `Ngày kiểm tra không đúng định dạng ở dòng: ${dateErrors.join(", ")}. Chỉ chấp nhận YYYY-MM-DD hoặc DD/MM/YYYY.`
          );
          return;
        }

        const invalidRow = imported.find(
          (item) =>
            !item.studentName ||
            !item.className ||
            !item.examName ||
            !item.date ||
            Number.isNaN(item.value)
        );

        if (invalidRow) {
          alert("File Excel có dòng thiếu dữ liệu bắt buộc — vui lòng kiểm tra lại.");
          return;
        }

        setScores((current) => [...current, ...imported]);
        setToastMessage(`Import thành công ${imported.length} dòng điểm số.`);
      } catch (error) {
        console.log("Import Excel failed", error);
        alert("Không đọc được file Excel. Vui lòng dùng đúng file mẫu.");
      }
    };

    reader.readAsBinaryString(file);
  };

  const classOptionsForSelectedStudent = selectedStudent
    ? studentClassOptions[selectedStudent] ?? []
    : [];

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Điểm số</h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý điểm học sinh theo từng lớp và đợt kiểm tra
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingScore(null);
              setSelectedStudent("");
              setShowForm(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Thêm điểm
          </button>

          <ExcelActionsMenu
            onImportFile={handleImportFile}
            onExport={handleExport}
            onDownloadTemplate={handleDownloadTemplate}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <ColumnFilterHeader
                  label="Học sinh"
                  value={filters.studentName}
                  onChange={(value) => updateFilter("studentName", value)}
                />

                <ColumnFilterHeader
                  label="Lớp"
                  value={filters.className}
                  onChange={(value) => updateFilter("className", value)}
                  options={classNameOptions}
                />

                <ColumnFilterHeader
                  label="Đợt kiểm tra"
                  value={filters.examName}
                  onChange={(value) => updateFilter("examName", value)}
                  options={examNameOptions}
                />

                <ColumnFilterHeader
                  label="Điểm"
                  value={filters.value}
                  onChange={(value) => updateFilter("value", value)}
                />

                <ColumnFilterHeader
                  label="Ngày"
                  value={filters.date}
                  onChange={(value) => updateFilter("date", value)}
                />

                <ColumnFilterHeader
                  label="Ghi chú"
                  value={filters.note}
                  onChange={(value) => updateFilter("note", value)}
                />

                <th className="border-b border-gray-200 bg-gray-50 px-2 py-2 text-right align-bottom text-xs font-semibold text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredScores.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Không tìm thấy điểm số.
                  </td>
                </tr>
              ) : (
                filteredScores.map((score) => (
                  <tr key={score.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {score.studentName}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                        {score.className}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {score.examName}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          score.value >= 8
                            ? "text-green-600"
                            : score.value >= 5
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {score.value}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {new Date(score.date).toLocaleDateString("vi-VN")}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {score.note || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(score)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(score.id)}
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

        <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
          Tổng: <strong>{filteredScores.length}</strong> điểm
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
                  {editingScore ? "Chỉnh sửa điểm" : "Thêm điểm"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Nhập điểm học sinh theo lớp và đợt kiểm tra
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
                    Học sinh <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="studentName"
                    value={selectedStudent}
                    onChange={(event) => setSelectedStudent(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Chọn học sinh</option>
                    {Object.keys(studentClassOptions).map((studentName) => (
                      <option key={studentName} value={studentName}>
                        {studentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lớp <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="className"
                    defaultValue={editingScore?.className || ""}
                    disabled={!selectedStudent}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">
                      {selectedStudent ? "Chọn lớp" : "Chọn học sinh trước"}
                    </option>
                    {classOptionsForSelectedStudent.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Đợt kiểm tra <span className="text-red-500">*</span>
                  </label>

                  <input
                    name="examName"
                    defaultValue={editingScore?.examName || ""}
                    placeholder="Đợt 1"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Điểm (0-10) <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    name="value"
                    min={0}
                    max={10}
                    step={0.1}
                    defaultValue={editingScore?.value ?? ""}
                    placeholder="8.5"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ngày kiểm tra <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    name="date"
                    defaultValue={editingScore?.date || ""}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ghi chú
                  </label>

                  <textarea
                    name="note"
                    defaultValue={editingScore?.note || ""}
                    placeholder="Nhập ghi chú (nếu có)..."
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
                  {editingScore ? "Lưu thay đổi" : "Thêm điểm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
