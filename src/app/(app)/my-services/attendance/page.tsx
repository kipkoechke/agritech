"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  MdAccessTime,
  MdCheckCircle,
  MdExitToApp,
  MdInfo,
  MdLocationOn,
} from "react-icons/md";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
}

interface Attendance {
  clock_in_at: string;
  clock_out_at: string | null;
  is_clocked_in: boolean;
}

interface DutyAssignment {
  id: string;
  duty_date: string;
  shift: string;
  attendance: Attendance | null;
}

// Simple dummy data
const DUMMY_DUTIES: DutyAssignment[] = [
  {
    id: "1",
    duty_date: format(new Date(), "yyyy-MM-dd"),
    shift: "Morning",
    attendance: null,
  },
  {
    id: "2",
    duty_date: format(new Date(Date.now() - 86400000), "yyyy-MM-dd"),
    shift: "Morning",
    attendance: {
      clock_in_at: "2026-03-29T08:15:00",
      clock_out_at: "2026-03-29T17:30:00",
      is_clocked_in: false,
    },
  },
];

export default function MyAttendancePage() {
  const [duties, setDuties] = useState<DutyAssignment[]>(DUMMY_DUTIES);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [clockOutNotes, setClockOutNotes] = useState("");
  const [showClockOutModal, setShowClockOutModal] = useState(false);

  const todayDuty = duties.find(
    (duty) => duty.duty_date === format(new Date(), "yyyy-MM-dd")
  );
  const isClockedIn = todayDuty?.attendance?.is_clocked_in || false;
  const activeAttendance = todayDuty?.attendance;

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
      };
      setCurrentLocation(locationData);
      return locationData;
    } catch (err: any) {
      const errorMessage = err.code === 1 ? "Location permission denied" : "Location unavailable";
      setLocationError(errorMessage);
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleClockIn = async () => {
    const location = await getCurrentLocation();
    if (!location) {
      alert("Please enable location services");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (todayDuty) {
        setDuties(duties.map(duty => 
          duty.id === todayDuty.id
            ? {
                ...duty,
                attendance: {
                  clock_in_at: new Date().toISOString(),
                  clock_out_at: null,
                  is_clocked_in: true,
                },
              }
            : duty
        ));
        alert("Clocked in successfully!");
      }
      setLoading(false);
    }, 500);
  };

  const handleClockOut = async () => {
    const location = await getCurrentLocation();
    if (!location) {
      alert("Please enable location services");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (todayDuty) {
        setDuties(duties.map(duty =>
          duty.id === todayDuty.id && duty.attendance
            ? {
                ...duty,
                attendance: {
                  ...duty.attendance,
                  clock_out_at: new Date().toISOString(),
                  is_clocked_in: false,
                },
              }
            : duty
        ));
        alert("Clocked out successfully!");
        setShowClockOutModal(false);
        setClockOutNotes("");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Today's Attendance Card */}
      <div className="mb-6 max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <MdAccessTime className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {todayDuty ? `${todayDuty.shift} Shift` : "No Duty Today"}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>

            {todayDuty && (
              isClockedIn ? (
                <button
                  onClick={() => setShowClockOutModal(true)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                >
                  <MdExitToApp className="w-4 h-4" />
                  Clock Out
                </button>
              ) : (
                <button
                  onClick={handleClockIn}
                  disabled={loading || locationLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                >
                  <MdCheckCircle className="w-4 h-4" />
                  {loading ? "Processing..." : locationLoading ? "Getting Location..." : "Clock In"}
                </button>
              )
            )}
          </div>

          {isClockedIn && activeAttendance && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <MdCheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Clocked in at:</span>
                <span className="font-medium text-gray-900">
                  {formatTime(activeAttendance.clock_in_at)}
                </span>
              </div>
            </div>
          )}

          {locationError && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <MdInfo className="w-4 h-4" />
              {locationError}
            </div>
          )}

          {currentLocation && !locationError && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <MdLocationOn className="w-4 h-4 text-green-600" />
              Location: {currentLocation.address}
            </div>
          )}
        </div>
      </div>

      {/* Recent Attendance History */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
        
        {duties.filter(d => d.attendance).length > 0 ? (
          <div className="space-y-3">
            {duties.filter(d => d.attendance).map((duty) => (
              <div key={duty.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(duty.duty_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{duty.shift} Shift</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                    {duty.attendance?.clock_out_at ? "Completed" : "In Progress"}
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Clock In:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {formatTime(duty.attendance?.clock_in_at || null)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Clock Out:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {formatTime(duty.attendance?.clock_out_at || null)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No attendance records found
          </div>
        )}
      </div>

      {/* Clock Out Modal */}
      {showClockOutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clock Out</h3>
            
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
                <MdLocationOn className="w-4 h-4 text-green-600" />
                {currentLocation.address}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowClockOutModal(false);
                  setClockOutNotes("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleClockOut}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
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