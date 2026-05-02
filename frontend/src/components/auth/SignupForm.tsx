// src/components/auth/SignupForm.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../../hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const API_URL = import.meta.env.VITE_API_AUTH_URL || "http://localhost:5000/api/auth";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    const googleAuthUrl = `${API_URL}/google`;
    window.location.href = googleAuthUrl;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { username, email, password, confirmPassword } = formData;

    // Validation
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        credentials: 'include', // Sends HttpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message.includes("already exists")) {
          toast({
            title: "Account exists",
            description: "This email or username is already taken. Try logging in.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.message || "Signup failed");
        }
        return;
      }

      toast({
        title: "Account created!",
        description: `Welcome ${username}! You're now logged in.`,
      });

      // Direct redirect to dashboard
      navigate('/dashboard', { replace: true });

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-4">
            <span className="text-4xl text-white font-bold">A</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Join Ads Insight and unlock powerful Google Ads analytics
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-12 font-medium" 
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="mr-3 h-5 w-5" /> Continue with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="ahmadking"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-medium">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 pt-4">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
            >
              Sign in here
            </Link>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline hover:text-gray-700">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;