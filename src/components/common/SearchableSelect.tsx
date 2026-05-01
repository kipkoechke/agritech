"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MdExpandMore, MdSearch, MdClose } from "react-icons/md";

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  label: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  isLoading?: boolean;
  onSearchChange?: (search: string) => void;
  onCreateNew?: (search: string) => void;
  createNewLabel?: string;
  multiSelect?: boolean;
  values?: string[];
  onChangeMulti?: (values: string[]) => void;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  required = false,
  isLoading = false,
  onSearchChange,
  onCreateNew,
  createNewLabel = "Add New",
  multiSelect = false,
  values = [],
  onChangeMulti,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState<"below" | "above">("below");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const DROPDOWN_ESTIMATED_HEIGHT = 280;

    if (spaceBelow < DROPDOWN_ESTIMATED_HEIGHT && spaceAbove > DROPDOWN_ESTIMATED_HEIGHT) {
      setDropdownPosition("above");
    } else {
      setDropdownPosition("below");
    }

    setDropdownPos({
      top: buttonRect.bottom,
      left: buttonRect.left,
      width: buttonRect.width,
    });
  }, [isOpen]);

  // Handle search input change with debounce for backend search
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (onSearchChange) {
      const timeoutId = setTimeout(() => {
        onSearchChange(query);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [onSearchChange]);

  // Filter options locally if no onSearchChange prop
  const filteredOptions = options.filter((option) =>
    option?.label?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get selected option label
  const selectedOption = options.find((opt) => opt?.value === value);
  const selectedLabel = selectedOption?.label || "";

  const handleSelect = (optionValue: string) => {
    if (multiSelect) {
      const newValues = values.includes(optionValue)
        ? values.filter((v) => v !== optionValue)
        : [...values, optionValue];
      onChangeMulti?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiSelect) {
      onChangeMulti?.([]);
    } else {
      onChange?.("");
    }
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={containerRef} style={{ zIndex: 1 }}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Select Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 border rounded-lg text-left bg-white
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? "border-red-500" : "border-gray-300"}
          ${isOpen ? "ring-2 ring-emerald-500 border-emerald-500" : ""}
        `}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 overflow-hidden">
            {multiSelect ? (
              values.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {values.map((v) => {
                    const opt = options.find((o) => o.value === v);
                    return (
                      <span
                        key={v}
                        className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full"
                      >
                        {opt?.label || v}
                        <MdClose
                          className="w-3 h-3 cursor-pointer hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onChangeMulti?.(values.filter((val) => val !== v));
                          }}
                        />
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="block text-sm text-gray-500">
                  {placeholder}
                </span>
              )
            ) : (
              <span
                className={`block truncate text-sm ${
                  selectedLabel ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {selectedLabel || placeholder}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            {(multiSelect ? values.length > 0 : value) && !disabled && (
              <MdClose
                className="w-4 h-4 text-gray-400 hover:text-gray-600 shrink-0"
                onClick={handleClear}
              />
            )}
            <MdExpandMore
              className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </button>

      {/* Description below selected item */}
      {selectedOption?.description && (
        <p className="mt-1 text-xs text-gray-600 italic">
          {selectedOption.description}
        </p>
      )}

      {/* Dropdown - Positioned dynamically with portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto"
          style={{
            top: dropdownPosition === "below" ? dropdownPos.top + 4 : undefined,
            bottom: dropdownPosition === "above" ? window.innerHeight - dropdownPos.top + 4 : undefined,
            left: dropdownPos.left,
            width: dropdownPos.width,
            maxHeight: "16rem",
            zIndex: 999999,
          }}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Options List */}
          {isLoading ? (
            <div className="px-3 py-4 text-center text-gray-500 text-sm">
              Loading...
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option?.value || Math.random()}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full text-left px-3 py-2.5 hover:bg-emerald-50 transition-colors text-sm
                  ${
                    (multiSelect ? values.includes(option.value) : value === option.value)
                      ? "bg-emerald-100 text-emerald-900 font-semibold"
                      : "text-gray-900"
                  }
                `}
              >
                {option?.label || option?.value || "Unknown"}
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-center text-sm">
              {onCreateNew && searchQuery ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-gray-400 text-xs">
                    No results for "{searchQuery}"
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onCreateNew(searchQuery);
                      setIsOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    {createNewLabel}
                  </button>
                </div>
              ) : (
                <span className="text-gray-500">No results found</span>
              )}
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};