import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import  {Button}  from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '../components/ui/progress';
import { Checkbox } from '../components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ArrowLeft, 
//   Settings, 
//   Globe, 
  BarChart3, 
  Target,
  CheckCircle,
  TrendingUp,
  Shield,
  Search,
  Users,
  Zap,
  Brain,
//   Eye,
  Award,
  AlertTriangle,
  Lightbulb,
//   FileText,
//   Image,
  Star,
  DollarSign,
  ArrowRight,
  Layers,
  Filter,
//   PieChart,
  Gauge,
  Building2,
  Route,
  Workflow,
  Play
} from 'lucide-react';

export default function CampaignStructureGuide() {
  const navigate = useNavigate();
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const toggleCompletion = (itemId: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const scrollToStep = (stepId: string) => {
    const element = document.getElementById(stepId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Sticky header scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const structureFramework = {
    step1: {
      id: 'step1',
      number: '01',
      title: 'Define Campaign Goals and Types',
      icon: Target,
      description: 'Each campaign should have one primary goal (sales, leads, awareness)',
      color: 'from-slate-800 via-emerald-600 to-slate-900',
      bgPattern: 'floating-orbs',
      items: [
        { 
          id: 'define-goals',
          title: 'Define Clear Campaign Goals',
          icon: Target,
          description: 'Each campaign should have one primary goal (sales, leads, awareness). Campaign types include Search, Display, Shopping, Video, Discovery, App, Performance Max (PMax). Don\'t mix campaign types or goals in one campaign.',
          checkpoints: [
            'Identify primary business objective for each campaign (sales conversions, lead generation, brand awareness)',
            'Choose appropriate campaign type: Search for high-intent keywords, Display for awareness, Shopping for products',
            'Never combine multiple campaign types in single campaign (e.g., avoid Search + Display together)',
            'Start with 1-2 focused campaigns for beginners or small budgets before expanding',
            'Use Expert Mode to retain full control over all campaign settings and features',
            'Define success metrics and KPIs specific to each campaign goal before launch',
            'Establish clear budget allocation based on campaign priority and expected performance'
          ],
          tips: [
            'Beginners should start with Search campaigns for immediate results and clear attribution',
            'Use Performance Max only after gathering sufficient conversion data (30+ conversions/month)',
            'Keep campaign goals simple and measurable - avoid trying to achieve multiple objectives',
            'Document campaign purposes and goals for team alignment and future optimization'
          ],
          redFlags: [
            'Mixing Search and Display targeting in the same campaign',
            'Using broad campaign goals like "increase everything" without specific metrics',
            'Starting with complex automation before understanding basic campaign management',
            'Setting up too many campaigns without sufficient budget to support each effectively'
          ]
        }
      ]
    },
    step2: {
      id: 'step2',
      number: '02',
      title: 'Organize Campaigns by Theme or Segment',
      icon: Layers,
      description: 'Structure campaigns around how your business operates or how customers shop',
      color: 'from-slate-800 via-emerald-500 to-slate-900',
      bgPattern: 'grid-dots',
      items: [
        { 
          id: 'organize-themes',
          title: 'Organize by Business Logic',
          icon: Building2,
          description: 'Structure campaigns around how your business operates or how customers shop: by product/service category, location, funnel stage, or goal.',
          checkpoints: [
            'Organize by Product/Service Category: Create separate campaigns for each major product line (e.g., "Men\'s Shoes" vs "Women\'s Shoes")',
            'Structure by Location: Use geo-targeting for businesses in multiple regions (e.g., "Gym – New York" vs "Gym – Los Angeles")',
            'Segment by Funnel Stage: Create prospecting campaigns (new customers) and remarketing campaigns (past visitors/customers)',
            'Allocate budget strategically: ~80% for new customer acquisition, 20% for remarketing and retention',
            'Organize by Goal: Separate campaigns for online sales vs app installs vs lead generation',
            'Use clear naming conventions: "Search – NonBrand – Shoes" or "PMax – Retargeting – All Products"',
            'Keep structures lean for smaller accounts to maintain data density, use MCCs for enterprise accounts'
          ],
          tips: [
            'Use consistent naming conventions across all campaigns for easy management',
            'Start with broader categories and split into more granular segments as data volume grows',
            'Align campaign structure with your website navigation and product catalog organization',
            'Consider seasonal patterns when organizing product categories (e.g., separate winter/summer campaigns)'
          ],
          redFlags: [
            'Mixing unrelated products or services in the same campaign',
            'Over-segmentation that spreads budget too thin across too many campaigns',
            'Inconsistent or confusing naming conventions across campaigns',
            'Not considering customer journey stages in campaign organization'
          ]
        }
      ]
    },
    step3: {
      id: 'step3',
      number: '03',
      title: 'Separate Brand and Non-Brand Campaigns',
      icon: Shield,
      description: 'Keep brand and non-brand traffic separate for clear performance insights',
      color: 'from-slate-800 via-emerald-700 to-slate-900',
      bgPattern: 'circuit-board',
      items: [
        { 
          id: 'separate-brand-nonbrand',
          title: 'Brand vs Non-Brand Separation',
          icon: Shield,
          description: 'Brand campaigns target branded keywords (e.g., "Nike Shoes") while non-brand campaigns exclude brand keywords and focus on prospecting (e.g., "running shoes for men").',
          checkpoints: [
            'Create dedicated Brand Campaign for branded keywords (your company name, product names, misspellings)',
            'Set up Non-Brand Campaigns excluding all brand terms, focusing on category and competitor keywords',
            'Add your brand terms as negative keywords in non-brand campaigns to prevent overlap',
            'Monitor brand campaigns for competitor hijacking and adjust bids accordingly',
            'Use different ad copy strategies: brand campaigns emphasize trust and offers, non-brand focuses on USPs',
            'Allocate budget appropriately: brand campaigns typically have higher conversion rates but lower volume',
            'Track branded vs non-branded performance separately for accurate attribution and ROI analysis'
          ],
          tips: [
            'Brand campaigns typically drive cheaper clicks with higher conversion rates',
            'Use brand campaigns to control your brand message and prevent competitor takeover',
            'Non-brand campaigns are crucial for new customer acquisition and growth',
            'Monitor share of voice for brand terms to ensure you\'re capturing your fair share'
          ],
          redFlags: [
            'Not having a dedicated brand campaign while competitors bid on your brand terms',
            'Mixing brand and non-brand keywords in the same campaigns',
            'Not using brand terms as negatives in non-brand campaigns',
            'Ignoring brand campaign performance because it seems "too easy"'
          ]
        }
      ]
    },
    step4: {
      id: 'step4',
      number: '04',
      title: 'Highlight Top Performers',
      icon: Star,
      description: 'Create dedicated campaigns for best-selling or highest-ROAS products/keywords',
      color: 'from-slate-800 via-emerald-600 to-slate-900',
      bgPattern: 'topography',
      items: [
        { 
          id: 'hero-campaigns',
          title: 'Hero Campaigns Strategy',
          icon: Award,
          description: 'Pull out your best-selling or highest-ROAS products/keywords into dedicated campaigns with more budget. Keep other products/keywords in general campaigns to discover new winners.',
          checkpoints: [
            'Create Hero Campaigns for products/keywords with proven high ROAS (typically 300%+ ROAS)',
            'Set up Testing Campaigns for discovering new winners among remaining products/keywords',
            'Implement 80/20 framework: ~70% budget to proven performers, ~20% to testing/discovery, ~10% to brand defense',
            'Promote proven performers from testing campaigns to hero campaigns over time based on performance',
            'Use query sculpting for Shopping campaigns with campaign priority levels (high/medium/low)',
            'Apply tailored negative keywords to control which campaign serves which query type',
            'Monitor cannibalization between hero and testing campaigns to prevent internal competition'
          ],
          tips: [
            'Start with broader testing campaigns and graduate winners to dedicated hero campaigns',
            'Use campaign priority settings in Shopping to control traffic flow between campaigns',
            'Review performance monthly to identify new products/keywords ready for hero campaign promotion',
            'Apply more aggressive bidding strategies to hero campaigns since they have proven performance'
          ],
          redFlags: [
            'Not separating proven performers from experimental products/keywords',
            'Allocating equal budget to high and low performing products',
            'Not using campaign priorities to prevent internal competition',
            'Failing to graduate winning products from testing to dedicated campaigns'
          ]
        }
      ]
    },
    step5: {
      id: 'step5',
      number: '05',
      title: 'Use Search Campaigns for High-Value Keywords',
      icon: Search,
      description: 'Create Search campaigns for high-intent, proven keywords even with PMax running',
      color: 'from-slate-800 via-emerald-500 to-slate-900',
      bgPattern: 'plus-grid',
      items: [
        { 
          id: 'search-campaigns',
          title: 'Strategic Search Campaign Setup',
          icon: Search,
          description: 'Even if PMax or Shopping covers search, create Search campaigns for high-intent, proven keywords. Use match type pyramid and Alpha/Beta approach for maximum control.',
          checkpoints: [
            'Identify 20+ "money keywords" for dedicated Search campaigns with tight ad groups',
            'Create optimized landing pages specifically for high-value keyword groups',
            'Implement match type pyramid: exact for high-intent, phrase for mid-funnel, broad for discovery',
            'Use exact or phrase match for focused spend, include broad match for discovery with Smart Bidding',
            'Set up Alpha/Beta campaign structure: Alpha for proven keywords, Beta for discovery',
            'Regularly review search term reports to move strong queries into targeted ad groups',
            'Exclude discovered keywords from broad campaigns to prevent cannibalization',
            'Layer in audience targeting and demographics for additional optimization'
          ],
          tips: [
            'Focus Search campaigns on your highest-converting, most profitable keywords',
            'Use responsive search ads with keyword-specific headlines for better relevance',
            'Implement negative keyword harvesting from PMax search themes reports',
            'Start with phrase match and expand to broad match once you have sufficient negative keyword lists'
          ],
          redFlags: [
            'Relying solely on automated campaigns without strategic Search campaign control',
            'Not using match type strategy to control traffic and costs',
            'Ignoring search term reports and allowing irrelevant traffic',
            'Not having dedicated landing pages for high-value keyword groups'
          ]
        }
      ]
    },
    step6: {
      id: 'step6',
      number: '06',
      title: 'Leverage Performance Max and DSA',
      icon: Zap,
      description: 'Use PMax and DSA as discovery tools while maintaining structured campaigns',
      color: 'from-slate-800 via-emerald-700 to-slate-900',
      bgPattern: 'signal-wave',
      items: [
        { 
          id: 'pmax-dsa-strategy',
          title: 'Performance Max & DSA Implementation',
          icon: Brain,
          description: 'Use Performance Max and Dynamic Search Ads as testing and discovery tools, but pair with structured Search/Shopping campaigns for full control.',
          checkpoints: [
            'Set up Performance Max campaigns for scaling with sufficient conversion data (30+ conversions/month)',
            'Configure PMax to run across all Google channels using product feed and quality assets',
            'Implement brand exclusions in PMax to avoid cannibalizing dedicated brand campaigns',
            'Add campaign-level negative keywords to PMax to refine relevance and reduce wasted spend',
            'Set new customer acquisition goals if growth is priority over existing customer retention',
            'Monitor search theme usefulness indicators and remove low-value themes quarterly',
            'Create Dynamic Search Ads campaigns organized by URL structure and product categories',
            'Use DSA for capturing long-tail keywords not covered in structured Search campaigns'
          ],
          tips: [
            'Start PMax broad, then split by category or performance tier as data accumulates',
            'Use PMax as discovery engine to find new high-performing search terms and placements',
            'Ensure DSA page feeds are clean and exclude irrelevant pages (blog, support, etc.)',
            'Monitor PMax search themes report monthly to identify expansion opportunities'
          ],
          redFlags: [
            'Running PMax without sufficient conversion data or proper asset quality',
            'Not excluding brand terms from PMax campaigns',
            'Relying solely on automated campaigns without structured Search backup',
            'Not monitoring or optimizing DSA search terms for relevance'
          ]
        }
      ]
    },
    step7: {
      id: 'step7',
      number: '07',
      title: 'Structure Ad Groups Tightly',
      icon: Filter,
      description: 'Use STAG methodology with tight themes and sufficient data volume',
      color: 'from-slate-800 via-emerald-600 to-slate-900',
      bgPattern: 'mesh-gradient',
      items: [
        { 
          id: 'ad-group-structure',
          title: 'Modern Ad Group Architecture',
          icon: Layers,
          description: 'Replace SKAGs with STAGs (Single Theme Ad Groups) - group 3-5 semantically related terms while maintaining theme relevance and data density.',
          checkpoints: [
            'Maintain 7-10 ad groups per campaign as baseline for optimal structure',
            'Group 10-20 tightly related keywords per ad group using STAG methodology',
            'Include 3-5 semantically related terms per theme instead of single keywords',
            'Create 2-3 responsive search ads per ad group with main keyword in headlines',
            'Ensure all ads in ad group lead to single, highly relevant landing page',
            'Apply Hagakure method: aim for 3,000+ impressions per week per ad group',
            'Avoid mixing unrelated keywords (e.g., "running shoes" + "running shorts" in same group)',
            'Implement keyword theme clustering for better Quality Score and performance'
          ],
          tips: [
            'Use semantic keyword grouping tools to identify related terms for STAG setup',
            'Consolidate ad groups with similar themes but low volume to meet Hagakure thresholds',
            'Focus on theme relevance rather than exact keyword match for better automation performance',
            'Regular review and consolidation of underperforming ad groups improves overall account health'
          ],
          redFlags: [
            'Using outdated SKAG methodology that starves campaigns of data',
            'Mixing unrelated keywords in the same ad group',
            'Creating too many ad groups with insufficient volume for optimization',
            'Not updating ad group structure as account data and performance evolves'
          ]
        }
      ]
    },
    step8: {
      id: 'step8',
      number: '08',
      title: 'Budget Allocation and Bidding Strategy',
      icon: DollarSign,
      description: 'Align budget and bidding with performance data and business goals',
      color: 'from-slate-800 via-emerald-500 to-slate-900',
      bgPattern: 'diagonal-lines',
      items: [
        { 
          id: 'budget-bidding',
          title: 'Strategic Budget and Bid Management',
          icon: TrendingUp,
          description: 'Fund high-ROI campaigns first, use appropriate bidding strategies based on data maturity, and implement portfolio bidding for larger accounts.',
          checkpoints: [
            'Prioritize budget allocation: fund high-ROI campaigns (brand, hero products) first',
            'Keep experimental/test campaigns on controlled, limited budgets initially',
            'Increase budgets gradually in 10-20% increments to maintain performance stability',
            'Follow automation roadmap: Manual CPC → Enhanced CPC → Target CPA/ROAS progression',
            'Use Target ROAS/CPA for proven campaigns with sufficient conversion data',
            'Apply Maximize Clicks/Conversions for testing campaigns and new account launches',
            'Implement portfolio bidding strategies for larger accounts to manage goals across campaigns',
            'Ensure each campaign has adequate budget - avoid spreading too thin across many campaigns'
          ],
          tips: [
            'Monitor campaign budget utilization daily to identify constraint opportunities',
            'Use shared budgets cautiously - they can lead to budget allocation issues',
            'Start conservative with automated bidding and gradually increase targets as performance proves',
            'Document bidding strategy rationale for each campaign for team alignment'
          ],
          redFlags: [
            'Using advanced bidding strategies on campaigns with insufficient conversion data',
            'Not adjusting budgets based on performance and ROI data',
            'Setting unrealistic ROAS targets that choke campaign volume',
            'Ignoring budget constraints that limit high-performing campaigns'
          ]
        }
      ]
    },
    step9: {
      id: 'step9',
      number: '09',
      title: 'Testing and Refining Structure',
      icon: Gauge,
      description: 'Continuously test and optimize campaign structure based on performance data',
      color: 'from-slate-800 via-emerald-700 to-slate-900',
      bgPattern: 'radial-gradient',
      items: [
        { 
          id: 'testing-refining',
          title: 'Continuous Structure Optimization',
          icon: Route,
          description: 'Test different campaign structures, use custom labels for refined segmentation, and review data weekly for ongoing optimization.',
          checkpoints: [
            'Test different campaign structures: by product, by audience, by placement strategy',
            'Start with product testing campaigns if unsure of winners, then graduate to hero campaigns',
            'Test placement-focused campaigns if product winners are known (Shopping vs YouTube/Display)',
            'Use custom labels in Shopping feeds: profit margin, inventory levels, seasonality, performance tier',
            'Review performance data weekly: merge weak campaigns, graduate winners, adjust negatives',
            'Implement attribution and measurement frameworks for accurate performance assessment',
            'Run incrementality testing or lift studies to measure true campaign impact',
            'Document structure changes and their performance impact for future reference'
          ],
          tips: [
            'Use Google Ads Experiments feature to test major structural changes safely',
            'Implement custom labels strategically to enable better segmentation and bidding',
            'Regular structure reviews prevent account bloat and maintain performance',
            'Focus on data-driven decisions rather than theoretical best practices'
          ],
          redFlags: [
            'Never testing or optimizing initial campaign structure',
            'Making too many structural changes at once without measuring impact',
            'Not using available data signals like custom labels for optimization',
            'Ignoring performance trends when making structural decisions'
          ]
        }
      ]
    }
  };

  const calculateProgress = () => {
    const totalItems = Object.values(structureFramework).reduce(
      (acc, step) => acc + step.items.length, 0
    );
    const completedCount = Object.keys(completedItems).filter(
      key => completedItems[key]
    ).length;
    return totalItems > 0 ? (completedCount / totalItems) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
      <PublicHeader />
      
      {/* Hero Section with Enhanced Gradients and Moving Animation */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        {/* Moving Gradient Background - Inspired by Big Tech */}
        <div className="absolute inset-0">
          {/* Base dark background */}
          <div className="absolute inset-0 bg-gray-900" />
          
          {/* Primary moving gradient */}
          <div 
            className="absolute inset-0 opacity-80"
            style={{
              background: `linear-gradient(135deg, 
                #0a0a0a 0%, 
                #1a2e1a 15%,
                #0d2818 35%,
                #164223 50%,
                #1a5c2e 65%,
                #0f2e1a 80%,
                #0a0a0a 100%)`,
              backgroundSize: '400% 400%',
            }}
          />
          
          {/* Secondary overlay gradient with animation */}
          <div 
            className="absolute inset-0 animate-gradient-shift opacity-60"
            style={{
              background: `radial-gradient(circle at center, 
                transparent 0%,
                rgba(34, 139, 34, 0.2) 30%,
                rgba(14, 75, 153, 0.3) 60%,
                rgba(26, 26, 46, 0.8) 100%)`,
              backgroundSize: '200% 200%',
            }}
          />
          
          {/* Moving light effect */}
          <div 
            className="absolute inset-0 animate-gradient-move opacity-30"
            style={{
              background: `linear-gradient(45deg, 
                transparent 30%, 
                rgba(34, 139, 34, 0.4) 50%, 
                transparent 70%)`,
              backgroundSize: '200% 200%',
            }}
          />
        </div>

        {/* Floating Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15 animate-orb-float blur-xl"
            style={{
              background: 'radial-gradient(circle, rgba(34, 139, 34, 0.3) 0%, transparent 70%)',
            }}
          />
          <div 
            className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-10 animate-orb-float blur-xl"
            style={{
              background: 'radial-gradient(circle, rgba(14, 75, 153, 0.3) 0%, transparent 70%)',
              animationDelay: '4s',
            }}
          />
          <div 
            className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-12 animate-orb-float blur-xl"
            style={{
              background: 'radial-gradient(circle, rgba(46, 139, 87, 0.4) 0%, transparent 70%)',
              animationDelay: '8s',
            }}
          />
        </div>

        {/* Content Overlay */}

        <div className="relative z-10 container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="mb-8 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>

            <div className="space-y-6">
              <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-600/50 px-4 py-2 text-sm font-medium">
                <Workflow className="h-4 w-4 mr-2" />
                Campaign Structure Guide
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                How to Structure{" "}
                <span className="bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 bg-clip-text text-transparent">
                  Campaigns
                </span>{" "}
                in Google Ads
              </h1>
              
              <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                A complete step-by-step roadmap to organize your Google Ads campaigns for maximum performance, clear data insights, and efficient budget allocation.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-white/90">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>9 Strategic Steps</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-300" />
                  <span>Modern 2025 Best Practices</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span>Data-Driven Framework</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-0">
                <div className="relative">
                  {!isVideoPlaying ? (
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => setIsVideoPlaying(true)}
                    >
                      {/* Video Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-primary via-emerald-600 to-primary relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-emerald-600/20 to-primary/20 animate-pulse"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,theme(colors.emerald.500/30),transparent_50%)]"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,theme(colors.primary/40),transparent_50%)]"></div>
                        
                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:bg-white/30">
                            <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                          </div>
                        </div>
                        
                        {/* Video Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                          <h3 className="text-white text-xl font-bold mb-2">
                            Master Campaign Structure for Google Ads Success
                          </h3>
                          <p className="text-white/90 text-sm">
                            Watch this comprehensive guide to implementing expert-level campaign structure strategies
                          </p>
                        </div>
                        
                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/5j50y5s3gHU?si=0Yv8sEw3QsacgtQM&autoplay=1"
                        title="Campaign Structure Guide"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Navigation Overview */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-4">
                Complete Campaign Structure Guide
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Everything you need to build high-performing Google Ads campaigns using our proven 9-step framework
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card 
                className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600"
                onClick={() => scrollToStep('why-structure-matters')}
              >
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <h5 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                    Why Structure Matters
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Foundation principles and impact on performance
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600"
                onClick={() => scrollToStep('campaign-flow')}
              >
                <CardContent className="p-4 text-center">
                  <Workflow className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <h5 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                    9-Step Framework
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Complete methodology with interactive flow
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600"
                onClick={() => scrollToStep('real-world-examples')}
              >
                <CardContent className="p-4 text-center">
                  <Building2 className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <h5 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                    Real-World Examples
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Detailed campaign structures by industry
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600"
                onClick={() => scrollToStep('campaign-checklist')}
              >
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <h5 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                    Implementation Checklist
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Step-by-step verification guide
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600"
                onClick={() => scrollToStep('frequently-asked-questions')}
              >
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <h5 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                    FAQ
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Common questions and migration tips
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600"
                onClick={() => scrollToStep('campaign-structure-glossary')}
              >
                <CardContent className="p-4 text-center">
                  <Brain className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <h5 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                    Glossary
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Essential terms and definitions
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600"
                onClick={() => scrollToStep('key-takeaways')}
              >
                <CardContent className="p-4 text-center">
                  <Award className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <h5 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                    Key Takeaways
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Essential principles and success metrics
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </section>

      {/* Why Campaign Structure Matters */}
      <section id="why-structure-matters" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Campaign Structure Matters
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The way you structure your Google Ads campaigns directly affects performance. A messy setup leads to wasted budget, confusing data, and irrelevant impressions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="bg-background border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50">
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="h-5 w-5" />
                    Poor Structure Leads To
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 py-6">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 group-hover:bg-red-100 dark:group-hover:bg-red-950/30 transition-colors">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-foreground font-medium">Wasted budget on irrelevant traffic</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 group-hover:bg-red-100 dark:group-hover:bg-red-950/30 transition-colors">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-foreground font-medium">Confusing performance data</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 group-hover:bg-red-100 dark:group-hover:bg-red-950/30 transition-colors">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-foreground font-medium">Irrelevant impressions and clicks</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 group-hover:bg-red-100 dark:group-hover:bg-red-950/30 transition-colors">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-foreground font-medium">Internal campaign competition</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50">
                  <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle className="h-5 w-5" />
                    Proper Structure Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 py-6">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/30 transition-colors">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-foreground font-medium">Budget aligned with business goals</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/30 transition-colors">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-foreground font-medium">Tightly relevant ads to audience</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/30 transition-colors">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-foreground font-medium">Clear data for optimization</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/30 transition-colors">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-foreground font-medium">Better AI learning and performance</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card id="campaign-flow" className="bg-background border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50">
                <div className="flex items-center justify-center">
                  <Brain className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mr-3" />
                  <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">2025 Campaign Structure Reality</h3>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <p className="text-foreground leading-relaxed text-base">
                    In 2025, campaign structure matters more than ever. Google's machine learning requires enough data density to optimize effectively.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                      <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">Over-segmentation:</h4>
                      <p className="text-sm text-foreground">Starves campaigns of signals and reduces performance</p>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Thoughtful structuring:</h4>
                      <p className="text-sm text-foreground">Balances human control with algorithmic optimization</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* 9-Step Framework Quick Reference */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card id="quick-navigation" className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
                  <Workflow className="w-7 h-7" />
                  9-Step Framework
                </CardTitle>
                <CardDescription>
                  Complete methodology for structuring high-performing Google Ads campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.values(structureFramework).map((step) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => scrollToStep(step.id)}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {step.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {step.description}
                        </p>
                      </div>
                      <step.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-slate-50 dark:from-emerald-950/20 dark:to-slate-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-4 text-center">
                    Quick Budget Guidelines
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-emerald-600 mb-1">Small Budget ({'<'}$2K)</div>
                      <div className="text-slate-600 dark:text-slate-400">Brand + 1-2 Search campaigns</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-emerald-600 mb-1">Medium Budget ($2K-$10K)</div>
                      <div className="text-slate-600 dark:text-slate-400">Add PMax + Hero campaigns</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-emerald-600 mb-1">Large Budget ($10K+)</div>
                      <div className="text-slate-600 dark:text-slate-400">Full 9-step framework</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content - Structure Steps */}
      <main className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            {Object.entries(structureFramework).map(([key, step]) => {
              const Icon = step.icon;
              return (
                <section key={key} id={step.id} className="scroll-mt-24">
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg`}>
                        {step.number}
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{step.title}</h2>
                        <p className="text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {step.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Card key={item.id} className="border-border/50 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white`}>
                                  <ItemIcon className="h-5 w-5" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{item.title}</CardTitle>
                                  <CardDescription className="mt-2 text-sm leading-relaxed">
                                    {item.description}
                                  </CardDescription>
                                </div>
                              </div>
                              <Checkbox
                                checked={completedItems[item.id] || false}
                                onCheckedChange={() => toggleCompletion(item.id)}
                                className="mt-1"
                              />
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">{/* Add hover effects */}
                            <Accordion type="single" collapsible>
                              <AccordionItem value="checkpoints" className="border-b-0">
                                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-3 group-hover:text-emerald-600 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    <span>Implementation Checkpoints ({item.checkpoints.length})</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2">
                                  <div className="space-y-3">
                                    {item.checkpoints.map((checkpoint, index) => (
                                      <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
                                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-foreground leading-relaxed">{checkpoint}</span>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>

                              <AccordionItem value="tips" className="border-b-0">
                                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-3 group-hover:text-emerald-600 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-emerald-400" />
                                    <span>Pro Tips ({item.tips.length})</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2">
                                  <div className="space-y-3">
                                    {item.tips.map((tip, index) => (
                                      <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
                                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-foreground leading-relaxed">{tip}</span>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>

                              <AccordionItem value="redflags" className="border-b-0">
                                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-3 group-hover:text-emerald-600 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <span>Red Flags to Avoid ({item.redFlags.length})</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2">
                                  <div className="space-y-3">
                                    {item.redFlags.map((redFlag, index) => (
                                      <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
                                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-foreground leading-relaxed">{redFlag}</span>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>

      {/* Final Checklist & Red Flags Summary */}
      <section id="campaign-checklist" className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Campaign Structure Checklist
              </h2>
              <p className="text-lg text-muted-foreground">
                Essential checkpoints before and after campaign launch
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-5 w-5" />
                    Before Launch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-emerald-200">
                  {[
                    'One goal per campaign',
                    'Clear campaign naming convention',
                    'Organized by category, location, funnel, or goal',
                    'Brand and non-brand separated',
                    'Negative keywords set up',
                    'Initial budgets aligned with goals',
                    'STAG architecture with 3–5 keywords per theme',
                    'Hagakure-style consolidation for volume',
                    'Portfolio bidding strategies implemented',
                    'Campaign-level negatives for PMax'
                  ].map((item, index) => (
                     <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                       <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                       <span className="text-sm text-foreground">{item}</span>
                     </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-950/30 to-emerald-900/30 border-emerald-800/40 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-5 w-5" />
                    After Launch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-emerald-200">
                  {[
                    'Weekly review of performance',
                    'Move best performers into hero campaigns',
                    'Monitor search term reports and add negatives',
                    'Adjust budgets incrementally',
                    'Refresh ad copy and creatives regularly',
                    'Apply attribution and measurement frameworks',
                    'Run incrementality testing for true impact',
                    'Document changes and performance impact',
                    'Optimize custom labels and segmentation',
                    'Review and refine campaign structure monthly'
                  ].map((item, index) => (
                     <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                       <TrendingUp className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                       <span className="text-sm text-foreground">{item}</span>
                     </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-red-950/40 to-red-900/40 border-red-800/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Red Flags to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Mixing unrelated products/services in one campaign',
                    'Too many tiny campaigns with low data',
                    'Not separating brand vs non-brand traffic',
                    'Overlapping campaigns without negatives',
                    'Combining Search + Display in one campaign',
                    'Relying only on automation without monitoring',
                    'Outdated match type strategies',
                    'Running PMax without negatives or acquisition goals',
                    'Ignoring advanced measurement frameworks',
                    'Unclear naming or documentation'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border border-gray-200 dark:border-gray-700">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Real-World Examples */}
      <section className="py-16 bg-gradient-to-br from-emerald-50/30 to-slate-50/30 dark:from-emerald-950/20 dark:to-slate-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-4">
                Real-World Campaign Structure Examples
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                See how the 9-step framework applies to different business types with complete campaign structures, budgets, and optimization strategies.
              </p>
            </div>

            <div className="grid gap-8">
              {/* Example 1: Jewelry Brand */}
              <Card className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
                    <Award className="w-7 h-7" />
                    Example 1: Jewelry Brand (Lab-Grown Diamonds)
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Mid-sized online store selling lab-grown diamond jewelry • Monthly Budget: $20,000 • Goal: Drive sales while building awareness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-4">
                    <AccordionItem value="jewelry-brand-search">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign 1: Brand Search - $4,000/month
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Ad Groups (STAG Structure)</h5>
                            <div className="space-y-2 text-sm">
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Brand Rings:</strong> ["lab grown diamond rings"] (exact), ["eco diamond engagement rings"] (phrase), ["sustainable rings buy"] (broad)
                              </div>
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Brand Necklaces:</strong> ["lab grown diamond necklaces"] (exact), ["eco friendly pendants"] (phrase), ["diamond necklace sustainable"] (broad)
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Strategy & Optimization</h5>
                            <ul className="space-y-1 text-sm">
                              <li>• Maximize Conversions with 400% tROAS</li>
                              <li>• 2-3 RSAs per group with brand messaging</li>
                              <li>• Negative keywords: "natural diamonds", "mined jewelry"</li>
                              <li>• Weekly search term reviews</li>
                              <li>• Custom labels for high-value products</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="jewelry-non-brand">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign 2: Non-Brand Search - $5,000/month (Alpha/Beta Structure)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Alpha Campaign (Proven Keywords)</h5>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-sm">
                              <strong>Engagement Rings Non-Brand:</strong> ["engagement rings affordable"] (exact), ["sustainable diamond rings"] (phrase)
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Beta Campaign (Discovery)</h5>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-sm">
                              <strong>Bracelets Discovery:</strong> ["tennis bracelets eco"] (broad), ["diamond bracelets buy"] (phrase)
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="jewelry-pmax">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign 3: Performance Max - $8,000/month
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Asset Groups</h5>
                            <div className="space-y-2 text-sm">
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Rings Collection:</strong> Product catalog images, videos, headlines for rings
                              </div>
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Necklaces & Bracelets:</strong> Consolidated for volume with diverse creative assets
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Optimization Strategy</h5>
                            <ul className="space-y-1 text-sm">
                              <li>• Audience signals: "Eco-Conscious Shoppers"</li>
                              <li>• Brand term exclusions to prevent cannibalization</li>
                              <li>• Maximize Conversion Value with tROAS</li>
                              <li>• Pull winners to hero Search campaigns</li>
                              <li>• Quarterly incrementality tests</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="jewelry-shopping">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign 4: Shopping - $3,000/month
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Structure</h5>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-sm">
                              Product feed segmented by category with one ad group per major category (e.g., "Diamond Rings Feed")
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Results</h5>
                            <ul className="space-y-1 text-sm">
                              <li>• Brand CTR {'>'} 15%</li>
                              <li>• Non-brand conversions {'>'} 20%</li>
                              <li>• PMax handles 40% of discovery traffic</li>
                              <li>• Portfolio bidding across groups</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Example 2: Law Firm */}
              <Card className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
                    <Building2 className="w-7 h-7" />
                    Example 2: Local Service (Law Firm)
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Multi-location law firm offering family, criminal, and personal injury services • Monthly Budget: $15,000 • Goal: Lead generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-4">
                    <AccordionItem value="law-structure">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign Structure by Location & Service
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid gap-4">
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                            <h5 className="font-semibold text-emerald-600 mb-2">Boston Campaigns</h5>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Brand Search - Boston:</strong> $2,000/month<br/>
                                STAG: "[firm name] family lawyer boston" (exact), 3-5 terms
                              </div>
                              <div>
                                <strong>Non-Brand Search - Boston:</strong> $3,000/month<br/>
                                "divorce lawyer boston" (phrase), "family attorney near me" (broad)
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                            <h5 className="font-semibold text-emerald-600 mb-2">Portland Campaigns</h5>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Brand Search - Portland:</strong> $2,000/month<br/>
                                Location-specific brand terms with geo-targeting
                              </div>
                              <div>
                                <strong>Non-Brand Search - Portland:</strong> $3,000/month<br/>
                                Similar structure to Boston with Portland geo-targeting
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                            <h5 className="font-semibold text-emerald-600 mb-2">Discovery & Hero Campaigns</h5>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Performance Max:</strong> $5,000/month<br/>
                                All services consolidated with local audience signals
                              </div>
                              <div>
                                <strong>Hero Campaign:</strong> $2,000/month<br/>
                                "Personal Injury Boston" if {'>'} 10x ROAS performance
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Example 3: Travel Agency */}
              <Card className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
                    <Route className="w-7 h-7" />
                    Example 3: Travel Agency (Historical Tours)
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Specialized WWII and D-Day tours in Europe • Monthly Budget: $10,000 • Goal: Bookings and awareness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-4">
                    <AccordionItem value="travel-brand-search">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign 1: Brand Search - $2,000/month
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Ad Groups (STAG Structure)</h5>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-sm">
                              <strong>Brand WWII Tours:</strong> ["[agency name] wwii tour"] (exact), ["[agency] d-day tours"] (exact), ["[brand] historical tours"] (phrase)
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Strategy & Optimization</h5>
                            <ul className="space-y-1 text-sm">
                              <li>• Maximize Conversions bidding strategy</li>
                              <li>• Location targeting: Europe and English-speaking countries</li>
                              <li>• Custom schedules for peak booking seasons</li>
                              <li>• Brand protection from competitor hijacking</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="travel-non-brand">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign 2: Non-Brand Search - $3,000/month (Alpha/Beta)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Alpha Campaign (High-Value Keywords)</h5>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-sm">
                              <strong>D-Day Tours Non-Brand:</strong> ["d day normandy tour"] (phrase), ["wwii battlefield tours"] (phrase), ["omaha beach tours"] (exact), ["normandy historical tours"] (phrase)
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Beta Campaign (Discovery)</h5>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-sm">
                              <strong>Historical Tours Discovery:</strong> ["european war tours"] (broad), ["military history trips"] (broad), ["battle site visits"] (phrase)
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="travel-pmax">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign 3: Performance Max - $3,000/month
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Asset Groups</h5>
                            <div className="space-y-2 text-sm">
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Historical Tours:</strong> High-quality videos of battlefields, detailed itineraries, testimonials, historical photos
                              </div>
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>DSA Integration:</strong> Dynamic ads covering tour packages, seasonal offerings, group bookings
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Optimization Strategy</h5>
                            <ul className="space-y-1 text-sm">
                              <li>• Audience signals: History enthusiasts, veterans, educators</li>
                              <li>• Seasonal budget adjustments for D-Day anniversary</li>
                              <li>• Location exclusions for non-travel-feasible areas</li>
                              <li>• Custom labels for "High-Intent-Tour" tracking</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="travel-video">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign 4: Video (Awareness) - $1,000/month
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Ad Groups by Funnel</h5>
                            <div className="space-y-2 text-sm">
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Top-Funnel WWII Awareness:</strong> Broad reach, educational content, documentary-style videos
                              </div>
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Mid-Funnel Consideration:</strong> Tour highlights, customer testimonials, itinerary previews
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Strategy</h5>
                            <ul className="space-y-1 text-sm">
                              <li>• Maximize Views bidding strategy</li>
                              <li>• YouTube Shorts and standard video formats</li>
                              <li>• Remarketing to website visitors</li>
                              <li>• A/B testing of different tour itineraries</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="travel-hero">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Hero Campaign: "Top D-Day Tours" (If High Performer)
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                          <h5 className="font-semibold text-emerald-600 mb-2">Graduation Criteria & Testing</h5>
                          <ul className="space-y-1 text-sm">
                            <li>• Promote if D-Day tours achieve 200%+ ROAS consistently</li>
                            <li>• A/B test different itinerary formats in ad copy</li>
                            <li>• Custom labels for "High-Intent-Tour" segmentation</li>
                            <li>• Weekly performance reviews during peak seasons</li>
                            <li>• Portfolio bidding across seasonal campaigns</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Example 4: Rental Marketplace */}
              <Card className="border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
                    <Building2 className="w-7 h-7" />
                    Example 4: Rental Marketplace (Apartments)
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Platform for apartment rentals in major cities • Monthly Budget: $25,000 • Goal: Lead generation (inquiries)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-4">
                    <AccordionItem value="rental-brand-search">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign 1: Brand Search (Per City) - $8,000/month total
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">City-Specific Campaigns</h5>
                            <div className="space-y-2 text-sm">
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>San Diego Brand:</strong> ["[platform name] apartments san diego"] (exact), ["[brand] rentals san diego"] (phrase)
                              </div>
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Austin Brand:</strong> ["[platform name] austin"] (exact), ["[brand] apartments austin"] (phrase)
                              </div>
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Denver Brand:</strong> Similar structure with Denver geo-targeting
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Strategy</h5>
                            <ul className="space-y-1 text-sm">
                              <li>• City-specific geo-targeting and radius exclusions</li>
                              <li>• Enhanced CPC bidding with conversion tracking</li>
                              <li>• Location-specific ad copy and extensions</li>
                              <li>• Brand protection monitoring</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rental-non-brand">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign 2: Non-Brand Search by Price Tier - $10,000/month
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Luxury Tier Campaigns</h5>
                            <div className="space-y-2 text-sm">
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Luxury Apartments San Diego:</strong> ["luxury apartments san diego"] (phrase), ["high end rentals san diego"] (phrase), ["premium apartments downtown"] (broad)
                              </div>
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Budget Rentals Austin:</strong> ["affordable apartments austin"] (phrase), ["cheap rentals austin"] (exact), ["budget housing austin"] (phrase)
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Mid-Tier & Student Housing</h5>
                            <div className="space-y-2 text-sm">
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Mid-Range Apartments:</strong> ["apartments for rent [city]"] (phrase), ["2 bedroom apartments [city]"] (exact)
                              </div>
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Student Housing:</strong> ["student apartments [city]"] (phrase), ["university housing [city]"] (phrase)
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rental-shopping">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign 3: Shopping Campaigns - $4,000/month
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Feed Organization</h5>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-sm">
                              <strong>Property Type Feeds:</strong> Studio apartments, 1BR, 2BR, 3BR+ organized by location and amenities in Merchant Center
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Campaign Structure</h5>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-sm">
                              <strong>Ad Groups:</strong> "Studio Apartments Feed", "Luxury Properties Feed", "Student Housing Feed" with priority bidding
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rental-pmax">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Campaign 4: Performance Max - $5,000/month
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Asset Groups by Tier</h5>
                            <div className="space-y-2 text-sm">
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Luxury Tier:</strong> High-quality apartment photos, virtual tours, amenity videos, neighborhood highlights
                              </div>
                              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                                <strong>Budget Tier:</strong> Value-focused imagery, affordability messaging, student lifestyle content
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Discovery Strategy</h5>
                            <ul className="space-y-1 text-sm">
                              <li>• Audience signals: Recent movers, young professionals, students</li>
                              <li>• Location targeting with radius bidding adjustments</li>
                              <li>• Seasonal campaigns for academic calendar</li>
                              <li>• Cross-channel discovery across YouTube, Gmail, Discovery</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="rental-hero">
                      <AccordionTrigger className="text-left font-semibold text-emerald-700 dark:text-emerald-300">
                        Hero Campaign: "Downtown Rentals" - $3,000/month
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">High-ROAS Focus Areas</h5>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg text-sm">
                              Downtown districts with proven 300%+ ROAS: Financial districts, tech corridors, university areas with dedicated campaigns
                            </div>
                          </div>
                          <div>
                            <h5 className="font-semibold text-emerald-600 mb-2">Portfolio Strategy</h5>
                            <ul className="space-y-1 text-sm">
                              <li>• Portfolio bidding strategy across all city campaigns</li>
                              <li>• Incrementality testing for budget optimization</li>
                              <li>• Weekly performance reviews by location</li>
                              <li>• Cross-city learning and bid adjustments</li>
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>


          </div>
        </div>
      </section>

      {/* Final Word */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-background border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">Key Takeaways</h2>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-left space-y-4">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      Campaign Structure Principles
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Start simple if your account is new, expand as data grows</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Always separate brand vs non-brand campaigns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Highlight top performers in dedicated campaigns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Test systematically and document changes</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="text-left space-y-4">
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-emerald-500" />
                      2025 Success Factors
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Provide sufficient data volume for AI optimization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Use STAG architecture with Hagakure consolidation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Leverage custom labels and query sculpting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Implement modern Performance Max practices</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-foreground text-center font-medium">
                    With a solid structure in place, you'll give Google the clean signals it needs to optimize effectively, 
                    while retaining control over budget and strategy.
                  </p>
                </div>
                
                <Button 
                  size="lg"
                  onClick={() => navigate('/contact')}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white px-8 py-3 transition-all duration-300 hover:scale-105"
                >
                  Get Professional Campaign Structure Audit
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Glossary Section */}
      <section id="campaign-structure-glossary" className="py-20 bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Campaign Structure Glossary
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Essential terms and definitions for mastering Google Ads campaign structure
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6">
              
              {/* Core Campaign Structure Terms */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Core Campaign Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">STAG</h4>
                      <p className="text-sm text-muted-foreground">Single Theme Ad Groups - modern alternative to SKAGs that groups 3-5 semantically related keywords for better data volume.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">SKAG</h4>
                      <p className="text-sm text-muted-foreground">Single Keyword Ad Groups - outdated method that creates one ad group per keyword, often limiting data volume for optimization.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Types */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Campaign Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-1 gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">DSA (Dynamic Search Ads)</h4>
                      <p className="text-sm text-muted-foreground">Automated campaign type that uses your website content to target relevant searches and automatically generate ad headlines.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Strategies */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Advanced Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Hero Campaigns</h4>
                      <p className="text-sm text-muted-foreground mb-3">Dedicated campaigns for top-performing products or keywords with proven high ROAS. Usually receive 70% of budget allocation.</p>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border-l-4 border-emerald-500">
                        <p className="text-xs text-muted-foreground"><strong>Example:</strong> If "running shoes" generates 400% ROAS, create a dedicated "Hero - Running Shoes" campaign with higher budget and aggressive bidding strategies.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Alpha/Beta Structure</h4>
                      <p className="text-sm text-muted-foreground mb-3">Campaign organization where Alpha campaigns contain proven performers and Beta campaigns test new keywords/products.</p>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border-l-4 border-emerald-500">
                        <p className="text-xs text-muted-foreground"><strong>Example:</strong> "Alpha - Proven Keywords" gets 80% budget with exact match keywords that convert. "Beta - Testing Keywords" gets 20% budget to discover new winners.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Query Sculpting</h4>
                      <p className="text-sm text-muted-foreground mb-3">Using negative keywords and campaign priorities to control which campaign serves which search query, preventing internal competition.</p>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border-l-4 border-emerald-500">
                        <p className="text-xs text-muted-foreground"><strong>Example:</strong> Add "nike" as negative keyword in generic "running shoes" campaign so branded searches only trigger your "Nike Shoes" campaign.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Hagakure Method</h4>
                      <p className="text-sm text-muted-foreground mb-3">Google's recommendation to consolidate ad groups to achieve 3,000+ impressions per week for better automated bidding performance.</p>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border-l-4 border-emerald-500">
                        <p className="text-xs text-muted-foreground"><strong>Example:</strong> Instead of 10 ad groups with 300 impressions each, create 3 ad groups with 1,000+ impressions each by combining related themes like "men's running shoes" + "men's athletic shoes" + "men's jogging shoes".</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Portfolio Bidding</h4>
                      <p className="text-sm text-muted-foreground mb-3">Advanced bidding strategy that optimizes across multiple campaigns sharing the same conversion goal and target ROAS or CPA.</p>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border-l-4 border-emerald-500">
                        <p className="text-xs text-muted-foreground"><strong>Example:</strong> Group "Search - Shoes", "Shopping - Shoes", and "PMax - Shoes" campaigns under one portfolio bid strategy with 300% target ROAS, allowing Google to shift budget to the best-performing campaign automatically.</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Campaign Priority</h4>
                      <p className="text-sm text-muted-foreground mb-3">Shopping campaign setting (High/Medium/Low) that determines which campaign serves ads when multiple campaigns are eligible for the same search.</p>
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border-l-4 border-emerald-500">
                        <p className="text-xs text-muted-foreground"><strong>Example:</strong> Set "Hero Products" campaign to High priority, "Testing Products" to Medium, and "Catch-All Products" to Low priority to control traffic flow.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800">
                <CardHeader>
                  <CardTitle className="text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Key Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">ROAS</h4>
                      <p className="text-sm text-muted-foreground">Return on Ad Spend - revenue generated for every dollar spent on ads. Heroes typically achieve 300%+ ROAS.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Quality Score</h4>
                      <p className="text-sm text-muted-foreground">Google's rating (1-10) of the relevance and quality of your keywords, ads, and landing pages. Higher scores reduce costs.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Impression Share</h4>
                      <p className="text-sm text-muted-foreground">Percentage of impressions your ads receive compared to total available impressions for your targeted keywords.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Search Lost IS (Budget)</h4>
                      <p className="text-sm text-muted-foreground">Percentage of impressions lost due to insufficient budget. Indicates opportunity to increase budget for more traffic.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}