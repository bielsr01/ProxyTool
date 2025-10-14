import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ISP/Proxy information from Evomi
export const proxies = pgTable("proxies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  country: text("country").notNull(),
  state: text("state"),
  city: text("city"),
  isp: text("isp").notNull(),
  asn: text("asn"),
  ip: text("ip"),
});

// Test results for proxy performance
export const testResults = pgTable("test_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proxyId: varchar("proxy_id").notNull(),
  pingLatency: real("ping_latency"),
  httpResponseTime: real("http_response_time"),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  testedAt: timestamp("tested_at").defaultNow(),
});

export const insertProxySchema = createInsertSchema(proxies).omit({
  id: true,
});

export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
  testedAt: true,
});

export type InsertProxy = z.infer<typeof insertProxySchema>;
export type Proxy = typeof proxies.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type TestResult = typeof testResults.$inferSelect;

// TypeScript interfaces for API responses
export interface EvomiLocation {
  country: string;
  state?: string;
  city?: string;
}

export interface EvomiISP {
  name: string;
  asn?: string;
  country: string;
  state?: string;
  city?: string;
}

export interface DbIpInfo {
  ipAddress: string;
  continentCode: string;
  continentName: string;
  countryCode: string;
  countryName: string;
  stateProv: string;
  city: string;
  isp: string;
  asn: string;
  organization: string;
}

export interface ProxyTestRequest {
  proxies: {
    country: string;
    state?: string;
    city?: string;
    isp: string;
    asn?: string;
  }[];
  concurrency?: number;
}

export interface ProxyTestProgress {
  total: number;
  completed: number;
  running: number;
  failed: number;
  successful: number;
}

export interface ProxyTestResultResponse {
  id: string;
  proxy: {
    country: string;
    state?: string;
    city?: string;
    isp: string;
    asn?: string;
  };
  pingLatency?: number;
  httpResponseTime?: number;
  totalTime?: number;
  status: 'testing' | 'success' | 'failed' | 'timeout';
  errorMessage?: string;
  dbipInfo?: DbIpInfo;
  rank?: number;
}

export interface EvomiCredentials {
  apiKey: string;
  username?: string;
}
