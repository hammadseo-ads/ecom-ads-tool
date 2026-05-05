import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import SEO from '@/components/SEO';
import  {Button}  from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ArrowLeft, 
  Settings, 
  Globe, 
  BarChart3, 
  Target,
  CheckCircle,
  TrendingUp,
  Shield,
  Search,
  Users,
  Zap,
  Brain,
  Eye,
  Award,
  AlertTriangle,
  Lightbulb,
  FileText,
  // Image,
  Star,
  // DollarSign,
  ArrowRight,
  Layers,
  Filter,
  PieChart,
  Gauge
} from 'lucide-react';

export default function GoogleAdsAuditGuide() {
  const navigate = useNavigate();
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);

  const handleDashboardClick = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/signup', { state: { from: '/dashboard' } });
    }
  };

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

  // Sticky header scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const auditFramework = {
    phase1: {
      id: 'phase1',
      number: '01',
      title: 'Audit Conversion Tracking & Campaign Settings',
      icon: Settings,
      description: 'Ensure foundational settings are correct for accurate tracking and optimization',
      color: 'from-primary via-primary-emerald to-slate-900',
      bgPattern: 'floating-orbs',
      items: [
        { 
          id: 'verify-conversion-tracking',
          title: 'Verify Conversion Tracking Accuracy',
          icon: Shield,
          description: 'Ensure all key conversion actions (e.g. purchases, sign-ups) are being tracked accurately. Confirm that the conversion tags or GA4 events are firing and there\'s no double-counting of conversions. Without reliable conversion data, an audit won\'t be useful. Fix any tracking issues before drawing conclusions from performance data.',
          checkpoints: [
            'Confirm all key conversion actions (purchases, sign-ups, leads, form submissions) are firing correctly using Google Tag Assistant',
            'Verify GA4 Enhanced Ecommerce events perfectly match Google Ads conversion tracking values and counts',
            'Check for duplicate conversion counting across Google Ads, Analytics, and any third-party platforms',
            'Test cross-device tracking paths and ensure mobile-to-desktop conversion journeys are properly attributed',
            'Implement enhanced conversions for first-party data collection and improved iOS14+ tracking accuracy',
            'Set up comprehensive offline conversion imports from CRM systems, phone sales, and in-store purchases',
            'Validate that conversion values accurately reflect actual revenue minus returns and refunds',
            'Ensure conversion attribution windows align with your actual customer purchase and consideration cycles',
            'Test conversion tracking with real transactions monthly, not just using preview modes',
            'Verify that conversion tags fire on thank-you pages, confirmation emails, and order completion flows',
            'Check that conversion tracking works across all devices, browsers, and with ad blockers enabled',
            'Implement server-side conversion tracking using Google Ads API for cookieless accuracy'
          ],
          tips: [
            'Use Google Tag Assistant, GTM Preview mode, and GA4 DebugView to test conversion tags before going live',
            'Set up monthly test purchases across different devices and browsers to verify tracking accuracy',
            'Implement Google\'s enhanced conversions feature to improve measurement in cookieless environments',
            'Use conversion value optimization rather than just conversion counting for ecommerce to maximize revenue',
            'Set up micro-conversions (email signups, cart additions, wish list adds) as secondary optimization goals',
            'Import offline sales data weekly using Google Ads offline conversion import or API integration',
            'Switch to data-driven attribution model when you have 3,000+ conversions in 30 days for better accuracy',
            'Set up custom conversion windows that match your actual sales cycle length (7-day, 30-day, or 90-day)',
            'Use Google\'s conversion tracking template for consistent implementation across all campaigns',
            'Implement Google Analytics 4 Enhanced Ecommerce alongside Google Ads tracking for data validation',
            'Set up automated alerts in GA4 when conversion tracking drops below expected thresholds',
            'Use Google Ads conversion debugging tools to identify and fix tracking discrepancies quickly'
          ],
          redFlags: [
            'Conversion count discrepancy greater than 15% between Google Ads and GA4 with no clear technical explanation',
            'Enhanced conversions not implemented despite iOS14+ privacy changes affecting conversion tracking accuracy',
            'No offline conversion tracking when phone calls or email sales represent more than 20% of total revenue',
            'Conversion tracking setup was changed in the last 30 days without proper testing and validation period',
            'Using view-through conversion windows longer than your actual customer consideration and purchase period',
            'Missing conversion tracking for critical micro-conversions like newsletter signups, quote requests, or demo bookings',
            'Conversion values include tax and shipping when they should only reflect product value for ROAS calculations',
            'No conversion tracking testing protocol - relying solely on "set it and forget it" approach',
            'Google Ads showing conversions but GA4 showing zero ecommerce events (indicates tracking setup problems)',
            'Conversion tracking hasn\'t been audited or validated in the past 6 months despite ongoing performance optimization'
          ]
        },
        { 
          id: 'review-campaign-settings',
          title: 'Review Campaign Goals & Settings',
          icon: Target,
          description: 'Check that each campaign\'s objective and settings align with best practices. For example, if it\'s a Search campaign, make sure it isn\'t inadvertently opted into the Google Display Network, which often either yields no benefit or wastes budget. Verify the location targeting is correct – exclude any countries/regions you don\'t serve.',
          checkpoints: [
            'Verify precise location targeting excludes all countries/regions where you cannot ship or provide services',
            'Confirm language settings exactly match your target audience and all available website language versions',
            'Check that Search campaigns are not accidentally opted into Google Display Network (common auto-opt-in issue)',
            'Review ad scheduling alignment with actual customer behavior patterns, conversion times, and business hours',
            'Analyze device performance data and implement appropriate bid adjustments based on conversion rate differences',
            'Ensure campaign objectives perfectly align with actual business goals (sales vs leads vs brand awareness)',
            'Validate that budget allocation directly matches campaign priority levels and proven performance potential',
            'Review all network settings to prevent accidental placements on irrelevant partner sites and mobile apps',
            'Check campaign-level settings for demographic targeting alignment with your ideal customer profile',
            'Verify that campaign naming conventions and organization support easy management and optimization',
            'Ensure bid strategy settings match the campaign\'s data maturity and conversion volume requirements',
            'Review frequency capping settings for Display campaigns to prevent overexposure and ad fatigue'
          ],
          tips: [
            'Use location performance reports to identify and exclude underperforming geographic areas that waste budget',
            'Regularly check for stray impressions from countries you don\'t serve and exclude them immediately to prevent waste',
            'Review Search campaigns daily for automatic Display Network opt-ins that Google often enables without permission',
            'Set up ad scheduling based on actual hourly conversion data patterns, not just standard business hours',
            'Apply mobile bid adjustments of -20% to +20% if mobile conversion rates differ significantly from desktop',
            'Use campaign-level negative keywords strategically to prevent keyword overlap and internal competition between campaigns',
            'Align daily budgets with weekly and monthly revenue goals, and adjust for seasonal demand pattern changes',
            'Exclude low-quality partner sites, mobile apps, and placements that don\'t align with your brand or target audience',
            'Review campaign settings monthly as Google frequently changes defaults and adds new features automatically',
            'Use location bid adjustments to increase/decrease bids in high-performing vs low-performing geographic areas',
            'Implement demographic bid adjustments based on age and gender performance data when statistically significant',
            'Set up custom campaign labels and naming conventions that make performance analysis and optimization easier'
          ],
          redFlags: [
            'Campaigns actively showing ads in countries where you cannot fulfill orders or provide customer service',
            'Search campaigns accidentally opted into Display Network without deliberate strategy, wasting budget on irrelevant placements',
            'Ad scheduling data shows strong performance patterns but no optimization or bid adjustments have been implemented',
            'Mobile device performance more than 50% worse than desktop without corresponding negative bid adjustments',
            'Language targeting includes languages not supported by your website, creating poor user experience',
            'Campaign settings haven\'t been reviewed, updated, or optimized in the past 3 months despite ongoing performance issues',
            'Location targeting set too broadly (entire countries) when you only serve specific cities or regions',
            'Campaign objectives don\'t match actual measurement goals (awareness campaigns measured only on conversions)',
            'Demographic data shows certain age/gender groups perform poorly but no exclusions or bid adjustments applied',
            'Campaign names and organization so poor that it\'s difficult to understand strategy or analyze performance efficiently'
          ]
        },
        {
          id: 'keyword-structure',
          title: 'Check Ad Group & Keyword Structure',
          icon: Layers,
          description: 'Keywords in an ad group should be closely related. Having 100+ keywords in one group is a red flag for poor organization.',
          checkpoints: [
            'Ensure each ad group contains tightly themed keywords (maximum 15-20 related keywords)',
            'Verify ad copy relevance directly matches the keyword themes within each ad group',
            'Review match type distribution - avoid over-reliance on broad match without negatives',
            'Implement Single Keyword Ad Groups (SKAGs) for your highest-converting terms',
            'Check for keyword overlap between campaigns that causes internal auction competition',
            'Analyze Quality Scores and identify keywords below 5/10 for improvement or removal',
            'Organize Shopping campaigns with clear product group structures by category',
            'Ensure Performance Max asset groups are organized by logical product themes'
          ],
          tips: [
            'Group keywords by specific product categories or customer intent, not broad themes',
            'Keep ad groups small - having 50+ keywords makes it impossible to write relevant ads',
            'Use exact match for your highest-converting keywords to maintain control and relevance',
            'Mirror your product catalog structure in Shopping campaign product groups',
            'Create themed asset groups in Performance Max that don\'t compete with each other',
            'Use keyword-level negative keywords to prevent irrelevant matches within ad groups',
            'Review search term reports monthly to identify new keyword opportunities and negatives',
            'Ensure SKAGs have dedicated landing pages that exactly match the keyword intent'
          ],
          redFlags: [
            'Ad groups containing 50+ keywords with completely different themes or intents',
            'Quality Scores consistently below 5/10 indicating poor keyword-ad-landing page alignment',
            'No exact match keywords for terms that convert regularly and drive significant volume',
            'Keyword overlap between campaigns causing you to compete against yourself',
            'Broad match keywords without comprehensive negative keyword lists causing irrelevant traffic',
            'Product groups in Shopping campaigns are too broad, making bid optimization impossible'
          ]
        },
        {
          id: 'bidding-strategy',
          title: 'Evaluate Bidding Strategy Effectiveness',
          icon: Gauge,
          description: 'Wrong bid strategy can drive up costs or limit performance. New campaigns need at least 30-50 conversions monthly for advanced strategies.',
          checkpoints: [
            'Verify bidding strategy matches campaign maturity - new campaigns need 30+ conversions/month for automation',
            'Check if ROAS/CPA targets are realistic based on actual historical performance data',
            'Review portfolio bidding strategies to ensure they\'re not limiting high-performing campaigns',
            'Analyze if bid limits are set appropriately to prevent overspending or limiting volume',
            'Ensure sufficient conversion volume exists before implementing advanced automated strategies',
            'Compare current automated performance against historical manual bidding benchmarks',
            'Validate that bidding strategy aligns with profit margins, not just vanity metrics',
            'Check for seasonal bidding adjustments and automated rules'
          ],
          tips: [
            'Start new campaigns with Manual or Enhanced CPC to gather baseline data',
            'Only implement Target ROAS when you have at least 30-50 conversions per month',
            'Set ROAS targets at 10-20% better than historical performance, not unrealistic goals',
            'Use Maximize Conversions first, then layer in ROAS targets once volume stabilizes',
            'Test automated strategies with 70/30 budget splits against manual control groups',
            'Adjust targets seasonally - holiday ROAS targets may need to be lower for volume',
            'Use portfolio strategies only when campaigns have similar margin structures',
            'Monitor learning periods - avoid making changes during 2-week algorithm adjustment phases'
          ],
          redFlags: [
            'Target ROAS/CPA applied to campaigns with fewer than 15 conversions per month',
            'Bidding targets set 50%+ higher than historical performance without gradual scaling',
            'No bidding strategy testing or changes implemented in past 6 months',
            'Automated strategies implemented without allowing proper learning periods',
            'Portfolio strategies mixing campaigns with vastly different profit margins',
            'New campaigns immediately set to aggressive automated bidding without data'
          ]
        },
        {
          id: 'budget-allocation',
          title: 'Inspect Budget Allocation & Distribution',
          icon: PieChart,
          description: 'Ensure budget distribution prioritizes campaigns and products that drive profitable sales and revenue growth.',
          checkpoints: [
            'Identify high-ROAS campaigns that are budget-constrained and losing impression share',
            'Analyze budget consumption patterns - campaigns hitting daily limits before 6 PM',
            'Review budget allocation vs actual performance - poor campaigns getting too much budget',
            'Check for shared budget inefficiencies where strong campaigns subsidize weak ones',
            'Evaluate budget pacing throughout the day and week for optimization opportunities',
            'Assess budget allocation alignment with profit margins and customer lifetime value',
            'Monitor impression share lost due to budget vs rank for reallocation decisions',
            'Review seasonal budget planning and allocation for key sales periods'
          ],
          tips: [
            'Reallocate budget from campaigns with ROAS <3x to those with ROAS >5x immediately',
            'Increase budgets for campaigns showing "limited by budget" with strong performance',
            'Reduce daily budgets for campaigns consistently spending with poor ROAS',
            'Use automated rules to increase budgets when ROAS exceeds targets',
            'Allocate 60-70% of budget to your top 20% performing campaigns',
            'Plan budget increases 2-3 weeks before major sales events (Black Friday, holidays)',
            'Set up budget alerts when high-performing campaigns approach daily limits',
            'Consider shared budgets only for campaigns with similar performance levels'
          ],
          redFlags: [
            'Top performing campaigns (ROAS >5x) losing impression share due to budget constraints',
            'Poor performing campaigns (ROAS <2x) consuming 30%+ of total monthly budget',
            'No budget reallocation in past 90 days despite significant performance differences',
            'Budget distribution not aligned with actual profit margins - treating all sales equally',
            'High-performing campaigns consistently hitting budget caps by mid-morning',
            'Seasonal events approaching without corresponding budget planning or increases'
          ]
        },
        {
          id: 'negative-keywords',
          title: 'Implement Negative Keywords & Exclusions',
          icon: Filter,
          description: 'Check if the account is utilizing negative keywords (especially for Search and Shopping campaigns). Negatives are crucial to filter out irrelevant search queries and avoid wasting spend. If you see no negative keywords at all, that\'s a problem. Also consider placements: for Performance Max or Display campaigns, it\'s recommended to exclude mobile app placements at the account level.',
          checkpoints: [
            'Comprehensive search term report analysis to identify irrelevant, low-intent queries that spent significant money with no conversions',
            'Account-level mobile app placement exclusions to prevent accidental clicks from games and random mobile applications',
            'Systematic irrelevant query identification and blocking using exact, phrase, and broad match negative keywords',
            'Account-level and campaign-level exclusion lists properly organized and applied across relevant campaigns',
            'Shared negative keyword list creation and management for efficiency across multiple campaigns',
            'Regular negative keyword maintenance schedule with monthly search term reviews and quarterly strategy updates',
            'Placement exclusions for Display and Performance Max campaigns targeting low-quality sites and partner networks',
            'Audience exclusions to prevent showing ads to users who already purchased or are unlikely to convert',
            'Geographic exclusions for locations that consistently show poor conversion rates or are outside service areas',
            'Demographic exclusions based on age, gender, and income data showing consistently poor performance',
            'Content category exclusions for brand safety and relevance (avoid appearing next to inappropriate content)',
            'YouTube channel and video exclusions for campaigns running on Google Video Partners'
          ],
          tips: [
            'Block mobile app placements account-wide since ads in random mobile apps (especially games) often generate accidental clicks and low-quality traffic',
            'Review search term reports weekly and add obvious irrelevant terms like "free," "jobs," "how to," and competitor names as negatives',
            'Don\'t add overly broad negative keywords that might accidentally block relevant traffic - be specific and strategic',
            'Exclude consistently poor-performing demographics, placements, and geographic locations systematically based on data',
            'Create shared negative keyword lists for common irrelevant terms and apply them across multiple campaigns for efficiency',
            'Set up a monthly search term review process as a standard operating procedure to catch new irrelevant queries',
            'Use Google\'s placement exclusion lists to block categories like mobile apps, games, and other known poor-quality placements',
            'Exclude past purchasers from new customer acquisition campaigns to avoid wasting budget on people who already bought',
            'Add negative keywords for terms related to competitors, jobs, free versions, and DIY solutions if you sell premium products',
            'Use broad match negative keywords sparingly - focus on exact and phrase match negatives for better control',
            'Exclude placements, YouTube channels, and websites that don\'t align with your brand values or target audience',
            'Review and update negative keyword lists quarterly as new irrelevant search trends and terms emerge over time'
          ],
          redFlags: [
            'No negative keywords implemented anywhere in the account despite running Search or Shopping campaigns for months',
            'High spend (>$100) on obviously irrelevant search terms like "free [product]," "[product] jobs," or competitor names',
            'Mobile app placements not excluded at account level, causing budget waste on accidental clicks in games and apps',
            'No regular search term review process in place - negative keyword lists haven\'t been updated in 6+ months',
            'Broad match keywords running without comprehensive negative keyword protection, causing irrelevant traffic',
            'Search term reports show extensive irrelevant queries but no action taken to add appropriate negatives',
            'Display campaigns running on all available placements without any exclusions or optimization',
            'Past purchasers not excluded from new customer acquisition campaigns, causing budget waste',
            'No placement exclusions despite poor performance from specific websites, apps, or YouTube channels',
            'Negative keyword lists not shared across campaigns, requiring duplicate management and missing efficiency opportunities'
          ]
        },
        {
          id: 'audience-targeting',
          title: 'Check Audience Targeting & Retargeting Setup',
          icon: Users,
          description: 'See if the account is leveraging audience data. For e-commerce, best practice is to use Remarketing and Customer Match where possible. A healthy account will have a strategy to re-engage past visitors. Not using your audience data (no retargeting, no customer list usage) is a big gap.',
          checkpoints: [
            'Remarketing campaign setup with proper audience creation for website visitors, cart abandoners, and past purchasers',
            'Customer Match implementation with regular email list uploads and proper list management and segmentation',
            'Strategic audience exclusions to prevent campaign overlap and reduce costs (exclude past purchasers from prospecting)',
            'Past purchaser exclusions from new customer acquisition campaigns to avoid paying for existing customers',
            'Audience signals implementation in Performance Max campaigns to guide algorithm learning and optimization',
            'Demographics and interest targeting analysis with appropriate bid adjustments or exclusions based on performance data',
            'Custom audience creation based on specific website behavior patterns, purchase history, and engagement levels',
            'Lookalike audience testing based on your highest-value customers and best converters',
            'In-market and affinity audience evaluation with observation mode testing before full implementation',
            'Cross-campaign audience strategy coordination to ensure consistent messaging and avoid budget waste',
            'Seasonal audience adjustments and list refreshes to maintain relevance and performance',
            'Google Analytics audience integration and custom audience creation based on GA4 events and conversions'
          ],
          tips: [
            'Set up comprehensive remarketing campaigns for past website visitors with tailored messaging based on pages visited',
            'Upload customer email lists monthly for Customer Match targeting and create segments based on purchase history',
            'Exclude past purchasers from new customer acquisition campaigns to avoid paying premium prices for existing customers',
            'Use audience signals effectively in Performance Max campaigns by adding your best-performing remarketing lists',
            'Create separate campaigns for different audience segments (new vs returning visitors) with appropriate bidding',
            'Test lookalike audiences based on your highest-value customers and converters, starting with 1% similarity',
            'Use observation mode for new audiences to gather performance data before switching to targeting mode',
            'Segment remarketing lists by recency (7-day, 30-day, 90-day visitors) for more targeted messaging',
            'Implement dynamic remarketing for ecommerce to show specific products that users viewed or added to cart',
            'Create custom audiences based on specific user behaviors like time on site, pages per session, or video engagement',
            'Refresh customer lists regularly and remove bounced emails to maintain list quality and deliverability',
            'Use similar audiences and in-market audiences as expansion opportunities once core audiences prove successful'
          ],
          redFlags: [
            'No remarketing campaigns set up despite having website traffic and potential for re-engagement',
            'Customer Match not implemented despite having customer email data and permission for marketing use',
            'No audience exclusions implemented, causing campaign overlap and inflated costs for the same users',
            'Demographic data clearly showing poor performance from certain age/gender groups without bid adjustments or exclusions',
            'Performance Max campaigns running without any audience signals, missing optimization opportunities',
            'Remarketing lists haven\'t been refreshed or updated in 6+ months, reducing relevance and effectiveness',
            'No segmentation of audiences - treating all website visitors the same regardless of behavior or value',
            'Dynamic remarketing not implemented for ecommerce despite having product feeds and catalog',
            'Lookalike audiences never tested despite having sufficient customer data for effective similar audience creation',
            'Cross-campaign audience strategy uncoordinated, leading to the same users seeing conflicting messages and offers'
          ]
        }
      ]
    },
    phase2: {
      id: 'phase2',
      number: '02',
      title: 'Audit Landing Pages & Product Feed Quality',
      icon: Globe,
      description: 'Optimize user experience and product data for maximum conversion potential and ad relevance',
      color: 'from-emerald-600 via-primary to-slate-800',
      bgPattern: 'geometric-patterns',
      items: [
        {
          id: 'landing-page-relevance',
          title: 'Landing Page Relevance & UX Audit',
          icon: Eye,
          description: 'For each major campaign or top ad, click through to the landing page and assess it critically. The landing page must deliver on the ad\'s promise and make it easy for the visitor to convert. Google recommends that ads land on the most specific relevant page (product page or category page, not the homepage).',
          checkpoints: [
            'Verify strong message match between ad headlines and landing page H1/hero content - should be immediately obvious they\'re connected',
            'Test page load speed with Google PageSpeed Insights and Core Web Vitals - target under 3 seconds on mobile and desktop',
            'Ensure clear, prominent call-to-action buttons are visible above the fold without excessive scrolling required',
            'Check mobile responsiveness and touch-friendly design since mobile represents 60%+ of traffic for most businesses',
            'Verify product availability status matches between ads and actual inventory - nothing worse than advertising out-of-stock items',
            'Analyze complete checkout flow for friction points, form complexity, and unexpected costs causing abandonment',
            'Test all form fields, payment processing systems, error handling, and confirmation processes work properly',
            'Ensure landing pages are product-specific or category-specific, not generic homepage destinations',
            'Check that product details, images, and descriptions are comprehensive enough for high-intent shoppers to make decisions',
            'Verify that important elements (product details, add-to-cart button, trust badges) are easily visible without scrolling',
            'Test cross-device experience to ensure consistent functionality across desktop, tablet, and mobile',
            'Analyze user flow from landing page through conversion to identify drop-off points and optimization opportunities'
          ],
          tips: [
            'Direct traffic to the most specific relevant page possible - if ad advertises "50% off summer shoes," land on summer shoes category with sale visible',
            'Match landing page headlines exactly to ad copy for seamless user experience and higher conversion rates',
            'Optimize images with compression, enable browser caching, and use CDN to improve load speeds significantly',
            'Place primary CTA above the fold and repeat it 2-3 times throughout the page for maximum visibility',
            'Use heat mapping tools like Hotjar or Crazy Egg to identify where users actually click and where they drop off',
            'A/B test different landing page layouts, headlines, CTA button colors, and placements systematically',
            'Include trust signals (security badges, return policy, free shipping) near call-to-action buttons for increased confidence',
            'Ensure mobile pages load in under 2 seconds for optimal conversion rates - mobile users are especially impatient',
            'Design landing page with upper-funnel-friendly headline that someone unfamiliar with your brand can understand',
            'Use hero image or video that immediately shows the product benefit, not just generic product photos',
            'Keep landing page clutter-free and focused on single conversion goal rather than multiple competing CTAs',
            'Include customer reviews, ratings, and testimonials on product pages to build trust with new visitors'
          ],
          redFlags: [
            'Page load speed consistently over 5 seconds on mobile or desktop, causing high bounce rates and poor Quality Scores',
            'Landing page headline or content doesn\'t match the specific promise made in the ad copy, confusing visitors',
            'Bounce rate for paid traffic exceeds 70%, indicating poor relevance, slow loading, or user experience issues',
            'Checkout or conversion flow abandonment rate above 80% suggests major friction points in the purchase process',
            'Generic homepage used as landing page for specific product ads instead of relevant product or category pages',
            'Out-of-stock products being actively advertised without real-time inventory updates causing frustrated users',
            'Mobile experience significantly worse than desktop (slow loading, hard to navigate, small buttons)',
            'Important conversion elements like add-to-cart buttons or contact forms are below the fold and hard to find',
            'Landing page contains multiple competing CTAs that distract from primary conversion goal',
            'No social proof, reviews, or trust signals visible to help convince unfamiliar visitors to take action'
          ]
        },
        {
          id: 'social-proof',
          title: 'Incorporate Social Proof & Trust Signals',
          icon: Star,
          description: 'People arriving at your site may not know your brand, so build trust quickly. Include social proof elements on your pages. For instance, display a statement like "10,000+ ★★★★★ reviews" or "Over 100,000 items sold!" prominently. Show evidence that what you promise is "legit" to overcome consumer skepticism.',
          checkpoints: [
            'Review count and star rating display prominently on hero section (e.g., "10,000+ ★★★★★ reviews" or "Over 100,000 items sold!")',
            'Media mention logos and press coverage prominently displayed (often called a "brag bar") to establish credibility',
            'Customer testimonials strategically placed with specific outcomes and results rather than generic praise',
            'Security badges from trusted providers (SSL certificates, payment security, privacy compliance) near checkout areas',
            'Return policy, money-back guarantee, and shipping information clearly visible and easily accessible',
            'About us, contact information, and team photos to establish credibility and personal connection with brand',
            'Industry certifications, awards, and professional memberships displayed to build authority and trust',
            'Customer photos and user-generated content showing real people using and enjoying products',
            'Trust indicators like "risk-free trial," "30-day guarantee," or "free returns" prominently featured',
            'Real customer reviews and ratings integrated directly into product pages rather than hidden in separate sections',
            'Social media proof like follower counts, customer posts, and engagement metrics when impressive',
            'Third-party validation from review sites, industry publications, and expert endorsements'
          ],
          tips: [
            'Display review count and average rating prominently in the hero section where visitors immediately see social validation',
            'Show press mentions and media logos in a "brag bar" format if your product or brand has been featured in reputable outlets',
            'Include specific customer testimonials with quotes that highlight positive outcomes rather than generic "great product" statements',
            'Add return policy and free shipping information clearly visible near add-to-cart buttons to reduce purchase anxiety',
            'Use security badges from recognized providers like Norton, McAfee, or SSL certificate badges near payment areas',
            'Include founder story, team photos, or company history to create personal connection and transparency with visitors',
            'Show real customer photos using your products rather than just professional stock photography when possible',
            'Display industry certifications, awards, or "as featured in" logos to establish credibility and authority',
            'Use specific numbers in social proof (not just "thousands of customers" but "over 15,000 satisfied customers")',
            'Place trust signals strategically throughout the conversion funnel, not just on homepage or about page',
            'Leverage user-generated content from social media to show real customers using and enjoying products',
            'Include guarantees or risk-reversal offers like "100% money-back guarantee" to reduce perceived purchase risk'
          ],
          redFlags: [
            'No social proof elements visible anywhere on landing pages or product pages despite having customer data available',
            'Customer reviews and ratings hidden on separate pages or buried below the fold where visitors won\'t see them',
            'No trust badges, security indicators, or credibility signals near checkout or high-conversion areas',
            'Missing or unclear return policy, contact information, or guarantee details that customers expect before purchasing',
            'Generic testimonials without specific outcomes or benefits that visitors can relate to and trust',
            'No media mentions, certifications, or third-party validation displayed despite having legitimate credentials',
            'Trust signals outdated or from unknown/unrecognizable sources that don\'t actually build credibility',
            'Social proof claims that can\'t be verified or seem exaggerated (like claiming millions of customers for small business)',
            'About us or company information missing, making business seem anonymous or untrustworthy',
            'No risk-reversal offers or guarantees when competitors clearly offer them, putting you at disadvantage'
          ]
        },
        {
          id: 'product-page-optimization',
          title: 'Product Page Optimization Analysis',
          icon: Zap,
          description: 'High-intent shoppers compare details and reviews. Images should showcase benefits and usage, not just generic studio photos.',
          checkpoints: [
            'Descriptive product titles and detailed descriptions',
            'High-quality product images showcasing benefits',
            'Product reviews and ratings display',
            'Competitor comparison analysis and positioning',
            'Cross-selling and upselling opportunities',
            'Product specification completeness'
          ],
          tips: [
            'Include material, dimensions, and detailed usage instructions',
            'Show product in use/context rather than just studio shots',
            'Display star ratings and customer comments prominently',
            'Check how your product listings appear vs competitors',
            'Add size guides, care instructions, and warranty info',
            'Include customer photos and video reviews when possible'
          ],
          redFlags: [
            'Generic product descriptions under 100 words',
            'Only studio photos without lifestyle/usage images',
            'No customer reviews visible',
            'Missing key product specifications'
          ]
        },
        {
          id: 'product-feed-optimization',
          title: 'Product Feed Titles & Attributes Optimization',
          icon: FileText,
          description: 'A crucial part of e-commerce ads is your Google Merchant Center feed, which supplies product info for Shopping and Performance Max campaigns. Focus on product titles first, as they heavily influence ad relevance. Best practices: Include brand, product type, and key attributes. Avoid vague titles like "T-Shirt" - instead use "Brand X Men\'s T-Shirt – Blue, Size M – 100% Cotton".',
          checkpoints: [
            'Product titles include most important info: brand, product type, color, size, model, and key differentiating attributes',
            'Variant differentiation ensures Google can tell products apart - each variant has unique identifying words in titles',
            'Optimize title length between 50-150 characters to use full allowable space for keyword inclusion',
            'Integrate high-converting keywords from search term reports directly into product titles for better matching',
            'Create custom labels for campaign segmentation and optimization (bestseller, high margin, seasonal, etc.)',
            'Ensure accurate Google product categorization for better algorithm understanding and impression eligibility',
            'Include material specifications, dimensions, and key features that customers actively search for',
            'Add promotional text allowable by Google policies (Free Shipping, In Stock, Made in USA, etc.)',
            'Optimize titles for mobile display since Google shows ~70 characters but indexes much more',
            'Use search term report data to identify exact customer language and incorporate into titles',
            'Implement title testing for top-performing products using supplemental feeds for optimization',
            'Include seasonal and gift-relevant keywords during appropriate times (holiday, back-to-school, etc.)'
          ],
          tips: [
            'Transform generic titles like "T-Shirt" into descriptive "Brand X Men\'s Cotton T-Shirt - Blue, Size L - Crew Neck, Short Sleeve"',
            'Use actual search term data to identify what language customers use and mirror that in titles',
            'Append additional keywords at end of titles even if truncated visually - Google indexes beyond display limit',
            'Include specific product attributes that differentiate from competitors (material, origin, features)',
            'Use custom labels strategically to organize products by profit margin tiers for advanced bidding optimization',
            'Test title variations for your top-performing products using supplemental feeds to measure impact',
            'Include seasonally relevant keywords during holidays, sales events, and gift-giving periods',
            'Ensure mobile-optimized titles since 60%+ of searches happen on mobile devices with limited screen space',
            'Take advantage of full 150-character limit - you can fit more descriptive information than you think',
            'Use product performance data to prioritize which products deserve the most title optimization effort',
            'Include keywords that trigger your Shopping ads in competitor analysis and search term reports',
            'Consider adding urgency or scarcity terms when appropriate (Limited Edition, While Supplies Last)'
          ],
          redFlags: [
            'Product titles under 30 characters that miss opportunities to include key descriptive information',
            'Identical titles for product variants making it impossible for Google to differentiate which variant to show',
            'No custom labels implemented, severely limiting campaign optimization and product performance analysis capabilities',
            'Missing brand information, GTINs, or MPNs causing frequent product disapprovals and reduced impression eligibility',
            'Titles that don\'t include any keywords customers actually search for based on search term report analysis',
            'No title optimization implemented based on search term report data insights in past 6+ months',
            'Generic titles like "Blue Shirt" when competitors use detailed titles like "Men\'s Navy Oxford Button-Down Shirt"',
            'Product variants all share identical titles creating confusion for Google\'s product selection algorithm',
            'Titles violate Google policies with excessive capitalization, promotional language, or special characters',
            'No seasonal title updates or optimization despite clear seasonal demand patterns in your product categories'
          ]
        },
        {
          id: 'merchant-center-compliance',
          title: 'Google Merchant Center Policy Compliance',
          icon: Shield,
          description: 'Policy violations can limit product visibility and campaign effectiveness. Regular compliance checks prevent account suspensions.',
          checkpoints: [
            'Product policy violation review and resolution',
            'Accurate product availability and pricing',
            'Proper age group and gender categorization',
            'Shipping and return policy compliance',
            'Website compliance with Google policies',
            'Product data quality score monitoring'
          ],
          tips: [
            'Regularly check Merchant Center for policy warnings',
            'Ensure product availability matches actual stock',
            'Use clear, descriptive product images that match descriptions',
            'Maintain accurate pricing across all platforms',
            'Implement structured data markup for better understanding',
            'Set up automated feeds to prevent outdated information'
          ],
          redFlags: [
            'Active policy violations in Merchant Center',
            'Frequent disapprovals for the same products',
            'Mismatch between website and feed pricing',
            'Poor data quality scores (<70%)'
          ]
        }
      ]
    },
    phase3: {
      id: 'phase3',
      number: '03',
      title: 'Audit Performance Data & Attribution',
      icon: BarChart3,
      description: 'Analyze performance data and attribution models to make informed optimization decisions',
      color: 'from-emerald-700 via-primary to-green-600',
      bgPattern: 'data-visualization',
      items: [
        {
          id: 'performance-analysis',
          title: 'Campaign Performance Analysis',
          icon: TrendingUp,
          description: 'Identify top and bottom performers to reallocate budget effectively. Look for patterns in time, device, and audience performance.',
          checkpoints: [
            'ROAS performance by campaign type and product category',
            'Cost per acquisition trends and efficiency',
            'Conversion rate optimization opportunities',
            'Time-based performance pattern analysis',
            'Device and audience segment performance',
            'Impression share and competitive analysis'
          ],
          tips: [
            'Segment performance by product margin, not just ROAS',
            'Look for hour-of-day and day-of-week patterns',
            'Compare Search vs Shopping vs Performance Max effectiveness',
            'Identify seasonal trends and prepare for them',
            'Use audience insights to refine targeting',
            'Monitor competitor activity and adjust accordingly'
          ],
          redFlags: [
            'No performance segmentation by product profitability',
            'Ignoring clear time-based performance patterns',
            'Equal budget allocation despite varying performance',
            'No competitive intelligence gathering'
          ]
        },
        {
          id: 'attribution-model-review',
          title: 'Attribution Model & Customer Journey Analysis',
          icon: Brain,
          description: 'Understand the full customer journey to attribute value correctly. Multi-touch attribution often reveals hidden value in awareness campaigns.',
          checkpoints: [
            'Attribution model comparison across different windows',
            'View-through conversion analysis and value',
            'Assisted conversion identification and credit',
            'Cross-device journey mapping and tracking',
            'First-click vs last-click attribution analysis',
            'Custom attribution model development'
          ],
          tips: [
            'Use data-driven attribution when sufficient conversion volume exists',
            'Don\'t ignore view-through conversions for awareness campaigns',
            'Analyze the full path to purchase, not just last click',
            'Consider longer attribution windows for high-value products',
            'Use Google Analytics to understand multi-channel funnels',
            'Test different attribution models to find optimal approach'
          ],
          redFlags: [
            'Only using last-click attribution for all decisions',
            'Ignoring view-through conversions completely',
            'No analysis of customer journey touchpoints',
            'Attribution window too short for product consideration cycle'
          ]
        },
        {
          id: 'search-term-mining',
          title: 'Search Term Mining & Query Analysis',
          icon: Search,
          description: 'Search terms reveal actual customer intent and language. Mine for new keywords, negative keywords, and campaign optimization opportunities.',
          checkpoints: [
            'High-volume, high-converting search term identification',
            'Irrelevant search term analysis for negatives',
            'Search term to keyword matching evaluation',
            'New keyword opportunity discovery',
            'Query intent classification and optimization',
            'Search term performance by match type'
          ],
          tips: [
            'Export search terms monthly and analyze systematically',
            'Look for patterns in converting vs non-converting terms',
            'Use search terms to improve ad copy relevance',
            'Identify product-specific language customers use',
            'Create themed ad groups based on search term clusters',
            'Use search terms to inform content marketing strategy'
          ],
          redFlags: [
            'No regular search term report analysis',
            'High spend on irrelevant search terms',
            'Missing obvious keyword opportunities from search terms',
            'Poor match between keywords and actual search queries'
          ]
        },
        {
          id: 'competitor-analysis',
          title: 'Competitive Analysis & Market Position',
          icon: Award,
          description: 'Understanding competitive landscape helps identify opportunities and threats. Auction insights reveal bidding efficiency.',
          checkpoints: [
            'Auction insights analysis for impression share',
            'Competitor ad copy and positioning review',
            'Competitive pricing and offer analysis',
            'Market share and growth opportunity assessment',
            'Competitor product catalog comparison',
            'Seasonal competitive pattern analysis'
          ],
          tips: [
            'Use auction insights to identify bidding inefficiencies',
            'Analyze competitor ad copy for messaging opportunities',
            'Monitor competitor promotional calendars and pricing',
            'Identify gaps in competitor product offerings',
            'Use competitive intelligence for strategic planning',
            'Test counter-positioning against competitor claims'
          ],
          redFlags: [
            'No competitive monitoring or analysis',
            'Losing significant impression share to competitors',
            'Outdated positioning vs current competitive landscape',
            'No awareness of competitor promotional strategies'
          ]
        }
      ]
    },
    phase4: {
      id: 'phase4',
      number: '04',
      title: 'Advanced Optimization & Scaling',
      icon: Target,
      description: 'Implement advanced strategies for growth, testing, and long-term success',
      color: 'from-slate-700 via-primary to-emerald-700',
      bgPattern: 'success-indicators',
      items: [
        {
          id: 'automation-optimization',
          title: 'Smart Bidding & Automation Optimization',
          icon: Brain,
          description: 'Leverage Google\'s machine learning while maintaining control. Proper automation setup can significantly improve efficiency.',
          checkpoints: [
            'Smart bidding strategy effectiveness evaluation',
            'Automated rule implementation and monitoring',
            'Performance Max campaign optimization',
            'Dynamic ad content and asset optimization',
            'Audience automation and similar audience expansion',
            'Budget automation and pacing optimization'
          ],
          tips: [
            'Allow sufficient learning period for automated strategies',
            'Use automated rules for routine optimizations',
            'Regularly audit and refresh automated audiences',
            'Test automated vs manual performance periodically',
            'Implement safety nets and guardrails for automation',
            'Monitor automation for seasonal and market changes'
          ],
          redFlags: [
            'Over-reliance on automation without monitoring',
            'Automated strategies with insufficient data',
            'No testing of automation effectiveness',
            'Automation running without performance guardrails'
          ]
        },
        {
          id: 'advanced-testing',
          title: 'Advanced Testing & Experimentation',
          icon: Zap,
          description: 'Systematic testing drives continuous improvement. Test one variable at a time with sufficient sample size for statistical significance.',
          checkpoints: [
            'A/B testing methodology and statistical significance',
            'Landing page testing and conversion optimization',
            'Ad copy and creative testing framework',
            'Bidding strategy testing and evaluation',
            'Audience testing and expansion opportunities',
            'Campaign structure testing and optimization'
          ],
          tips: [
            'Test only one variable at a time for clear results',
            'Ensure sufficient sample size for statistical significance',
            'Run tests for full business cycles (weekly/monthly)',
            'Document all tests and results for future reference',
            'Use control groups to isolate test impact',
            'Scale winning tests gradually to confirm results'
          ],
          redFlags: [
            'No systematic testing framework in place',
            'Testing multiple variables simultaneously',
            'Ending tests too early without statistical significance',
            'Not scaling successful test results'
          ]
        },
        {
          id: 'scaling-strategies',
          title: 'Scaling Strategies & Growth Planning',
          icon: TrendingUp,
          description: 'Scale winning campaigns while maintaining efficiency. Growth requires systematic expansion of successful elements.',
          checkpoints: [
            'Budget scaling methodology and risk management',
            'Geographic expansion opportunity assessment',
            'Product line expansion and testing framework',
            'Seasonal scaling and planning strategies',
            'Customer lifetime value optimization',
            'Market expansion and new channel integration'
          ],
          tips: [
            'Scale budget gradually (20-50% increases) to maintain efficiency',
            'Test new geos with smaller budgets before full expansion',
            'Use successful campaign structures as templates',
            'Plan for seasonal demand fluctuations',
            'Focus on customer LTV, not just immediate ROAS',
            'Coordinate scaling with inventory and fulfillment capacity'
          ],
          redFlags: [
            'Aggressive scaling without performance monitoring',
            'No geographic or demographic expansion testing',
            'Scaling without considering fulfillment capacity',
            'No long-term growth planning or strategy'
          ]
        },
        {
          id: 'integration-optimization',
          title: 'Cross-Platform Integration & Optimization',
          icon: Layers,
          description: 'Optimize the entire marketing ecosystem. Google Ads performs better when integrated with other marketing channels.',
          checkpoints: [
            'Google Ads and Facebook Ads coordination',
            'Email marketing and retargeting integration',
            'SEO and paid search keyword coordination',
            'CRM integration and customer data utilization',
            'Attribution modeling across all channels',
            'Creative and messaging consistency across platforms'
          ],
          tips: [
            'Avoid audience overlap between paid channels',
            'Use email lists for customer match in multiple platforms',
            'Coordinate keyword strategies between SEO and PPC',
            'Share creative assets and successful messaging across channels',
            'Implement unified tracking and attribution',
            'Plan integrated campaigns with consistent messaging'
          ],
          redFlags: [
            'No coordination between paid marketing channels',
            'Duplicate targeting causing increased costs',
            'Inconsistent messaging across marketing channels',
            'No unified customer data or attribution model'
          ]
        },
        {
          id: 'long-term-strategy',
          title: 'Long-term Strategy & Account Health',
          icon: Award,
          description: 'Maintain account health and plan for sustainable growth. Regular audits and strategic planning ensure continued success.',
          checkpoints: [
            'Account health monitoring and maintenance',
            'Quality Score improvement and monitoring',
            'Long-term competitive positioning strategy',
            'Seasonal planning and preparation',
            'Team training and knowledge transfer',
            'Performance benchmarking and goal setting'
          ],
          tips: [
            'Schedule regular account audits (quarterly)',
            'Monitor and improve Quality Scores consistently',
            'Plan campaigns 3-6 months in advance',
            'Document processes and strategies for team knowledge',
            'Set realistic growth targets based on market conditions',
            'Stay updated with platform changes and new features'
          ],
          redFlags: [
            'No regular account maintenance or audits',
            'Declining Quality Scores without improvement efforts',
            'No long-term strategic planning',
            'No documentation of successful strategies and processes'
          ]
        }
      ]
    }
  };

  const getPhaseProgress = (phaseId: string) => {
    const phase = auditFramework[phaseId as keyof typeof auditFramework];
    const completedCount = phase.items.filter(item => completedItems[item.id]).length;
    return Math.round((completedCount / phase.items.length) * 100);
  };

  const getTotalProgress = () => {
    const totalItems = Object.values(auditFramework).reduce((acc, phase) => acc + phase.items.length, 0);
    const completedCount = Object.keys(completedItems).filter(id => completedItems[id]).length;
    return Math.round((completedCount / totalItems) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <SEO
        title="Google Ads Audit Guide, Complete Framework"
        description="A full framework for auditing any Google Ads account, campaign structure, conversion tracking, bidding, audiences, assets, search terms."
        ogType="article"
      />
      
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div 
          className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-200"
          style={{
            width: `${Math.min(100, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}%`
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24">
          {/* Moving Gradient Background - Inspired by Google Ads Service */}
          <div className="absolute inset-0 rounded-3xl">
            {/* Base dark background */}
            <div className="absolute inset-0 bg-gray-900 rounded-3xl" />
            
            {/* Primary moving gradient */}
            <div 
              className="absolute inset-0 opacity-80 rounded-3xl"
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
              className="absolute inset-0 animate-gradient-shift opacity-60 rounded-3xl"
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
              className="absolute inset-0 animate-gradient-move opacity-30 rounded-3xl"
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
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
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
          
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
            <Button 
              variant="ghost" 
              onClick={handleDashboardClick} 
              className="mb-8 text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:scale-105 transition-transform duration-200">
              Complete Google Ads Framework
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white drop-shadow-2xl">
              Google Ads{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-green-200 to-emerald-400 bg-clip-text text-transparent">
                Audit Guide
              </span>
            </h1>
            
            <p className="text-xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              A comprehensive, actionable framework to audit and optimize your Google Ads campaigns for maximum ROI and sustainable growth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>4 Comprehensive Phases</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>25+ Detailed Checkpoints</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Actionable Tips & Red Flags</span>
              </div>
            </div>
            
            {/* Progress Overview */}
            <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white/80">Overall Progress</span>
                <span className="text-sm font-bold text-emerald-400">{getTotalProgress()}%</span>
              </div>
              <Progress value={getTotalProgress()} className="h-2" />
              <p className="text-xs text-white/70 mt-2">
                {Object.keys(completedItems).length} of {Object.values(auditFramework).reduce((acc, phase) => acc + phase.items.length, 0)} items completed
              </p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="mt-16 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why This Framework Works</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              This framework is built from real-world experience optimizing campaigns that drive millions in revenue. 
              Each phase builds upon the previous, ensuring a systematic approach to campaign optimization.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(auditFramework).map((phase) => {
              const Icon = phase.icon;
              return (
                <Card key={phase.id} className="relative group hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg--to-br from-slate-800 to-slate-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      <Icon className="w-8 h-8 text-black" />
                    </div>
                    <Badge variant="outline" className="mb-2 text-xs border-primary/30 text-primary">
                      Phase {phase.number}
                    </Badge>
                    <CardTitle className="text-lg">{phase.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {phase.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      {phase.items.length} checkpoints
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs font-medium text-primary">{getPhaseProgress(phase.id)}%</span>
                    </div>
                    <Progress value={getPhaseProgress(phase.id)} className="h-1 mt-2" />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4 w-full hover:bg-primary hover:text-white transition-colors duration-200"
                      onClick={() => scrollToPhase(phase.id)}
                    >
                      Go to Phase {phase.number}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Phases */}
        {Object.values(auditFramework).map((phase, phaseIndex) => {
          const PhaseIcon = phase.icon;
          
          // Define unique background patterns for each phase
          const getPhaseBackground = (pattern: string, index: number) => {
            switch (pattern) {
              case 'floating-orbs':
                return (
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <div 
                      className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 animate-orb-float blur-2xl"
                      style={{
                        background: 'radial-gradient(circle, rgba(34, 139, 34, 0.4) 0%, transparent 70%)',
                        animationDelay: `${index * 2}s`,
                      }}
                    />
                    <div 
                      className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full opacity-15 animate-orb-float blur-2xl"
                      style={{
                        background: 'radial-gradient(circle, rgba(46, 139, 87, 0.3) 0%, transparent 70%)',
                        animationDelay: `${index * 2 + 4}s`,
                      }}
                    />
                  </div>
                );
              case 'geometric-patterns':
                return (
                  <div className="absolute inset-0 opacity-10 rounded-3xl">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(34, 139, 34, 0.1) 10px, rgba(34, 139, 34, 0.1) 20px)`
                    }} />
                  </div>
                );
              case 'data-visualization':
                return (
                  <div className="absolute inset-0 opacity-15 rounded-3xl">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid grid-cols-8 gap-2 opacity-30">
                        {Array.from({ length: 32 }).map((_, i) => (
                          <div key={i} className="w-2 bg-emerald-400 animate-pulse" style={{
                            height: `${Math.random() * 40 + 10}px`,
                            animationDelay: `${i * 0.1}s`
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              case 'success-indicators':
                return (
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <div className="absolute inset-0 opacity-20">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} 
                          className="absolute w-6 h-6 text-emerald-400 animate-pulse"
                          style={{
                            top: `${Math.random() * 80 + 10}%`,
                            left: `${Math.random() * 80 + 10}%`,
                            animationDelay: `${i * 0.5}s`
                          }}
                        >
                          ✓
                        </div>
                      ))}
                    </div>
                  </div>
                );
              default:
                return null;
            }
          };
          
          return (
            <section key={phase.id} id={phase.id} className="mb-20">
              <div className="relative">
                {/* Phase Header */}
                <div className={`relative rounded-3xl bg-gradient-to-br ${phase.color} p-8 lg:p-12 mb-8 overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20" />
                  {getPhaseBackground(phase.bgPattern, phaseIndex)}
                  <div className="relative z-10 text-center text-white">
                    <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30 hover:scale-105 transition-transform duration-200">
                      Phase {phase.number}
                    </Badge>
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 backdrop-blur-sm flex items-center justify-center shadow-xl">
                        <PhaseIcon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4 drop-shadow-lg">{phase.title}</h2>
                    <p className="text-lg lg:text-xl text-white/90 max-w-3xl mx-auto mb-6 drop-shadow-md">
                      {phase.description}
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>{phase.items.length} Items</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>{getPhaseProgress(phase.id)}% Complete</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase Items */}
                <div className="grid gap-6">
                  {phase.items.map((item, itemIndex) => {
                    const ItemIcon = item.icon;
                    const isCompleted = completedItems[item.id];
                    
                    // Muted green shades for each card
                    const cardColors = [
                      'from-emerald-50 to-green-100 border-emerald-200',
                      'from-green-50 to-emerald-50 border-green-200', 
                      'from-teal-50 to-green-50 border-teal-200',
                      'from-emerald-100 to-teal-50 border-emerald-300',
                      'from-green-100 to-emerald-100 border-green-300',
                      'from-teal-100 to-green-100 border-teal-300',
                      'from-emerald-50 to-teal-100 border-emerald-200'
                    ];
                    
                    const cardColor = cardColors[itemIndex % cardColors.length];
                    
                    return (
                      <Card key={item.id} className={`transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${isCompleted ? 'ring-2 ring-primary/50' : ''} bg-gradient-to-br ${cardColor}`}>
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg transition-shadow duration-200`}>
                              <ItemIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-xl text-slate-800">{item.title}</CardTitle>
                                <Checkbox
                                  checked={isCompleted}
                                  onCheckedChange={() => toggleCompletion(item.id)}
                                  className="ml-auto"
                                />
                              </div>
                              <CardDescription className="text-base text-slate-700">
                                {item.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <Accordion type="multiple" className="w-full">
                            {/* Checkpoints */}
                            <AccordionItem value="checkpoints">
                              <AccordionTrigger className="text-left hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5 text-primary" />
                                  <span className="font-medium">Checkpoints</span>
                                  <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                                    {item.checkpoints.length}
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                                  <div className="space-y-3">
                                    {item.checkpoints.map((checkpoint, index) => (
                                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/80 border border-emerald-100 hover:shadow-md transition-shadow duration-200">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="text-sm text-foreground font-medium">{checkpoint}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            {/* Tips */}
                            <AccordionItem value="tips">
                              <AccordionTrigger className="text-left hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <Lightbulb className="w-5 h-5 text-emerald-600" />
                                  <span className="font-medium">Tips</span>
                                  <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
                                    {item.tips.length}
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                  <div className="space-y-3">
                                    {item.tips.map((tip, index) => (
                                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/80 border border-green-100 hover:shadow-md transition-shadow duration-200">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                          <Lightbulb className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-sm text-foreground">{tip}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>

                            {/* Red Flags */}
                            <AccordionItem value="red-flags">
                              <AccordionTrigger className="text-left hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-5 h-5 text-red-600" />
                                  <span className="font-medium">Red Flags</span>
                                  <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
                                    {item.redFlags.length}
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                                  <div className="space-y-3">
                                    {item.redFlags.map((flag, index) => (
                                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/80 border border-red-100 hover:shadow-md transition-shadow duration-200">
                                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                          <AlertTriangle className="w-4 h-4 text-red-600" />
                                        </div>
                                        <span className="text-sm text-foreground">{flag}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}

        {/* Call to Action */}
        <section className="text-center py-16 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border border-emerald-200">
          <h2 className="text-3xl font-bold mb-4 text-slate-800">Need Expert Help?</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            This framework provides the foundation, but implementing these changes effectively requires experience. 
            Our team specializes in Google Ads optimization for e-commerce businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.open('https://calendly.com/managingseo-hammad/client-management-and-meetings', '_blank')}
              className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get Professional Audit & Management
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleDashboardClick}
              className="border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200"
            >
              Use Our Analysis Tool
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}