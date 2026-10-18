import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Toast } from "../components/Toast";
import { ColumnFilterHeader } from "../components/ColumnFilterHeader";
import { ExcelActionsMenu } from "../components/ExcelActionsMenu";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useApiData } from "../hooks/useApiData";
import {
  classApi,
  getErrorMessage,
  scoreApi,
  studentApi,
  type Score,
  type ScoreInput,
} from "../services/api";
import { formatDateVN } from "../utils/date";
import { writeExcelWithBoldHeader } from "../utils/excel";

type ClassOption = { id: number; name: string };

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

// So khớp tên khi import Excel: bỏ khoảng trắng thừa, không phân biệt hoa thường.
function normalizeName(value: string) {
  return value.trim().toLowerCase();
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
  const {
    data: scores,
    setData: setScores,
    loading: scoresLoading,
    error: scoresError,
  } = useApiData<Score[]>(scoreApi.list, []);
  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
  } = useApiData(studentApi.list, []);
  const {
    data: classes,
    loading: classesLoading,
    error: classesError,
  } = useApiData(classApi.list, []);
  const loading = scoresLoading || studentsLoading || classesLoading;
  const loadError = scoresError ?? studentsError ?? classesError;

  const [filters, setFilters] = useState<ColumnFilters>(emptyFilters);
  const [showForm, setShowForm] = useState(false);
  useLockBodyScroll(showForm);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [saving, setSaving] = useState(false);

  // Tra cứu lớp mà mỗi học sinh đang học — 1 học sinh có thể học nhiều lớp.
  const studentClassOptions = useMemo(() => {
    const map = new Map<number, ClassOption[]>();
    students.forEach((student) => {
      map.set(
        student.id,
        student.classIds.map((id, index) => ({
          id,
          name: student.classNames[index] ?? "",
        }))
      );
    });
    return map;
  }, [students]);

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
      (item.date.includes(filters.date) ||
        formatDateVN(item.date).includes(filters.date)) &&
      item.note.toLowerCase().includes(filters.note.toLowerCase())
    );
  });

  const updateFilter = (key: keyof ColumnFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleDelete = async (id: number) => {
    const score = scores.find((item) => item.id === id);

    if (!score) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa điểm "${score.examName}" của "${score.studentName}" không?`
    );

    if (!confirmed) return;

    try {
      await scoreApi.remove(id);
      setScores((current) => current.filter((item) => item.id !== id));
      setToastMessage(`Xóa điểm của "${score.studentName}" thành công.`);
    } catch (error) {
      console.log(`Delete score ${id} failed`, error);
      alert(`Xóa điểm thất bại: ${getErrorMessage(error)}`);
    }
  };

  const handleEdit = (score: Score) => {
    setEditingScore(score);
    setSelectedStudentId(String(score.studentId));
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingScore(null);
    setSelectedStudentId("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const studentId = Number(formData.get("studentId") || 0);
    const classId = Number(formData.get("classId") || 0);
    const examName = String(formData.get("examName") || "");
    const value = Number(formData.get("value"));
    const date = String(formData.get("date") || "");
    // Chỉ bỏ khoảng trắng/dòng trống thừa ở cuối, giữ nguyên định dạng người dùng gõ.
    const note = String(formData.get("note") || "").trimEnd();

    if (
      !studentId ||
      !classId ||
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

    const input: ScoreInput = { studentId, classId, examName, value, date, note };

    setSaving(true);
    try {
      if (editingScore) {
        const updated = await scoreApi.update(editingScore.id, input);
        setScores((current) =>
          current.map((item) => (item.id === updated.id ? updated : item))
        );

        setToastMessage(`Cập nhật điểm của "${updated.studentName}" thành công.`);
      } else {
        const created = await scoreApi.create(input);
        setScores((current) => [...current, created]);

        setToastMessage(`Thêm điểm cho "${created.studentName}" thành công.`);
      }

      handleCloseForm();
    } catch (error) {
      console.log(
        editingScore ? `Update score ${editingScore.id} failed` : "Create score failed",
        input,
        error
      );
      alert(`Lưu điểm thất bại: ${getErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const headers = ["Học sinh", "Lớp", "Đợt kiểm tra", "Điểm", "Ngày kiểm tra", "Ghi chú"];
    const rows = filteredScores.map((item) => [
      item.studentName,
      item.className,
      item.examName,
      item.value,
      // Xuất cùng định dạng DD/MM/YYYY đang hiển thị trên UI, tránh lệch với ISO lưu trong state.
      formatDateVN(item.date),
      item.note,
    ]);

    try {
      writeExcelWithBoldHeader(headers, rows, "Điểm số", "diem-so.xlsx");
      setToastMessage("Export điểm số ra Excel thành công.");
    } catch (error) {
      alert(`Export thất bại: ${getErrorMessage(error)}`);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      writeExcelWithBoldHeader(TEMPLATE_HEADERS, [], "Mau diem so", "mau-import-diem-so.xlsx");
    } catch (error) {
      alert(`Tải file mẫu thất bại: ${getErrorMessage(error)}`);
    }
  };

  // Tạo lần lượt từng dòng qua API; dòng lỗi được gom lại để báo cho người dùng.
  const createImportedScores = async (inputs: { row: number; input: ScoreInput }[]) => {
    const created: Score[] = [];
    const failedRows: string[] = [];

    for (const { row, input } of inputs) {
      try {
        created.push(await scoreApi.create(input));
      } catch (error) {
        console.log(`Import score row ${row} failed`, input, error);
        failedRows.push(`dòng ${row}: ${getErrorMessage(error)}`);
      }
    }

    if (created.length > 0) {
      setScores((current) => [...current, ...created]);
      setToastMessage(`Import thành công ${created.length} dòng điểm số.`);
    }

    if (failedRows.length > 0) {
      alert(`Không import được ${failedRows.length} dòng:\n${failedRows.join("\n")}`);
    }
  };

  const handleImportFile = (file: File) => {
    if (loading || loadError) {
      alert("Dữ liệu học sinh/lớp chưa tải xong, vui lòng thử lại sau.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
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

        const imported = rows.map((row, index) => {
          const rawDate =
            row["Ngày kiểm tra"] ??
            row["Ngày kiểm tra (YYYY-MM-DD)"] ??
            row["Ngày kiểm tra (YYYY-MM-DD hoặc DD/MM/YYYY)"];
          const parsedDate = parseExcelDate(rawDate);

          if (rawDate && !parsedDate) {
            dateErrors.push(index + 2); // +2: dòng 1 là header, dữ liệu bắt đầu từ dòng 2
          }

          return {
            row: index + 2,
            studentName: String(row["Học sinh"] ?? "").trim(),
            className: String(row["Lớp"] ?? "").trim(),
            examName: String(row["Đợt kiểm tra"] ?? "").trim(),
            // Ô trống -> NaN để bị loại ở bước kiểm tra bên dưới (không ngầm lưu thành 0).
            value:
              row["Điểm"] === undefined || String(row["Điểm"]).trim() === ""
                ? Number.NaN
                : Number(row["Điểm"]),
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
            Number.isNaN(item.value) ||
            item.value < 0 ||
            item.value > 10
        );

        if (invalidRow) {
          alert(
            `File Excel có dòng thiếu dữ liệu bắt buộc hoặc điểm không nằm trong khoảng 0-10 (dòng ${invalidRow.row}) — vui lòng kiểm tra lại.`
          );
          return;
        }

        // Đối chiếu tên học sinh / lớp với dữ liệu thật để lấy id.
        const resolveErrors: string[] = [];
        const inputs: { row: number; input: ScoreInput }[] = [];

        imported.forEach((item) => {
          // Chỉ xét học sinh trùng tên VÀ đang học lớp đó; nếu vẫn còn >1 thì không đoán.
          const sameName = students.filter(
            (s) => normalizeName(s.fullName) === normalizeName(item.studentName)
          );
          const classItem = classes.find(
            (c) => normalizeName(c.name) === normalizeName(item.className)
          );

          if (sameName.length === 0) {
            resolveErrors.push(`dòng ${item.row}: không tìm thấy học sinh "${item.studentName}"`);
            return;
          }
          if (!classItem) {
            resolveErrors.push(`dòng ${item.row}: không tìm thấy lớp "${item.className}"`);
            return;
          }
          const inClass = sameName.filter((s) => s.classIds.includes(classItem.id));
          if (inClass.length > 1) {
            resolveErrors.push(
              `dòng ${item.row}: có ${inClass.length} học sinh tên "${item.studentName}" trong lớp "${classItem.name}", hãy nhập điểm cho các em này bằng tay`
            );
            return;
          }
          const student = inClass[0] ?? sameName[0];
          if (!student.classIds.includes(classItem.id)) {
            resolveErrors.push(
              `dòng ${item.row}: học sinh "${student.fullName}" không học lớp "${classItem.name}"`
            );
            return;
          }

          inputs.push({
            row: item.row,
            input: {
              studentId: student.id,
              classId: classItem.id,
              examName: item.examName,
              value: item.value,
              date: item.date,
              note: item.note,
            },
          });
        });

        if (resolveErrors.length > 0) {
          alert(`File Excel có dòng không hợp lệ:\n${resolveErrors.join("\n")}`);
          return;
        }

        await createImportedScores(inputs);
      } catch (error) {
        console.log("Import Excel failed", error);
        alert("Không đọc được file Excel. Vui lòng dùng đúng file mẫu.");
      }
    };

    reader.readAsBinaryString(file);
  };

  const classOptionsForSelectedStudent = selectedStudentId
    ? studentClassOptions.get(Number(selectedStudentId)) ?? []
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
              setSelectedStudentId("");
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
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-red-600"
                  >
                    Không tải được dữ liệu: {loadError}
                  </td>
                </tr>
              ) : filteredScores.length === 0 ? (
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
                      {formatDateVN(score.date)}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {/* Giữ xuống dòng như lúc nhập; dài quá 3 dòng thì cắt "...", rê chuột để xem đủ. */}
                      <div
                        title={score.note || undefined}
                        className="line-clamp-3 max-w-xs whitespace-pre-wrap break-words"
                      >
                        {score.note || "-"}
                      </div>
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
                    name="studentId"
                    value={selectedStudentId}
                    onChange={(event) => setSelectedStudentId(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Chọn học sinh</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lớp <span className="text-red-500">*</span>
                  </label>

                  <select
                    // Đổi key khi đổi học sinh để reset lựa chọn lớp cũ không còn hợp lệ.
                    key={selectedStudentId}
                    name="classId"
                    defaultValue={
                      editingScore && String(editingScore.studentId) === selectedStudentId
                        ? editingScore.classId
                        : ""
                    }
                    disabled={!selectedStudentId}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">
                      {selectedStudentId ? "Chọn lớp" : "Chọn học sinh trước"}
                    </option>
                    {classOptionsForSelectedStudent.map((classOption) => (
                      <option key={classOption.id} value={classOption.id}>
                        {classOption.name}
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
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Đang lưu..."
                    : editingScore
                    ? "Lưu thay đổi"
                    : "Thêm điểm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
