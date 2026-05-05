import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import  {Button}  from "@/components/ui/button";
import { Card, CardContent,  CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, AlertTriangle, Search, Target,  BarChart3, CheckCircle, TrendingDown, Filter, Users, MapPin, Play } from "lucide-react";
import PublicHeader from '@/components/PublicHeader';

import SEO from '@/components/SEO';
const StrategicNegativeKeywordsGuide = () => {
  const navigate = useNavigate();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const keyFactors = [
    {
      icon: Target,
      title: "Keyword Match Type Issues",
      description: "Broad match keywords can trigger ads for loosely related searches, generating many irrelevant clicks.",
      examples: [
        'Keyword: "running shoes" (broad match)',
        'Unwanted triggers: "running away from problems", "shoes for running errands"',
        'Root cause: Overly broad match type without proper negative coverage'
      ]
    },
    {
      icon: AlertTriangle,
      title: "Wrong or Poorly Chosen Keywords",
      description: "Fundamentally incorrect keywords in your account attract the wrong audience.",
      examples: [
        'Selling premium products but using keyword: "cheap laptops"',
        'Offering B2B services but targeting: "personal finance tips"',
        'Root cause: Misalignment between business offering and keyword selection'
      ]
    },
    {
      icon: Users,
      title: "Incomplete Competitor Blocking",
      description: "Users searching for competitors waste your ad spend and have low conversion probability.",
      examples: [
        'Your business: "DataTech Solutions"',
        'Competitor searches: "Microsoft Azure", "Amazon AWS", "Google Cloud"',
        'Root cause: Haven\'t identified and blocked all major competitors'
      ]
    },
    {
      icon: Search,
      title: "Product/Service Misalignment",
      description: "Keywords that sound relevant but attract users looking for different products/services.",
      examples: [
        'You sell: Software licenses',
        'Keyword: "office software"',
        'Unwanted searches: "free office software", "office software training"'
      ]
    },
    {
      icon: MapPin,
      title: "Geographic Misalignment",
      description: "Attracting users from locations you don't serve.",
      examples: [
        'You serve: New York only',
        'Unwanted searches: "plumber Los Angeles", "NYC plumber moving to California"',
        'Root cause: Insufficient geographic targeting'
      ]
    },
    {
      icon: TrendingDown,
      title: "Intent Misalignment",
      description: "Attracting users in different stages of the buying funnel.",
      examples: [
        'You sell: Enterprise software (high-ticket B2B)',
        'Unwanted searches: "how to use", "free tutorial", "student discount"',
        'Root cause: Not blocking informational/educational intent keywords'
      ]
    }
  ];

  const analyzeSteps = [
    {
      letter: "A",
      title: "Assess Current Performance",
      icon: BarChart3,
      content: "Go to Google Ads Reports Editor > create a Search Term report and include the Keyword column along with Search Term, Impressions, Clicks, Cost, and Conversions. Export the last 30 days of data, then sort by Cost (highest first) to identify expensive irrelevant terms.",
      tool: "Google Ads Reports Editor > Search Terms Report"
    },
    {
      letter: "N",
      title: "Navigate to Root Causes",
      icon: Search,
      content: "For each negative keyword candidate, identify which keyword triggered this search term, why it triggered, and what category it belongs to (competitor, wrong product/service, wrong intent, etc.).",
      tool: "Check 'Keyword' column in Search Terms Report"
    },
    {
      letter: "A",
      title: "Analyze Patterns and Group",
      icon: Filter,
      content: "Group similar irrelevant terms together. Identify themes (competitors, free seekers, wrong locations, etc.). Look for keyword families that generate multiple negative terms.",
      tool: "Pattern Recognition and Categorization"
    },
    {
      letter: "L",
      title: "Layer Your Negative Strategy",
      icon: Target,
      content: "Implement campaign-level negatives for broad themes, ad group-level negatives for product-specific terms. Use appropriate match types: exact for specific brands, phrase for instructional content, broad for general concepts.",
      tool: "Strategic Implementation Framework"
    },
    {
      letter: "Y",
      title: "Yield Optimization Through Testing",
      icon: TrendingDown,
      content: "Week 1-2: Implement high-impact negatives. Week 3-4: Monitor and refine. Week 5+: Systematic weekly review and monthly performance assessment.",
      tool: "Continuous Optimization Process"
    },
    {
      letter: "Z",
      title: "Zero In on Advanced Tactics",
      icon: Shield,
      content: "Preemptive negative research, competitor intelligence, seasonal/temporal negatives. Use Google Keyword Planner to research potential irrelevant variations before they cost money.",
      tool: "Advanced Strategy Implementation"
    }
  ];

  const matchTypes = [
    {
      type: "Exact Match Negatives",
      syntax: "[keyword]",
      description: "Blocks only the exact phrase - Most restrictive",
      use: "Specific competitor names, exact phrases you never want"
    },
    {
      type: "Phrase Match Negatives", 
      syntax: '"keyword"',
      description: "Blocks the phrase in any order with additional words - Moderate restriction",
      use: "Product categories you don't offer, service types you avoid"
    },
    {
      type: "Broad Match Negatives",
      syntax: "keyword",
      description: "Blocks variations, synonyms, and related terms - Least restrictive but widest coverage",
      use: "General themes, concepts, or topics you want to avoid"
    }
  ];

  const qualityChecklist = [
    "Confirmed it has 0 conversions over meaningful time period",
    "Identified the root cause keyword that triggered it",
    "Chosen appropriate match type for the negative",
    "Considered if this might block relevant traffic",
    "Determined correct level (campaign vs. ad group)"
  ];

  const monthlyReview = [
    "Analyze new search terms for negative opportunities",
    "Review negative keyword performance (ensure they're triggering)",
    "Check for over-blocking (declining impression share without obvious cause)",
    "Update competitor lists and industry changes",
    "Document learnings for future campaigns"
  ];

  const mistakes = [
    {
      title: "Adding Negatives Without Root Cause Analysis",
      wrong: 'See "cheap shoes" → Add as negative',
      right: 'See "cheap shoes" → Check which keyword triggered it → Adjust source keyword or match type'
    },
    {
      title: "Incorrect Match Type Selection",
      wrong: 'Adding "free" as exact match (only blocks exactly "free")',
      right: 'Adding "free" as broad match (blocks "free trial", "for free", etc.)'
    },
    {
      title: "Over-Blocking with Broad Match Negatives",
      wrong: 'Adding "software" as broad match negative for a software company',
      right: 'Adding specific types like "free software" or "software training"'
    },
    {
      title: "Not Considering Keyword Hierarchy",
      wrong: "Adding same negatives at campaign and ad group level",
      right: "Strategic placement based on scope and relevance"
    }
  ];

  return (
    <>
      <PublicHeader />
      <SEO
        title="Strategic Negative Keywords, Expert-Level Tactics"
        description="Master expert-level negative-keyword strategy for Search, Shopping, and Performance Max, beyond the obvious junk-query lists."
        ogType="article"
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section with Interactive Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-emerald-600 to-primary">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-emerald-600/20 to-primary/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,theme(colors.emerald.500/20),transparent_50%)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,theme(colors.primary/30),transparent_50%)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,theme(colors.emerald.400/10),transparent_50%)] animate-pulse"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-8 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="text-center text-white">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">Strategic Negative Keywords</h1>
              </div>
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Master expert-level negative keyword strategy that goes beyond blocking unwanted terms. 
                Understand root causes and implement systematic solutions that prevent future issues.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Introduction */}
          <Card className="mb-12 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Shield className="w-6 h-6 mr-3 text-primary" />
                Beyond Basic Blocking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Negative keyword targeting goes beyond simply blocking unwanted search terms. Expert-level negative keyword 
                strategy requires understanding the <strong>root causes</strong> that generate irrelevant traffic and implementing 
                systematic solutions that prevent future issues.
              </p>
            </CardContent>
          </Card>

          {/* Video Section */}
          <div className="mb-12">
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
                            Master Strategic Negative Keywords
                          </h3>
                          <p className="text-white/90 text-sm">
                            Watch this comprehensive guide to implementing expert-level negative keyword strategies
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
                        src="https://www.youtube.com/embed/DZANrV8Z4GY?si=yKWyRVW5cg2QE11M&autoplay=1"
                        title="Strategic Negative Keywords Guide"
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

          {/* Key Factors Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-primary mb-8">Part 1: Key Factors That Generate Negative Keywords</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {keyFactors.map((factor, index) => (
                <Card key={index} className="border-l-4 border-primary hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <CardTitle className="flex items-center text-primary">
                      <factor.icon className="w-5 h-5 mr-3" />
                      {factor.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{factor.description}</p>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">Examples:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {factor.examples.map((example, i) => (
                          <li key={i}>• {example}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Match Type Strategy */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-primary mb-8">Part 2: Keyword Hierarchy and Match Type Strategy</h2>
            
            <Card className="mb-8 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl">Understanding the Hierarchy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-primary">Campaign Level Negatives</div>
                    <div className="text-2xl text-primary">↓</div>
                    <div className="text-lg font-semibold text-emerald-600">Ad Group Level Negatives</div>
                    <div className="text-2xl text-emerald-600">↓</div>
                    <div className="text-lg font-semibold text-muted-foreground">Keyword Level Competition</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {matchTypes.map((type, index) => (
                <Card key={index} className="border-l-4 border-emerald-500 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-emerald-600">{type.type}</span>
                      <code className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-sm">{type.syntax}</code>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">{type.description}</p>
                    <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-lg p-3">
                      <span className="font-semibold text-emerald-700">Use for: </span>
                      <span className="text-emerald-600">{type.use}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ANALYZE Framework */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-primary mb-8">Part 3: The ANALYZE Framework - Step-by-Step Formula</h2>
            
            <div className="space-y-8">
              {analyzeSteps.map((step, index) => (
                <Card key={index} className="border-l-4 border-primary hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4 text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                        {step.letter}
                      </div>
                      <div>
                        <div className="text-primary text-xl">{step.title}</div>
                        <div className="flex items-center mt-1">
                          <step.icon className="w-4 h-4 mr-2 text-emerald-600" />
                          <span className="text-sm text-emerald-600">{step.tool}</span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{step.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quality Control */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-primary mb-8">Part 4: Quality Control Checklist</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-primary" />
                    Before Adding Any Negative Keyword
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {qualityChecklist.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-emerald-600 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
                    Monthly Review Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyReview.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-3 mt-0.5 text-emerald-600 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-primary mb-8">Part 5: Common Mistakes to Avoid</h2>
            
            <div className="space-y-6">
              {mistakes.map((mistake, index) => (
                <Card key={index} className="border-l-4 border-red-500 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-red-600">{mistake.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-4">
                        <h4 className="font-semibold text-red-700 mb-2">❌ Wrong:</h4>
                        <p className="text-red-600 text-sm">{mistake.wrong}</p>
                      </div>
                      <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-lg p-4">
                        <h4 className="font-semibold text-emerald-700 mb-2">✅ Right:</h4>
                        <p className="text-emerald-600 text-sm">{mistake.right}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Conclusion */}
          <Card className="text-center bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/20 mb-8 hover:shadow-lg transition-all duration-300">
            <CardContent className="py-12">
              <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h3 className="text-2xl font-bold text-primary mb-4">Master Strategic Negative Keywords</h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                Effective negative keyword strategy requires systematic analysis of root causes rather than reactive blocking 
                of individual terms. By following the ANALYZE framework and understanding the underlying factors that generate 
                irrelevant traffic, you can create a sustainable negative keyword strategy that improves campaign performance 
                while preventing future wastage.
              </p>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
                <p className="text-primary font-semibold text-lg">
                  Remember: Every negative keyword should solve a root cause problem, not just treat a symptom.
                </p>
              </div>
              <Button 
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Apply These Strategies
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default StrategicNegativeKeywordsGuide;