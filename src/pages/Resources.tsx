import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { 
  Search, 
  ArrowRight, 
  Clock, 
  BookOpen,
  Video,
  FileText,
  Lightbulb,
  TrendingUp,
  Users,
  Calendar,
  LayoutGrid,
  List
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { fadeInUp, staggerContainer, cardHover, viewportOnce } from '@/lib/animations';

const categories = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'hr', label: 'HR', icon: Users },
  { id: 'projects', label: 'Projects', icon: Calendar },
  { id: 'payroll', label: 'Payroll', icon: FileText },
  { id: 'tips', label: 'Tips & Tricks', icon: Lightbulb },
  { id: 'updates', label: 'Product Updates', icon: TrendingUp }
];

const resources = [
  {
    id: 1,
    title: 'The Complete Guide to HR Automation in 2026',
    excerpt: 'Learn how to automate repetitive HR tasks and free up your team for strategic initiatives. This comprehensive guide covers everything from onboarding to offboarding.',
    category: 'hr',
    type: 'guide',
    readTime: '12 min read',
    date: '2026-01-28',
    featured: true,
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=400&fit=crop'
  },
  {
    id: 2,
    title: 'How to Implement GPS-Based Attendance Tracking',
    excerpt: 'Step-by-step guide to setting up GPS attendance for your distributed workforce. Includes best practices for privacy and compliance.',
    category: 'hr',
    type: 'tutorial',
    readTime: '8 min read',
    date: '2026-01-25',
    featured: false,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop'
  },
  {
    id: 3,
    title: 'Project Management Best Practices for BPO Teams',
    excerpt: 'Discover proven strategies for managing projects in high-volume BPO environments. Learn how to balance quality with efficiency.',
    category: 'projects',
    type: 'guide',
    readTime: '10 min read',
    date: '2026-01-22',
    featured: false,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop'
  },
  {
    id: 4,
    title: 'Payroll Compliance: India Tax Updates 2026',
    excerpt: 'Stay updated with the latest tax regulations affecting payroll processing in India. Includes TDS, PF, and ESI changes.',
    category: 'payroll',
    type: 'article',
    readTime: '6 min read',
    date: '2026-01-20',
    featured: false,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop'
  },
  {
    id: 5,
    title: '10 Keyboard Shortcuts to Boost Your Productivity',
    excerpt: 'Master these TeneXA keyboard shortcuts to navigate faster and get more done in less time.',
    category: 'tips',
    type: 'tips',
    readTime: '4 min read',
    date: '2026-01-18',
    featured: false,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=400&fit=crop'
  },
  {
    id: 6,
    title: 'New Feature: AI-Powered Performance Insights',
    excerpt: 'Introducing our latest AI feature that automatically identifies performance trends and suggests improvements.',
    category: 'updates',
    type: 'announcement',
    readTime: '3 min read',
    date: '2026-01-15',
    featured: false,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop'
  },
  {
    id: 7,
    title: 'Building High-Performance Remote Teams',
    excerpt: 'Strategies for managing remote and hybrid teams effectively. Includes communication frameworks and collaboration tools.',
    category: 'hr',
    type: 'guide',
    readTime: '15 min read',
    date: '2026-01-12',
    featured: false,
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=400&fit=crop'
  },
  {
    id: 8,
    title: 'OKR Framework: Setting Goals That Drive Results',
    excerpt: 'Learn how to implement OKRs in your organization with practical examples and templates.',
    category: 'projects',
    type: 'guide',
    readTime: '11 min read',
    date: '2026-01-10',
    featured: false,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop'
  },
  {
    id: 9,
    title: 'Automating Leave Approval Workflows',
    excerpt: 'Set up smart leave approval chains that save time and ensure policy compliance.',
    category: 'tips',
    type: 'tutorial',
    readTime: '5 min read',
    date: '2026-01-08',
    featured: false,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=400&fit=crop'
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'guide': return BookOpen;
    case 'video': return Video;
    case 'tutorial': return FileText;
    case 'tips': return Lightbulb;
    case 'announcement': return TrendingUp;
    default: return FileText;
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'guide': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'video': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'tutorial': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'tips': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'announcement': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredResource = resources.find(r => r.featured);

  return (
    <>
      <SEOHead 
        title="Resources - Tenexa | Guides, Tutorials & Best Practices"
        description="Explore TeneXA's resource library: HR guides, project management tutorials, payroll tips, and product updates to help you succeed."
        keywords="HR resources, workforce management guides, project management tutorials, payroll compliance, TeneXA blog"
        canonical="https://tenexa.lovable.app/resources"
      />
      <div className="min-h-screen bg-background">
        <PublicHeader />

        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                <BookOpen className="h-3 w-3 mr-1" />
                Resources & Insights
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Learn, Grow,{' '}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Succeed
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Guides, tutorials, and best practices to help you get the most out of TeneXA and transform your workforce management.
              </p>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles, guides, tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base rounded-full border-2 focus:border-primary"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Article */}
        {featuredResource && !searchQuery && activeCategory === 'all' && (
          <section className="py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                {...fadeInUp}
                viewport={viewportOnce}
              >
                <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-video md:aspect-auto">
                      <img 
                        src={featuredResource.image} 
                        alt={featuredResource.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
                      <Badge className="w-fit mb-4 bg-primary/10 text-primary">Featured</Badge>
                      <h2 className="text-2xl lg:text-3xl font-bold mb-4">{featuredResource.title}</h2>
                      <p className="text-muted-foreground mb-6">{featuredResource.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredResource.readTime}
                        </span>
                        <span>{new Date(featuredResource.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <Button className="w-fit" asChild>
                        <Link to="#">
                          Read Article
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            </div>
          </section>
        )}

        {/* Filter Bar */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                    className="rounded-full"
                  >
                    <category.icon className="h-4 w-4 mr-1" />
                    {category.label}
                  </Button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-9 w-9"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-9 w-9"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {filteredResources.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <motion.div 
                className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
                }
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={viewportOnce}
              >
                {filteredResources.filter(r => !r.featured || searchQuery || activeCategory !== 'all').map((resource) => {
                  const TypeIcon = getTypeIcon(resource.type);
                  
                  if (viewMode === 'list') {
                    return (
                      <motion.div key={resource.id} variants={fadeInUp}>
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                          <div className="flex flex-col sm:flex-row gap-4 p-4">
                            <div className="w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                              <img 
                                src={resource.image} 
                                alt={resource.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`text-xs ${getTypeBadgeColor(resource.type)}`}>
                                  <TypeIcon className="h-3 w-3 mr-1" />
                                  {resource.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(resource.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <h3 className="font-semibold mb-2 line-clamp-1">{resource.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{resource.excerpt}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {resource.readTime}
                                </span>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to="#">
                                    Read <ArrowRight className="ml-1 h-3 w-3" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div 
                      key={resource.id} 
                      variants={fadeInUp}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 hover:border-primary/50 group">
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={resource.image} 
                            alt={resource.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={`text-xs ${getTypeBadgeColor(resource.type)}`}>
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {resource.type}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{resource.excerpt}</p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {resource.readTime}
                            </span>
                            <span>{new Date(resource.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Load More */}
            {filteredResources.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-2xl mx-auto text-center"
              {...fadeInUp}
              viewport={viewportOnce}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Stay Updated</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Get the latest HR insights, product updates, and best practices delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  className="h-12 flex-1"
                />
                <Button size="lg" className="h-12 px-8">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                No spam. Unsubscribe anytime.
              </p>
            </motion.div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </>
  );
}
