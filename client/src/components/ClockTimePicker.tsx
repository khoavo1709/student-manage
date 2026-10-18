import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimeClock } from "@mui/x-date-pickers/TimeClock";

dayjs.extend(customParseFormat);

type ClockTimePickerProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
};

const TIME_FORMAT = "HH:mm";
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const CLOCK_SCALE = 0.8;

export function ClockTimePicker({ name, value, onChange }: ClockTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [draftText, setDraftText] = useState(value);
  const [scaledHeight, setScaledHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (open && clockRef.current) {
      setScaledHeight(clockRef.current.scrollHeight * CLOCK_SCALE);
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
    if (TIME_REGEX.test(nextText)) {
      onChange(nextText);
    }
  };

  const handleTextBlur = () => {
    if (!TIME_REGEX.test(draftText)) {
      setDraftText(value);
    }
  };

  const clockValue: Dayjs | null = TIME_REGEX.test(draftText)
    ? dayjs(draftText, TIME_FORMAT, true)
    : null;

  const handleClockChange = (newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      const formatted = newValue.format(TIME_FORMAT);
      setDraftText(formatted);
      onChange(formatted);
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
          placeholder="HH:mm"
          maxLength={5}
          className="w-full min-w-0 rounded-lg bg-transparent px-3 py-2 text-sm outline-none"
        />

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label="Chọn giờ bằng đồng hồ"
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
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          <div
            className="overflow-hidden"
            style={{ height: scaledHeight || undefined }}
          >
            <div
              ref={clockRef}
              className="origin-top-left"
              style={{ transform: `scale(${CLOCK_SCALE})`, width: 320 * CLOCK_SCALE }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimeClock
                  value={clockValue}
                  onChange={handleClockChange}
                  ampm={false}
                  minutesStep={1}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
