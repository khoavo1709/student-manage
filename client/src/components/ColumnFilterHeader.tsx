import { useEffect, useMemo, useRef, useState } from "react";

type ColumnFilterHeaderProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
};

export function ColumnFilterHeader({
  label,
  value,
  onChange,
  options,
}: ColumnFilterHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [draftText, setDraftText] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftText(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasOptions = Boolean(options && options.length > 0);

  const visibleOptions = useMemo(() => {
    if (!options) return [];
    if (!draftText) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(draftText.toLowerCase())
    );
  }, [options, draftText]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextText = event.target.value;
    setDraftText(nextText);
    onChange(nextText);
    if (hasOptions) {
      setShowDropdown(true);
    }
  };

  const handleTextKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (visibleOptions.length > 0) {
        handleSelectOption(visibleOptions[0]);
      } else {
        onChange(draftText);
        setShowDropdown(false);
      }
    } else if (event.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSelectOption = (option: string) => {
    onChange(option);
    setDraftText(option);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange("");
    setDraftText("");
    setShowDropdown(false);
  };

  return (
    <th className="border-b border-gray-200 bg-gray-50 px-2 py-2 align-top">
      <div className="mb-1 text-xs font-semibold text-gray-600">{label}</div>

      <div ref={containerRef} className="relative">
        <div className="flex items-center rounded-md border border-gray-300 bg-white">
          <span className="flex shrink-0 items-center pl-2 text-gray-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>

          <input
            type="text"
            value={draftText}
            onChange={handleTextChange}
            onFocus={() => hasOptions && setShowDropdown(true)}
            onKeyDown={handleTextKeyDown}
            className="w-full min-w-0 rounded-md bg-transparent px-2 py-1.5 text-xs text-gray-700 outline-none"
          />

          {hasOptions && (
            <button
              type="button"
              onClick={() => setShowDropdown((current) => !current)}
              className="flex shrink-0 items-center px-1.5 text-gray-400 hover:text-gray-600"
              aria-label={`Lọc theo ${label}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
            </button>
          )}
        </div>

        {showDropdown && hasOptions && (
          <div className="absolute left-0 top-full z-20 mt-1 max-h-56 w-48 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={handleClear}
              className="block w-full px-3 py-1.5 text-left text-xs text-gray-500 hover:bg-gray-50"
            >
              Tất cả
            </button>

            {visibleOptions.length === 0 ? (
              <div className="px-3 py-1.5 text-xs text-gray-400">
                Không có kết quả
              </div>
            ) : (
              visibleOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 ${
                    value === option
                      ? "font-medium text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </th>
  );
}
