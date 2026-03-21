import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// Mock db module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({}),
  getLinks: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, url: "https://shopee.com/product1", title: "Produto Teste", imageUrl: null, price: "R$ 29,90", discount: "30%", description: "Desc", active: true, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getLinkById: vi.fn().mockResolvedValue(
    { id: 1, userId: 1, url: "https://shopee.com/product1", title: "Produto Teste", imageUrl: null, price: "R$ 29,90", discount: "30%", description: "Desc", active: true, createdAt: new Date(), updatedAt: new Date() }
  ),
  createLink: vi.fn().mockResolvedValue(1),
  updateLink: vi.fn().mockResolvedValue(undefined),
  deleteLink: vi.fn().mockResolvedValue(undefined),
  getSchedules: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, linkId: 1, daysOfWeek: "1,2,3,4,5", hour: 10, minute: 30, active: true, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getScheduleById: vi.fn().mockResolvedValue(
    { id: 1, userId: 1, linkId: 1, daysOfWeek: "1,2,3,4,5", hour: 10, minute: 30, active: true, createdAt: new Date(), updatedAt: new Date() }
  ),
  createSchedule: vi.fn().mockResolvedValue(1),
  updateSchedule: vi.fn().mockResolvedValue(undefined),
  deleteSchedule: vi.fn().mockResolvedValue(undefined),
  getSendHistory: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, linkId: 1, scheduleId: 1, linkTitle: "Produto Teste", linkUrl: "https://shopee.com/product1", status: "success", errorMessage: null, sentAt: new Date() },
  ]),
  getSettings: vi.fn().mockResolvedValue(
    { id: 1, userId: 1, allowedStartHour: 8, allowedEndHour: 22, whatsappGroupId: "120363407824970879@g.us", botApiKey: "test-api-key-123", createdAt: new Date(), updatedAt: new Date() }
  ),
  upsertSettings: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "https://cdn.example.com/image.png" }),
}));

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

describe("links", () => {
  it("lists links for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.links.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toBe("Produto Teste");
  });

  it("creates a link", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.links.create({
      url: "https://shopee.com/new-product",
      title: "Novo Produto",
      price: "R$ 49,90",
      discount: "20%",
    });
    expect(result.id).toBe(1);
  });

  it("updates a link", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.links.update({
      id: 1,
      title: "Produto Atualizado",
    });
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

describe("schedules", () => {
  it("lists schedules for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.schedules.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("creates a schedule", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.schedules.create({
      linkId: 1,
      daysOfWeek: "1,2,3,4,5",
      hour: 10,
      minute: 30,
    });
    expect(result.id).toBe(1);
  });

  it("updates a schedule", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.schedules.update({
      id: 1,
      active: false,
    });
    expect(result.success).toBe(true);
  });

  it("deletes a schedule", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.schedules.delete({ id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("history", () => {
  it("lists send history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.history.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].status).toBe("success");
  });
});

describe("settings", () => {
  it("gets settings for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.settings.get();
    expect(result).toBeTruthy();
    expect(result?.allowedStartHour).toBe(8);
    expect(result?.allowedEndHour).toBe(22);
    expect(result?.botApiKey).toBe("test-api-key-123");
  });

  it("updates settings", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.settings.update({
      allowedStartHour: 9,
      allowedEndHour: 21,
      whatsappGroupId: "new-group-id@g.us",
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
