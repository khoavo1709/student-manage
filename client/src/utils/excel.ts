import XLSXStyle from "xlsx-js-style";

const THIN_BORDER = { style: "thin", color: { rgb: "000000" } };

const CELL_BORDER = {
  top: THIN_BORDER,
  bottom: THIN_BORDER,
  left: THIN_BORDER,
  right: THIN_BORDER,
};

// wrapText: chu dai tu xuong dong va Excel/Google Sheets tu noi chieu cao dong;
// vertical center: du lieu nam giua o khi dong cao len.
const CELL_ALIGNMENT = { vertical: "center", wrapText: true };

const HEADER_STYLE = {
  font: { bold: true },
  fill: { fgColor: { rgb: "E5E7EB" } },
  alignment: CELL_ALIGNMENT,
  border: CELL_BORDER,
};

const DATA_STYLE = { alignment: CELL_ALIGNMENT, border: CELL_BORDER };

// Cot rong toi da ~40 ky tu; noi dung dai hon se xuong dong thay vi keo cot qua rong.
const MIN_COLUMN_WIDTH = 10;
const MAX_COLUMN_WIDTH = 40;

// Ghi file Excel 1 sheet: header in dam, ke vien cho header va moi dong co du lieu.
// Dung xlsx-js-style vi ban SheetJS mien phi (xlsx) khong ghi duoc style.
export function writeExcelWithBoldHeader(
  headers: string[],
  rows: (string | number)[][],
  sheetName: string,
  fileName: string
) {
  try {
    // Bo khoang trang / dong trong thua o dau-cuoi (vd: ghi chu lo Enter) de dong khong cao vo ly.
    const cleanRows = rows.map((row) =>
      row.map((value) => (typeof value === "string" ? value.trim() : value))
    );
    const worksheet = XLSXStyle.utils.aoa_to_sheet([headers, ...cleanRows]);

    for (let rowIndex = 0; rowIndex <= cleanRows.length; rowIndex++) {
      headers.forEach((_header, columnIndex) => {
        const cellAddress = XLSXStyle.utils.encode_cell({ r: rowIndex, c: columnIndex });
        // O trong van can co cell de ke vien day du.
        worksheet[cellAddress] ??= { t: "s", v: "" };
        worksheet[cellAddress].s = rowIndex === 0 ? HEADER_STYLE : DATA_STYLE;
      });
    }

    // Do rong cot vua voi noi dung dai nhat, trong khoang MIN..MAX ky tu.
    worksheet["!cols"] = headers.map((header, columnIndex) => {
      const longest = Math.max(
        header.length,
        ...cleanRows.map((row) => String(row[columnIndex] ?? "").length)
      );
      return {
        wch: Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, longest + 2)),
      };
    });

    const workbook = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSXStyle.writeFile(workbook, fileName);
  } catch (error) {
    console.log("writeExcelWithBoldHeader failed", fileName, error);
    throw error;
  }
}
