import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = { name: string; options: Record<string, unknown> };
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];
  const user: AuthenticatedUser = {
    id: 1, openId: "test-user-123", email: "test@example.com", name: "Test User",
    loginMethod: "manus", role: "admin",
    createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: (name: string, options: Record<string, unknown>) => { clearedCookies.push({ name, options }); } } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// Mock db module with all new fields
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({}),
  getLinks: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, url: "https://shopee.com/product1", title: "Produto Teste", imageUrl: null, price: "R$ 29,90", discount: "30%", description: "Desc", category: "cozinha", active: true, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getLinkById: vi.fn().mockResolvedValue(
    { id: 1, userId: 1, url: "https://shopee.com/product1", title: "Produto Teste", imageUrl: null, price: "R$ 29,90", discount: "30%", description: "Desc", category: "cozinha", active: true, createdAt: new Date(), updatedAt: new Date() }
  ),
  createLink: vi.fn().mockResolvedValue(1),
  updateLink: vi.fn().mockResolvedValue(undefined),
  deleteLink: vi.fn().mockResolvedValue(undefined),
  getSchedules: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, linkId: 1, daysOfWeek: "1,5", hour: 10, minute: 30, customMessage: "Oferta!", repeatWeekly: true, active: true, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getScheduleById: vi.fn().mockResolvedValue(
    { id: 1, userId: 1, linkId: 1, daysOfWeek: "1,5", hour: 10, minute: 30, customMessage: "Oferta!", repeatWeekly: true, active: true, createdAt: new Date(), updatedAt: new Date() }
  ),
  createSchedule: vi.fn().mockResolvedValue(1),
  updateSchedule: vi.fn().mockResolvedValue(undefined),
  deleteSchedule: vi.fn().mockResolvedValue(undefined),
  getSendHistory: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, linkId: 1, scheduleId: 1, linkTitle: "Produto Teste", linkUrl: "https://shopee.com/product1", status: "success", errorMessage: null, sentAt: new Date() },
  ]),
  getSettings: vi.fn().mockResolvedValue(
    { id: 1, userId: 1, allowedStartHour: 8, allowedEndHour: 22, whatsappGroupId: "120363407824970879@g.us", botApiKey: "test-api-key-123", allowWeekends: true, defaultMessage: "Confira!", createdAt: new Date(), updatedAt: new Date() }
  ),
  upsertSettings: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  getDashboardStats: vi.fn().mockResolvedValue({ linkCount: 3, scheduleCount: 2, sentCount: 5, failedCount: 0, pendingCount: 1 }),
  getUpcomingSchedules: vi.fn().mockResolvedValue([
    { id: 1, linkId: 1, linkTitle: "Produto Teste", daysOfWeek: "1,5", hour: 14, minute: 30, repeatWeekly: true },
  ]),
  getNotifications: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, title: "Link enviado com sucesso", message: "O link \"Produto Teste\" foi enviado.", type: "send_success", isRead: false, createdAt: new Date() },
    { id: 2, userId: 1, title: "Agendamento criado", message: "Agendamento criado.", type: "schedule_created", isRead: true, createdAt: new Date() },
  ]),
  getUnreadNotificationCount: vi.fn().mockResolvedValue(3),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  createNotification: vi.fn().mockResolvedValue(1),
}));

vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn().mockResolvedValue(true) }));
vi.mock("./storage", () => ({ storagePut: vi.fn().mockResolvedValue({ key: "k", url: "https://cdn.example.com/img.png" }) }));
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({ choices: [{ message: { content: "Olá! Posso te ajudar com ofertas!" } }] }),
}));

// ─── Auth ────────────────────────────────────────────────────────
describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});

describe("auth.me", () => {
  it("returns user when authenticated", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeTruthy();
    expect(result?.openId).toBe("test-user-123");
  });

  it("returns null when not authenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

// ─── Links ───────────────────────────────────────────────────────
describe("links", () => {
  it("lists links with category field", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.links.list();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toBe("Produto Teste");
    expect(result[0].category).toBe("cozinha");
  });

  it("creates a link with category", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.links.create({
      url: "https://shopee.com/new",
      title: "Novo Produto",
      price: "R$ 49,90",
      discount: "20%",
      category: "decoração",
    });
    expect(result.id).toBe(1);
  });

  it("updates a link", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.links.update({ id: 1, title: "Atualizado" });
    expect(result.success).toBe(true);
  });

  it("deletes a link", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.links.delete({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects unauthenticated access", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.links.list()).rejects.toThrow();
  });
});

