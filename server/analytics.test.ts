import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import * as db from "./db";

describe("Analytics Functions", () => {
  const testUserId = 99999;

  beforeAll(async () => {
    console.log("Analytics tests setup complete");
  });

  afterAll(async () => {
    console.log("Analytics tests cleanup complete");
  });

  it("should return analytics summary with correct structure", async () => {
    const summary = await db.getAnalyticsSummary(testUserId);
    
    expect(summary).toBeDefined();
    expect(summary).toHaveProperty("totalSent");
    expect(summary).toHaveProperty("totalFailed");
    expect(summary).toHaveProperty("totalPending");
    expect(summary).toHaveProperty("successRate");
    expect(summary).toHaveProperty("averagePerDay");
    
    expect(typeof summary.totalSent).toBe("number");
    expect(typeof summary.totalFailed).toBe("number");
    expect(typeof summary.totalPending).toBe("number");
    expect(typeof summary.successRate).toBe("number");
    expect(typeof summary.averagePerDay).toBe("number");
  });

  it("should return valid success rate percentage", async () => {
    const summary = await db.getAnalyticsSummary(testUserId);
    
    expect(summary.successRate).toBeGreaterThanOrEqual(0);
    expect(summary.successRate).toBeLessThanOrEqual(100);
  });

  it("should return analytics by product with correct structure", async () => {
    const byProduct = await db.getAnalyticsByProduct(testUserId);
    
    expect(Array.isArray(byProduct)).toBe(true);
    
    if (byProduct.length > 0) {
      const firstProduct = byProduct[0];
      expect(firstProduct).toHaveProperty("linkId");
      expect(firstProduct).toHaveProperty("linkTitle");
      expect(firstProduct).toHaveProperty("sent");
      expect(firstProduct).toHaveProperty("failed");
      expect(typeof firstProduct.sent).toBe("number");
      expect(typeof firstProduct.failed).toBe("number");
    }
  });

  it("should return non-negative numbers for summary", async () => {
    const summary = await db.getAnalyticsSummary(testUserId);
    
    expect(summary.totalSent).toBeGreaterThanOrEqual(0);
    expect(summary.totalFailed).toBeGreaterThanOrEqual(0);
    expect(summary.totalPending).toBeGreaterThanOrEqual(0);
    expect(summary.averagePerDay).toBeGreaterThanOrEqual(0);
  });

  it("should return non-negative numbers for products", async () => {
    const byProduct = await db.getAnalyticsByProduct(testUserId);
    
    byProduct.forEach(p => {
      expect(p.sent).toBeGreaterThanOrEqual(0);
      expect(p.failed).toBeGreaterThanOrEqual(0);
    });
  });
});
