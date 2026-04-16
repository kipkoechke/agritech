"use client";

import React, { useState, useRef, useEffect } from "react";
import { MdExpandMore, MdSearch, MdClose, MdPersonAdd, MdCheck } from "react-icons/md";
import { useOutsideClick } from "../../hooks/useOutsideClick";

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
  onSearchChange?: (search: string) => void;
  isLoading?: boolean;
  showSearchHint?: boolean;
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
  onSearchChange,
  isLoading = false,
  showSearchHint = false,
  onCreateNew,
  createNewLabel = "Add New",
  multiSelect = false,
  values = [],
  onChangeMulti,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useOutsideClick(() => setIsOpen(false));
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Notify parent of search changes (for backend search)
  // Only trigger search when dropdown is open
  useEffect(() => {
    if (onSearchChange && isOpen) {
      onSearchChange(searchQuery);
    }
  }, [searchQuery, onSearchChange, isOpen]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen && onSearchChange) {
      setSearchQuery("");
    }
  }, [isOpen, onSearchChange]);

  // Filter options based on search query (client-side or backend)
  const filteredOptions = onSearchChange
    ? options // Backend search: use options as-is
    : options.filter((option) =>
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
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {showSearchHint && (
        <p className="mb-1 text-xs text-gray-500">
          Start typing to search all customers. The list below shows only a few.
        </p>
      )}
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-3 border rounded-lg text-left
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? "border-red-500" : "border-gray-300"}
          ${isOpen ? "ring-2 ring-emerald-500 border-emerald-500" : ""}
        `}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {multiSelect ? (
              values.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {values.map((v) => {
                    const opt = options.find((o) => o.value === v);
                    return (
                      <span key={v} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full">
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
                <span className="block text-sm text-gray-500">{placeholder}</span>
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

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 bg-white">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option?.value || Math.random()}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors text-sm font-semibold flex items-center gap-2
                    ${
                      (multiSelect ? values.includes(option.value) : value === option.value)
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-900"
                    }
                  `}
                >
                  {multiSelect && (
                    <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                      {values.includes(option.value) && <MdCheck className="w-4 h-4 text-emerald-600" />}
                    </span>
                  )}
                  {option?.label || option?.value || "Unknown"}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-center text-sm">
                {onSearchChange && !searchQuery ? (
                  <span className="text-gray-500">
                    Start typing to search...
                  </span>
                ) : onCreateNew && searchQuery ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-gray-400 text-xs">
                      No results for &ldquo;{searchQuery}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onCreateNew(searchQuery);
                        setIsOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
                      <MdPersonAdd className="w-3.5 h-3.5" />
                      {createNewLabel}
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500">No results found</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
