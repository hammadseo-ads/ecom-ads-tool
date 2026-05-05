import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { LayoutDashboard, User, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const PublicHeader = () => {
  const { user, cleanupAuthState } = useUser();
  // Authoritative auth state from our own JWT cookie (NOT Auth0 — we don't
  // actually use Auth0 for sessions). Keeping `logout` from Auth0 around for
  // the JS API even though we don't call it.
  const isAuthenticated = !!user;
  const { logout } = useAuth0();
  const { toast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGuidesDropdownOpen, setIsGuidesDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductGuidesOpen, setIsProductGuidesOpen] = useState(false);
  const [isCampaignGuidesOpen, setIsCampaignGuidesOpen] = useState(false);
  const isMobile = useIsMobile();

  const caseStudies = [
    {
      name: "MyGreenScape",
      industry: "Indoor Plants",
      result: "+368% Conv Value",
      link: "/portfolio/mygreen-scape"
    },
    {
      name: "PJ BOLD",
      industry: "Food-Grade Molds",
      result: "9.32x Sales Increase",
      link: "/portfolio/pj-bold"
    },
    {
      name: "Mathfel",
      industry: "Video Door Intercoms",
      result: "+114% Sales",
      link: "/portfolio/mathfel"
    }
  ];

  const productPerformanceGuides = [
    {
      name: "Profitable Products",
      description: "Scale your star-performing products",
      link: "/guides/profitable-products"
    },
    {
      name: "Costly Products",
      description: "Optimize budget-draining products",
      link: "/guides/costly-products"
    },
    {
      name: "Zero-Conversion Products",
      description: "Fix products with clicks but no conversions",
      link: "/guides/zero-conversion"
    },
    {
      name: "Zombie Products",
      description: "Reactivate low-visibility products",
      link: "/guides/zombie-products"
    }
  ];

  const googleAdsGuides = [
    {
      name: "Google Ads Audit Guide",
      description: "Complete audit framework for your ads",
      link: "/google-ads-audit-guide"
    },
    {
      name: "Product Title Optimization",
      description: "Optimize titles for better performance",
      link: "/product-title-optimization-guide"
    },
    {
      name: "Campaign Structure Guide",
      description: "Structure campaigns for maximum ROI",
      link: "/campaign-structure-guide"
    },
    {
      name: "Strategic Negative Keywords",
      description: "Master expert-level negative keyword strategy",
      link: "/strategic-negative-keywords-guide"
    },
    {
      name: "Simple Google Ads Sales Formula",
      description: "5-step formula to boost your Google Ads sales",
      link: "/simple-google-ads-sales-formula"
    },
    {
      name: "Ecommerce CRO Audit",
      description: "7-section manual checklist to audit your store",
      link: "/guides/ecommerce-cro-audit"
    },
    {
      name: "Negative Keywords & Titles",
      description: "Pull 30 days of data + run through Claude skill",
      link: "/guides/negative-keywords-and-titles"
    }
  ];

  const handleLogout = () => {
    cleanupAuthState();
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of your account.",
    });
  };

  return (
    <header className="bg-white backdrop-blur-sm border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="block">
              <img
                src="/lovable-uploads/051b9e52-0e07-481f-80e2-9769a32180b0.png"
                alt="Ecom Ads by ManagingSEO"
                className="h-12 sm:h-16 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center space-x-4">
              {/* Always-visible public nav (Case Studies / Analysis Tool / Guides)
                  — shown regardless of auth state. Auth-specific buttons (Dashboard
                  vs Sign In / Get Started) live in the conditional block below. */}
              <>
                  <div
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <Link to="/case-studies">
                      <Button variant="ghost" className="text-foreground hover:bg-muted transition-all duration-200 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left flex items-center">
                        Case Studies
                        <ChevronDown className="w-4 h-4 ml-1" />
                        
                      </Button>
                    </Link>

                    {/* Dropdown Menu — wrapper has top-full + pt-2 so the
                        visual 8px gap is part of the hoverable region (fixes
                        the "dropdown disappears when reaching for it" bug). */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 pt-2 z-50">
                      <Card className="w-80 bg-white border shadow-lg p-4">
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">Featured Case Studies</h3>
                          {caseStudies.map((study, index) => (
                            <Link key={index} to={study.link} className="block">
                              <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold text-sm">{study.name}</h4>
                                    <p className="text-xs text-muted-foreground">{study.industry}</p>
                                  </div>
                                  <span className="text-xs font-medium text-green-600">{study.result}</span>
                                </div>
                              </div>
                            </Link>
                          ))}
                          <Link to="/case-studies" className="block pt-2 border-t">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                              View All Case Studies →
                            </Button>
                          </Link>
                        </div>
                      </Card>
                      </div>
                    )}
                  </div>
                  <Link to="/ads-tool">
                    <Button variant="ghost" className="text-foreground hover:bg-muted transition-all duration-200 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                      Analysis Tool
                    </Button>
                  </Link>
                  <div
                    className="relative"
                    onMouseEnter={() => setIsGuidesDropdownOpen(true)}
                    onMouseLeave={() => setIsGuidesDropdownOpen(false)}
                  >
                    <Link to="/guides">
                      <Button variant="ghost" className="text-foreground hover:bg-muted transition-all duration-200 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left flex items-center">
                        Guides
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>

                    {/* Guides Mega Menu — wrapper provides hoverable bridge */}
                    {isGuidesDropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                      <Card className="w-[640px] max-w-[calc(100vw-2rem)] bg-white border shadow-xl p-4">
                        <div className="grid grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1">
                          {/* Product Performance Guides Column */}
                          <div>
                            <h3 className="text-xs font-semibold text-green-900 border-b border-primary/20 pb-2 mb-2 sticky top-0 bg-white">
                              Product Performance Guides
                            </h3>
                            <div className="space-y-1">
                              {productPerformanceGuides.map((guide, index) => (
                                <Link key={index} to={guide.link} className="block">
                                  <div className="p-2 rounded-md hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                                    <h4 className="font-semibold text-xs mb-0.5 leading-tight">{guide.name}</h4>
                                    <p className="text-[11px] text-muted-foreground leading-snug">{guide.description}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>

                          {/* Google Ads Guides Column */}
                          <div>
                            <h3 className="text-xs font-semibold text-green-600 border-b border-green-600/20 pb-2 mb-2 sticky top-0 bg-white">
                              Google Ads Guides
                            </h3>
                            <div className="space-y-1">
                              {googleAdsGuides.map((guide, index) => (
                                <Link key={index} to={guide.link} className="block">
                                  <div className="p-2 rounded-md hover:bg-muted/50 transition-colors duration-200 cursor-pointer">
                                    <h4 className="font-semibold text-xs mb-0.5 leading-tight">{guide.name}</h4>
                                    <p className="text-[11px] text-muted-foreground leading-snug">{guide.description}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <Link to="/guides">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                              View All Guides →
                            </Button>
                          </Link>
                        </div>
                      </Card>
                      </div>
                    )}
                  </div>
              </>

              {/* Auth-state buttons — Dashboard for logged-in users; Sign In / Get Started otherwise */}
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/account">
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="hover:bg-muted text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="border-primary/20 hover:bg-gray-100 transition-all duration-200">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" className="block">
                    <Button className="w-full bg-transparent bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-500 h-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:bg-muted"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && isMobileMenuOpen && (
          <div className="py-4 border-t space-y-3">
            {/* Always-visible public nav (matches desktop behavior) */}
            <>
                <Link to="/case-studies" className="block">
                  <Button variant="ghost" className="w-full justify-start text-left">
                    Case Studies
                  </Button>
                </Link>
                <Link to="/ads-tool" className="block">
                  <Button variant="ghost" className="w-full justify-start text-left">
                    Analysis Tool
                  </Button>
                </Link>
                <Link to="/guides" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-left font-semibold">
                    View All Guides
                  </Button>
                </Link>

                {/* Product Performance Guides - Collapsible */}
                <div className="mt-4">
                  <button
                    onClick={() => setIsProductGuidesOpen(!isProductGuidesOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-primary uppercase tracking-wide hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <span>Product Performance Guides</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProductGuidesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isProductGuidesOpen && (
                    <div className="space-y-1 mt-2">
                      {productPerformanceGuides.map((guide, index) => (
                        <Link key={index} to={guide.link} className="block" onClick={() => setIsMobileMenuOpen(false)}>
                          <div className="px-3 py-2 hover:bg-muted/50 rounded-lg transition-colors">
                            <div className="text-sm font-medium">{guide.name}</div>
                            <div className="text-xs text-muted-foreground">{guide.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campaign & Strategy Guides - Collapsible */}
                <div className="mt-2">
                  <button
                    onClick={() => setIsCampaignGuidesOpen(!isCampaignGuidesOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-emerald-600 uppercase tracking-wide hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <span>Campaign & Strategy Guides</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCampaignGuidesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isCampaignGuidesOpen && (
                    <div className="space-y-1 mt-2">
                      {googleAdsGuides.map((guide, index) => (
                        <Link key={index} to={guide.link} className="block" onClick={() => setIsMobileMenuOpen(false)}>
                          <div className="px-3 py-2 hover:bg-muted/50 rounded-lg transition-colors">
                            <div className="text-sm font-medium">{guide.name}</div>
                            <div className="text-xs text-muted-foreground">{guide.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
            </>

            {/* Auth-state buttons swap */}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 justify-start text-left">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/account" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-left text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="block">
                  <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" className="block">
                  <Button className="w-full bg-transparent bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-500">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;