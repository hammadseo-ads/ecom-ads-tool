import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, X, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailVerificationBannerProps {
  onDismiss: () => void;
}

export function EmailVerificationBanner({ onDismiss }: EmailVerificationBannerProps) {
  const { loginWithRedirect, user } = useAuth0();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
          login_hint: user?.email,
          prompt: 'login'
        }
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className="border-yellow-200 bg-yellow-50 mb-4">
      <Mail className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="text-yellow-800">
          <strong>Email verification required:</strong> Please check your inbox (and spam folder) for a verification link.
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            {isResending ? (
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-1" />
            )}
            Resend Email
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-yellow-600 hover:bg-yellow-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}