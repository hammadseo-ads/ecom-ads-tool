
// import React from 'react';
import { useNavigate } from "react-router-dom";
import SEO from '@/components/SEO';
import  {Button}  from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Database, Trash2, Lock } from "lucide-react";


const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Privacy Policy"
        description="Privacy policy for Ads Analysis by ManagingSEO — what data we collect, how we store it, and how to delete it."
        ogType="website"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Your data protection and privacy rights</p>
        </div>

        <div className="space-y-6">
          {/* Data Protection Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Shield className="w-5 h-5 mr-2" />
                Your Data is Protected
              </CardTitle>
              <CardDescription>
                We are committed to protecting your privacy and data security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  <strong>We respect your privacy.</strong> Your Google Ads data is processed securely and used only to provide you with performance insights and analytics.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Secure Storage</h4>
                    <p className="text-sm text-gray-600">All data is encrypted and stored securely using industry-standard protocols.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Database className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">No Third-Party Sharing</h4>
                    <p className="text-sm text-gray-600">We never share your data with third parties or use it for advertising.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Data We Collect */}
          <Card>
            <CardHeader>
              <CardTitle>What Data We Collect</CardTitle>
              <CardDescription>
                Information we gather to provide our services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Google Ads Performance Data:</strong> Campaign performance metrics, product data, and advertising statistics from your connected Google Ads accounts.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Account Information:</strong> Your email address and basic profile information for account management.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Usage Analytics:</strong> How you interact with our platform to improve our services (anonymized).
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Your Data */}
          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Data</CardTitle>
              <CardDescription>
                The purposes for which we process your information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Performance Analytics:</strong> Generate insights and reports about your Google Ads performance.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Service Improvement:</strong> Enhance our platform features and user experience.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Account Management:</strong> Manage your account access and provide customer support.
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trash2 className="w-5 h-5 mr-2" />
                Your Data Rights
              </CardTitle>
              <CardDescription>
                You have full control over your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Data Deletion</h4>
                  <p className="text-blue-800 text-sm mb-3">
                    You can request complete removal of your data from our systems at any time.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-blue-500 text-blue-700 hover:bg-blue-50"
                    onClick={() => navigate('/account')}
                  >
                    Manage Data in Account Settings
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Access Rights</h4>
                    <p className="text-sm text-gray-600">Request a copy of all data we have about you.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Correction Rights</h4>
                    <p className="text-sm text-gray-600">Update or correct any inaccurate personal information.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>
                Questions about our privacy practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> mhammad@managingseo.com<br />
                  <strong>Response Time:</strong> We aim to respond within 48 hours
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500 mt-8">
            Last updated: December 30, 2024
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
