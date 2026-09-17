import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  projectId?: string;
  status?: string;
  userId?: string;
}

function dateRange(filters: ReportFilters) {
  const gte = filters.dateFrom ? new Date(filters.dateFrom + "T00:00:00") : undefined;
  const lte = filters.dateTo ? new Date(filters.dateTo + "T23:59:59") : undefined;
  if (!gte && !lte) return undefined;
  return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
}

export async function getUsageReport(filters: ReportFilters) {
  const where: Prisma.FlightLogWhereInput = {};
  const range = dateRange(filters);
  if (range) where.date = range;
  if (filters.projectId) where.projectId = filters.projectId;
  if (filters.userId) where.operatorId = filters.userId;

  return prisma.flightLog.findMany({
    where,
    orderBy: { date: "desc" },
    include: { operator: true, project: true, withdrawal: { include: { equipment: true } } },
  });
}

export async function getBatteryReport() {
  return prisma.battery.findMany({
    orderBy: { code: "asc" },
    include: {
      _count: { select: { chargeRecords: true, usageRecords: true, incidents: true, maintenanceRecords: true } },
    },
  });
}

export async function getAssetReport() {
  const equipmentList = await prisma.equipment.findMany({
    orderBy: { name: "asc" },
    include: {
      accessories: true,
      _count: { select: { reservations: true, incidents: true, maintenanceRecords: true } },
      withdrawals: {
        where: { status: "ABERTA" },
        take: 1,
        include: { responsibleUser: true },
      },
    },
  });
  return equipmentList;
}

export async function getWithdrawalReport(filters: ReportFilters) {
  const where: Prisma.WithdrawalWhereInput = {};
  const range = dateRange(filters);
  if (range) where.checkoutAt = range;
  if (filters.status) where.status = filters.status;
  if (filters.projectId) where.projectId = filters.projectId;
  if (filters.userId) where.responsibleUserId = filters.userId;

  return prisma.withdrawal.findMany({
    where,
    orderBy: { checkoutAt: "desc" },
    include: { responsibleUser: true, equipment: true, project: true, return: true },
  });
}
