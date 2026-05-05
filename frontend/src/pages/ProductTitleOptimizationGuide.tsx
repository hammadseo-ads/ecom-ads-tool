import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import SEO from '@/components/SEO';
import  {Button}  from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ArrowLeft, 
  Edit3,
  Target,
  CheckCircle,
  TrendingUp,
  Search,
//   Zap,
//   Brain,
  Eye,
  Award,
  AlertTriangle,
  Lightbulb,
  FileText,
  Star,
  ArrowRight,
  Layers,
  BarChart3,
  Settings,
  Globe,
  Shield,
  Copy,
  Sparkles,
  Play
} from 'lucide-react';

function ProductTitleOptimizationGuide() {
  const navigate = useNavigate();
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const toggleCompletion = (itemId: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const scrollToPhase = (phaseId: string) => {
    const element = document.getElementById(phaseId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const copyPrompt = () => {
    const prompt = `You are tasked with reviewing product titles for quality and correctness. I will attach a list of product titles in plain text below. Your job is not to rewrite or correct the titles but only to identify which titles are wrong, incomplete, or poorly structured based on the rules provided.

Instructions

Read through all attached titles carefully.

Identify only the wrong titles. Do not rewrite or attempt to correct them. Present them exactly as they appear in the input.

A title should be considered wrong if it meets any of the following conditions:

The brand name is missing or not placed at the end of the title.

The title is incomplete, unclear, or lacks important descriptive attributes (such as size, color, type, or variant when these are relevant).

The title is unusually short, making it vague or unhelpful for understanding the product.

The wording is disorganized, redundant, or does not follow a consistent structure.

Output Format
Step 1: Main Table of Wrong Titles

Create a table with two columns:

Wrong Title (copy the exact title as it appears in the input)

Reason (explain briefly why it is wrong, based on the rules above)

Only unique wrong titles should be included here.

Step 2: Separate Tables for Identical / Near-Duplicate Wrong Titles

If multiple titles are identical or nearly identical (repetitions with slight variations), do not list them again in the main table.

Instead, create a separate table for each group of duplicates.

Format:

Column 1: Repeated / Identical Titles (list them all exactly as they appear).

Column 2: Reason (explain once why these are wrong).

Step 3: Example of a Correct Title

After the tables, include a short section titled "Example of a Correct Title".

Provide only one generic example that demonstrates the proper format.

Do not tie it to the input list.

Example should show brand at the end, clear descriptive attributes, and organized wording.

Important Notes

Do not rewrite or improve the wrong titles in the tables.

Do not include correct titles from the input in your output.

Only show wrong titles and then one standalone correct example at the end.

Input Titles

[Paste all the titles here in plain text]`;

    navigator.clipboard.writeText(prompt).then(() => {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    });
  };

  // Sticky header scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const optimizationFramework = {
    phase1: {
      id: 'phase1',
      number: '01',
      title: 'Understanding Title Types & Purpose',
      icon: Globe,
      description: 'Master the difference between on-page and feed titles for strategic optimization',
      color: 'from-black via-emerald-700 to-emerald-500',
      bgPattern: 'floating-orbs',
      items: [
        { 
          id: 'on-page-titles',
          title: 'On-Page Titles (Website Display)',
          icon: Eye,
          description: 'Customer-facing titles optimized for readability and brand experience',
          checkpoints: [
            'Keep concise and aesthetically pleasing for user experience (30-60 characters)',
            'Use clean, readable formatting that matches your brand style',
            'Focus on clarity and customer-friendly language over keyword density',
            'Include primary product benefit or key differentiator',
            'Ensure titles work well in your website\'s design and layout',
            'Make them compelling enough to encourage clicks and engagement',
            'Test different emotional triggers and benefit-focused language'
          ],
          tips: [
            'Example: "Wireless Charging Pad" instead of "Qi-Enabled 10W Fast Wireless Charger Pad Black"',
            'Prioritize user experience over SEO - customers see these first',
            'Use emotional triggers: "Cozy Cotton Blanket" vs "Cotton Blanket 50x60"'
          ],
          redFlags: [
            'Using identical titles for website and feed without optimization',
            'Titles that don\'t match your brand voice or aesthetic',
            'No testing or optimization of on-page titles for engagement',
            'Keyword-stuffed titles that feel spammy to real customers'
          ]
        },
        { 
          id: 'feed-titles',
          title: 'Feed Titles (Ads & Shopping)',
          icon: Settings,
          description: 'Algorithm-optimized titles packed with searchable attributes and keywords',
          checkpoints: [
            'Include comprehensive product details (70-150 characters)',
            'Add brand, product type, model, size, color, material, key features',
            'Structure for Google\'s algorithm matching and search relevance',
            'Include technical specifications that customers search for',
            'Use separators (-, |, •) to organize information clearly',
            'Research competitor titles in Google Shopping for opportunities',
            'Update based on search term report insights from campaigns'
          ],
          tips: [
            'Example: "Apple iPhone 15 Pro Max 256GB Titanium Blue Unlocked Smartphone | A17 Pro Chip"',
            'Use the full character limit when beneficial for keyword coverage',
            'Include model numbers for electronics, automotive, technical products',
            'Add seasonal keywords during relevant periods',
            'Study search term reports weekly for optimization insights'
          ],
          redFlags: [
            'Feed titles too short, missing keyword opportunities',
            'No differentiation from competitors in Google Shopping results',
            'Missing critical attributes that customers actively search for',
            'No updates based on actual search performance data'
          ]
        }
      ]
    },
    phase2: {
      id: 'phase2',
      number: '02',
      title: 'Core Structure & Keyword Strategy',
      icon: Target,
      description: 'Build titles with proven formulas and strategic keyword placement',
      color: 'from-emerald-900 via-emerald-600 to-emerald-400',
      bgPattern: 'grid-pattern',
      items: [
        {
          id: 'title-structure',
          title: 'Proven Title Formulas by Category',
          icon: Layers,
          description: 'Industry-specific structures that maximize both readability and searchability',
          checkpoints: [
            'Apply category-specific formulas consistently across product lines',
            'Front-load the most important information customers look for first',
            'Include essential attributes: brand, type, model, size, color, material',
            'Maintain proper capitalization and professional formatting',
            'Use unique identifiers for variants to avoid confusion',
            'Structure information by customer priority and search importance',
            'Balance keyword density with natural readability'
          ],
          tips: [
            'Apparel: "Brand + Gender + Product + Size/Color + Style | Material"',
            'Electronics: "Brand + Product + Model + Specifications + Color | Key Feature"',
            'Furniture: "Brand + Product + Size/Material + Style | Key Features"',
            'Consumables: "Brand + Product + Quantity/Size + Key Benefit + Format"',
            'Use Title Case for professional appearance across all platforms',
            'Place brand first only if well-known, otherwise lead with product type'
          ],
          redFlags: [
            'No consistent formula across similar products',
            'Most important information buried at the end',
            'Poor capitalization or formatting inconsistencies',
            'Formulas that don\'t match customer search patterns'
          ]
        },
        {
          id: 'keyword-research',
          title: 'Strategic Keyword Research & Integration',
          icon: Search,
          description: 'Identify and incorporate high-impact keywords that match real customer searches',
          checkpoints: [
            'Research actual search terms using Google Ads Keyword Planner',
            'Use customer language rather than internal product names or jargon',
            'Include both broad category terms and specific descriptors',
            'Add model numbers when your target audience searches with codes',
            'Integrate seasonal or trending keywords during peak periods',
            'Analyze competitor keyword strategies for market insights',
            'Include long-tail variations for lower competition opportunities'
          ],
          tips: [
            'Use "t-shirt" not "short-sleeve garment" - match customer language',
            'Include benefit keywords: "waterproof," "organic," "wireless," "fast"',
            'Research search term reports monthly for new opportunities',
            'Include both singular/plural when space allows',
            'Add location-specific terms for local market targeting',
            'Use tools like Answer The Public for long-tail keyword ideas'
          ],
          redFlags: [
            'Using internal product names customers don\'t search for',
            'Missing obvious keywords competitors rank well for',
            'No keyword research in 6+ months',
            'Keyword stuffing that destroys readability'
          ]
        },
        {
          id: 'differentiation',
          title: 'Highlighting Unique Value Propositions',
          icon: Star,
          description: 'Showcase what makes your products stand out from competitors',
          checkpoints: [
            'Identify one primary unique selling point per title',
            'Include quality indicators: "handmade," "organic," "premium"',
            'Add warranty or guarantee information when competitive',
            'Highlight certifications customers value (USDA Organic, Energy Star)',
            'Mention exclusive features competitors don\'t offer',
            'Include size/quantity advantages when they provide value',
            'Add convenience benefits: "ready-to-use," "tool-free assembly"'
          ],
          tips: [
            'Focus on benefits customers care most about in your category',
            'Test different USPs to identify what drives higher CTR',
            'Use specific certifications rather than vague quality claims',
            'Highlight compatibility advantages for technical products',
            'Include exclusivity terms: "limited edition," "exclusive design"',
            'Mention shipping or return advantages when competitive'
          ],
          redFlags: [
            'Generic titles with no differentiating factors',
            'USPs that can\'t be supported with evidence',
            'Missing benefits customers specifically search for',
            'Too many USPs making titles confusing'
          ]
        }
      ]
    },
    phase3: {
      id: 'phase3',
      number: '03',
      title: 'Platform Compliance & Quality Control',
      icon: CheckCircle,
      description: 'Ensure titles meet platform requirements while maintaining high quality standards',
      color: 'from-emerald-800 via-emerald-500 to-emerald-300',
      bgPattern: 'diagonal-lines',
      items: [
        {
          id: 'compliance-rules',
          title: 'Platform Policy Compliance',
          icon: Shield,
          description: 'Avoid disapprovals and policy violations that hurt performance',
          checkpoints: [
            'Remove promotional language: "Free Shipping," "50% OFF," "Sale"',
            'Eliminate excessive capitalization and special characters',
            'Ensure no misleading claims or clickbait terminology',
            'Verify titles accurately represent the actual product',
            'Remove pricing information from title text',
            'Avoid keyword stuffing or repetitive terms',
            'Check compliance with latest platform policy updates'
          ],
          tips: [
            'Google Ads automatically disapproves promotional language',
            'Use standard punctuation only - avoid excessive symbols',
            'Keep promotional content in descriptions, not titles',
            'Focus on factual product information over marketing claims',
            'Review platform policies quarterly for updates',
            'Set up automated alerts for policy violations'
          ],
          redFlags: [
            'Recent disapprovals due to promotional language',
            'ALL CAPS or excessive punctuation usage',
            'Misleading terms that don\'t match product reality',
            'No regular policy compliance reviews'
          ]
        },
        {
          id: 'accuracy-check',
          title: 'Title Accuracy & Landing Page Alignment',
          icon: CheckCircle,
          description: 'Ensure perfect consistency between titles and actual product offerings',
          checkpoints: [
            'Verify feed titles match product details on landing pages',
            'Confirm all mentioned attributes are actually available',
            'Check that variants have distinct, accurate titles',
            'Ensure color, size, material descriptions are precise',
            'Validate brand names and model numbers are correct',
            'Cross-reference with actual inventory and availability',
            'Test complete customer journey for consistency'
          ],
          tips: [
            'Set up automated checks for title-landing page consistency',
            'Review titles when product specs or availability changes',
            'Use product data feeds for automatic synchronization',
            'Implement QC processes before launching new titles',
            'Regular audits against product photos and descriptions'
          ],
          redFlags: [
            'Titles don\'t match actual product on landing pages',
            'Variants sharing identical titles despite differences',
            'Outdated titles referencing discontinued features',
            'No update process when products change'
          ]
        }
      ]
    },
    phase4: {
      id: 'phase4',
      number: '04',
      title: 'Testing & Advanced Optimization',
      icon: TrendingUp,
      description: 'Implement data-driven optimization for continuous performance improvement',
      color: 'from-emerald-700 via-emerald-400 to-emerald-200',
      bgPattern: 'dots-pattern',
      items: [
        {
          id: 'testing-optimization',
          title: 'Performance Testing & Continuous Optimization',
          icon: BarChart3,
          description: 'Data-driven testing and optimization for maximum performance',
          checkpoints: [
            'Set up controlled A/B tests for title formats and structures',
            'Monitor CTR, conversion rates, and overall ROAS impact',
            'Test brand positioning (front vs back) by category',
            'Analyze search term reports for optimization opportunities',
            'Use Google Ads scripts for automated optimization rules',
            'Monitor competitor title changes for market insights',
            'Build reusable title templates for scalable optimization'
          ],
          tips: [
            'Test only one variable at a time for clear results',
            'Allow 2-4 weeks minimum for statistical significance', 
            'Track beyond CTR - monitor full funnel impact',
            'Document winning patterns for future product launches',
            'Set up alerts when performance drops below thresholds'
          ],
          redFlags: [
            'No title testing in past 6 months',
            'Testing multiple variables simultaneously',
            'Reactive optimization only when problems occur',
            'No automation for routine optimization tasks'
          ]
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <PublicHeader />
      <SEO
        title="Product Title Optimization for Google Shopping and PMax"
        description="Why product titles drive PMax targeting — and how to rewrite them so your ads show up on the searches that actually convert."
        ogType="article"
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-700 text-white py-24">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-6 text-emerald-200 hover:text-white hover:bg-emerald-800/50 transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guides
            </Button>
            
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 px-4 py-2 text-sm font-medium">
                <Edit3 className="mr-2 h-4 w-4" />
                Optimization Guide
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent leading-tight">
              Product Title Optimization Guide
            </h1>
            
            <p className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Master the art of writing compelling product titles that drive clicks, conversions, and sales across all platforms
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-emerald-200">
              <div className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                <span>4-Phase Framework</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                <span>Actionable Checklists</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                <span>Performance Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                          Master Product Title Optimization
                        </h3>
                        <p className="text-white/90 text-sm">
                          Watch this comprehensive guide to creating high-performing product titles for maximum visibility and conversions
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
                      src="https://www.youtube.com/embed/eNN683cA53U?si=Bo8XAeDF4I4SGDk_&autoplay=1"
                      title="Product Title Optimization Guide"
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
      </section>

      {/* Table of Contents */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
            <p className="text-lg text-gray-600">Complete roadmap to title optimization mastery</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.values(optimizationFramework).map((phase) => (
              <Card 
                key={phase.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500"
                onClick={() => scrollToPhase(phase.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                      Phase {phase.number}
                    </Badge>
                    <phase.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg">{phase.title}</CardTitle>
                  <CardDescription>{phase.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Is Title Optimization + Why It Matters */}
      <section className="bg-gradient-to-r from-emerald-50 to-green-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Is Title Optimization & Why It Matters</h2>
            <p className="text-lg text-gray-600">The foundation of successful product marketing</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-emerald-600" />
                  What It Is
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-700">
                  <li>• <strong>Strategic crafting</strong> of product titles to maximize visibility and conversions</li>
                  <li>• <strong>Platform-specific optimization</strong> for different channels (website, Google Ads, Amazon)</li>
                  <li>• <strong>Balancing SEO keywords</strong> with customer-friendly language</li>
                  <li>• <strong>Continuous testing</strong> and refinement based on performance data</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Why It Matters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-700">
                  <li>• <span className="font-semibold text-emerald-600">30-50% increase</span> in click-through rates</li>
                  <li>• <span className="font-semibold text-emerald-600">15-25% boost</span> in conversion rates</li>
                  <li>• <span className="font-semibold text-emerald-600">Lower CPCs</span> due to improved relevance scores</li>
                  <li>• <span className="font-semibold text-emerald-600">Better organic rankings</span> in search results</li>
                  <li>• <span className="font-semibold text-emerald-600">Enhanced Google Ads relevancy</span> for better campaign performance</li>
                  <li>• <span className="font-semibold text-emerald-600">Clear product understanding</span> by Google's algorithm for better variant distinction</li>
                  <li>• <span className="font-semibold text-emerald-600">Improved feed optimization</span> showing products for relevant keywords</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-800">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Critical Warning: The Title Mismatch Problem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                <span className="font-semibold">85% of businesses</span> make this costly mistake: using identical titles for their website and advertising feeds. This creates a massive missed opportunity because:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Website Titles Should Be:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Clean and aesthetically pleasing</li>
                    <li>• Customer-friendly language</li>
                    <li>• Shorter and more readable</li>
                    <li>• Brand-aligned messaging</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Feed Titles Should Be:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Keyword-rich and detailed</li>
                    <li>• Algorithm-optimized</li>
                    <li>• Longer with full specifications</li>
                    <li>• Search-term focused</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* AI Title Review Prompt Section */}
      <section className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Title Quality Check</h2>
            <p className="text-lg text-gray-600">Use this AI prompt to instantly identify problematic titles in your catalog</p>
          </div>
          
          <Card className="border-l-4 border-l-emerald-500 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-emerald-600" />
                  AI Title Analysis Prompt
                </div>
                <Button
                  onClick={copyPrompt}
                  variant="outline"
                  size="sm"
                  className={`${copiedPrompt ? 'bg-green-50 border-green-200 text-green-700' : 'hover:bg-emerald-50'}`}
                >
                  {copiedPrompt ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Prompt
                    </>
                  )}
                </Button>
              </CardTitle>
              <CardDescription>
                Copy this prompt and paste it into ChatGPT, Claude, or any AI tool along with your product titles to get instant quality analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700 max-h-96 overflow-y-auto">
                <p className="font-semibold mb-2">Prompt to copy:</p>
                <div className="font-mono text-xs leading-relaxed">
                  You are tasked with reviewing product titles for quality and correctness. I will attach a list of product titles in plain text below. Your job is not to rewrite or correct the titles but only to identify which titles are wrong, incomplete, or poorly structured based on the rules provided.
                  <br /><br />
                  <strong>Instructions</strong>
                  <br /><br />
                  Read through all attached titles carefully.
                  <br /><br />
                  Identify only the wrong titles. Do not rewrite or attempt to correct them. Present them exactly as they appear in the input.
                  <br /><br />
                  <strong>A title should be considered wrong if it meets any of the following conditions:</strong>
                  <br /><br />
                  The brand name is missing or not placed at the end of the title.
                  <br /><br />
                  The title is incomplete, unclear, or lacks important descriptive attributes (such as size, color, type, or variant when these are relevant).
                  <br /><br />
                  The title is unusually short, making it vague or unhelpful for understanding the product.
                  <br /><br />
                  The wording is disorganized, redundant, or does not follow a consistent structure.
                  <br /><br />
                  <strong>Output Format</strong>
                  <br />
                  <strong>Step 1: Main Table of Wrong Titles</strong>
                  <br /><br />
                  Create a table with two columns:
                  <br /><br />
                  Wrong Title (copy the exact title as it appears in the input)
                  <br /><br />
                  Reason (explain briefly why it is wrong, based on the rules above)
                  <br /><br />
                  Only unique wrong titles should be included here.
                  <br /><br />
                  <strong>Step 2: Separate Tables for Identical / Near-Duplicate Wrong Titles</strong>
                  <br /><br />
                  If multiple titles are identical or nearly identical (repetitions with slight variations), do not list them again in the main table.
                  <br /><br />
                  Instead, create a separate table for each group of duplicates.
                  <br /><br />
                  Format:
                  <br /><br />
                  Column 1: Repeated / Identical Titles (list them all exactly as they appear).
                  <br /><br />
                  Column 2: Reason (explain once why these are wrong).
                  <br /><br />
                  <strong>Step 3: Example of a Correct Title</strong>
                  <br /><br />
                  After the tables, include a short section titled "Example of a Correct Title".
                  <br /><br />
                  Provide only one generic example that demonstrates the proper format.
                  <br /><br />
                  Do not tie it to the input list.
                  <br /><br />
                  Example should show brand at the end, clear descriptive attributes, and organized wording.
                  <br /><br />
                  <strong>Important Notes</strong>
                  <br /><br />
                  Do not rewrite or improve the wrong titles in the tables.
                  <br /><br />
                  Do not include correct titles from the input in your output.
                  <br /><br />
                  Only show wrong titles and then one standalone correct example at the end.
                  <br /><br />
                  <strong>Input Titles</strong>
                  <br /><br />
                  [Paste all the titles here in plain text]
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">How to use:</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm">
                  <li>Copy the prompt above using the "Copy Prompt" button</li>
                  <li>Open ChatGPT, Claude, or your preferred AI tool</li>
                  <li>Paste the prompt</li>
                  <li>Add your product titles at the bottom</li>
                  <li>Get instant analysis of problematic titles</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sticky Navigation */}
      <div className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center">
            <div className="flex gap-2 bg-white/90 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg border border-gray-200">
              {Object.values(optimizationFramework).map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => scrollToPhase(phase.id)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200"
                >
                  {phase.number}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Optimization Framework Phases */}
        {Object.values(optimizationFramework).map((phase) => (
          <section key={phase.id} id={phase.id} className="mb-20">
            {/* Phase Header */}
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${phase.color} text-white p-8 mb-8`}>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm">
                    <phase.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-2">
                      Phase {phase.number}
                    </Badge>
                    <h2 className="text-2xl font-bold">{phase.title}</h2>
                  </div>
                </div>
                <p className="text-emerald-100 text-lg leading-relaxed max-w-3xl">
                  {phase.description}
                </p>
              </div>
              
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                {phase.bgPattern === 'floating-orbs' && (
                  <div className="absolute inset-0">
                    <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full opacity-20"></div>
                    <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full opacity-15"></div>
                  </div>
                )}
                {phase.bgPattern === 'grid-pattern' && (
                  <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:20px_20px]"></div>
                )}
                {phase.bgPattern === 'diagonal-lines' && (
                  <div className="absolute inset-0 bg-diagonal-lines-white/[0.1]"></div>
                )}
                {phase.bgPattern === 'dots-pattern' && (
                  <div className="absolute inset-0 bg-dots-white/[0.1] bg-[length:16px_16px]"></div>
                )}
              </div>
            </div>

            {/* Phase Items */}
            <div className="space-y-6">
              {phase.items.map((item) => (
                <Card key={item.id} className="overflow-hidden border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-emerald-50/30">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full">
                        <item.icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 mb-2">{item.title}</CardTitle>
                        <CardDescription className="text-gray-600 leading-relaxed">
                          {item.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="implementation" className="border-0">
                        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium">Implementation Checklist</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <div className="space-y-3">
                            {item.checkpoints.map((checkpoint, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <Checkbox
                                  id={`${item.id}-checkpoint-${idx}`}
                                  checked={completedItems[`${item.id}-checkpoint-${idx}`] || false}
                                  onCheckedChange={() => toggleCompletion(`${item.id}-checkpoint-${idx}`)}
                                  className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                />
                                <label 
                                  htmlFor={`${item.id}-checkpoint-${idx}`}
                                  className={`text-sm cursor-pointer transition-colors leading-relaxed ${
                                    completedItems[`${item.id}-checkpoint-${idx}`] 
                                      ? 'line-through text-muted-foreground' 
                                      : 'text-foreground'
                                  }`}
                                >
                                  {checkpoint}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="tips" className="border-0">
                        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium">Pro Tips & Examples</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <div className="space-y-3">
                            {item.tips.map((tip, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="redflags" className="border-0">
                        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="font-medium">Red Flags to Avoid</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <div className="space-y-3">
                            {item.redFlags.map((redFlag, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-gray-700 leading-relaxed">{redFlag}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}

        {/* Final Checklist */}
        <section className="mt-16">
          <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-emerald-900 mb-2 flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Final Quality Checklist
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Before launching any title, ensure it passes these final checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-emerald-900 mb-3">Essential Elements</h4>
                  <div className="space-y-2">
                    {[
                      'Includes brand, product type, and key attributes',
                      'Uses customer search language, not jargon',
                      'Contains primary unique selling point',
                      'Follows platform compliance guidelines',
                      'Matches landing page content accurately',
                      'Optimized for target platform (website vs feed)',
                      'Proper capitalization and formatting'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Checkbox
                          id={`essential-${idx}`}
                          checked={completedItems[`essential-${idx}`] || false}
                          onCheckedChange={() => toggleCompletion(`essential-${idx}`)}
                          className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <label 
                          htmlFor={`essential-${idx}`}
                          className={`text-sm cursor-pointer transition-colors ${
                            completedItems[`essential-${idx}`] 
                              ? 'line-through text-muted-foreground' 
                              : 'text-foreground'
                          }`}
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-emerald-900 mb-3">Quality Standards</h4>
                  <div className="space-y-2">
                    {[
                      'Clear and easy to understand',
                      'No promotional language (if for feeds)',
                      'Appropriate length for platform',
                      'Free of typos and errors',
                      'Consistent formatting across variants',
                      'Complies with platform policies'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Checkbox
                          id={`quality-${idx}`}
                          checked={completedItems[`quality-${idx}`] || false}
                          onCheckedChange={() => toggleCompletion(`quality-${idx}`)}
                          className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <label 
                          htmlFor={`quality-${idx}`}
                          className={`text-sm cursor-pointer transition-colors ${
                            completedItems[`quality-${idx}`] 
                              ? 'line-through text-muted-foreground' 
                              : 'text-foreground'
                          }`}
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>


        {/* Call to Action */}
        <section className="mt-16">
          <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Award className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Transform Your Titles?</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Apply this framework to see immediate improvements in your click-through rates, conversion rates, and overall campaign performance. Start with your top-selling products for maximum impact.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg font-medium"
                >
                  Start Optimizing Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/google-ads-audit-guide')}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-8 py-3 text-lg font-medium"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Explore More Guides
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
export default ProductTitleOptimizationGuide;