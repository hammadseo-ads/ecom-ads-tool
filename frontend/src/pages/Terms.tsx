
// import React from 'react';
import { useNavigate } from "react-router-dom";
import SEO from '@/components/SEO';
import {Button}  from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Scale, Shield, Database, AlertTriangle, Mail } from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Terms of Service"
        description="Terms of service for Ecom Ads by ManagingSEO."
        ogType="website"
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Please read these terms carefully before using our service</p>
        </div>

        <div className="space-y-6">
          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-800">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Important Legal Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800">
                <strong>This document does not constitute legal advice.</strong> These Terms of Service contain common components 
                that should be reviewed with qualified legal counsel before implementation. Last updated: January 3, 2025.
              </p>
            </CardContent>
          </Card>

          {/* 1. Introduction and Acceptance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="w-5 h-5 mr-2 text-blue-600" />
                1. Introduction and Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Welcome to Google Ads Insights ("Service", "Tool", "Platform"). These Terms of Service ("Terms", "ToS") 
                constitute a legally binding agreement between you ("User", "Client", "You") and Managing SEO ("Company", "We", "Us").
              </p>
              <p className="text-gray-700">
                By accessing, browsing, using any part of this service, creating an account, or clicking "I agree", 
                you acknowledge that you have read, understood, and agree to be bound by these Terms.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">Age Requirement</p>
                <p className="text-blue-700 text-sm">
                  You must be at least 18 years old to use this service. By using the service, you represent and warrant 
                  that you meet this age requirement.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Description of Service */}
          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Google Ads Insights is a web-based analytical tool designed to help e-commerce businesses analyze and 
                optimize their Google Ads product performance. The service specializes in:
              </p>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Extracting, organizing, and aggregating granular data from Google Shopping and Performance Max campaigns
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Categorizing products into performance segments: Profitable, Costly, Zero-Conversion, Zombie, and Uncategorized
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Providing on-demand reporting with customizable date ranges, campaign filtering, and category sorting
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Offering data visualization, pagination, and CSV export functionality
                </li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Important Disclaimer</p>
                <p className="text-red-700 text-sm">
                  This tool provides analytical insights and is NOT a substitute for professional marketing, financial, 
                  or legal advice. All business decisions should be made in consultation with qualified professionals.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">Account creation requires providing a valid email address and secure password.</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Your Responsibilities:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Maintain confidentiality of your account credentials</li>
                  <li>• Take responsibility for all activities under your account</li>
                  <li>• Provide accurate, complete, and current information</li>
                  <li>• Notify us immediately of any unauthorized account use</li>
                </ul>
              </div>
              <p className="text-gray-700 text-sm">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in prohibited activities.
              </p>
            </CardContent>
          </Card>

          {/* 4. User Responsibilities and Prohibited Conduct */}
          <Card>
            <CardHeader>
              <CardTitle>4. User Responsibilities and Prohibited Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">You Must:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Comply with all applicable laws and regulations</li>
                    <li>• Follow all Google Ads policies and guidelines</li>
                    <li>• Use the service for legitimate business purposes only</li>
                    <li>• Respect other users' data and privacy</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">You Must Not:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Attempt unauthorized access to the service</li>
                    <li>• Reverse engineer or derive source code</li>
                    <li>• Interfere with service operation</li>
                    <li>• Use the service for illegal activities</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">Google Ads Compliance</p>
                <p className="text-blue-700 text-sm">
                  You must comply with all Google Ads policies, terms of service, and guidelines when using our 
                  integration features. Violations may result in service termination.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Google Ads Integration and Data Handling - MOST IMPORTANT */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <Database className="w-5 h-5 mr-2" />
                5. Google Ads Integration and Data Handling
              </CardTitle>
              <CardDescription className="text-green-600">
                This section is crucial - please read carefully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Connection Method</h4>
                  <p className="text-gray-700 text-sm">
                    Our tool connects to your Google Ads account via Google's OAuth 2.0 protocol, granting us specific, 
                    limited permissions (scopes) to access necessary data (e.g., https://www.googleapis.com/auth/adwords).
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Ownership</h4>
                  <p className="text-gray-700 text-sm">
                    <strong>You retain all ownership rights to your Google Ads data.</strong> Our tool acts solely as a 
                    processor of this data on your behalf for analytical purposes.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Our Data Usage</h4>
                  <p className="text-gray-700 text-sm">
                    We access and process your Google Ads data exclusively to provide analytics, reports, and insights 
                    within our application for your business use.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">What We Will NOT Do</h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    <li>• Sell, rent, or share your data with third parties for marketing</li>
                    <li>• Use your data for purposes other than providing our service</li>
                    <li>• Use your data for targeting outside your campaigns</li>
                    <li>• Access your data without your explicit consent</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Storage</h4>
                  <p className="text-gray-700 text-sm">
                    We store certain Google Ads performance data (aggregated product metrics, campaign details, account hierarchy) 
                    in our secure database to enable faster reporting, historical analysis, and on-demand retrieval.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Security</h4>
                  <p className="text-gray-700 text-sm">
                    We implement reasonable security measures including encryption and access controls to protect stored data. 
                    However, no system is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Reliance on Google Ads API</h4>
                  <p className="text-gray-700 text-sm">
                    Our tool's functionality depends entirely on the Google Ads API. Changes, deprecations, or policy 
                    updates by Google LLC may impact or discontinue features of our tool.
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-800 font-medium text-sm">
                    <strong>No Affiliation:</strong> Google Ads Insights is an independent tool and is not endorsed by, 
                    affiliated with, or certified by Google LLC.
                  </p>
                </div>

                <div>
                  <p className="text-blue-700 text-sm">
                    For detailed information about our data collection and privacy practices, please review our 
                    <Button variant="link" className="p-0 h-auto text-blue-700 underline" onClick={() => navigate('/privacy')}>
                      Privacy Policy
                    </Button>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Intellectual Property Rights */}
          <Card>
            <CardHeader>
              <CardTitle>6. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                The Google Ads Insights tool, including its software, code, design, content, trademarks, and other 
                intellectual property, is owned by Managing SEO.
              </p>
              <p className="text-gray-700">
                We grant you a limited, non-exclusive, non-transferable license to use the service for your own 
                internal business purposes, subject to these Terms.
              </p>
            </CardContent>
          </Card>

          {/* 7. Payment and Billing */}
          <Card>
            <CardHeader>
              <CardTitle>7. Payment and Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Current service is provided free of charge. If we introduce paid features in the future:
              </p>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li>• Pricing will be clearly displayed before purchase</li>
                <li>• Billing cycles and payment methods will be specified</li>
                <li>• Users will be notified of pricing changes with reasonable advance notice</li>
                <li>• Cancellation and refund policies will be clearly stated</li>
              </ul>
            </CardContent>
          </Card>

          {/* 8. Disclaimers of Warranties */}
          <Card>
            <CardHeader>
              <CardTitle>8. Disclaimers of Warranties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">Service Provided "AS IS"</p>
                <p className="text-yellow-700 text-sm mb-2">
                  The service is provided "as is" and "as available" without warranties of any kind, either express or implied.
                </p>
                <ul className="space-y-1 text-sm text-yellow-700">
                  <li>• No guarantee of uninterrupted, error-free, or secure operation</li>
                  <li>• No guarantee of data accuracy, completeness, or reliability</li>
                  <li>• No guarantee of specific marketing or business results</li>
                  <li>• Results depend on data provided by Google Ads API</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 9. Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Liability Limitations</p>
                <div className="space-y-2 text-sm text-red-700">
                  <p>
                    Managing SEO shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including:
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>• Loss of profits, revenue, or business opportunities</li>
                    <li>• Loss of data or goodwill</li>
                    <li>• Business interruption or system downtime</li>
                    <li>• Costs of substitute services or products</li>
                  </ul>
                  <p className="mt-2">
                    <strong>Total liability is limited to $100 or the amount paid by you in the last 12 months, whichever is greater.</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 10. Indemnification */}
          <Card>
            <CardHeader>
              <CardTitle>10. Indemnification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                You agree to indemnify, defend, and hold harmless Managing SEO from any claims, damages, losses, 
                liabilities, and expenses arising from:
              </p>
              <ul className="space-y-1 text-gray-700 ml-4 mt-2">
                <li>• Your use of the service</li>
                <li>• Violation of these Terms</li>
                <li>• Infringement of third-party rights</li>
                <li>• Violation of Google Ads policies or guidelines</li>
              </ul>
            </CardContent>
          </Card>

          {/* 11. Termination */}
          <Card>
            <CardHeader>
              <CardTitle>11. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Our Rights</h4>
                  <p className="text-sm text-gray-700">
                    We may suspend or terminate your account for violations of these Terms, with or without notice.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Your Rights</h4>
                  <p className="text-sm text-gray-700">
                    You may terminate your account at any time through your account settings.
                  </p>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                Upon termination, your access to stored data will cease. We may retain certain data as required by law 
                or for legitimate business purposes.
              </p>
            </CardContent>
          </Card>

          {/* 12. Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>12. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-2">
                We reserve the right to update these Terms at any time. Changes will be communicated through:
              </p>
              <ul className="space-y-1 text-gray-700 ml-4">
                <li>• Email notification to registered users</li>
                <li>• In-app notifications</li>
                <li>• Website banner announcements</li>
              </ul>
              <p className="text-gray-700 text-sm mt-2">
                Continued use of the service after changes constitutes acceptance of the updated Terms.
              </p>
            </CardContent>
          </Card>

          {/* 13. Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>13. Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-2">
                These Terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved through:
              </p>
              <ol className="space-y-1 text-gray-700 ml-4">
                <li>1. Good faith informal negotiation</li>
                <li>2. Mediation if negotiation fails</li>
                <li>3. Binding arbitration or court jurisdiction as applicable</li>
              </ol>
            </CardContent>
          </Card>

          {/* 14. Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                14. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                For questions regarding these Terms of Service or our service, please contact us:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Email:</strong> mhammad@managingseo.com<br />
                  <strong>Subject Line:</strong> Terms of Service Inquiry<br />
                  <strong>Response Time:</strong> We aim to respond within 48 hours
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 15. Privacy Policy Link */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Shield className="w-5 h-5 mr-2" />
                15. Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                For comprehensive information regarding our data collection, use, and disclosure practices, please review our Privacy Policy.
              </p>
              <Button 
                onClick={() => navigate('/privacy')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                View Privacy Policy
              </Button>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500 mt-8 pb-8">
            <p>These Terms of Service were last updated on January 3, 2025</p>
            <p className="mt-2">
              <strong>Document ID:</strong> TOS-GAI-2025-v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
