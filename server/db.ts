import { eq, and, desc, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  links, InsertLink,
  schedules, InsertSchedule,
  sendHistory, InsertSendHistory,
  settings, InsertSettings,
  notifications, InsertNotification,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Links ───────────────────────────────────────────────────────────
export async function createLink(data: Omit<InsertLink, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(links).values(data);
  return result[0].insertId;
}

export async function getLinks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(links).where(eq(links.userId, userId)).orderBy(desc(links.createdAt));
}

export async function getLinkById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(links).where(eq(links.id, id)).limit(1);
  return result[0];
}

export async function updateLink(id: number, data: Partial<InsertLink>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(links).set(data).where(eq(links.id, id));
}

export async function deleteLink(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(links).where(eq(links.id, id));
}

// ─── Schedules ───────────────────────────────────────────────────────
export async function createSchedule(data: Omit<InsertSchedule, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(schedules).values(data);
  return result[0].insertId;
}

export async function getSchedules(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(schedules).where(eq(schedules.userId, userId)).orderBy(desc(schedules.createdAt));
}

export async function getScheduleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(schedules).where(eq(schedules.id, id)).limit(1);
  return result[0];
}

export async function updateSchedule(id: number, data: Partial<InsertSchedule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(schedules).set(data).where(eq(schedules.id, id));
}

export async function deleteSchedule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(schedules).where(eq(schedules.id, id));
}

export async function getActiveSchedulesForTime(dayOfWeek: number, hour: number, minute: number) {
  const db = await getDb();
  if (!db) return [];
  const allActive = await db.select().from(schedules).where(
    and(eq(schedules.active, true), eq(schedules.hour, hour), eq(schedules.minute, minute))
  );
  return allActive.filter(s => {
    const days = s.daysOfWeek.split(",").map(d => parseInt(d.trim()));
    return days.includes(dayOfWeek);
  });
}

// ─── Send History ────────────────────────────────────────────────────
export async function createSendHistory(data: Omit<InsertSendHistory, "id" | "sentAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sendHistory).values(data);
  return result[0].insertId;
}

export async function getSendHistory(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sendHistory).where(eq(sendHistory.userId, userId)).orderBy(desc(sendHistory.sentAt)).limit(limit);
}

// ─── Dashboard Stats ────────────────────────────────────────────────
export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { linksCount: 0, schedulesCount: 0, sentCount: 0, failedCount: 0, pendingCount: 0 };

  const [linksResult] = await db.select({ count: count() }).from(links).where(eq(links.userId, userId));
  const [schedulesResult] = await db.select({ count: count() }).from(schedules).where(and(eq(schedules.userId, userId), eq(schedules.active, true)));
  const [sentResult] = await db.select({ count: count() }).from(sendHistory).where(and(eq(sendHistory.userId, userId), eq(sendHistory.status, "success")));
  const [failedResult] = await db.select({ count: count() }).from(sendHistory).where(and(eq(sendHistory.userId, userId), eq(sendHistory.status, "failed")));
  const [pendingResult] = await db.select({ count: count() }).from(sendHistory).where(and(eq(sendHistory.userId, userId), eq(sendHistory.status, "pending")));

  return {
    linksCount: linksResult?.count ?? 0,
    schedulesCount: schedulesResult?.count ?? 0,
    sentCount: sentResult?.count ?? 0,
    failedCount: failedResult?.count ?? 0,
    pendingCount: pendingResult?.count ?? 0,
  };
}

/** Get upcoming schedules with link info */
export async function getUpcomingSchedules(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const activeSchedules = await db.select().from(schedules).where(and(eq(schedules.userId, userId), eq(schedules.active, true)));
  const result = [];
  for (const sched of activeSchedules) {
    const link = await getLinkById(sched.linkId);
    result.push({
      ...sched,
      linkTitle: link?.title ?? "Link removido",
      linkUrl: link?.url ?? "",
    });
  }
  return result;
}

// ─── Settings ────────────────────────────────────────────────────────
export async function getSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
  return result[0];
}

export async function upsertSettings(userId: number, data: Partial<Omit<InsertSettings, "id" | "userId" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSettings(userId);
  if (existing) {
    await db.update(settings).set(data).where(eq(settings.userId, userId));
  } else {
    await db.insert(settings).values({ userId, ...data });
  }
}

