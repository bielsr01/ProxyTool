import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

interface StatusBadgeProps {
  status: 'testing' | 'success' | 'failed' | 'timeout' | 'pending';
  testId?: string;
}

export function StatusBadge({ status, testId }: StatusBadgeProps) {
  const statusConfig = {
    testing: {
      label: 'Testing',
      icon: Loader2,
      className: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      iconClassName: 'animate-spin',
    },
    success: {
      label: 'Success',
      icon: CheckCircle2,
      className: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
      iconClassName: '',
    },
    failed: {
      label: 'Failed',
      icon: XCircle,
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      iconClassName: '',
    },
    timeout: {
      label: 'Timeout',
      icon: Clock,
      className: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      iconClassName: '',
    },
    pending: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-muted/50 text-muted-foreground border-muted',
      iconClassName: '',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`gap-1 ${config.className}`}
      data-testid={testId || `badge-status-${status}`}
    >
      <Icon className={`h-3 w-3 ${config.iconClassName}`} />
      <span>{config.label}</span>
    </Badge>
  );
}
