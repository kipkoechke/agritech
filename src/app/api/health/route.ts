import { NextResponse } from "next/server";

const startTime = Date.now();

export async function GET() {
  const uptime = (Date.now() - startTime) / 1000;
  const memoryUsage = process.memoryUsage();

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || "development",
    version: process.env.npm_package_version || "0.1.0",
    uptime,
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers,
    },
  });
}
