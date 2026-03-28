import { useState } from "react";

interface CancelOrderModalProps {
  orderNumber: string;
  onConfirm: (cancellationMessage: string) => void;
  isCancelling: boolean;
}

export default function CancelOrderModal({
  orderNumber,
  onConfirm,
  isCancelling,
}: CancelOrderModalProps) {
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const isValid = message.trim().length >= 50;

  const handleConfirm = () => {
    setTouched(true);
    if (isValid) {
      onConfirm(message.trim());
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Cancel Order</h2>
      <p className="text-sm text-gray-600 mb-4">
        Please provide a reason for cancelling order <span className="font-bold">{orderNumber}</span>.<br />
        <span className="text-xs text-gray-500">(At least 50 characters required)</span>
      </p>
      <textarea
        className="w-full min-h-[100px] border border-gray-300 rounded-lg p-3 text-base bg-white text-gray-900 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none placeholder-gray-400"
        value={message}
        onChange={e => setMessage(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="Enter detailed cancellation reason..."
        disabled={isCancelling}
      />
      {touched && !isValid && (
        <p className="text-xs text-red-600 mt-1">Reason must be at least 50 characters.</p>
      )}
      <div className="flex items-center justify-end gap-2 mt-6">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isCancelling}
          onClick={() => window.dispatchEvent(new CustomEvent("modal:close"))}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isValid || isCancelling}
          onClick={handleConfirm}
        >
          {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
        </button>
      </div>
    </div>
  );
}
