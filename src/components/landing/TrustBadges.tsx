import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

const companies = [
  'Tech Mahindra', 'Wipro', 'Infosys', 'TCS', 'HCL',
  'Cognizant', 'Accenture', 'Capgemini', 'IBM', 'Microsoft'
];

export function TrustBadges() {
  return (
    <div className="w-full overflow-hidden py-8">
      <p className="text-center text-sm text-muted-foreground mb-8 font-medium">
        Trusted by 500+ organizations across India
      </p>
      
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-12 items-center"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ x: { duration: 30, repeat: Infinity, ease: 'linear' } }}
          >
            {[...companies, ...companies].map((company, index) => (
              <div
                key={`${company}-${index}`}
                className="flex items-center gap-3 px-6 py-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors shrink-0"
              >
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{company}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default TrustBadges;
