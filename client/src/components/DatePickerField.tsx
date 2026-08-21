import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

dayjs.extend(customParseFormat);

type DatePickerFieldProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
};

const DATE_FORMAT = "YYYY-MM-DD";
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const CALENDAR_SCALE = 0.8;

export function DatePickerField({ name, value, onChange }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [draftText, setDraftText] = useState(value);
  const [scaledSize, setScaledSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (open && calendarRef.current) {
      setScaledSize({
        width: calendarRef.current.scrollWidth * CALENDAR_SCALE,
        height: calendarRef.current.scrollHeight * CALENDAR_SCALE,
      });
    }
  }, [open]);

  useEffect(() => {
    setDraftText(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextText = event.target.value;
    setDraftText(nextText);
    if (DATE_REGEX.test(nextText) && dayjs(nextText, DATE_FORMAT, true).isValid()) {
      onChange(nextText);
    }
  };

  const handleTextBlur = () => {
    if (!DATE_REGEX.test(draftText) || !dayjs(draftText, DATE_FORMAT, true).isValid()) {
      setDraftText(value);
    }
  };

  const calendarValue: Dayjs | null =
    DATE_REGEX.test(draftText) && dayjs(draftText, DATE_FORMAT, true).isValid()
      ? dayjs(draftText, DATE_FORMAT, true)
      : null;

  const handleCalendarChange = (newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      const formatted = newValue.format(DATE_FORMAT);
      setDraftText(formatted);
      onChange(formatted);
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />

      <div className="flex items-center rounded-lg border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <input
          type="text"
          value={draftText}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          placeholder="YYYY-MM-DD"
          maxLength={10}
          className="w-full min-w-0 rounded-lg bg-transparent px-3 py-2 text-sm outline-none"
        />

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label="Chọn ngày"
          className="flex shrink-0 items-center px-2.5 text-gray-400 hover:text-gray-600"
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
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
          <div
            className="overflow-hidden"
            style={{
              width: scaledSize.width || undefined,
              height: scaledSize.height || undefined,
            }}
          >
            <div
              ref={calendarRef}
              className="origin-top-left"
              style={{ transform: `scale(${CALENDAR_SCALE})` }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar value={calendarValue} onChange={handleCalendarChange} />
              </LocalizationProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
