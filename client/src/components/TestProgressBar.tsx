import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface TestProgressBarProps {
  total: number;
  completed: number;
  running: number;
  failed: number;
  successful: number;
  isActive: boolean;
}

export function TestProgressBar({ 
  total, 
  completed, 
  running, 
  failed, 
  successful,
  isActive 
}: TestProgressBarProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  if (!isActive && completed === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isActive && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              <span className="text-sm font-medium">
                {isActive ? 'Testing in progress...' : 'Tests completed'}
              </span>
            </div>
            <span className="text-sm font-mono text-muted-foreground" data-testid="text-progress-count">
              {completed} / {total}
            </span>
          </div>
          
          <Progress value={percentage} className="h-2" data-testid="progress-test" />
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-4">
              <span className="text-muted-foreground">
                Running: <span className="font-mono text-chart-4" data-testid="text-running-count">{running}</span>
              </span>
              <span className="text-muted-foreground">
                Success: <span className="font-mono text-chart-2" data-testid="text-success-count">{successful}</span>
              </span>
              <span className="text-muted-foreground">
                Failed: <span className="font-mono text-destructive" data-testid="text-failed-count">{failed}</span>
              </span>
            </div>
            <span className="font-mono text-muted-foreground" data-testid="text-progress-percentage">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
