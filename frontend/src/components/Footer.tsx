import React from 'react';
import { useNavigate } from 'react-router-dom';
import  {Button}  from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, FileText, ExternalLink, MessageSquare, Target } from "lucide-react";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <a href="https://ads.managingseo.com" className="block" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/lovable-uploads/051b9e52-0e07-481f-80e2-9769a32180b0.png" 
                  alt="Ecom Ads by ManagingSEO" 
                  className="h-14 w-auto"
                />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional analytics tool for optimizing Google Ads product performance and maximizing ROI.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>© 2025 ManagingSEO. All rights reserved.</span>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Legal</h4>
            <div className="space-y-2">
              <a 
                href="/terms" 
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Terms of Service
              </a>
              <a 
                href="/privacy" 
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shield className="w-4 h-4 mr-2" />
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Support</h4>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start"
                onClick={() => navigate('/contact')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Us
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-sm text-primary hover:text-primary/80 justify-start"
                onClick={() => window.open('https://calendly.com/managingseo-hammad/client-management-and-meetings', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Book Consultation
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Services</h4>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start"
                onClick={() => navigate('/google-ads-service')}
              >
                <Target className="w-4 h-4 mr-2" />
                Google Ads Service
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start"
                onClick={() => navigate('/google-ads-audit-guide')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Audit Guide
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground justify-start"
                onClick={() => navigate('/case-studies')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Case Studies
              </Button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Disclaimer</h4>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>
                This tool is independent and not affiliated with, endorsed by, or certified by Google LLC.
              </p>
              <p>
                Google Ads is a trademark of Google LLC.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-xs text-muted-foreground">
            Made with love for e-commerce businesses by ManagingSEO
          </div>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>Last updated: 17 August 2025</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Version 2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;