import { motion } from 'framer-motion';
import { 
  CreditCard, 
  MessageSquare, 
  Cloud, 
  Video, 
  Building2,
  Mail,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const integrations = [
  { name: 'Razorpay', icon: CreditCard, category: 'Payments', color: 'from-blue-500 to-indigo-600' },
  { name: 'Slack', icon: MessageSquare, category: 'Communication', color: 'from-purple-500 to-pink-600' },
  { name: 'MS Teams', icon: Video, category: 'Communication', color: 'from-blue-600 to-blue-700' },
  { name: 'Google Workspace', icon: Cloud, category: 'Productivity', color: 'from-green-500 to-emerald-600' },
  { name: 'Zoom', icon: Video, category: 'Meetings', color: 'from-blue-500 to-blue-600' },
  { name: 'Tally', icon: FileSpreadsheet, category: 'Accounting', color: 'from-red-500 to-orange-600' },
  { name: 'Gmail', icon: Mail, category: 'Email', color: 'from-red-500 to-red-600' },
  { name: 'Google Calendar', icon: Calendar, category: 'Scheduling', color: 'from-blue-500 to-blue-600' },
];

export function IntegrationsSection() {
  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Integrates with Tools You Already Use
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect TeneXA with your existing tech stack for a seamless workflow
          </p>
        </motion.div>

        <motion.div
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Center logo */}
          <div className="flex items-center justify-center mb-12">
            <motion.div
              className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30"
              animate={{ 
                boxShadow: [
                  '0 0 30px hsla(160, 84%, 39%, 0.3)',
                  '0 0 50px hsla(160, 84%, 39%, 0.5)',
                  '0 0 30px hsla(160, 84%, 39%, 0.3)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Building2 className="h-12 w-12 text-white" />
            </motion.div>
          </div>

          {/* Integration cards grid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <div className="p-6 rounded-2xl bg-background border border-border/50 hover:border-emerald-500/50 transition-all duration-300 text-center hover:shadow-lg hover:shadow-emerald-500/5">
                  <motion.div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    animate={{ 
                      y: [0, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    <integration.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {integration.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {integration.category}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Connection lines (decorative) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px bg-gradient-to-b from-emerald-500 to-transparent"
                style={{
                  left: `${12.5 + i * 12.5}%`,
                  top: '0',
                  height: '40%'
                }}
                animate={{ 
                  opacity: [0.2, 0.5, 0.2],
                  height: ['30%', '50%', '30%']
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* API note */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-muted-foreground">
            Don't see your tool? We offer a <span className="text-emerald-600 font-medium">REST API</span> for custom integrations.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default IntegrationsSection;
