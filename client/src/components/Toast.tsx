import { useEffect } from "react";

type ToastProps = {
  message: string;
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed left-0 right-0 top-0 z-[60] flex justify-center px-4 pt-4">
      <div className="flex w-full max-w-2xl items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-md">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>

        <p className="flex-1 text-center text-sm font-medium text-green-800">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông báo"
          className="shrink-0 text-green-700 hover:text-green-900"
        >
          ×
        </button>
      </div>
    </div>
  );
}