// ─── Schedules ───────────────────────────────────────────────────
describe("schedules", () => {
  it("lists schedules with linkTitle enrichment", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.schedules.list();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].linkTitle).toBe("Produto Teste");
    expect(result[0].customMessage).toBe("Oferta!");
    expect(result[0].repeatWeekly).toBe(true);
  });

  it("creates a schedule with customMessage and repeatWeekly", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.schedules.create({
      linkId: 1,
      daysOfWeek: "1,2,3,4,5",
      hour: 10,
      minute: 30,
      customMessage: "Confira essa oferta!",
      repeatWeekly: true,
    });
    expect(result.id).toBe(1);
  });

  it("updates a schedule", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.schedules.update({ id: 1, active: false });
    expect(result.success).toBe(true);
  });

  it("deletes a schedule", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.schedules.delete({ id: 1 });
    expect(result.success).toBe(true);
  });
});

// ─── History ─────────────────────────────────────────────────────
describe("history", () => {
  it("lists send history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.history.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].status).toBe("success");
    expect(result[0].linkTitle).toBe("Produto Teste");
  });

  it("returns history stats", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.history.stats();
    expect(result.sent).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.pending).toBe(0);
  });
});

// ─── Dashboard ───────────────────────────────────────────────────
describe("dashboard", () => {
  it("returns stats with all counters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.dashboard.stats();
    expect(stats.linkCount).toBe(3);
    expect(stats.scheduleCount).toBe(2);
    expect(stats.sentCount).toBe(5);
    expect(stats.failedCount).toBe(0);
    expect(stats.pendingCount).toBe(1);
  });

  it("returns upcoming schedules", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const upcoming = await caller.dashboard.upcoming();
    expect(Array.isArray(upcoming)).toBe(true);
    expect(upcoming.length).toBeGreaterThan(0);
    expect(upcoming[0].linkTitle).toBe("Produto Teste");
  });
});

// ─── Notifications ───────────────────────────────────────────────
describe("notifications", () => {
  it("lists notifications", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.list();
    expect(result.length).toBe(2);
    expect(result[0].title).toBe("Link enviado com sucesso");
    expect(result[0].isRead).toBe(false);
  });

  it("returns unread count as number", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const count = await caller.notifications.unreadCount();
    expect(count).toBe(3);
  });

  it("marks a notification as read", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.markRead({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("marks all notifications as read", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.markAllRead();
    expect(result.success).toBe(true);
  });
});

// ─── Chatbot ─────────────────────────────────────────────────────
describe("chatbot", () => {
  it("sends a message and receives a reply", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.chatbot.sendMessage({ message: "Tem link de cafeteira?" });
    expect(typeof result.reply === "string" || Array.isArray(result.reply)).toBe(true);
  });
});

// ─── Settings ────────────────────────────────────────────────────
describe("settings", () => {
  it("gets settings with all new fields", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.settings.get();
    expect(result?.allowedStartHour).toBe(8);
    expect(result?.allowedEndHour).toBe(22);
    expect(result?.botApiKey).toBe("test-api-key-123");
    expect(result?.allowWeekends).toBe(true);
    expect(result?.defaultMessage).toBe("Confira!");
  });

  it("updates settings with allowWeekends and defaultMessage", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.settings.update({
      allowedStartHour: 9,
      allowedEndHour: 21,
      allowWeekends: false,
      defaultMessage: "Nova mensagem padrão",
    });
    expect(result.success).toBe(true);
  });

  it("regenerates API key", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.settings.regenerateApiKey();
    expect(result.apiKey).toBeTruthy();
    expect(typeof result.apiKey).toBe("string");
    expect(result.apiKey.length).toBeGreaterThan(10);
  });
});
