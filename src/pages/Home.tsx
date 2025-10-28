import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scale, TrendingUp, Shield, Users, Brain, Sparkles, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container relative py-24 md:py-32 neural-pattern">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium backdrop-blur-sm animate-fade-in">
            <Brain className="h-4 w-4 text-primary animate-pulse" />
            AI-Powered Wage Analysis
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in">
            Empowering Fair Pay
            <br />
            <span className="gradient-text">Through AI Intelligence</span>
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground md:text-xl animate-fade-in">
            Advanced machine learning analyzes market data in real-time to ensure 
            wage fairness and economic equity for all workers.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in">
            <Button asChild size="lg" className="glow-primary text-lg">
              <Link to="/check">
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze Your Wage
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass-card text-lg">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Floating AI Elements */}
        <div className="absolute left-1/4 top-1/4 h-32 w-32 animate-pulse rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-32 w-32 animate-pulse rounded-full bg-accent/5 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Next-Gen Wage <span className="gradient-text">Assessment</span>
          </h2>
          <p className="text-muted-foreground">
            Powered by cutting-edge AI and comprehensive market data
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="group glass-card p-6 transition-all hover:scale-105 hover:glow-primary">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">AI-Powered Analysis</h3>
            <p className="text-muted-foreground">
              Advanced neural networks analyze thousands of data points to determine 
              wage fairness with unprecedented accuracy.
            </p>
          </Card>

          <Card className="group glass-card p-6 transition-all hover:scale-105 hover:glow-accent">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Real-Time Insights</h3>
            <p className="text-muted-foreground">
              Get instant assessments with live market data and trend analysis 
              powered by cloud-based AI infrastructure.
            </p>
          </Card>

          <Card className="group glass-card p-6 transition-all hover:scale-105 hover:glow-primary">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Promote Equity</h3>
            <p className="text-muted-foreground">
              Support SDG 8 by ensuring fair compensation through transparent, 
              data-driven wage analysis and recommendations.
            </p>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-16 md:py-24">
        <Card className="glass-card p-8 md:p-12 neural-pattern">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold gradient-text">99%</div>
              <div className="text-sm text-muted-foreground">AI Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold gradient-text">15K+</div>
              <div className="text-sm text-muted-foreground">Assessments Completed</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold gradient-text">50+</div>
              <div className="text-sm text-muted-foreground">Industries Covered</div>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <Card className="relative overflow-hidden glass-card p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
          <div className="relative mx-auto max-w-2xl text-center">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-accent animate-pulse" />
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to assess wage fairness?
            </h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Join thousands using AI-powered insights for transparent compensation.
            </p>
            <Button asChild size="lg" className="glow-primary">
              <Link to="/auth">
                <Brain className="mr-2 h-5 w-5" />
                Get Started Now
              </Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Home;
