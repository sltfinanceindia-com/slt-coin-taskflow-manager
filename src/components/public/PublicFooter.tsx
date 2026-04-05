import { Link } from 'react-router-dom';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Twitter,
  Linkedin,
  Youtube,
  Github
} from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Start Trial', href: '/start-trial' },
    { name: 'Resources', href: '/resources' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Feedback', href: '/feedback' },
  ],
  resources: [
    { name: 'Blog', href: '/resources' },
    { name: 'Help Center', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
  { name: 'GitHub', icon: Github, href: 'https://github.com' },
];

export function PublicFooter() {
  return (
    <>
      <footer className="bg-[#0A0A0A] dark:bg-[#050505] text-slate-100 py-14" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main footer content */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <img 
                  src="/slt-hub-icon.png" 
                  alt="TeneXA"
                  className="h-10 w-10 rounded-lg object-contain"
                />
                <span className="text-xl font-bold text-white">TeneXA</span>
              </Link>
              <p className="text-slate-400 mb-6 max-w-sm leading-relaxed">
                The complete enterprise platform for HR management, project tracking, 
                and team collaboration. Built for modern organizations.
              </p>
              
              {/* Contact info */}
              <div className="space-y-3 mb-6">
                <a href="mailto:hello@tenexa.com" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                  hello@tenexa.com
                </a>
                <a href="tel:+919876543210" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4" />
                  +91 98765 43210
                </a>
                <div className="flex items-start gap-3 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>Mumbai, India</span>
                </div>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300"
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-[#2A2A2A]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} TeneXA. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span>Made with ❤️ in</span>
                <span className="font-semibold">भारत 🇮🇳</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation variant="public" />
      
      {/* Add padding at bottom for mobile nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}
