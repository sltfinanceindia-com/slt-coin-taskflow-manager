import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, Building2, MessageSquare, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { contactFormSchema, validateFormData } from "@/utils/validation-schemas";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { SEOHead } from "@/components/SEOHead";

// Import background image
import bgPatternFeatures from '@/assets/bg-pattern-features.jpg';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate using Zod schema
    const result = validateFormData(contactFormSchema, formData);
    
    if (!result.success) {
      // Map errors to field names
      const fieldErrors: Record<string, string> = {};
      (result as { success: false; errors: string[] }).errors.forEach(error => {
        if (error.includes('Name')) fieldErrors.name = error;
        else if (error.includes('Email')) fieldErrors.email = error;
        else if (error.includes('Subject')) fieldErrors.subject = error;
        else if (error.includes('Message')) fieldErrors.message = error;
        else if (error.includes('Company')) fieldErrors.company = error;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the form errors before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store validated and sanitized data
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          name: result.data.name,
          email: result.data.email,
          company: result.data.company || null,
          subject: result.data.subject,
          message: result.data.message,
        }]);

      if (error) throw error;
      
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", company: "", subject: "", message: "" });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Contact Us - Tenexa | Get in Touch"
        description="Contact Tenexa for enterprise solutions, custom integrations, or any questions. Our team is ready to help you transform your workplace."
        keywords="contact, support, enterprise solutions, custom integrations, Tenexa contact"
        canonical="https://tenexa.lovable.app/contact"
      />
      <div className="min-h-screen bg-background">
        {/* Shared Header */}
        <PublicHeader />

        {/* Hero with Background */}
        <section 
          className="relative py-16 sm:py-24 lg:py-32 text-center overflow-hidden"
          style={{
            backgroundImage: `url(${bgPatternFeatures})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-background/85 dark:bg-background/90" />
          
          {/* Decorative Background Shapes */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2" aria-hidden="true" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl translate-y-1/2" aria-hidden="true" />
          
          <div className="container relative mx-auto px-4">
            <Badge className="mb-4 sm:mb-6 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700 text-xs sm:text-sm animate-bounce-subtle">
              <MessageSquare className="h-3 w-3 mr-1" />
              Get in Touch
            </Badge>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight leading-tight animate-fade-in">
              Contact
              <span className="block text-emerald-600 dark:text-emerald-400">Our Team</span>
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
              Have questions about our enterprise plans or need custom solutions? 
              Our team is here to help you find the perfect fit for your organization.
            </p>
          </div>
        </section>

        <main className="container mx-auto px-4 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Send us a message</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">Full Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Work Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@company.com"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm">Company Name</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Acme Corporation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm">Subject *</Label>
                    <Input
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Enterprise pricing inquiry"
                      className={errors.subject ? 'border-red-500' : ''}
                    />
                    {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your organization's needs..."
                      className={errors.message ? 'border-red-500' : ''}
                    />
                    {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                  </div>

                  <Button type="submit" className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-4 sm:space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Get in touch</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Reach out to our sales and support teams directly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base">Email</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">sales@tenexa.com</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">support@tenexa.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base">Phone</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">+91 98765 43210</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Mon-Fri, 9am-6pm IST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base">Office</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Tenexa Building</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Mumbai, India</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Enterprise Solutions</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Need a custom solution for your large organization?
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <li>• Dedicated account manager</li>
                    <li>• Custom integrations</li>
                    <li>• SLA guarantees</li>
                    <li>• On-premise deployment options</li>
                    <li>• Priority support 24/7</li>
                  </ul>
                  <Link to="/pricing">
                    <Button variant="outline" className="w-full mt-4 min-h-[44px]">
                      View Pricing Plans
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Shared Footer */}
        <PublicFooter />
      </div>
    </>
  );
};

export default Contact;
