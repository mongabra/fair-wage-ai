import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Target, Users, TrendingUp, Shield } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">About MalipoHaki</h1>
            <p className="text-lg text-muted-foreground">
              Promoting transparency and equity in wages through AI-powered insights
            </p>
          </div>

          <div className="mb-12 space-y-6">
            <Card className="p-6">
              <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                MalipoHaki is dedicated to promoting <strong>Decent Work and Economic Growth (SDG 8)</strong> by 
                providing transparent, AI-powered wage fairness assessments. We believe that fair compensation 
                is fundamental to economic justice and human dignity. Our platform empowers both employers and 
                employees with data-driven insights to make informed decisions about compensation.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-2xl font-bold">How It Works</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our AI-powered analysis considers multiple factors to assess wage fairness:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Job role and responsibilities</li>
                  <li>Education level and qualifications</li>
                  <li>Years of professional experience</li>
                  <li>Geographic location and cost of living</li>
                  <li>Industry standards and market trends</li>
                </ul>
                <p>
                  Using machine learning models trained on comprehensive wage data, MalipoHaki provides 
                  accurate assessments with high confidence levels, helping identify wage disparities and 
                  promote equitable compensation practices.
                </p>
              </div>
            </Card>
          </div>

          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-center">Why MalipoHaki?</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Data-Driven Decisions</h3>
                <p className="text-muted-foreground">
                  Make informed compensation decisions based on market data and AI analysis rather than guesswork.
                </p>
              </Card>

              <Card className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Promote Transparency</h3>
                <p className="text-muted-foreground">
                  Foster open conversations about compensation and build trust between employers and employees.
                </p>
              </Card>

              <Card className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Economic Equity</h3>
                <p className="text-muted-foreground">
                  Contribute to a more equitable economy by identifying and addressing wage disparities.
                </p>
              </Card>

              <Card className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Support SDG 8</h3>
                <p className="text-muted-foreground">
                  Actively contribute to achieving Decent Work and Economic Growth for all.
                </p>
              </Card>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8">
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold">Join the Movement</h2>
              <p className="text-muted-foreground">
                Together, we can create a more transparent and equitable workplace for everyone. 
                Start assessing wage fairness today and be part of the solution.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
