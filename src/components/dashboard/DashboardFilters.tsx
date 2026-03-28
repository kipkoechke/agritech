// "use client";

// import React, { useEffect } from "react";
// import { useAvailableFilterLevels } from "../../hooks/useAuth";
// import {
//   useCountyOptions,
//   useRegionOptions,
//   useStationOptions,
//   useSubCountyOptions,
// } from "../../hooks/useLookups";
// import type { TimeRange } from "../../types/dashboard";
// import { SearchableSelect } from "../common/SearchableSelect";

// interface DashboardFiltersProps {
//   region?: string;
//   county?: string;
//   subCounty?: string;
//   policeStation?: string;
//   timeRange: TimeRange;
//   onRegionChange: (region: string) => void;
//   onCountyChange: (county: string) => void;
//   onSubCountyChange: (subCounty: string) => void;
//   onPoliceStationChange: (station: string) => void;
//   onTimeRangeChange: (range: TimeRange) => void;
// }

// const timeRangeOptions: { value: TimeRange; label: string }[] = [
//   { value: "all_time", label: "All Time" },
//   { value: "today", label: "Today" },
//   { value: "last_7_days", label: "Last 7 Days" },
//   { value: "last_1_month", label: "Last 1 Month" },
//   { value: "last_3_months", label: "Last 3 Months" },
//   { value: "last_6_months", label: "Last 6 Months" },
//   { value: "last_1_year", label: "Last 1 Year" },
// ];

// const DashboardFilters: React.FC<DashboardFiltersProps> = ({
//   region,
//   county,
//   subCounty,
//   policeStation,
//   timeRange,
//   onRegionChange,
//   onCountyChange,
//   onSubCountyChange,
//   onPoliceStationChange,
//   onTimeRangeChange,
// }) => {
//   // Get available filter levels based on user's access level
//   const filterLevels = useAvailableFilterLevels();

//   const { options: regionOptions, isLoading: loadingRegions } =
//     useRegionOptions();
//   const { options: countyOptions, isLoading: loadingCounties } =
//     useCountyOptions(region || "");
//   const { options: subCountyOptions, isLoading: loadingSubCounties } =
//     useSubCountyOptions(county || "");
//   const { options: stationOptions, isLoading: loadingStations } =
//     useStationOptions(subCounty || "");

//   // Reset dependent filters when parent changes
//   useEffect(() => {
//     if (!region) {
//       onCountyChange("");
//       onSubCountyChange("");
//       onPoliceStationChange("");
//     }
//   }, [region, onCountyChange, onSubCountyChange, onPoliceStationChange]);

//   useEffect(() => {
//     if (!county) {
//       onSubCountyChange("");
//       onPoliceStationChange("");
//     }
//   }, [county, onSubCountyChange, onPoliceStationChange]);

//   useEffect(() => {
//     if (!subCounty) {
//       onPoliceStationChange("");
//     }
//   }, [subCounty, onPoliceStationChange]);

//   return (
//     <div className="bg-white rounded-xl border border-gray-100 p-2 shadow-sm">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
//         {/* Region Filter - Only for National level */}
//         {filterLevels.regional && (
//           <SearchableSelect
//             label="Region"
//             options={regionOptions}
//             value={region || ""}
//             onChange={onRegionChange}
//             disabled={loadingRegions}
//             placeholder={loadingRegions ? "Loading..." : "All Regions"}
//             searchPlaceholder="Search regions..."
//           />
//         )}

//         {/* County Filter - For National and Regional levels */}
//         {filterLevels.county && (
//           <SearchableSelect
//             label="County"
//             options={countyOptions}
//             value={county || ""}
//             onChange={onCountyChange}
//             disabled={loadingCounties}
//             placeholder={loadingCounties ? "Loading..." : "All Counties"}
//             searchPlaceholder="Search counties..."
//           />
//         )}

//         {/* Sub County Filter - For National, Regional, and County levels */}
//         {filterLevels.subcounty && (
//           <SearchableSelect
//             label="Sub County"
//             options={subCountyOptions}
//             value={subCounty || ""}
//             onChange={onSubCountyChange}
//             disabled={!county || loadingSubCounties}
//             placeholder={loadingSubCounties ? "Loading..." : "All Sub Counties"}
//             searchPlaceholder="Search sub counties..."
//           />
//         )}

//         {/* Police Stations Filter - For all levels except Station */}
//         {filterLevels.station && (
//           <SearchableSelect
//             label="Police Stations"
//             options={stationOptions}
//             value={policeStation || ""}
//             onChange={onPoliceStationChange}
//             disabled={!subCounty || loadingStations}
//             placeholder={loadingStations ? "Loading..." : "All Stations"}
//             searchPlaceholder="Search stations..."
//           />
//         )}

//         {/* Time Range Filter - Always visible */}
//         <SearchableSelect
//           label="Period"
//           options={timeRangeOptions}
//           value={timeRange}
//           onChange={(value) => onTimeRangeChange(value as TimeRange)}
//           placeholder="Select period"
//           searchPlaceholder="Search period..."
//         />
//       </div>
//     </div>
//   );
// };

// export default DashboardFilters;
