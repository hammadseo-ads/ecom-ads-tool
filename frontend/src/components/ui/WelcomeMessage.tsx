import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

interface WelcomeMessageProps {
  onShown: () => void;
}

export function WelcomeMessage({ onShown }: WelcomeMessageProps) {
  const { toast } = useToast();

  useEffect(() => {
    // Show welcome toast message
    toast({
      title: "Welcome to Google Ads Insights!",
      description: "Let's get you started with connecting your Google Ads account to unlock powerful insights.",
      duration: 8000,
      className: "border-green-200 bg-green-50",
    });

    // Mark as shown
    onShown();
  }, [toast, onShown]);

  return null;
}