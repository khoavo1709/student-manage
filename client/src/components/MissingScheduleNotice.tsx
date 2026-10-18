import { Link } from "react-router-dom";

type MissingScheduleNoticeProps = {
  classNames: string[];
  message: string;
};

// Nhac cac lop chua co lich hoc -> chua tinh duoc cac thang hoc phi.
export function MissingScheduleNotice({ classNames, message }: MissingScheduleNoticeProps) {
  if (classNames.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
      <p>
        ⚠ {message}: <strong>{classNames.join(", ")}</strong>.
      </p>
      <Link
        to="/schedule"
        className="shrink-0 font-medium text-amber-900 underline hover:text-amber-700"
      >
        Thêm lịch học →
      </Link>
    </div>
  );
}
