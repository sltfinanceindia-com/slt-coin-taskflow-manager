import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download } from 'lucide-react';
import { CertificateGenerator } from './CertificateGenerator';

export function CertificatesList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certificates
        </CardTitle>
        <CardDescription>Generate and download your training certificates</CardDescription>
      </CardHeader>
      <CardContent>
        <CertificateGenerator />
      </CardContent>
    </Card>
  );
}
