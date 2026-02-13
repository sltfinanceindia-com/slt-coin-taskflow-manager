import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon, ArrowLeft, Settings, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  comingSoon = false,
}: FeaturePlaceholderProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <Badge className={categoryColors[category]}>{categoryLabels[category]}</Badge>
            {comingSoon && <Badge variant="outline">Coming Soon</Badge>}
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {features.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Key Capabilities
                </h4>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>This feature is being configured for your organization.</p>
                <p className="text-sm">Contact your administrator for more details.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
