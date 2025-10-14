import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./StatusBadge";
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Trophy } from "lucide-react";
import { ProxyTestResultResponse } from "@shared/schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ResultsTableProps {
  results: ProxyTestResultResponse[];
  onExport: (format: 'json' | 'csv') => void;
}

type SortField = 'rank' | 'isp' | 'location' | 'ping' | 'http' | 'total' | 'status';
type SortDirection = 'asc' | 'desc';

export function ResultsTable({ results, onExport }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedResults = useMemo(() => {
    const sorted = [...results].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'rank':
          aVal = a.rank ?? Infinity;
          bVal = b.rank ?? Infinity;
          break;
        case 'isp':
          aVal = a.proxy.isp;
          bVal = b.proxy.isp;
          break;
        case 'location':
          aVal = `${a.proxy.city || ''} ${a.proxy.state || ''} ${a.proxy.country}`;
          bVal = `${b.proxy.city || ''} ${b.proxy.state || ''} ${b.proxy.country}`;
          break;
        case 'ping':
          aVal = a.pingLatency ?? Infinity;
          bVal = b.pingLatency ?? Infinity;
          break;
        case 'http':
          aVal = a.httpResponseTime ?? Infinity;
          bVal = b.httpResponseTime ?? Infinity;
          break;
        case 'total':
          aVal = a.totalTime ?? Infinity;
          bVal = b.totalTime ?? Infinity;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [results, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatTime = (ms?: number) => {
    if (ms === undefined || ms === null) return '-';
    return `${ms.toFixed(0)}ms`;
  };

  const getPerformanceColor = (ms?: number) => {
    if (!ms) return 'text-muted-foreground';
    if (ms < 100) return 'text-chart-2';
    if (ms < 300) return 'text-chart-3';
    return 'text-destructive';
  };

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Results will appear here once tests are completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            No test results yet. Select ISPs and start testing to see results.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              {results.length} test{results.length !== 1 ? 's' : ''} completed
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('json')}
              data-testid="button-export-json"
            >
              <Download className="h-4 w-4 mr-1" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('csv')}
              data-testid="button-export-csv"
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('rank')}
                      className="h-8 px-2"
                      data-testid="button-sort-rank"
                    >
                      Rank
                      <SortIcon field="rank" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('isp')}
                      className="h-8 px-2"
                      data-testid="button-sort-isp"
                    >
                      ISP Name
                      <SortIcon field="isp" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('location')}
                      className="h-8 px-2"
                      data-testid="button-sort-location"
                    >
                      Location
                      <SortIcon field="location" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('ping')}
                      className="h-8 px-2"
                      data-testid="button-sort-ping"
                    >
                      Ping
                      <SortIcon field="ping" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('http')}
                      className="h-8 px-2"
                      data-testid="button-sort-http"
                    >
                      HTTP Time
                      <SortIcon field="http" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('total')}
                      className="h-8 px-2"
                      data-testid="button-sort-total"
                    >
                      Total
                      <SortIcon field="total" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('status')}
                      className="h-8 px-2"
                      data-testid="button-sort-status"
                    >
                      Status
                      <SortIcon field="status" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResults.map((result, index) => (
                  <Collapsible
                    key={result.id}
                    open={expandedRows.has(result.id)}
                    onOpenChange={() => toggleExpand(result.id)}
                    asChild
                  >
                    <>
                      <CollapsibleTrigger asChild>
                        <TableRow 
                          className="cursor-pointer hover-elevate"
                          data-testid={`row-result-${index}`}
                        >
                          <TableCell>
                            {result.rank !== undefined && result.rank <= 3 && result.status === 'success' ? (
                              <div className="flex items-center gap-1">
                                <Trophy className={`h-4 w-4 ${
                                  result.rank === 1 ? 'text-yellow-500' :
                                  result.rank === 2 ? 'text-gray-400' :
                                  'text-amber-700'
                                }`} />
                                <span className="font-mono font-semibold">#{result.rank}</span>
                              </div>
                            ) : result.rank !== undefined ? (
                              <span className="font-mono text-muted-foreground">#{result.rank}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{result.proxy.isp}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {result.proxy.city && `${result.proxy.city}, `}
                            {result.proxy.state && `${result.proxy.state}, `}
                            {result.proxy.country}
                          </TableCell>
                          <TableCell className={`text-right font-mono ${getPerformanceColor(result.pingLatency)}`}>
                            {formatTime(result.pingLatency)}
                          </TableCell>
                          <TableCell className={`text-right font-mono ${getPerformanceColor(result.httpResponseTime)}`}>
                            {formatTime(result.httpResponseTime)}
                          </TableCell>
                          <TableCell className={`text-right font-mono font-semibold ${getPerformanceColor(result.totalTime)}`}>
                            {formatTime(result.totalTime)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={result.status} testId={`badge-status-result-${index}`} />
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>
                      {result.dbipInfo && (
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={7} className="bg-muted/30">
                              <div className="py-3 px-4 space-y-2">
                                <div className="text-sm font-medium">DB-IP Enrichment Data</div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">IP Address: </span>
                                    <span className="font-mono">{result.dbipInfo.ipAddress}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">ASN: </span>
                                    <span className="font-mono">{result.dbipInfo.asn || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Organization: </span>
                                    <span>{result.dbipInfo.organization || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Continent: </span>
                                    <span>{result.dbipInfo.continentName}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Country: </span>
                                    <span>{result.dbipInfo.countryName} ({result.dbipInfo.countryCode})</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">City: </span>
                                    <span>{result.dbipInfo.city || 'N/A'}</span>
                                  </div>
                                </div>
                                {result.errorMessage && (
                                  <div className="mt-2 text-xs text-destructive">
                                    <span className="font-medium">Error: </span>
                                    {result.errorMessage}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      )}
                    </>
                  </Collapsible>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
