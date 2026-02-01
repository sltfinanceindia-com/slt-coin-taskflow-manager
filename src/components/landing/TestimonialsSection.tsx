import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "TeneXA reduced our payroll processing time by 70%. What used to take our team 3 days now happens automatically overnight.",
    author: "Priya Sharma",
    role: "CFO",
    company: "TechVision Solutions",
    rating: 5
  },
  {
    quote: "The best project management tool for BPO operations. Real-time visibility into team capacity has transformed how we plan sprints.",
    author: "Rajesh Kumar",
    role: "Operations Head",
    company: "GlobalServe BPO",
    rating: 5
  },
  {
    quote: "Attendance tracking is now seamless with GPS check-in. No more disputes about work hours, everything is transparent.",
    author: "Anita Patel",
    role: "HR Manager",
    company: "Precision Manufacturing",
    rating: 5
  },
  {
    quote: "We onboarded 500 employees in a week. The training module with assessments ensured everyone was up to speed quickly.",
    author: "Vikram Singh",
    role: "L&D Director",
    company: "FinServe India",
    rating: 5
  },
  {
    quote: "The gamification features have boosted team engagement by 40%. Employees actually look forward to completing tasks now.",
    author: "Sneha Reddy",
    role: "Team Lead",
    company: "CreativeHub Digital",
    rating: 5
  },
  {
    quote: "Finally, one platform for everything HR. No more switching between 5 different tools. TeneXA just works.",
    author: "Amit Joshi",
    role: "CHRO",
    company: "Innovate Corp",
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-32 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Loved by Teams Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about transforming their workplace with TeneXA
          </p>
        </motion.div>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 lg:w-64 bg-gradient-to-r from-muted/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 lg:w-64 bg-gradient-to-l from-muted/80 to-transparent z-10 pointer-events-none" />
        
        {/* First row - scrolling left */}
        <div className="flex overflow-hidden mb-6">
          <motion.div
            className="flex gap-6"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              x: {
                duration: 40,
                repeat: Infinity,
                ease: 'linear'
              }
            }}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
            ))}
          </motion.div>
        </div>

        {/* Second row - scrolling right */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: ['-50%', '0%'] }}
            transition={{
              x: {
                duration: 45,
                repeat: Infinity,
                ease: 'linear'
              }
            }}
          >
            {[...testimonials.slice(3), ...testimonials.slice(0, 3), ...testimonials.slice(3), ...testimonials.slice(0, 3)].map((testimonial, index) => (
              <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="w-[400px] shrink-0 p-6 rounded-2xl bg-background border border-border/50 hover:border-emerald-500/30 transition-colors">
      {/* Quote icon */}
      <Quote className="h-8 w-8 text-emerald-600/30 mb-4" />
      
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      
      {/* Quote */}
      <p className="text-foreground mb-6 leading-relaxed">
        "{testimonial.quote}"
      </p>
      
      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
          {testimonial.author.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-foreground">{testimonial.author}</p>
          <p className="text-sm text-muted-foreground">
            {testimonial.role}, {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestimonialsSection;
