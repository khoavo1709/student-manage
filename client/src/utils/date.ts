// "2026-08-05" -> "05/08/2026".
// Khong dung new Date(...) vi chuoi "YYYY-MM-DD" bi hieu la 0h UTC,
// may o mui gio sau UTC (vd: My) se hien lui 1 ngay.
export function formatDateVN(value: string | null | undefined): string {
  if (!value) return "";
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}
