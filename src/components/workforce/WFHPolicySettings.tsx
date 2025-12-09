import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useWFH } from '@/hooks/useWFH';
import { Home, Save } from 'lucide-react';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const WFHPolicySettings: React.FC = () => {
  const { policy, updatePolicy } = useWFH();

  const [formData, setFormData] = useState({
    max_wfh_days_per_month: 8,
    require_approval: true,
    advance_notice_days: 1,
    blackout_days: [] as string[],
  });

  useEffect(() => {
    if (policy) {
      setFormData({
        max_wfh_days_per_month: policy.max_wfh_days_per_month,
        require_approval: policy.require_approval,
        advance_notice_days: policy.advance_notice_days,
        blackout_days: policy.blackout_days || [],
      });
    }
  }, [policy]);

  const handleBlackoutDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      blackout_days: prev.blackout_days.includes(day)
        ? prev.blackout_days.filter(d => d !== day)
        : [...prev.blackout_days, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePolicy.mutateAsync(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            WFH Policy Settings
          </CardTitle>
          <CardDescription>Configure work from home policies for your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max-days">Max WFH Days Per Month</Label>
              <Input
                id="max-days"
                type="number"
                min="0"
                max="31"
                value={formData.max_wfh_days_per_month}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  max_wfh_days_per_month: parseInt(e.target.value) || 0 
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Maximum WFH days allowed per employee per month
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="advance-notice">Advance Notice (Days)</Label>
              <Input
                id="advance-notice"
                type="number"
                min="0"
                max="30"
                value={formData.advance_notice_days}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  advance_notice_days: parseInt(e.target.value) || 0 
                }))}
              />
              <p className="text-xs text-muted-foreground">
                How many days in advance must requests be made
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <Label htmlFor="require-approval">Require Approval</Label>
              <p className="text-sm text-muted-foreground">
                WFH requests must be approved by a manager
              </p>
            </div>
            <Switch
              id="require-approval"
              checked={formData.require_approval}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, require_approval: checked }))}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>Blackout Days</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Days when WFH is not allowed
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {WEEK_DAYS.map(day => (
                <label 
                  key={day}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                >
                  <Checkbox
                    checked={formData.blackout_days.includes(day)}
                    onCheckedChange={() => handleBlackoutDayToggle(day)}
                  />
                  <span className="text-sm">{day}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={updatePolicy.isPending}>
        <Save className="h-4 w-4 mr-2" />
        {updatePolicy.isPending ? 'Saving...' : 'Save Policy'}
      </Button>
    </form>
  );
};
