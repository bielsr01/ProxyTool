import { randomUUID } from "crypto";
import type { EvomiISP, ProxyTestResultResponse, ProxyTestProgress } from "@shared/schema";

export interface IStorage {
  // Test session management
  createTestSession(proxies: EvomiISP[]): Promise<string>;
  getTestResults(testId: string): Promise<{ results: ProxyTestResultResponse[], progress: ProxyTestProgress } | undefined>;
  updateTestResult(testId: string, result: ProxyTestResultResponse): Promise<void>;
  updateTestProgress(testId: string, progress: ProxyTestProgress): Promise<void>;
}

interface TestSession {
  id: string;
  proxies: EvomiISP[];
  results: ProxyTestResultResponse[];
  progress: ProxyTestProgress;
  createdAt: Date;
}

export class MemStorage implements IStorage {
  private testSessions: Map<string, TestSession>;

  constructor() {
    this.testSessions = new Map();
  }

  async createTestSession(proxies: EvomiISP[]): Promise<string> {
    const id = randomUUID();
    const session: TestSession = {
      id,
      proxies,
      results: [],
      progress: {
        total: proxies.length,
        completed: 0,
        running: 0,
        failed: 0,
        successful: 0,
      },
      createdAt: new Date(),
    };
    this.testSessions.set(id, session);
    return id;
  }

  async getTestResults(testId: string): Promise<{ results: ProxyTestResultResponse[], progress: ProxyTestProgress } | undefined> {
    const session = this.testSessions.get(testId);
    if (!session) return undefined;
    return {
      results: session.results,
      progress: session.progress,
    };
  }

  async updateTestResult(testId: string, result: ProxyTestResultResponse): Promise<void> {
    const session = this.testSessions.get(testId);
    if (!session) return;
    
    const existingIndex = session.results.findIndex(r => r.id === result.id);
    if (existingIndex >= 0) {
      session.results[existingIndex] = result;
    } else {
      session.results.push(result);
    }
  }

  async updateTestProgress(testId: string, progress: ProxyTestProgress): Promise<void> {
    const session = this.testSessions.get(testId);
    if (!session) return;
    session.progress = progress;
  }
}

export const storage = new MemStorage();
