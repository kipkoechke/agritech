// "use client";

// import React from "react";
// import type { TrendChartData } from "../../types/dashboard";
// import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// interface TrendChartProps {
//   title: string;
//   data: TrendChartData;
//   color?: string;
//   formatValue?: (value: number) => string;
// }

// const TrendChart: React.FC<TrendChartProps> = ({
//   title,
//   data,
//   color = "blue",
//   formatValue = (v) => v.toLocaleString(),
// }) => {
//   const colorMap: Record<string, { main: string; light: string; bg: string }> =
//     {
//       blue: { main: "#3b82f6", light: "#93c5fd", bg: "bg-blue-50" },
//       green: { main: "#10b981", light: "#6ee7b7", bg: "bg-green-50" },
//       purple: { main: "#8b5cf6", light: "#c4b5fd", bg: "bg-purple-50" },
//       orange: { main: "#f97316", light: "#fdba74", bg: "bg-orange-50" },
//     };

//   const colors = colorMap[color] || colorMap.blue;

//   // Format data for recharts
//   const chartData = data.data_points.slice(-12).map((point) => ({
//     date: new Date(point.date).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//     }),
//     value: point.value,
//     fullDate: point.date,
//   }));

//   return (
//     <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//       <div className="px-6 py-4 border-b border-gray-100">
//         <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
//       </div>

//       {/* Recharts Area Chart */}
//       <div className="p-6">
//         <ResponsiveContainer width="100%" height={180}>
//           <AreaChart
//             data={chartData}
//             margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
//           >
//             <defs>
//               <linearGradient
//                 id={`gradient-${color}`}
//                 x1="0"
//                 y1="0"
//                 x2="0"
//                 y2="1"
//               >
//                 <stop offset="5%" stopColor={colors.main} stopOpacity={0.3} />
//                 <stop offset="95%" stopColor={colors.main} stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <CartesianGrid
//               strokeDasharray="3 3"
//               stroke="#f3f4f6"
//               vertical={false}
//             />
//             <XAxis
//               dataKey="date"
//               tick={{ fill: "#9ca3af", fontSize: 10 }}
//               tickLine={false}
//               axisLine={{ stroke: "#e5e7eb" }}
//             />
//             <YAxis
//               tick={{ fill: "#9ca3af", fontSize: 10 }}
//               tickLine={false}
//               axisLine={{ stroke: "#e5e7eb" }}
//               tickFormatter={(value) => {
//                 if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
//                 if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
//                 return value.toString();
//               }}
//             />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: "#ffffff",
//                 border: "1px solid #e5e7eb",
//                 borderRadius: "0.5rem",
//                 boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
//                 fontSize: "12px",
//               }}
//               formatter={(value: number | undefined) => [
//                 formatValue(value ?? 0),
//                 "Value",
//               ]}
//               labelStyle={{ color: "#374151", fontWeight: 600 }}
//             />
//             <Area
//               type="monotone"
//               dataKey="value"
//               stroke={colors.main}
//               strokeWidth={2}
//               fillOpacity={1}
//               fill={`url(#gradient-${color})`}
//               dot={false}
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Top 3 Trends */}
//       <div className="px-6 pb-6">
//         <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
//           Top 3 Trends
//         </h4>
//         <div className="space-y-2">
//           {data.top_three.map((trend, index) => (
//             <div
//               key={index}
//               className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//             >
//               <div className="flex items-center space-x-3">
//                 <span className="text-xs font-bold text-gray-400">
//                   #{index + 1}
//                 </span>
//                 <span className="text-sm font-medium text-gray-900">
//                   {trend.name}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <span className="text-sm font-bold text-gray-900">
//                   {formatValue(trend.value)}
//                 </span>
//                 <div className="flex items-center">
//                   {trend.percentage_change >= 0 ? (
//                     <MdTrendingUp className="w-4 h-4 text-green-600" />
//                   ) : (
//                     <MdTrendingDown className="w-4 h-4 text-red-600" />
//                   )}
//                   <span
//                     className={`text-xs font-semibold ml-1 ${
//                       trend.percentage_change >= 0
//                         ? "text-green-600"
//                         : "text-red-600"
//                     }`}
//                   >
//                     {Math.abs(trend.percentage_change).toFixed(1)}%
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TrendChart;
