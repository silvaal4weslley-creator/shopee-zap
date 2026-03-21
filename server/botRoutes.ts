/**
 * Rotas públicas para o bot Python acessar.
 * Estas rotas NÃO passam pelo middleware OAuth.
 * Protegidas por API key simples (header X-Bot-Api-Key).
 */
import type { Express, Request, Response } from "express";
import * as db from "./db";
import { getDb } from "./db";
import { links, schedules } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

async function validateApiKey(req: Request, res: Response): Promise<ReturnType<typeof db.getSettingsByApiKey> | null> {
  const apiKey = req.headers["x-bot-api-key"] as string;
  if (!apiKey) {
    res.status(401).json({ error: "API key ausente. Envie no header X-Bot-Api-Key." });
    return null;
  }
  const settings = await db.getSettingsByApiKey(apiKey);
  if (!settings) {
    res.status(403).json({ error: "API key inválida." });
    return null;
  }
  return settings;
}

export function registerBotRoutes(app: Express) {
  /**
   * GET /api/bot/schedules
   * Retorna os agendamentos ativos para o momento atual (dia/hora/minuto).
   * Query params opcionais: day, hour, minute (para testar com horários específicos)
   */
  app.get("/api/bot/schedules", async (req: Request, res: Response) => {
    try {
      const settings = await validateApiKey(req, res);
      if (!settings) return;

      const now = new Date();
      const day = req.query.day !== undefined ? parseInt(req.query.day as string) : now.getUTCDay();
      const hour = req.query.hour !== undefined ? parseInt(req.query.hour as string) : now.getUTCHours();
      const minute = req.query.minute !== undefined ? parseInt(req.query.minute as string) : now.getUTCMinutes();

      // Verificar horários permitidos
      if (hour < settings.allowedStartHour || hour >= settings.allowedEndHour) {
        res.json({
          schedules: [],
          message: `Fora do horário permitido (${settings.allowedStartHour}h - ${settings.allowedEndHour}h)`,
          currentTime: { day, hour, minute },
          settings: {
            allowedStartHour: settings.allowedStartHour,
            allowedEndHour: settings.allowedEndHour,
            whatsappGroupId: settings.whatsappGroupId,
          },
        });
        return;
      }

      // Buscar agendamentos ativos para este horário
      const activeSchedules = await db.getActiveSchedulesForTime(day, hour, minute);

      // Buscar os links associados
      const dbInstance = await getDb();
      const result = [];
      for (const schedule of activeSchedules) {
        if (schedule.userId !== settings.userId) continue;
        const link = await db.getLinkById(schedule.linkId);
        if (link && link.active) {
          result.push({
            scheduleId: schedule.id,
            linkId: link.id,
            title: link.title,
            url: link.url,
            imageUrl: link.imageUrl,
            price: link.price,
            discount: link.discount,
            description: link.description,
          });
        }
      }

      res.json({
        schedules: result,
        currentTime: { day, hour, minute },
        settings: {
          allowedStartHour: settings.allowedStartHour,
          allowedEndHour: settings.allowedEndHour,
          whatsappGroupId: settings.whatsappGroupId,
        },
      });
    } catch (error) {
      console.error("[Bot API] Error fetching schedules:", error);
      res.status(500).json({ error: "Erro interno ao buscar agendamentos." });
    }
  });

  /**
   * GET /api/bot/all-schedules
   * Retorna TODOS os agendamentos ativos com seus links (para o bot montar o cron local).
   */
  app.get("/api/bot/all-schedules", async (req: Request, res: Response) => {
    try {
      const settings = await validateApiKey(req, res);
      if (!settings) return;

      const userSchedules = await db.getSchedules(settings.userId);
      const result = [];
      for (const schedule of userSchedules) {
        if (!schedule.active) continue;
        const link = await db.getLinkById(schedule.linkId);
        if (link && link.active) {
          result.push({
            scheduleId: schedule.id,
            linkId: link.id,
            title: link.title,
            url: link.url,
            imageUrl: link.imageUrl,
            price: link.price,
            discount: link.discount,
            description: link.description,
            daysOfWeek: schedule.daysOfWeek,
            hour: schedule.hour,
            minute: schedule.minute,
          });
        }
      }

      res.json({
        schedules: result,
        settings: {
          allowedStartHour: settings.allowedStartHour,
          allowedEndHour: settings.allowedEndHour,
          whatsappGroupId: settings.whatsappGroupId,
        },
      });
    } catch (error) {
      console.error("[Bot API] Error fetching all schedules:", error);
      res.status(500).json({ error: "Erro interno ao buscar agendamentos." });
    }
  });

  /**
   * POST /api/bot/report-send
   * Bot reporta o resultado de um envio.
   */
  app.post("/api/bot/report-send", async (req: Request, res: Response) => {
    try {
      const settings = await validateApiKey(req, res);
      if (!settings) return;

      const { scheduleId, linkId, status, errorMessage } = req.body;
      if (!status || !["success", "failed"].includes(status)) {
        res.status(400).json({ error: "Status deve ser 'success' ou 'failed'." });
        return;
      }

      const link = linkId ? await db.getLinkById(linkId) : null;

      await db.createSendHistory({
        userId: settings.userId,
        linkId: linkId ?? null,
        scheduleId: scheduleId ?? null,
        linkTitle: link?.title ?? null,
        linkUrl: link?.url ?? null,
        status,
        errorMessage: errorMessage ?? null,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("[Bot API] Error reporting send:", error);
      res.status(500).json({ error: "Erro interno ao registrar envio." });
    }
  });

  /**
   * GET /api/bot/health
   * Health check simples para o bot verificar se a API está acessível.
   */
  app.get("/api/bot/health", async (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
}
