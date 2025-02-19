'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, LayoutDashboard } from 'lucide-react';
import axios from "axios";
import { cn } from '@/lib/utils';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'; 
 
// Types
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormMessage {
  type: string;
  content: string;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Section1Props {
  onStartChatting: () => void;
  isSignedIn?: boolean;
}

// SVG Component
function ToolRecommendationLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 5L21 3V19L14 21V5Z"
        fill="#4A5568"
        stroke="#2D3748"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 5L10 3V19L3 21V5Z"
        fill="#4A5568"
        stroke="#2D3748"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12H21"
        stroke="#2D3748"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="9" r="1" fill="#2D3748" />
      <circle cx="17" cy="15" r="1" fill="#2D3748" />
    </svg>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className={cn(
      "bg-white p-8 rounded-xl",
      "transform transition-all duration-500",
      "hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]",
      "hover:-translate-y-2",
      "border border-gray-100",
      "relative group",
      "overflow-hidden",
      "shadow-xl"
    )}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-blue-50 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 
                    bg-[linear-gradient(45deg,transparent_25%,rgba(68,_147,_224,_0.5)_50%,transparent_75%)]
                    bg-[length:200%_200%] group-hover:bg-[position:100%_100%]
                    transition-all duration-1000" />
      
      {/* Content container */}
      <div className="relative z-10">
        {/* Icon with floating animation */}
        <div className={cn(
          "text-blue-600 mb-6",
          "transform transition-all duration-500",
          "group-hover:scale-110",
          "animate-float"
        )}>
          {icon}
        </div>

        {/* Title with color transition */}
        <h3 className={cn(
          "text-gray-900 text-xl font-bold mb-4",
          "transition-colors duration-300",
          "group-hover:text-blue-600"
        )}>
          {title}
        </h3>

        {/* Description with subtle animation */}
        <p className={cn(
          "text-gray-600",
          "transition-colors duration-300",
          "group-hover:text-gray-800"
        )}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Section1({ onStartChatting, isSignedIn }: Section1Props) {
  console.log('isSignedIn:', isSignedIn);
  
  // Add this useEffect for debugging
  useEffect(() => {
    console.log('Clerk environment:', {
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    });
  }, []);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<FormMessage>({ type: '', content: '' });
  const [displayText, setDisplayText] = useState("");
  const fullText = "Welcome to Bent's Woodworking Assistant";
  
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50); // Adjust typing speed here (milliseconds)

    return () => clearInterval(typingInterval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage({ type: '', content: '' });

    try {
      const response = await axios.post('https://bents-backend-server.vercel.app/contact', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setFormMessage({ type: 'success', content: response.data.message });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setFormMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'An error occurred while submitting the form. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [heroHeight, setHeroHeight] = useState("100vh");

  // Add animation effect when component mounts
  useEffect(() => {
    // Start with full height
    setHeroHeight("100vh");
    
    // After a small delay, animate to the target height
    const timer = setTimeout(() => {
      setHeroHeight("calc(50vh - 4rem)");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Add new state for animation
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target); // Stop observing once animation is triggered
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-black text-white">
        <div 
          className="container mx-auto px-4 py-16 flex flex-col items-center text-center"
          style={{
            minHeight: heroHeight,
            transition: "min-height 1s ease-in-out",
          }}
        >
          <div className="flex flex-col items-center justify-center h-full"
               style={{
                 opacity: heroHeight === "100vh" ? 0 : 1,
                 transform: `translateY(${heroHeight === "100vh" ? "20px" : "0"})`,
                 transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
               }}>
            <h1 className="text-[rgba(23,155,215,255)] text-3xl md:text-4xl lg:text-4xl font-bold mb-6">
              {displayText}
              <span className="animate-blink">|</span>
            </h1>
            <p className="text-white text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl">
              Your AI-powered companion for all things woodworking. Get expert advice, tool recommendations, and shop improvement tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button 
                    className={cn(
                      "inline-block bg-[rgba(23,155,215,255)] text-black font-semibold",
                      "py-3 px-6 w-full sm:w-48 rounded-[8px]",
                      "touch-manipulation",
                      "hover:bg-[rgba(20,139,193,255)] active:bg-[rgba(18,125,174,255)]",
                      "transform transition-all duration-300 ease-in-out",
                      "hover:scale-105 active:scale-95",
                      "hover:shadow-lg active:shadow-inner",
                      "relative overflow-hidden group",
                      "hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50",
                      "before:absolute before:inset-0",
                      "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
                      "before:translate-x-[-200%] before:transition-transform before:duration-700",
                      "hover:before:translate-x-[200%]",
                      "tap-highlight-transparent",
                      "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    )}
                  >
                    <span className="relative z-10">Sign In/Up to Chat</span>
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <button 
                  onClick={onStartChatting}
                  className={cn(
                    "inline-block bg-[rgba(23,155,215,255)] text-black font-semibold",
                    "py-3 px-6 w-full sm:w-48 rounded-[8px]",
                    "touch-manipulation",
                    "hover:bg-[rgba(20,139,193,255)] active:bg-[rgba(18,125,174,255)]",
                    "transform transition-all duration-300 ease-in-out",
                    "hover:scale-105 active:scale-95",
                    "hover:shadow-lg active:shadow-inner",
                    "relative overflow-hidden group",
                    "hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50",
                    "before:absolute before:inset-0",
                    "before:bg-gradient-to-r before:from-transparent before:via-white/90 before:to-transparent",
                    "before:translate-x-[-200%] before:transition-transform before:duration-700",
                    "hover:before:translate-x-[200%]",
                    "tap-highlight-transparent",
                    "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                  )}
                >
                  <span className="relative z-10">Start Chatting</span>
                </button>
              </SignedIn>

              <Link 
                href="/shop" 
                className={cn(
                  "inline-block bg-black text-white font-semibold",
                  "py-3 px-6 w-full sm:w-48 rounded-[8px]",
                  "border-2 border-white",
                  "touch-manipulation",
                  " hover:text-white active:bg-gray-100",
                  "transform transition-all duration-300 ease-in-out",
                  "hover:scale-105 active:scale-95",
                  "hover:shadow-lg active:shadow-inner",
                  "relative overflow-hidden group",
                  "hover:ring-2 hover:ring-white hover:ring-opacity-50",
                  "before:absolute before:inset-0",
                  "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
                  "before:translate-x-[-200%] before:transition-transform before:duration-700",
                  "hover:before:translate-x-[200%]",
                  "tap-highlight-transparent",
                  "focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                )}
              >
                <span className="relative z-10">Shop Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-black text-3xl md:text-4xl font-bold mb-12 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MessageSquare size={40} />}
              title="Expert Advice"
              description="Get instant answers to your woodworking questions from our AI assistant."
            />
            <FeatureCard 
              icon={<ToolRecommendationLogo className="w-10 h-10" />}
              title="Tool Recommendations"
              description="Discover the best tools for your projects with personalized suggestions."
            />
            <FeatureCard 
              icon={<LayoutDashboard size={40} />}
              title="Shop Improvement"
              description="Learn how to optimize your workspace for better efficiency and safety."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section 
        ref={sectionRef}
        className="bg-gray-200 py-16 overflow-hidden md:p-10"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div 
              className={`lg:w-1/2 lg:pr-8 mb-8 lg:mb-0 transform transition-all duration-700
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}
            >
              <h2 className="text-black text-3xl md:text-4xl font-bold mb-6">
                About Bent's Woodworking Assistant
              </h2>
              <p className={`text-black text-lg leading-relaxed transition-all duration-700 delay-200
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}
              >
                Bent's Woodworking Assistant is an AI-powered tool designed to help woodworkers of all skill levels. Whether you're a beginner looking for guidance or an experienced craftsman seeking to optimize your workflow, our assistant is here to help.
              </p>
              <p className={`text-black text-lg leading-relaxed mt-4 transition-all duration-700 delay-400
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}
              >
                With a vast knowledge base covering techniques, tools, and shop management, we're your go-to resource for all things woodworking.
              </p>
            </div>
            <div 
              className={`lg:w-1/2 transform transition-all duration-700
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}
            >
              <div className="relative overflow-hidden rounded-[8px] transition-all duration-300">
                <Image
                  src="/bents-image.jpg"
                  alt="Woodworking Workshop"
                  width={600}
                  height={400}
                  className="rounded-[8px] transform transition-all duration-500 hover:scale-105"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative bg-gradient-to-br from-[rgba(23,155,215,0.9)] to-[rgba(23,155,215,0.7)] py-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-white/10 rounded-full mix-blend-overlay animate-float-slow"></div>
          <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-white/10 rounded-full mix-blend-overlay animate-float-delayed"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info Side */}
              <div className="bg-black p-8 text-white transform transition-all duration-500 hover:scale-[1.02]">
                <h2 className="text-3xl font-bold mb-6 text-[rgba(23,155,215,255)]">Let's Connect</h2>
                <p className="mb-8 text-gray-300">
                  Have questions about woodworking? Want to learn more about our services? Drop us a message!
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-[rgba(23,155,215,255)]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white">bentswoodworking@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-4 text-[rgba(23,155,215,255)]">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    <a href="https://discord.gg/YsscHYyx" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="text-white hover:text-[rgba(23,155,215,255)] transition-colors duration-300">
                      Join our Discord Community
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form Side */}
              <div className="p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="group">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-b-2 border-gray-200 focus:border-[rgba(23,155,215,255)] 
                               transition-all duration-300 outline-none rounded-t-lg group-hover:bg-gray-100"
                      placeholder="Your Name"
                      required
                    />
                  </div>

                  <div className="group">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-b-2 border-gray-200 focus:border-[rgba(23,155,215,255)]
                               transition-all duration-300 outline-none rounded-t-lg group-hover:bg-gray-100"
                      placeholder="Your Email"
                      required
                    />
                  </div>

                  <div className="group">
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-b-2 border-gray-200 focus:border-[rgba(23,155,215,255)]
                               transition-all duration-300 outline-none rounded-t-lg group-hover:bg-gray-100"
                      placeholder="Subject"
                      required
                    />
                  </div>

                  <div className="group">
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border-b-2 border-gray-200 focus:border-[rgba(23,155,215,255)]
                               transition-all duration-300 outline-none rounded-t-lg group-hover:bg-gray-100 resize-none"
                      placeholder="Your Message"
                      required
                    ></textarea>
                  </div>

                  {formMessage.content && (
                    <div className={`p-4 rounded-lg transform transition-all duration-300 ${
                      formMessage.type === 'success' 
                        ? 'bg-green-50 text-green-700 border-l-4 border-green-500' 
                        : 'bg-red-50 text-red-700 border-l-4 border-red-500'
                    }`}>
                      {formMessage.content}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white font-semibold py-3 px-6 rounded-lg
                             transform transition-all duration-300
                             hover:bg-[rgba(23,155,215,255)] hover:scale-[1.02]
                             disabled:opacity-70 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-2 focus:ring-[rgba(23,155,215,255)] focus:ring-opacity-50
                             shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
