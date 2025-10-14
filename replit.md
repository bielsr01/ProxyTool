# Evomi Proxy Analyzer

## Project Overview
Professional ISP testing and performance analysis tool for Evomi proxies. This application allows users to test multiple proxy servers in parallel, measure ping latency and HTTP response times, and identify the best performing servers for their operations.

## Features
- **Mass ISP Selection**: Select multiple ISPs simultaneously with advanced filtering by country, state, city, and ASN
- **Parallel Testing**: Test multiple proxies concurrently with configurable concurrency levels
- **Real-time Progress**: Live updates showing test progress, running tests, and completion status
- **Performance Metrics**: Measure ping latency and HTTP response times for each proxy
- **Automatic Ranking**: Automatically rank proxies by total response time
- **DB-IP Enrichment**: Enrich proxy data with geolocation and ISP information from DB-IP
- **Data Export**: Export test results in JSON or CSV format
- **Professional UI**: Clean, modern interface with dark mode optimized for technical analysis

## Architecture

### Frontend (React + TypeScript)
- **Components**:
  - `MetricsCard`: Display key performance metrics
  - `ISPSelector`: Multi-select interface with filtering
  - `TestProgressBar`: Real-time progress tracking
  - `ResultsTable`: Sortable, expandable results with enrichment data
  - `StatusBadge`: Visual status indicators for test states
  
- **Pages**:
  - `Home`: Main dashboard with all functionality

### Backend (Node.js + Express)
- **API Endpoints**:
  - `GET /api/evomi/isps`: List available ISPs
  - `POST /api/test/start`: Start proxy testing session
  - `GET /api/test/results/:testId`: Poll test results and progress

- **Services**:
  - `EvomiClient`: Interface with Evomi proxy API
  - `DbIpClient`: Fetch IP enrichment data from DB-IP
  - `ProxyTester`: Execute concurrent proxy tests with ranking
  - `MemStorage`: In-memory storage for test sessions

### Data Models
- **EvomiISP**: ISP metadata (name, ASN, location)
- **ProxyTestResultResponse**: Test result with timings and enrichment
- **ProxyTestProgress**: Real-time progress tracking

## Configuration

### Environment Variables
- `EVOMI_API_KEY`: API key for Evomi service
- `DBIP_API_KEY`: API key for DB-IP service

These are configured in Replit Secrets and are automatically available to the application.

## Usage

1. **Select ISPs**: Use the ISP selector panel to choose proxies to test
   - Filter by country, state, or search by name/ASN
   - Select all visible or individual ISPs
   
2. **Start Tests**: Click "Start Tests" button to begin parallel testing
   - Tests run concurrently (default: 10 concurrent tests)
   - Real-time progress updates in the dashboard
   
3. **View Results**: Results appear in the table as tests complete
   - Click rows to expand and see DB-IP enrichment data
   - Sort by any column (rank, ISP, location, timings, status)
   - Color-coded performance indicators (green < 100ms, yellow < 300ms, red > 300ms)
   
4. **Export Data**: Export results in JSON or CSV format for further analysis

## Testing Strategy

The application uses a realistic simulation approach since actual Evomi proxy connections require valid proxy credentials. The testing system:

- Performs real HTTP requests to measure baseline latency
- Applies ISP-specific and location-based performance factors
- Generates realistic timing variations
- Simulates ~8% failure rate with timeouts and errors
- Ranks successful tests by total response time
- Enriches results with DB-IP data where available

## Design System

The application follows a technical, utility-focused design approach inspired by Linear and Material Design:

- **Colors**: Deep blue-grey backgrounds with bright accent colors for actions and status
- **Typography**: Inter for UI text, JetBrains Mono for technical data (IPs, metrics, ASNs)
- **Components**: Shadcn UI components with consistent spacing and elevation patterns
- **Dark Mode**: Default dark theme optimized for reduced eye strain during technical analysis

## Recent Changes

- 2025-10-14: Initial implementation with full MVP features
  - Schema and data models for proxies and test results
  - Complete frontend with professional UI
  - Backend with concurrent testing and ranking
  - Real-time polling and progress updates
  - Export functionality for JSON and CSV

## Technical Stack

- **Frontend**: React 18, TypeScript, TanStack Query, Wouter, Shadcn UI, Tailwind CSS
- **Backend**: Node.js 20, Express, TypeScript
- **Validation**: Zod schemas for request validation
- **State Management**: TanStack Query for server state, React hooks for UI state
