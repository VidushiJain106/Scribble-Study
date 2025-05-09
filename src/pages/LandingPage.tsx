import React from 'react';
import { Button } from "@/components/ui/button";
import { PenLine, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEnterApp = () => {
    // If user is logged in, redirect to app, otherwise redirect to auth
    if (user) {
      console.log("User is logged in, redirecting to app");
      navigate('/app');
    } else {
      console.log("User is not logged in, redirecting to auth");
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-3xl w-full text-center space-y-6">
        <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
          <PenLine className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-brand-600">StudyBuddy</h1>
        
        <p className="text-xl text-muted-foreground max-w-prose mx-auto">
          Your intelligent note-taking companion. Take notes, organize your thoughts, and boost your productivity all in one place.
        </p>
        
        <div className="pt-6">
          <Button 
            onClick={handleEnterApp}
            size="lg" 
            className="text-lg px-8 py-6 rounded-full"
          >
            Enter App <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-background rounded-lg p-6 shadow-sm border">
            <h3 className="font-medium text-lg mb-2">Intelligent Notes</h3>
            <p className="text-muted-foreground">Create, organize and access your notes from anywhere with AI-powered insights.</p>
          </div>
          
          <div className="bg-background rounded-lg p-6 shadow-sm border">
            <h3 className="font-medium text-lg mb-2">Document Analysis</h3>
            <p className="text-muted-foreground">Upload documents and get instant summaries and key insights.</p>
          </div>
          
          <div className="bg-background rounded-lg p-6 shadow-sm border">
            <h3 className="font-medium text-lg mb-2">Study Assistant</h3>
            <p className="text-muted-foreground">Use the exam prep feature to help you prepare for tests and exams.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
