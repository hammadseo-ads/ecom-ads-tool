
import { useNavigate } from 'react-router-dom';
import  {Button}  from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, Calendar, Sparkles } from "lucide-react";

const ContactSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
          {/* Success Animation Circle */}
          <CardHeader className="text-center pt-10 pb-6">
            <div className="mx-auto relative">
              <div className="absolute inset-0 animate-ping bg-emerald-200 dark:bg-emerald-800 rounded-full opacity-75"></div>
              <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Message Sent Successfully!
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8 pb-10 px-8">
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Thank you for reaching out! Your message has been received.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our team will review it and get back to you <strong className="text-emerald-600 dark:text-emerald-400">within 24 hours</strong> during business days.
              </p>
            </div>

            {/* Success Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>We'll reply soon!</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <Button
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                onClick={() => navigate('/')}
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all duration-300"
                onClick={() => window.open('https://calendly.com/managingseo-hammad/client-management-and-meetings', '_blank', 'noopener,noreferrer')}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book a Free Consultation
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                <strong>Ads Insight</strong> • Trusted by 500+ businesses in Pakistan
                <br />
                Average response time: <strong className="text-emerald-600">4 hours</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
          <div className="absolute top-32 right-20 w-3 h-3 bg-teal-400 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-20 left-32 w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-700"></div>
        </div>
      </div>
    </div>
  );
};

export default ContactSuccess;