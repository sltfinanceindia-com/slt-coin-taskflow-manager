import { motion } from 'framer-motion';
import { CreditCard, MessageSquare, Cloud, Video, Building2, Mail, Calendar, FileSpreadsheet } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const integrations = [
  { name: 'Razorpay', icon: CreditCard, category: 'Payments', color: 'from-blue-500 to-indigo-600' },
  { name: 'Slack', icon: MessageSquare, category: 'Communication', color: 'from-purple-500 to-pink-600' },
  { name: 'MS Teams', icon: Video, category: 'Communication', color: 'from-blue-600 to-blue-700' },
  { name: 'Google Workspace', icon: Cloud, category: 'Productivity', color: 'from-green-500 to-green-600' },
  { name: 'Zoom', icon: Video, category: 'Meetings', color: 'from-blue-500 to-blue-600' },
  { name: 'Tally', icon: FileSpreadsheet, category: 'Accounting', color: 'from-red-500 to-orange-600' },
  { name: 'Gmail', icon: Mail, category: 'Email', color: 'from-red-500 to-red-600' },
  { name: 'Google Calendar', icon: Calendar, category: 'Scheduling', color: 'from-blue-500 to-blue-600' },
];

export function IntegrationsSection() {
  return (
    <section className="py-14 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Integrates with Tools You Already Use</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">Connect TeneXA with your existing tech stack for a seamless workflow</p>
        </motion.div>

        <motion.div className="relative max-w-4xl mx-auto" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div className="flex items-center justify-center mb-8">
            <motion.div
              className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#2E5F99] flex items-center justify-center shadow-xl shadow-primary/30"
              animate={{ boxShadow: ['0 0 20px hsla(213, 63%, 58%, 0.3)', '0 0 40px hsla(213, 63%, 58%, 0.5)', '0 0 20px hsla(213, 63%, 58%, 0.3)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Building2 className="h-8 w-8 text-white" />
            </motion.div>
          </div>

          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
            {integrations.map((integration, index) => (
              <motion.div key={integration.name} variants={fadeInUp} whileHover={{ y: -3, scale: 1.02 }} className="group">
                <div className="p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-all duration-300 text-center hover:shadow-lg hover:shadow-primary/5">
                  <motion.div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                  >
                    <integration.icon className="h-5 w-5 text-white" />
                  </motion.div>
                  <h4 className="text-sm font-semibold text-foreground mb-0.5">{integration.name}</h4>
                  <p className="text-xs text-muted-foreground">{integration.category}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="text-center mt-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
          <p className="text-sm text-muted-foreground">
            Don't see your tool? We offer a <span className="text-primary font-medium">REST API</span> for custom integrations.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default IntegrationsSection;
