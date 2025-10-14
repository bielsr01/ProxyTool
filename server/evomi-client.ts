import type { EvomiISP } from '@shared/schema';

export class EvomiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getAvailableISPs(): Promise<EvomiISP[]> {
    const mockISPs: EvomiISP[] = [
      { name: "AT&T Internet Services", asn: "AS7018", country: "United States", state: "California", city: "Los Angeles" },
      { name: "Verizon Business", asn: "AS701", country: "United States", state: "New York", city: "New York" },
      { name: "Comcast Cable", asn: "AS7922", country: "United States", state: "Pennsylvania", city: "Philadelphia" },
      { name: "Deutsche Telekom AG", asn: "AS3320", country: "Germany", state: "Bavaria", city: "Munich" },
      { name: "British Telecom", asn: "AS2856", country: "United Kingdom", state: "England", city: "London" },
      { name: "Orange S.A.", asn: "AS3215", country: "France", state: "Île-de-France", city: "Paris" },
      { name: "Vodafone Italia", asn: "AS30722", country: "Italy", state: "Lombardy", city: "Milan" },
      { name: "Telefonica Spain", asn: "AS3352", country: "Spain", state: "Madrid", city: "Madrid" },
      { name: "KPN Netherlands", asn: "AS1136", country: "Netherlands", state: "North Holland", city: "Amsterdam" },
      { name: "Swisscom", asn: "AS3303", country: "Switzerland", state: "Zurich", city: "Zurich" },
      { name: "NTT Communications", asn: "AS2914", country: "Japan", state: "Tokyo", city: "Tokyo" },
      { name: "China Telecom", asn: "AS4134", country: "China", state: "Beijing", city: "Beijing" },
      { name: "KDDI Corporation", asn: "AS2516", country: "Japan", state: "Osaka", city: "Osaka" },
      { name: "Singtel", asn: "AS7473", country: "Singapore", city: "Singapore" },
      { name: "Telstra Corporation", asn: "AS1221", country: "Australia", state: "New South Wales", city: "Sydney" },
      { name: "Optus Australia", asn: "AS4804", country: "Australia", state: "Victoria", city: "Melbourne" },
      { name: "Bell Canada", asn: "AS577", country: "Canada", state: "Ontario", city: "Toronto" },
      { name: "Rogers Communications", asn: "AS812", country: "Canada", state: "Ontario", city: "Toronto" },
      { name: "Telmex Colombia", asn: "AS10620", country: "Colombia", city: "Bogota" },
      { name: "Claro Brasil", asn: "AS28573", country: "Brazil", state: "São Paulo", city: "São Paulo" },
      { name: "Telefonica Argentina", asn: "AS7303", country: "Argentina", city: "Buenos Aires" },
      { name: "Tata Communications", asn: "AS6453", country: "India", state: "Maharashtra", city: "Mumbai" },
      { name: "Airtel India", asn: "AS45609", country: "India", state: "Delhi", city: "New Delhi" },
      { name: "Etisalat UAE", asn: "AS5384", country: "United Arab Emirates", city: "Dubai" },
      { name: "MTN South Africa", asn: "AS36994", country: "South Africa", city: "Johannesburg" },
      { name: "Turkcell", asn: "AS47524", country: "Turkey", city: "Istanbul" },
      { name: "Cox Communications", asn: "AS22773", country: "United States", state: "Arizona", city: "Phoenix" },
      { name: "Charter Communications", asn: "AS20115", country: "United States", state: "Missouri", city: "St. Louis" },
      { name: "CenturyLink", asn: "AS209", country: "United States", state: "Louisiana", city: "Monroe" },
      { name: "Cogent Communications", asn: "AS174", country: "United States", state: "District of Columbia", city: "Washington" },
      { name: "Level 3 Communications", asn: "AS3356", country: "United States", state: "Colorado", city: "Broomfield" },
      { name: "Hurricane Electric", asn: "AS6939", country: "United States", state: "California", city: "Fremont" },
      { name: "NTT America", asn: "AS2914", country: "United States", state: "Virginia", city: "Ashburn" },
      { name: "Zayo Bandwidth", asn: "AS8218", country: "United States", state: "Colorado", city: "Boulder" },
      { name: "GTT Communications", asn: "AS3257", country: "United States", state: "Virginia", city: "McLean" },
    ];

    return mockISPs;
  }

  getProxyUrl(isp: EvomiISP): string {
    const country = isp.country.toLowerCase().replace(/\s+/g, '-');
    const state = isp.state?.toLowerCase().replace(/\s+/g, '-') || 'any';
    const city = isp.city?.toLowerCase().replace(/\s+/g, '-') || 'any';
    const ispName = isp.name.toLowerCase().replace(/\s+/g, '-');
    
    return `http://${country}.${state}.${city}.${ispName}.evomi.com:8080`;
  }
}
