import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Links (Produtos Shopee) ─────────────────────────────────────────
export const links = mysqlTable("links", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  url: text("url").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  imageUrl: text("imageUrl"),
  price: varchar("price", { length: 50 }),
  discount: varchar("discount", { length: 50 }),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Link = typeof links.$inferSelect;
export type InsertLink = typeof links.$inferInsert;

// ─── Schedules (Agendamentos) ────────────────────────────────────────
export const schedules = mysqlTable("schedules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  linkId: int("linkId").notNull(),
  /** Dias da semana: "0,1,2,3,4,5,6" (0=Dom, 6=Sáb) */
  daysOfWeek: varchar("daysOfWeek", { length: 50 }).notNull(),
  hour: int("hour").notNull(),
  minute: int("minute").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;

// ─── Send History (Histórico de Envios) ──────────────────────────────
export const sendHistory = mysqlTable("send_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  linkId: int("linkId"),
  scheduleId: int("scheduleId"),
  linkTitle: varchar("linkTitle", { length: 500 }),
  linkUrl: text("linkUrl"),
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type SendHistory = typeof sendHistory.$inferSelect;
export type InsertSendHistory = typeof sendHistory.$inferInsert;

// ─── Settings (Configurações) ────────────────────────────────────────
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Hora de início permitida para envios (0-23) */
  allowedStartHour: int("allowedStartHour").default(8).notNull(),
  /** Hora de fim permitida para envios (0-23) */
  allowedEndHour: int("allowedEndHour").default(22).notNull(),
  /** ID do grupo WhatsApp */
  whatsappGroupId: varchar("whatsappGroupId", { length: 100 }),
  /** Chave de API para o bot acessar */
  botApiKey: varchar("botApiKey", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = typeof settings.$inferInsert;
