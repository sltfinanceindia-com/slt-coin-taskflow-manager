import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Coins, Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex h-14 sm:h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/slt-hub-icon.png" 
                alt="SLT work HuB"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-contain"
              />
              <span className="text-sm sm:text-lg font-bold">
                <span className="font-black">SLT</span>
                <span className="font-normal text-muted-foreground"> work </span>
                <span className="font-black">HuB</span>
              </span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">Last updated: December 2025</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6 sm:p-8 prose prose-sm sm:prose-base dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  SLT work HuB ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                  explains how we collect, use, disclose, and safeguard your information when you use our workplace 
                  management platform. Please read this policy carefully to understand our practices regarding your 
                  personal data.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect the following types of information:
                </p>
                
                <h3 className="text-lg font-medium text-foreground mb-2">Personal Information</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                  <li>Full name and email address</li>
                  <li>Employee ID and department information</li>
                  <li>Profile picture (if uploaded)</li>
                  <li>Phone number (if provided)</li>
                  <li>Date of birth and employment dates</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mb-2">Usage Information</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                  <li>Task completion and performance data</li>
                  <li>Time tracking and attendance records</li>
                  <li>Training progress and assessment results</li>
                  <li>Communication history within the platform</li>
                  <li>SLT Coin earnings and transactions</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mb-2">Technical Information</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Login timestamps and session data</li>
                  <li>Geolocation data (for attendance features, with consent)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use your information for the following purposes:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>To provide and maintain the Platform's services</li>
                  <li>To manage your account and authenticate access</li>
                  <li>To track task assignments, progress, and completion</li>
                  <li>To administer the SLT Coin reward system</li>
                  <li>To generate analytics and performance reports</li>
                  <li>To facilitate team communication and collaboration</li>
                  <li>To send notifications about tasks, training, and updates</li>
                  <li>To generate certificates upon training completion</li>
                  <li>To improve our services and user experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">4. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may share your information with:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Your Organization:</strong> Your employer/organization has access to your work-related data including tasks, time logs, performance metrics, and communication within the platform</li>
                  <li><strong>Administrators:</strong> Organization administrators can view and manage user accounts and data</li>
                  <li><strong>Service Providers:</strong> Third-party vendors who help us operate the Platform (hosting, analytics, email services)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We do not sell your personal information to third parties.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement appropriate security measures to protect your data:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication with password hashing</li>
                  <li>Role-based access control</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Multi-tenant data isolation between organizations</li>
                  <li>Automatic session timeout and secure logout</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">6. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies and similar technologies for:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for authentication and platform functionality</li>
                  <li><strong>Preference Cookies:</strong> To remember your settings (theme, language)</li>
                  <li><strong>Analytics Cookies:</strong> To understand how you use the Platform and improve our services</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You can manage cookie preferences through your browser settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the following rights regarding your personal data:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                  <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                  <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
                  <li><strong>Objection:</strong> Object to certain processing activities</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise these rights, contact your organization administrator or our support team.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">8. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal data for as long as your account is active or as needed to provide services. 
                  When you leave an organization, your data may be retained as per your organization's policies and 
                  legal requirements. Deleted accounts may have data retained in backups for a limited period.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Platform is not intended for children under 18 years of age. We do not knowingly collect 
                  personal information from children. If you believe we have collected information from a child, 
                  please contact us immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">10. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your data may be processed in countries other than your country of residence. We ensure appropriate 
                  safeguards are in place for international data transfers in compliance with applicable data protection laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">11. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes 
                  through the Platform or via email. Your continued use of the Platform after such changes constitutes 
                  acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-foreground font-medium">SLT work HuB Data Protection Team</p>
                  <p className="text-muted-foreground">Email: privacy@sltworkhub.com</p>
                  <p className="text-muted-foreground">Phone: +91-XXX-XXX-XXXX</p>
                  <p className="text-muted-foreground mt-2">
                    For GDPR-related inquiries, you may also contact our Data Protection Officer at dpo@sltworkhub.com
                  </p>
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
            <Link to="/terms">
              <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                View Terms of Service
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-100 py-10 sm:py-14 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center md:text-left md:flex-row md:justify-between">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <img 
                  src="/slt-hub-icon.png" 
                  alt="SLT work HuB"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-contain"
                />
                <span className="text-sm sm:text-lg font-bold">
                  <span className="font-black">SLT</span>
                  <span className="font-normal text-slate-400"> work </span>
                  <span className="font-black">HuB</span>
                </span>
              </div>
              <span className="text-emerald-400 font-medium flex items-center gap-2 text-xs sm:text-sm">
                <span>Made with ❤️ in</span>
                <span className="font-bold">భారత్ 🇮🇳</span>
              </span>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="text-slate-400 text-xs sm:text-sm">
                © 2025 SLT work HuB. All rights reserved.
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
                <Link to="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
                <Link to="/features" className="hover:text-slate-300 transition-colors">Features</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
