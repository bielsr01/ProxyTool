import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { EvomiClient } from "./evomi-client";
import { ProxyTester } from "./proxy-tester";
import { z } from "zod";

const proxyTestRequestSchema = z.object({
  proxies: z.array(z.object({
    name: z.string(),
    asn: z.string().optional(),
    country: z.string(),
    state: z.string().optional(),
    city: z.string().optional(),
  })),
  concurrency: z.number().min(1).max(50).optional().default(10),
});

export async function registerRoutes(app: Express): Promise<Server> {
  const evomiApiKey = process.env.EVOMI_API_KEY || '';
  const dbipApiKey = process.env.DBIP_API_KEY || '';

  if (!evomiApiKey || !dbipApiKey) {
    console.warn('Warning: API keys not configured. Using mock data for demonstration.');
  }

  const evomiClient = new EvomiClient(evomiApiKey);
  const proxyTester = new ProxyTester(evomiApiKey, dbipApiKey);

  app.get('/api/evomi/isps', async (req, res) => {
    try {
      const isps = await evomiClient.getAvailableISPs();
      res.json(isps);
    } catch (error: any) {
      console.error('Error fetching ISPs:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/test/start', async (req, res) => {
    try {
      const validationResult = proxyTestRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request',
          details: validationResult.error.errors 
        });
      }

      const testRequest = validationResult.data;
      
      if (testRequest.proxies.length === 0) {
        return res.status(400).json({ error: 'No proxies provided' });
      }

      const testId = await storage.createTestSession(testRequest.proxies);

      setImmediate(async () => {
        try {
          await proxyTester.testMultipleProxies(
            testRequest.proxies,
            { concurrency: testRequest.concurrency },
            async (result, progress) => {
              await storage.updateTestResult(testId, result);
              await storage.updateTestProgress(testId, progress);
            }
          );
        } catch (error) {
          console.error('Error during test execution:', error);
        }
      });

      res.json({ testId });
    } catch (error: any) {
      console.error('Error starting tests:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/test/results/:testId', async (req, res) => {
    try {
      const { testId } = req.params;
      const data = await storage.getTestResults(testId);
      
      if (!data) {
        return res.status(404).json({ error: 'Test session not found' });
      }

      res.json(data);
    } catch (error: any) {
      console.error('Error fetching results:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
