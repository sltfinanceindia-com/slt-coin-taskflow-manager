/**
 * Automation Tab Component
 * Automation builder and rule templates
 */

import { AutomationBuilder } from '@/components/automation/AutomationBuilder';
import { RuleTemplates } from '@/components/automation/RuleTemplates';

export function AutomationTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <AutomationBuilder />
      </div>
      <div>
        <RuleTemplates />
      </div>
    </div>
  );
}
