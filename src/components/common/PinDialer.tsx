"use client";

import { useState, useEffect } from "react";
import { MdBackspace, MdCheck } from "react-icons/md";

interface PinDialerProps {
  value: string;
  onChange: (pin: string) => void;
  onComplete?: (pin: string) => void;
  length?: number;
  disabled?: boolean;
}

export default function PinDialer({ 
  value, 
  onChange, 
  onComplete, 
  length = 4, 
  disabled = false 
}: PinDialerProps) {
  const [pin, setPin] = useState(value);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setPin(value);
  }, [value]);

  const handleNumberClick = (num: number) => {
    if (disabled) return;
    if (pin.length < length) {
      const newPin = pin + num.toString();
      setPin(newPin);
      onChange(newPin);
      setActiveIndex(newPin.length);
      
      if (newPin.length === length && onComplete) {
        onComplete(newPin);
      }
    }
  };

  const handleBackspace = () => {
    if (disabled) return;
    const newPin = pin.slice(0, -1);
    setPin(newPin);
    onChange(newPin);
    setActiveIndex(newPin.length);
  };

  const handleClear = () => {
    if (disabled) return;
    setPin("");
    onChange("");
    setActiveIndex(0);
  };

  const numbers = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ["clear", 0, "backspace"],
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* PIN Display */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
          Enter PIN ({length} digits)
        </label>
        <div className="flex justify-center gap-3 mb-4">
          {Array.from({ length }).map((_, index) => (
            <div
              key={index}
              className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all
                ${index < pin.length 
                  ? "border-primary bg-primary/5 text-primary" 
                  : "border-gray-300 bg-white text-gray-400"
                }
                ${index === activeIndex && pin.length < length && !disabled
                  ? "ring-2 ring-primary ring-offset-2" 
                  : ""
                }
              `}
            >
              {pin[index] || "•"}
            </div>
          ))}
        </div>
      </div>

      {/* PIN Dialer Grid */}
      <div className="grid grid-cols-3 gap-3">
        {numbers.map((row, rowIndex) => (
          row.map((item, colIndex) => {
            if (item === "clear") {
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  type="button"
                  onClick={handleClear}
                  disabled={disabled || pin.length === 0}
                  className="h-14 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              );
            }
            
            if (item === "backspace") {
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  type="button"
                  onClick={handleBackspace}
                  disabled={disabled || pin.length === 0}
                  className="h-14 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <MdBackspace className="w-6 h-6" />
                </button>
              );
            }
            
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                onClick={() => handleNumberClick(item as number)}
                disabled={disabled || pin.length === length}
                className="h-14 rounded-lg bg-white border-2 border-gray-200 text-xl font-semibold text-gray-800 hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {item}
              </button>
            );
          })
        ))}
      </div>

      {/* Complete Button (Optional) */}
      {onComplete && pin.length === length && (
        <button
          type="button"
          onClick={() => onComplete(pin)}
          className="mt-4 w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <MdCheck className="w-5 h-5" />
          Confirm PIN
        </button>
      )}
    </div>
  );
}