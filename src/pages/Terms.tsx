import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { SEOHead } from '@/components/SEOHead';

export default function Terms() {
  return (
    <>
      <SEOHead 
        title="Terms of Service - Tenexa"
        description="Read the terms and conditions for using Tenexa workplace management platform."
        keywords="terms of service, terms and conditions, Tenexa terms"
        canonical="https://sltwork.lovable.app/terms"
      />
      <div className="min-h-screen bg-background">
        <PublicHeader />

        {/* Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Terms of Service</h1>
                <p className="text-sm text-muted-foreground">Last updated: December 2025</p>
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6 sm:p-8 prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using Tenexa ("the Platform"), you accept and agree to be bound by these Terms of Service. 
                    If you do not agree to these terms, please do not use the Platform. These terms apply to all users, 
                    including administrators, employees, and interns.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Tenexa is a comprehensive workplace management platform that provides:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Task management and Kanban board functionality</li>
                    <li>Team communication and collaboration tools</li>
                    <li>Training and assessment modules</li>
                    <li>Coin reward system for productivity incentives</li>
                    <li>Time tracking and attendance management</li>
                    <li>Certificate generation for completed training</li>
                    <li>Analytics and reporting dashboards</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">3. User Accounts and Responsibilities</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Users are responsible for:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Maintaining the confidentiality of their account credentials</li>
                    <li>All activities that occur under their account</li>
                    <li>Providing accurate and complete information during registration</li>
                    <li>Immediately notifying us of any unauthorized use of their account</li>
                    <li>Complying with their organization's policies while using the Platform</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">4. Acceptable Use Policy</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    You agree not to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Use the Platform for any unlawful purpose</li>
                    <li>Upload or transmit any malicious code, viruses, or harmful content</li>
                    <li>Attempt to gain unauthorized access to any part of the Platform</li>
                    <li>Interfere with or disrupt the Platform's infrastructure</li>
                    <li>Share your account credentials with others</li>
                    <li>Use the Platform to harass, abuse, or harm other users</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">5. Coin Reward System</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The coin reward system is subject to the following terms:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Coins are earned through task completion and verified by administrators</li>
                    <li>Coin values and exchange rates are determined by the organization</li>
                    <li>Coins have no cash value outside the Platform unless specified by your organization</li>
                    <li>Fraudulent attempts to earn coins will result in account termination</li>
                    <li>Coin balances may be adjusted or reset at the organization's discretion</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All content, features, and functionality of the Platform are owned by Tenexa and are protected 
                    by international copyright, trademark, and other intellectual property laws. Users retain ownership 
                    of content they upload but grant us a license to use, store, and display such content for providing 
                    the service.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">7. Privacy and Data Protection</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your use of the Platform is also governed by our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. 
                    We are committed to protecting your personal information and complying with applicable data protection 
                    regulations including GDPR and applicable data protection laws.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To the maximum extent permitted by law, Tenexa shall not be liable for any indirect, incidental, 
                    special, consequential, or punitive damages, including loss of profits, data, or other intangible losses 
                    resulting from your use of the Platform.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">9. Termination</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may terminate or suspend your account at any time for violations of these terms. Upon termination, 
                    your right to use the Platform will cease immediately. Organization administrators may also deactivate 
                    user accounts within their organization.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-foreground font-medium">Tenexa Support</p>
                    <p className="text-muted-foreground">Email: support@tenexa.com</p>
                  </div>
                </section>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link to="/privacy">
                <Button className="w-full sm:w-auto">
                  View Privacy Policy
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}