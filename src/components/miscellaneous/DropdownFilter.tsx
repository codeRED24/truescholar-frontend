import React, { useState, useMemo, useEffect, useRef } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import clsx from "clsx";

interface FilterOption {
  value: string;
  label: string;
}

interface DropdownFilterProps {
  options: FilterOption[];
  selected: string | null;
  placeholder: string;
  searchable?: boolean;
  onSelect: (value: string | null) => void;
  className?: string;
  containerClassName?: string;
  dropdownClassName?: string;
  inputClassName?: string;
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({
  options,
  selected,
  placeholder,
  searchable = false,
  onSelect,
  className = "",
  containerClassName = "",
  dropdownClassName = "",
  inputClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = useMemo(
    () =>
      search
        ? options.filter((o) =>
            o.label.toLowerCase().includes(search.toLowerCase())
          )
        : options,
    [options, search]
  );

  const defaultContainerClasses = "relative inline-block text-left";
  const defaultButtonClasses =
    "w-full px-3 md:px-4 py-1.5 md:py-2 text-sm rounded-full border border-gray-300 bg-white text-gray-700 flex justify-between items-center";
  const defaultDropdownClasses =
    "absolute mt-2 min-w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10";
  const defaultInputClasses =
    "w-full px-3 py-2 border-b border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-main";

  return (
    <div
      ref={dropdownRef}
      className={clsx(defaultContainerClasses, containerClassName)}
    >
      <button
        onClick={() => setOpen(!open)}
        className={clsx(defaultButtonClasses, className)}
      >
        <span className="truncate">
          {selected
            ? options.find((o) => o.value === selected)?.label || placeholder
            : placeholder}
        </span>
        <span className="ml-2">
          {open ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </span>
      </button>
      {open && (
        <div className={clsx(defaultDropdownClasses, dropdownClassName)}>
          {searchable && (
            <input
              type="text"
              placeholder={`Search ${placeholder}...`}
              className={clsx(defaultInputClasses, inputClassName)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">
                No {placeholder} found.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownFilter;
