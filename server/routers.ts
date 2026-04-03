import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Dashboard ──────────────────────────────────────────────────
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getDashboardStats(ctx.user.id);
    }),
    upcoming: protectedProcedure.query(async ({ ctx }) => {
      return db.getUpcomingSchedules(ctx.user.id);
    }),
  }),

  // ─── Links ───────────────────────────────────────────────────────
  links: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getLinks(ctx.user.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getLinkById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        url: z.string().min(1),
        title: z.string().min(1),
        imageUrl: z.string().optional(),
        price: z.string().optional(),
        discount: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createLink({
          userId: ctx.user.id,
          url: input.url,
          title: input.title,
          imageUrl: input.imageUrl ?? null,
          price: input.price ?? null,
          discount: input.discount ?? null,
          description: input.description ?? null,
          category: input.category ?? null,
          active: true,
        });
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        url: z.string().min(1).optional(),
        title: z.string().min(1).optional(),
        imageUrl: z.string().optional(),
        price: z.string().optional(),
        discount: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateLink(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLink(input.id);
        return { success: true };
      }),
    uploadImage: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileBase64: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const suffix = nanoid(8);
        const key = `links/${ctx.user.id}/${suffix}-${input.fileName}`;
        const buffer = Buffer.from(input.fileBase64, "base64");
        const { url } = await storagePut(key, buffer, input.contentType);
        return { url };
      }),
  }),

  // ─── Schedules ─────────────────────────────────────────────────
  schedules: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const scheds = await db.getSchedules(ctx.user.id);
      // Enrich with link title
      const result = [];
      for (const sched of scheds) {
        const link = await db.getLinkById(sched.linkId);
        result.push({
          ...sched,
          linkTitle: link?.title ?? "Link removido",
        });
      }
      return result;
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getScheduleById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        linkId: z.number(),
        daysOfWeek: z.string().min(1),
        hour: z.number().min(0).max(23),
        minute: z.number().min(0).max(59),
        customMessage: z.string().optional(),
        repeatWeekly: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createSchedule({
          userId: ctx.user.id,
          linkId: input.linkId,
          daysOfWeek: input.daysOfWeek,
          hour: input.hour,
          minute: input.minute,
          customMessage: input.customMessage ?? null,
          repeatWeekly: input.repeatWeekly ?? true,
          active: true,
        });
        // Create notification
        const link = await db.getLinkById(input.linkId);
        try {
          await db.createNotification({
            userId: ctx.user.id,
            title: "Agendamento criado",
            message: `Agendamento para "${link?.title ?? 'Link #' + input.linkId}" às ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`,
            type: "schedule_created",
            read: false,
            relatedLinkId: input.linkId,
          });
          await notifyOwner({
            title: "Novo agendamento criado",
            content: `Agendamento para "${link?.title ?? 'Link #' + input.linkId}" às ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`,
          });
        } catch { /* ignore notification errors */ }
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        linkId: z.number().optional(),
        daysOfWeek: z.string().optional(),
        hour: z.number().min(0).max(23).optional(),
        minute: z.number().min(0).max(59).optional(),
        customMessage: z.string().optional(),
        repeatWeekly: z.boolean().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSchedule(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSchedule(input.id);
        return { success: true };
      }),
  }),

  // ─── Send History ──────────────────────────────────────────────
  history: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(500).optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.getSendHistory(ctx.user.id, input?.limit ?? 100);
      }),
    stats: protectedProcedure.query(async ({ ctx }) => {
      const history = await db.getSendHistory(ctx.user.id, 10000);
      const sent = history.filter(h => h.status === "success").length;
      const failed = history.filter(h => h.status === "failed").length;
      const pending = history.filter(h => h.status === "pending").length;
      return { sent, failed, pending };
    }),
  }),

  // ─── Notifications ────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getNotifications(ctx.user.id);
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount(ctx.user.id);
    }),
    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationRead(input.id);
        return { success: true };
      }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ─── Chatbot ──────────────────────────────────────────────────
  chatbot: router({
    sendMessage: protectedProcedure
      .input(z.object({ message: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        // Get user's links to provide context
        const userLinks = await db.getLinks(ctx.user.id);
        const linksContext = userLinks.map(l =>
          `- ${l.title}: ${l.description ?? ''} | Preço: ${l.price ?? 'N/A'} | Desconto: ${l.discount ?? 'N/A'} | Categoria: ${l.category ?? 'N/A'} | URL: ${l.url}`
        ).join("\n");

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é a assistente virtual da Emily, uma influenciadora digital que compartilha ofertas e links de afiliados da Shopee. Responda de forma simpática, usando emojis ocasionalmente. Se o cliente perguntar sobre um produto que está cadastrado, compartilhe as informações. Se não tiver o produto, diga que a influenciadora está sempre de olho nas melhores ofertas e pode aparecer em breve.

Produtos cadastrados:
${linksContext || "Nenhum produto cadastrado ainda."}`,
            },
            { role: "user", content: input.message },
          ],
        });

        const botReply = response.choices?.[0]?.message?.content ?? "Desculpe, não consegui processar sua mensagem. Tente novamente!";
        return { reply: botReply };
      }),
  }),

  // ─── Analytics ────────────────────────────────────────────────
  analytics: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      return db.getAnalyticsSummary(ctx.user.id);
    }),
    byDay: protectedProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ ctx, input }) => {
        return db.getAnalyticsByDay(ctx.user.id, input.days);
      }),
    byHour: protectedProcedure.query(async ({ ctx }) => {
      return db.getAnalyticsByHour(ctx.user.id);
    }),
    byProduct: protectedProcedure.query(async ({ ctx }) => {
      return db.getAnalyticsByProduct(ctx.user.id);
    }),
    byDayOfWeek: protectedProcedure.query(async ({ ctx }) => {
      return db.getAnalyticsByDayOfWeek(ctx.user.id);
    }),
  }),

  // ─── Settings ──────────────────────────────────────────────────
  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      let s = await db.getSettings(ctx.user.id);
      if (!s) {
        const apiKey = nanoid(32);
        await db.upsertSettings(ctx.user.id, { botApiKey: apiKey });
        s = await db.getSettings(ctx.user.id);
      }
      return s;
    }),
    update: protectedProcedure
      .input(z.object({
        allowedStartHour: z.number().min(0).max(23).optional(),
        allowedEndHour: z.number().min(0).max(23).optional(),
        whatsappGroupId: z.string().optional(),
        allowWeekends: z.boolean().optional(),
        defaultMessage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertSettings(ctx.user.id, input);
        return { success: true };
      }),
    regenerateApiKey: protectedProcedure.mutation(async ({ ctx }) => {
      const newKey = nanoid(32);
      await db.upsertSettings(ctx.user.id, { botApiKey: newKey });
      return { apiKey: newKey };
    }),
  }),
});

export type AppRouter = typeof appRouter;
