"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ElementType;
}

interface SimpleDropdownProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
}

export function SimpleDropdown<T extends string = string>({
  value,
  onChange,
  options,
  className,
  triggerClassName,
  placeholder = "Select...",
}: SimpleDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Update position when opening
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 150),
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 text-sm transition-colors",
          triggerClassName,
        )}
      >
        {selectedOption ? (
          <span className="flex items-center gap-2">
            {selectedOption.icon && <selectedOption.icon className="h-4 w-4" />}
            <span>{selectedOption.label}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[2147483647] min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
            style={{
              top: coords.top,
              left: coords.left,
              minWidth: coords.width,
            }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground",
                  option.value === value && "bg-accent/50",
                )}
              >
                {option.icon && <option.icon className="h-4 w-4" />}
                <span>{option.label}</span>
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
