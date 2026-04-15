import type { Express } from "express";
import { type Server } from "http";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", dashboard: "Jeff's MarketIntel v3", asOf: "Apr 15, 2026" });
  });

  return httpServer;
}
