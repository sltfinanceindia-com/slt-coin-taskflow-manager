import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, Construction, Info } from 'lucide-react';

interface FeaturePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  category: 'finance' | 'hr' | 'work' | 'agile' | 'admin';
  features?: string[];
  comingSoon?: boolean;
}

const categoryColors = {
  finance: 'bg-primary/10 text-primary',
  hr: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  work: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  agile: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  admin: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
};

const categoryLabels = {
  finance: 'Finance',
  hr: 'Human Resources',
  work: 'Work Management',
  agile: 'Agile & Projects',
  admin: 'Administration',
};

export function FeaturePlaceholder({
  title,
  description,
  icon: Icon,
  category,
  features = [],
}: FeaturePlaceholderProps) {
  return (
    <div className="space-y-6" data-testid={`placeholder-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          <Badge className={categoryColors[category]}>{categoryLabels[category]}</Badge>
          <Badge variant="secondary" className="gap-1">
            <Construction className="h-3 w-3" />
            Coming Soon
          </Badge>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-muted">
              <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>This feature is under development</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 border border-dashed rounded-lg p-6 text-center mb-6">
            <Construction className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">Under Development</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              This module is currently being built. It will be available in a future update.
            </p>
          </div>

          {features.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                <Info className="h-4 w-4" />
                Planned Capabilities
              </h4>
              <ul className="grid gap-2 sm:grid-cols-2">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
