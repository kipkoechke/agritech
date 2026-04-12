"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: "top" | "bottom";
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current?.offsetWidth || 0;

      let x = rect.left + rect.width / 2 - tooltipWidth / 2;
      // Keep tooltip within viewport
      if (x < 8) x = 8;
      if (x + tooltipWidth > window.innerWidth - 8)
        x = window.innerWidth - tooltipWidth - 8;

      const y =
        position === "top" ? rect.top - 8 : rect.bottom + 8;

      setCoords({ x, y });
    }
  }, [visible, position]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="inline-flex"
    >
      {children}
      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`fixed z-[9999] px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none whitespace-nowrap transition-opacity duration-150 ${
              position === "top" ? "-translate-y-full" : ""
            }`}
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
            }}
          >
            {content}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 ${
                position === "top" ? "-bottom-1" : "-top-1"
              }`}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Tooltip;
