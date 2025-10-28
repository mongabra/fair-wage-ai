import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Target, Users, TrendingUp, Shield, Brain, Sparkles, Zap, Globe } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container py-12 md:py-16 neural-pattern">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Brain className="h-4 w-4 text-accent animate-pulse" />
              Powered by AI
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              About <span className="gradient-text">MalipoHaki</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Revolutionizing wage transparency through artificial intelligence
            </p>
          </div>

          <div className="mb-12 space-y-6">
            <Card className="glass-card p-6">
              <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Our Mission
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                MalipoHaki leverages cutting-edge <strong>artificial intelligence</strong> to promote 
                <strong> Decent Work and Economic Growth (SDG 8)</strong>. Our advanced neural networks 
                analyze thousands of wage data points in real-time, providing unprecedented transparency 
                in compensation decisions. We believe that AI-powered insights can bridge the wage gap 
                and create a more equitable economy for all.
              </p>
            </Card>

            <Card className="glass-card p-6">
              <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6 text-accent" />
                How AI Powers Our Platform
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our platform uses sophisticated machine learning algorithms to assess wage fairness:
                </p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Neural Network Analysis:</strong> Deep learning models process job roles, 
                    qualifications, and market data to generate accurate assessments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span><strong>Real-Time Market Intelligence:</strong> AI continuously monitors 
                    industry trends and cost-of-living data across regions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Predictive Analytics:</strong> Machine learning forecasts wage trends 
                    and identifies emerging compensation patterns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span><strong>Bias Detection:</strong> AI algorithms identify and flag potential 
                    wage discrimination across demographics</span>
                  </li>
                </ul>
                <p>
                  With confidence scores typically exceeding 90%, our AI provides reliable, 
                  actionable insights that empower both employers and employees.
                </p>
              </div>
            </Card>
          </div>

          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-center">
              AI-Enhanced <span className="gradient-text">Features</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card p-6 hover:glow-primary transition-all">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Intelligent Recommendations</h3>
                <p className="text-muted-foreground">
                  AI generates personalized compensation recommendations based on your unique profile 
                  and market dynamics.
                </p>
              </Card>

              <Card className="glass-card p-6 hover:glow-accent transition-all">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Transparent AI</h3>
                <p className="text-muted-foreground">
                  Every assessment includes confidence scores and explanations, ensuring transparency 
                  in our AI decision-making process.
                </p>
              </Card>

              <Card className="glass-card p-6 hover:glow-primary transition-all">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Collective Intelligence</h3>
                <p className="text-muted-foreground">
                  Our AI learns from thousands of assessments, continuously improving accuracy 
                  and fairness predictions.
                </p>
              </Card>

              <Card className="glass-card p-6 hover:glow-accent transition-all">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Support SDG 8</h3>
                <p className="text-muted-foreground">
                  AI-driven insights contribute to achieving Decent Work and Economic Growth 
                  for sustainable development.
                </p>
              </Card>
            </div>
          </div>

          <Card className="glass-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
            <div className="relative text-center">
              <Brain className="mx-auto mb-4 h-12 w-12 text-accent animate-pulse" />
              <h2 className="mb-4 text-2xl font-bold">Join the AI Revolution</h2>
              <p className="text-muted-foreground">
                Be part of a movement leveraging artificial intelligence to create fair, 
                transparent, and equitable workplaces for everyone. Our AI works tirelessly 
                to ensure every worker receives fair compensation.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
