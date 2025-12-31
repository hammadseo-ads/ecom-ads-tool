
import  {Button}  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExternalLink, Mail, MessageSquare, Calendar } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <a href="https://ads.managingseo.com" className="block">
              <img 
                src="/lovable-uploads/051b9e52-0e07-481f-80e2-9769a32180b0.png" 
                alt="Ecom Ads by ManagingSEO" 
                className="h-12 w-auto"
              />
            </a>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get expert help with your Google Ads campaigns or reach out for collaboration opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form 
                action="https://formsubmit.co/mhammad@managingseo.com" 
                method="POST"
                className="space-y-6"
              >
                {/* Hidden FormSubmit.co fields */}
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value="https://ads.managingseo.com/contact-success" />
                <input type="hidden" name="_subject" value="New Contact Form Submission from Google Ads Insights" />
                
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your Name"
                    required
                    className="w-full"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your Email"
                    required
                    className="w-full"
                  />
                </div>

                {/* Reason Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <select
                    id="reason"
                    name="reason"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a Reason</option>
                    <option value="Google Ads Consultation">Google Ads Consultation</option>
                    <option value="Collaboration">Collaboration</option>
                    <option value="Technical Question">Technical Question</option>
                  </select>
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Your Message"
                    rows={5}
                    required
                    className="w-full"
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Book Consultation */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Book a Consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Schedule a one-on-one consultation to discuss your Google Ads strategy and optimization opportunities.
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => window.open('https://calendly.com/managingseo-hammad/client-management-and-meetings', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Book Consultation
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">mhammad@managingseo.com</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  We typically respond within 24 hours during business days.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
