import type { DbIpInfo } from '@shared/schema';

export class DbIpClient {
  private apiKey: string;
  private baseUrl = 'https://api.db-ip.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getIpInfo(ipAddress: string): Promise<DbIpInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiKey}/${ipAddress}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        ipAddress: data.ipAddress || ipAddress,
        continentCode: data.continentCode || 'N/A',
        continentName: data.continentName || 'N/A',
        countryCode: data.countryCode || 'N/A',
        countryName: data.countryName || 'N/A',
        stateProv: data.stateProv || 'N/A',
        city: data.city || 'N/A',
        isp: data.isp || 'N/A',
        asn: data.asn || 'N/A',
        organization: data.organization || 'N/A',
      };
    } catch (error) {
      console.error(`Error fetching IP info for ${ipAddress}:`, error);
      return null;
    }
  }
}
