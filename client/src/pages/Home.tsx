import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MetricsCard } from "@/components/MetricsCard";
import { ISPSelector } from "@/components/ISPSelector";
import { TestProgressBar } from "@/components/TestProgressBar";
import { ResultsTable } from "@/components/ResultsTable";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Zap,
  Globe
} from "lucide-react";
import { EvomiISP, ProxyTestResultResponse, ProxyTestProgress } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Home() {
  const { toast } = useToast();
  const [selectedISPs, setSelectedISPs] = useState<EvomiISP[]>([]);
  const [testResults, setTestResults] = useState<ProxyTestResultResponse[]>([]);
  const [testProgress, setTestProgress] = useState<ProxyTestProgress>({
    total: 0,
    completed: 0,
    running: 0,
    failed: 0,
    successful: 0,
  });
  const [isTesting, setIsTesting] = useState(false);

  const { data: isps = [], isLoading: isLoadingISPs } = useQuery<EvomiISP[]>({
    queryKey: ['/api/evomi/isps'],
  });

  const startTestMutation = useMutation({
    mutationFn: async (selectedProxies: EvomiISP[]) => {
      const response = await apiRequest('POST', '/api/test/start', {
        proxies: selectedProxies,
        concurrency: 10,
      });
      return response;
    },
    onSuccess: (data: { testId: string }) => {
      setIsTesting(true);
      setTestResults([]);
      setTestProgress({
        total: selectedISPs.length,
        completed: 0,
        running: 0,
        failed: 0,
        successful: 0,
      });
      toast({
        title: "Tests Started",
        description: `Testing ${selectedISPs.length} ISP${selectedISPs.length !== 1 ? 's' : ''} in parallel`,
      });
      pollTestResults(data.testId);
    },
    onError: (error: Error) => {
      toast({
        title: "Error Starting Tests",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pollTestResults = async (testId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/test/results/${testId}`);
        const data = await response.json();
        
        if (data.results) {
          setTestResults(data.results);
          setTestProgress(data.progress);

          if (data.progress.completed >= data.progress.total) {
            clearInterval(pollInterval);
            setIsTesting(false);
            toast({
              title: "Tests Completed",
              description: `Tested ${data.progress.total} ISPs. ${data.progress.successful} successful, ${data.progress.failed} failed.`,
            });
          }
        }
      } catch (error) {
        console.error('Error polling results:', error);
        clearInterval(pollInterval);
        setIsTesting(false);
      }
    }, 1000);
  };

  const handleStartTests = () => {
    if (selectedISPs.length === 0) {
      toast({
        title: "No ISPs Selected",
        description: "Please select at least one ISP to test",
        variant: "destructive",
      });
      return;
    }

    startTestMutation.mutate(selectedISPs);
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (testResults.length === 0) {
      toast({
        title: "No Results to Export",
        description: "Run tests first to generate results",
        variant: "destructive",
      });
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(testResults, null, 2);
      filename = `proxy-test-results-${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      const headers = ['Rank', 'ISP', 'Country', 'State', 'City', 'ASN', 'Ping (ms)', 'HTTP Time (ms)', 'Total Time (ms)', 'Status', 'Error'];
      const rows = testResults.map(r => [
        r.rank || '',
        r.proxy.isp,
        r.proxy.country,
        r.proxy.state || '',
        r.proxy.city || '',
        r.proxy.asn || '',
        r.pingLatency?.toFixed(0) || '',
        r.httpResponseTime?.toFixed(0) || '',
        r.totalTime?.toFixed(0) || '',
        r.status,
        r.errorMessage || '',
      ]);
      content = [headers, ...rows].map(row => row.join(',')).join('\n');
      filename = `proxy-test-results-${Date.now()}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Downloaded ${filename}`,
    });
  };

  const successfulTests = testResults.filter(r => r.status === 'success').length;
  const failedTests = testResults.filter(r => r.status === 'failed' || r.status === 'timeout').length;
  const avgLatency = testResults
    .filter(r => r.totalTime)
    .reduce((sum, r) => sum + (r.totalTime || 0), 0) / (successfulTests || 1);
  const bestISP = testResults
    .filter(r => r.status === 'success' && r.totalTime)
    .sort((a, b) => (a.totalTime || Infinity) - (b.totalTime || Infinity))[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto max-w-8xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 border border-primary/20">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Evomi Proxy Analyzer</h1>
                <p className="text-sm text-muted-foreground">
                  Professional ISP Testing & Performance Analysis
                </p>
              </div>
            </div>
            <Button
              onClick={handleStartTests}
              disabled={selectedISPs.length === 0 || isTesting}
              size="lg"
              data-testid="button-start-test"
            >
              <Play className="h-4 w-4 mr-2" />
              {isTesting ? 'Testing...' : `Start Test${selectedISPs.length !== 1 ? 's' : ''}`}
              {selectedISPs.length > 0 && ` (${selectedISPs.length})`}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-8xl px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Total Tests"
            value={testResults.length}
            icon={Activity}
            subtitle={`${selectedISPs.length} selected for testing`}
          />
          <MetricsCard
            title="Successful"
            value={successfulTests}
            icon={CheckCircle2}
            subtitle={`${failedTests} failed or timeout`}
          />
          <MetricsCard
            title="Avg Response Time"
            value={successfulTests > 0 ? `${avgLatency.toFixed(0)}ms` : '-'}
            icon={Zap}
            subtitle="Combined ping + HTTP time"
          />
          <MetricsCard
            title="Best ISP"
            value={bestISP ? `${bestISP.totalTime?.toFixed(0)}ms` : '-'}
            icon={Activity}
            subtitle={bestISP ? bestISP.proxy.isp : 'No data yet'}
          />
        </div>

        {(isTesting || testProgress.completed > 0) && (
          <TestProgressBar
            total={testProgress.total}
            completed={testProgress.completed}
            running={testProgress.running}
            failed={testProgress.failed}
            successful={testProgress.successful}
            isActive={isTesting}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ISPSelector
              isps={isps}
              selectedISPs={selectedISPs}
              onSelectionChange={setSelectedISPs}
              isLoading={isLoadingISPs}
            />
          </div>

          <div className="lg:col-span-2">
            <ResultsTable
              results={testResults}
              onExport={handleExport}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
