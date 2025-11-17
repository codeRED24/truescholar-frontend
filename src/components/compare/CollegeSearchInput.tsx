import { useUniSearch } from "@/hooks/useUniSearch";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function CollegeSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string, id?: string) => void;
}) {
  const [inputValue, setInputValue] = useState(value);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { results, loading, search } = useUniSearch();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val, undefined); // Clear selected college id when editing
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (val.trim().length === 0) {
      setDropdownOpen(false);
      return;
    }
    debounceTimeout.current = setTimeout(() => {
      search(val);
      setDropdownOpen(true);
    }, 300);
  };

  const handleSelectCollege = (collegeName: string, collegeId: string) => {
    setInputValue(collegeName);
    onChange(collegeName, collegeId);
    setDropdownOpen(false);
  };

  // Hide dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        ref={inputRef}
        placeholder="Enter name of university"
        className="h-12 pl-4 pr-10 text-sm"
        value={inputValue}
        onChange={handleInputChange}
        style={{ backgroundColor: "white" }}
        onFocus={() => {
          if (inputValue.trim().length > 0 && results.colleges.length > 0)
            setDropdownOpen(true);
        }}
        autoComplete="off"
      />
      <Search className="absolute right-3 top-4 h-4 w-4 text-gray-400" />
      {dropdownOpen &&
        typeof window !== "undefined" &&
        createPortal(
          (() => {
            // Calculate dropdown position
            const inputRect = inputRef.current?.getBoundingClientRect();
            const width = inputRect?.width || 0;
            const left = inputRect?.left || 0;
            const top = inputRect?.bottom || 0;
            return (
              <div
                style={{
                  position: "fixed",
                  left,
                  top,
                  width,
                  zIndex: 9999,
                }}
                className="max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg"
              >
                {loading && (
                  <div className="px-4 py-2 text-gray-500">Searching...</div>
                )}
                {!loading &&
                  results.colleges.length === 0 &&
                  inputValue.trim().length > 0 && (
                    <div className="px-4 py-2 text-gray-500">
                      No results found
                    </div>
                  )}
                {results.colleges.map((college) => (
                  <div
                    key={college.college_id}
                    className="cursor-pointer border px-4 py-2 hover:bg-gray-100"
                    onMouseDown={() =>
                      handleSelectCollege(
                        college.college_name,
                        String(college.college_id)
                      )
                    }
                  >
                    <div className="flex justify-between">
                      <span className="line-clamp-1">
                        {college.college_name}
                      </span>
                      <div className="flex flex-row gap-1 text-xs">
                        <Star className="size-4 text-yellow-500" />
                        {college.rating}
                      </div>
                    </div>
                    <span className="font-mdeium line-clamp-1 text-xs text-gray-500">
                      {college.kapp_location}
                    </span>
                  </div>
                ))}
              </div>
            );
          })(),
          document.body
        )}
    </div>
  );
}
