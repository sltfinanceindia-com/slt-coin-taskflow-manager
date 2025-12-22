import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, Building2, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { contactFormSchema, validateFormData } from "@/utils/validation-schemas";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Pricing</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="text-xs sm:text-sm">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4">Contact Us</h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Have questions about our enterprise plans or need custom solutions? 
            Our team is here to help you find the perfect fit for your organization.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card>
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
                    />
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
                    />
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
                  />
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
                  />
                </div>

                <Button type="submit" className="w-full min-h-[44px]" disabled={isSubmitting}>
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
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Get in touch</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Reach out to our sales and support teams directly.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 rounded-lg bg-primary/10 shrink-0">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Email</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">sales@sltworkhub.com</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">support@sltworkhub.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 rounded-lg bg-primary/10 shrink-0">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Phone</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">+91 98765 43210</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Mon-Fri, 9am-6pm IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 rounded-lg bg-primary/10 shrink-0">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Office</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">SLT Finance Building</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Mumbai, India</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
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

      {/* Footer */}
      <footer className="border-t mt-12 sm:mt-16 py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} SLT work HuB. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-3 sm:mt-4 text-xs sm:text-sm">
            <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;