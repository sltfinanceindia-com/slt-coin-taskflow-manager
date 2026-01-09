/**
 * Templates Tab Component
 * Template library and builder
 */

import { TemplateLibrary } from '@/components/templates/TemplateLibrary';
import { TemplateBuilder } from '@/components/templates/TemplateBuilder';

export function TemplatesTab() {
  return (
    <div className="space-y-6">
      <TemplateLibrary />
      <TemplateBuilder />
    </div>
  );
}
