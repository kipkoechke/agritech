"use client";

import { useAttendance } from "@/hooks/useAttendance";
import { useDutyAssignments } from "@/hooks/useDutyAssignments";
// Import only the type you need, or use a type alias
import type { DutyAssignment as DutyAssignmentType } from "@/services/dutyAssignmentsService";
import { safeFormatDate } from "@/utils/dateUtils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  MdAccessTime,
  MdCheckCircle,
  MdExitToApp,
  MdInfo,
  MdLocationOn,
} from "react-icons/md";

// Use a type alias to avoid conflicts
type DutyAssignment = DutyAssignmentType;

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
}

export default function MyAttendancePage() {
  const { clockIn, clockOut, loading, error } = useAttendance();
  const {
    data: dutiesData,
    isLoading: dutiesLoading,
    refetch: refetchDuties,
  } = useDutyAssignments();

  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [clockOutNotes, setClockOutNotes] = useState("");
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState<DutyAssignment | null>(null);

  const duties = dutiesData?.data || [];

  // Find today's active duty
  const todayDuty = duties.find(
    (duty: DutyAssignment) => duty.duty_date === format(new Date(), "yyyy-MM-dd")
  );

  // Check if user is clocked in based on is_clocked_in field from API
  const isClockedIn = todayDuty?.attendance?.is_clocked_in || false;
  const activeAttendance = todayDuty?.attendance;

  // Get current location
  const getCurrentLocation = async (): Promise<LocationData | null> => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        address: `${position.coords.latitude.toFixed(
          6
        )}, ${position.coords.longitude.toFixed(6)}`,
      };

      setCurrentLocation(locationData);
      return locationData;
    } catch (err: any) {
      const errorMessage =
        err.code === 1
          ? "Location permission denied. Please enable location access."
          : err.code === 2
          ? "Location unavailable. Please try again."
          : "Location request timed out. Please try again.";
      setLocationError(errorMessage);
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleClockIn = async () => {
    const location = currentLocation || (await getCurrentLocation());

    if (!location) {
      toast.error(
        "Could not get your location. Please enable location services."
      );
      return;
    }

    try {
      await clockIn({ location });
      toast.success("Clocked in successfully!");
      refetchDuties();
    } catch (err: any) {
      // Error is already handled in the hook
    }
  };

  const handleClockOutClick = (duty: DutyAssignment) => {
    setSelectedDuty(duty);
    setShowClockOutModal(true);
  };

  const handleClockOut = async () => {
    const location = currentLocation || (await getCurrentLocation());

    if (!location) {
      toast.error(
        "Could not get your location. Please enable location services."
      );
      return;
    }

    try {
      await clockOut({ 
        location, 
        notes: clockOutNotes 
      });
      toast.success("Clocked out successfully!");
      setShowClockOutModal(false);
      setClockOutNotes("");
      setSelectedDuty(null);
      refetchDuties();
    } catch (err: any) {
      // Error is already handled in the hook
    }
  };

  if (dutiesLoading) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Loading attendance information...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Clock In/Out Card - Always visible */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Today&apos;s Attendance
        </h3>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <MdAccessTime className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {todayDuty
                      ? `${
                          todayDuty.shift.charAt(0).toUpperCase() +
                          todayDuty.shift.slice(1)
                        } Shift`
                      : "No Duty Assigned Today"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(), "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>

              {isClockedIn ? (
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MdCheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">Clocked In:</span>
                    <span className="font-medium text-gray-900">
                      {safeFormatDate(
                        activeAttendance?.clock_in_at,
                        "hh:mm a"
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-2">
                  {todayDuty
                    ? "You haven't clocked in yet for today's shift."
                    : "No duty assigned for today. Please check your schedule."}
                </p>
              )}
            </div>

            <div className="ml-4">
              {isClockedIn ? (
                <button
                  onClick={() => todayDuty && handleClockOutClick(todayDuty)}
                  disabled={loading || locationLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <MdExitToApp className="w-4 h-4" />
                  {loading ? "Processing..." : "Clock Out"}
                </button>
              ) : (
                <button
                  onClick={handleClockIn}
                  disabled={loading || locationLoading || !todayDuty}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <MdCheckCircle className="w-4 h-4" />
                  {loading
                    ? "Processing..."
                    : locationLoading
                    ? "Getting Location..."
                    : !todayDuty
                    ? "No Duty Assigned"
                    : "Clock In"}
                </button>
              )}
            </div>
          </div>

          {/* Location Status */}
          {locationError && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <MdInfo className="w-4 h-4 shrink-0" />
              {locationError}
            </div>
          )}

          {currentLocation && !locationError && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <MdLocationOn className="w-4 h-4 shrink-0 text-green-600" />
              Location ready: {currentLocation.address}
            </div>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Attendance
        </h3>

        {duties.filter((d: DutyAssignment) => d.attendance).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {duties
                  .filter((d: DutyAssignment) => d.attendance !== null && d.attendance !== undefined)
                  .map((duty: DutyAssignment) => (
                    <tr
                      key={duty.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {safeFormatDate(duty.duty_date, "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <span className="capitalize">{duty.shift}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {safeFormatDate(
                          duty.attendance?.clock_in_at,
                          "hh:mm a",
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {safeFormatDate(
                          duty.attendance?.clock_out_at,
                          "hh:mm a",
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            duty.attendance?.is_clocked_in
                              ? "bg-green-100 text-green-800"
                              : duty.attendance?.clock_out_at
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {duty.attendance?.is_clocked_in
                            ? "CLOCKED IN"
                            : duty.attendance?.clock_out_at
                            ? "CLOCKED OUT"
                            : "PENDING"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 text-sm bg-gray-50 rounded-lg">
            No attendance records found
          </div>
        )}
      </div>

      {/* Clock Out Modal */}
      {showClockOutModal && selectedDuty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Clock Out
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={clockOutNotes}
                onChange={(e) => setClockOutNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="Any notes about your shift..."
              />
            </div>

            {currentLocation && (
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <MdLocationOn className="w-4 h-4 shrink-0 text-green-600" />
                {currentLocation.address}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowClockOutModal(false);
                  setClockOutNotes("");
                  setSelectedDuty(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleClockOut}
                disabled={loading || locationLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                {loading ? "Processing..." : "Confirm Clock Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}