import type { EvomiISP } from '@shared/schema';

interface EvomiSettingsResponse {
  success: boolean;
  data: {
    rp?: {
      countries?: Record<string, string>;
      cities?: { data: any[] };
      regions?: { data: any[] };
      isp?: Record<string, { value: string; countryCode: string }>;
    };
    mp?: {
      isp?: Record<string, { value: string; countryCode: string }>;
    };
  };
}

interface EvomiProxyData {
  success: boolean;
  products: {
    rp?: {
      username: string;
      password: string;
      endpoint: string;
      ports: { http: number; socks5: number };
    };
  };
}

export class EvomiClient {
  private apiKey: string;
  private cachedCredentials: { username: string; password: string; endpoint: string; port: number } | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCredentials(): Promise<{ username: string; password: string; endpoint: string; port: number }> {
    if (this.cachedCredentials) {
      return this.cachedCredentials;
    }

    if (!this.apiKey) {
      throw new Error('EVOMI_API_KEY not configured');
    }

    const response = await fetch('https://api.evomi.com/public', {
      headers: {
        'x-apikey': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Evomi API error: ${response.status} ${response.statusText}`);
    }

    const data: EvomiProxyData = await response.json();
    
    if (!data.success || !data.products.rp) {
      throw new Error('No Premium Residential proxy product available');
    }

    this.cachedCredentials = {
      username: data.products.rp.username,
      password: data.products.rp.password,
      endpoint: data.products.rp.endpoint,
      port: data.products.rp.ports.http,
    };

    return this.cachedCredentials;
  }

  async getAvailableISPs(): Promise<EvomiISP[]> {
    if (!this.apiKey) {
      console.warn('Using mock ISP data - EVOMI_API_KEY not configured');
      return this.getMockISPs();
    }

    try {
      const response = await fetch('https://api.evomi.com/public/settings', {
        headers: {
          'x-apikey': this.apiKey,
        },
      });

      if (!response.ok) {
        console.error(`Evomi settings API error: ${response.status}`);
        return this.getMockISPs();
      }

      const data: EvomiSettingsResponse = await response.json();
      
      if (!data.success) {
        console.error('Evomi settings API returned success=false');
        return this.getMockISPs();
      }

      const isps: EvomiISP[] = [];
      const countries = data.data.rp?.countries || {};

      if (data.data.rp?.isp) {
        for (const [ispName, ispData] of Object.entries(data.data.rp.isp)) {
          const countryName = countries[ispData.countryCode] || ispData.countryCode;
          
          isps.push({
            name: ispName,
            asn: ispData.value,
            country: countryName,
          });
        }
      }

      if (data.data.mp?.isp) {
        for (const [ispName, ispData] of Object.entries(data.data.mp.isp)) {
          const countryName = countries[ispData.countryCode] || ispData.countryCode;
          
          const exists = isps.some(isp => 
            isp.name === ispName && isp.country === countryName
          );
          
          if (!exists) {
            isps.push({
              name: ispName,
              asn: ispData.value,
              country: countryName,
            });
          }
        }
      }

      console.log(`Loaded ${isps.length} ISPs from Evomi API`);
      return isps.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching ISPs from Evomi:', error);
      return this.getMockISPs();
    }
  }

  private getMockISPs(): EvomiISP[] {
    return [
      { name: "Claro Brasil", asn: "AS28573", country: "Brazil" },
      { name: "AT&T", asn: "AS7018", country: "United States" },
      { name: "Verizon", asn: "AS701", country: "United States" },
      { name: "Comcast", asn: "AS7922", country: "United States" },
      { name: "Deutsche Telekom", asn: "AS3320", country: "Germany" },
      { name: "British Telecom", asn: "AS2856", country: "United Kingdom" },
      { name: "Orange", asn: "AS3215", country: "France" },
      { name: "Vodafone", asn: "AS30722", country: "Italy" },
    ];
  }

  getProxyConfig(isp: EvomiISP, credentials: { username: string; password: string; endpoint: string; port: number }): {
    host: string;
    port: number;
    auth: string;
  } {
    const ispCode = isp.asn || isp.name.toLowerCase().replace(/\s+/g, '-');
    const password = `${credentials.password}_isp-${ispCode}`;
    
    return {
      host: credentials.endpoint,
      port: credentials.port,
      auth: `${credentials.username}:${password}`,
    };
  }
}
