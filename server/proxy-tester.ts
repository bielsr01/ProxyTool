import { performance } from 'perf_hooks';
import type { EvomiISP, ProxyTestResultResponse } from '@shared/schema';
import { EvomiClient } from './evomi-client';
import { DbIpClient } from './dbip-client';
import { randomUUID } from 'crypto';
import { HttpsProxyAgent } from 'https-proxy-agent';

export interface TestOptions {
  targetUrl?: string;
  timeout?: number;
  concurrency?: number;
}

export class ProxyTester {
  private evomiClient: EvomiClient;
  private dbipClient: DbIpClient;

  constructor(evomiApiKey: string, dbipApiKey: string) {
    this.evomiClient = new EvomiClient(evomiApiKey);
    this.dbipClient = new DbIpClient(dbipApiKey);
  }

  async testProxy(isp: EvomiISP, options: TestOptions = {}): Promise<ProxyTestResultResponse> {
    const { targetUrl = 'https://www.google.com', timeout = 30000 } = options;
    const resultId = randomUUID();
    
    const result: ProxyTestResultResponse = {
      id: resultId,
      proxy: {
        country: isp.country,
        state: isp.state,
        city: isp.city,
        isp: isp.name,
        asn: isp.asn,
      },
      status: 'testing',
    };

    try {
      const credentials = await this.evomiClient.getCredentials();
      const proxyConfig = this.evomiClient.getProxyConfig(isp, credentials);
      
      const proxyUrl = `http://${proxyConfig.auth}@${proxyConfig.host}:${proxyConfig.port}`;
      const agent = new HttpsProxyAgent(proxyUrl);

      const pingStart = performance.now();
      const pingResponse = await fetch(targetUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        // @ts-ignore
        agent,
      });
      const pingEnd = performance.now();
      const pingLatency = pingEnd - pingStart;

      if (!pingResponse.ok) {
        throw new Error(`HTTP ${pingResponse.status}: ${pingResponse.statusText}`);
      }

      const httpStart = performance.now();
      const httpResponse = await fetch(targetUrl, {
        signal: AbortSignal.timeout(15000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        // @ts-ignore
        agent,
      });
      const httpEnd = performance.now();
      const httpResponseTime = httpEnd - httpStart;

      if (!httpResponse.ok) {
        throw new Error(`HTTP ${httpResponse.status}: ${httpResponse.statusText}`);
      }

      result.pingLatency = Math.round(pingLatency * 100) / 100;
      result.httpResponseTime = Math.round(httpResponseTime * 100) / 100;
      result.totalTime = Math.round((pingLatency + httpResponseTime) * 100) / 100;
      result.status = 'success';

      try {
        const ipCheckResponse = await fetch('https://api.ipify.org?format=json', {
          signal: AbortSignal.timeout(5000),
          // @ts-ignore
          agent,
        });
        
        if (ipCheckResponse.ok) {
          const ipData = await ipCheckResponse.json();
          const proxyIp = ipData.ip;
          
          const dbipInfo = await this.dbipClient.getIpInfo(proxyIp);
          if (dbipInfo) {
            result.dbipInfo = dbipInfo;
          }
        }
      } catch (error) {
        console.error('Error enriching with DB-IP:', error);
      }

    } catch (error: any) {
      result.status = error.name === 'AbortError' || error.name === 'TimeoutError' ? 'timeout' : 'failed';
      result.errorMessage = error.message || 'Connection failed';
      result.pingLatency = undefined;
      result.httpResponseTime = undefined;
      result.totalTime = undefined;
    }

    return result;
  }

  private hashString(str: string): number {
    return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  private generateMockIp(isp: EvomiISP): string {
    const hash = this.hashString(isp.name);
    const octet1 = (hash % 200) + 1;
    const octet2 = ((hash * 7) % 255);
    const octet3 = ((hash * 13) % 255);
    const octet4 = ((hash * 19) % 255);
    return `${octet1}.${octet2}.${octet3}.${octet4}`;
  }

  async testMultipleProxies(
    isps: EvomiISP[],
    options: TestOptions = {},
    onProgress?: (result: ProxyTestResultResponse, progress: { completed: number; total: number; running: number; failed: number; successful: number }) => void
  ): Promise<ProxyTestResultResponse[]> {
    const { concurrency = 10 } = options;
    const results: ProxyTestResultResponse[] = [];
    let completed = 0;
    let running = 0;
    let failed = 0;
    let successful = 0;

    const runTest = async (isp: EvomiISP): Promise<void> => {
      running++;
      if (onProgress) {
        onProgress({
          id: 'temp',
          proxy: { country: isp.country, state: isp.state, city: isp.city, isp: isp.name, asn: isp.asn },
          status: 'testing',
        }, { completed, total: isps.length, running, failed, successful });
      }

      try {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
        
        const result = await this.testProxy(isp, options);
        results.push(result);
        completed++;
        running--;
        
        if (result.status === 'success') {
          successful++;
        } else {
          failed++;
        }

        if (onProgress) {
          onProgress(result, { 
            completed, 
            total: isps.length, 
            running,
            failed,
            successful 
          });
        }
      } catch (error) {
        running--;
        failed++;
        completed++;
        console.error('Error testing proxy:', error);
      }
    };

    const queue = [...isps];
    const activeTests: Set<Promise<void>> = new Set();

    while (queue.length > 0 || activeTests.size > 0) {
      while (activeTests.size < concurrency && queue.length > 0) {
        const isp = queue.shift()!;
        const testPromise = runTest(isp);
        activeTests.add(testPromise);
        testPromise.finally(() => activeTests.delete(testPromise));
      }

      if (activeTests.size > 0) {
        await Promise.race(Array.from(activeTests));
      }
    }

    const successfulResults = results
      .filter(r => r.status === 'success' && r.totalTime !== undefined)
      .sort((a, b) => (a.totalTime || Infinity) - (b.totalTime || Infinity));

    successfulResults.forEach((result, index) => {
      result.rank = index + 1;
    });

    return results;
  }
}
