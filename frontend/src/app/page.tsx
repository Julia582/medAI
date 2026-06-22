import { Navbar } from '@/components/layout/navbar';
import { AuthProvider } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stethoscope, Upload, MessageSquare, FileSearch, Shield, Brain } from 'lucide-react';

export default function HomePage() {
  return (
    <AuthProvider>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
    </AuthProvider>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-medical-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-100 dark:bg-medical-900/30 text-medical-700 dark:text-medical-400 text-sm font-medium mb-6">
            <Brain className="h-4 w-4" />
            Powered by Advanced AI
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your AI-Powered{' '}
            <span className="text-medical-600 dark:text-medical-400">Medical Assistant</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Upload medical documents, chat with an intelligent AI assistant, and get patient-friendly
            explanations, summaries, and risk detection insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-grid-medical-500/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Upload,
      title: 'Upload Medical Documents',
      description: 'Upload PDF, DOCX, or TXT medical reports, lab results, and patient records securely.',
    },
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Ask questions about your medical documents and get intelligent, context-aware answers.',
    },
    {
      icon: FileSearch,
      title: 'Smart Summarization',
      description: 'Automatically summarize medical reports and extract key findings and medications.',
    },
    {
      icon: Shield,
      title: 'Risk Detection',
      description: 'Identify abnormal values and potential health concerns from your medical documents.',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features to help you understand your medical documents better.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="relative p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-medical-500 dark:hover:border-medical-500 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-medical-100 dark:bg-medical-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-medical-600 dark:text-medical-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { number: '1', title: 'Create Account', description: 'Sign up securely with your email.' },
    { number: '2', title: 'Upload Documents', description: 'Upload your medical PDFs, DOCX, or TXT files.' },
    { number: '3', title: 'Chat with AI', description: 'Ask questions and get intelligent answers.' },
    { number: '4', title: 'Get Insights', description: 'Receive summaries, risk detection, and recommendations.' },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Get started in minutes with these simple steps.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 rounded-full bg-medical-100 dark:bg-medical-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-medical-600 dark:text-medical-400">{step.number}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-medical-600 to-medical-700 dark:from-medical-800 dark:to-medical-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Transform Your Medical Document Experience?
        </h2>
        <p className="text-lg text-medical-100 mb-8 max-w-2xl mx-auto">
          Join thousands of users who trust MedAI for their medical document analysis.
        </p>
        <Link href="/auth/register">
          <Button
            size="lg"
            className="bg-white text-medical-700 hover:bg-medical-50 text-base px-10"
          >
            <Stethoscope className="h-5 w-5 mr-2" />
            Start Free Trial
          </Button>
        </Link>
      </div>
    </section>
  );
}