export async function getSettingsByApiKey(apiKey: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.botApiKey, apiKey)).limit(1);
  return result[0];
}

// ─── Notifications ──────────────────────────────────────────────────
export async function createNotification(data: Omit<InsertNotification, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return result[0].insertId;
}

export async function getNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db.select({ count: count() }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  return result?.count ?? 0;
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
}


// ─── Analytics ──────────────────────────────────────────────────────
export async function getAnalyticsSummary(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const [totalSent] = await db.select({ count: count() }).from(sendHistory).where(and(eq(sendHistory.userId, userId), sql`status = 'sent'`));
  const [totalFailed] = await db.select({ count: count() }).from(sendHistory).where(and(eq(sendHistory.userId, userId), sql`status = 'failed'`));
  const [totalPending] = await db.select({ count: count() }).from(sendHistory).where(and(eq(sendHistory.userId, userId), sql`status = 'pending'`));

  // Calculate average per day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30Days = await db.select().from(sendHistory).where(
    and(
      eq(sendHistory.userId, userId),
      sql`DATE(${sendHistory.sentAt}) >= DATE(${thirtyDaysAgo})`
    )
  );
  const uniqueDays = new Set(last30Days.map(h => new Date(h.sentAt).toDateString())).size;
  const averagePerDay = uniqueDays > 0 ? Math.round(last30Days.length / uniqueDays) : 0;

  return {
    totalSent: totalSent?.count ?? 0,
    totalFailed: totalFailed?.count ?? 0,
    totalPending: totalPending?.count ?? 0,
    successRate: totalSent && (totalSent.count + totalFailed.count) > 0 
      ? Math.round((totalSent.count / (totalSent.count + totalFailed.count)) * 100)
      : 0,
    averagePerDay,
  };
}

export async function getAnalyticsByDay(userId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT CAST(DATE(${sendHistory.sentAt}) AS CHAR) as day,
           COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
           COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
    FROM ${sendHistory}
    WHERE userId = ${userId} 
      AND ${sendHistory.sentAt} >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
    GROUP BY CAST(DATE(${sendHistory.sentAt}) AS CHAR)
    ORDER BY CAST(DATE(${sendHistory.sentAt}) AS CHAR) DESC
  `);

  return (result as unknown as Array<{ day: string; sent: number; failed: number }>);
}

export async function getAnalyticsByHour(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select({
    hour: sql<number>`HOUR(${sendHistory.sentAt})`,
    sent: sql<number>`COUNT(CASE WHEN status = 'sent' THEN 1 END)`,
    failed: sql<number>`COUNT(CASE WHEN status = 'failed' THEN 1 END)`,
  }).from(sendHistory)
    .where(eq(sendHistory.userId, userId))
    .groupBy(sql`HOUR(${sendHistory.sentAt})`)
    .orderBy(sql`HOUR(${sendHistory.sentAt}) ASC`);

  return result;
}

export async function getAnalyticsByProduct(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select({
    linkId: sendHistory.linkId,
    linkTitle: links.title,
    sent: sql<number>`COUNT(CASE WHEN status = 'sent' THEN 1 END)`,
    failed: sql<number>`COUNT(CASE WHEN status = 'failed' THEN 1 END)`,
  }).from(sendHistory)
    .leftJoin(links, eq(sendHistory.linkId, links.id))
    .where(eq(sendHistory.userId, userId))
    .groupBy(sendHistory.linkId)
    .orderBy(sql`COUNT(CASE WHEN status = 'sent' THEN 1 END) DESC`);

  return result;
}

export async function getAnalyticsByDayOfWeek(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const result = await db.select({
    dayOfWeek: sql<number>`DAYOFWEEK(${sendHistory.sentAt}) - 1`,
    sent: sql<number>`COUNT(CASE WHEN status = 'sent' THEN 1 END)`,
    failed: sql<number>`COUNT(CASE WHEN status = 'failed' THEN 1 END)`,
  }).from(sendHistory)
    .where(eq(sendHistory.userId, userId))
    .groupBy(sql`DAYOFWEEK(${sendHistory.sentAt})`)
    .orderBy(sql`DAYOFWEEK(${sendHistory.sentAt}) ASC`);

  return result.map(r => ({
    ...r,
    dayName: dayNames[r.dayOfWeek] || 'Unknown',
  }));
}
