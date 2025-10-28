import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scale, TrendingUp, Shield, Users } from "lucide-react";
import Navbar from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-secondary/50 px-4 py-2 text-sm font-medium text-secondary-foreground">
            <Shield className="h-4 w-4" />
            Promoting SDG 8: Decent Work & Economic Growth
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Empowering Fair Pay
            <span className="text-primary"> for All</span>
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Use AI-powered analysis to assess wage fairness and promote economic equity. 
            Make informed decisions with data-driven insights.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link to="/check">Check Wage Fairness</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">AI-Powered Analysis</h3>
            <p className="text-muted-foreground">
              Advanced machine learning models analyze wage data to determine fairness based on role, experience, and location.
            </p>
          </Card>

          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Market Insights</h3>
            <p className="text-muted-foreground">
              Compare wages against market standards with real-time data visualization and comprehensive reports.
            </p>
          </Card>

          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Promote Equity</h3>
            <p className="text-muted-foreground">
              Help employers and employees work together toward fair compensation and economic justice.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to assess wage fairness?
            </h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Join the movement for transparent and equitable compensation.
            </p>
            <Button asChild size="lg">
              <Link to="/check">Get Started Now</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Home;
