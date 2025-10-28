import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Brain, TrendingUp, Users, Sparkles } from "lucide-react";

const Dashboard = () => {
  // Sample data
  const wageDistribution = [
    { category: "Below Market", count: 45, percentage: 30 },
    { category: "Fair Wage", count: 75, percentage: 50 },
    { category: "Above Market", count: 30, percentage: 20 },
  ];

  const industryData = [
    { industry: "Tech", avgWage: 85000 },
    { industry: "Healthcare", avgWage: 65000 },
    { industry: "Education", avgWage: 45000 },
    { industry: "Finance", avgWage: 95000 },
    { industry: "Retail", avgWage: 35000 },
  ];

  const COLORS = ["#ef4444", "#2ecc71", "#a78bfa"];

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Navbar />
        
        <div className="container py-12 md:py-16 neural-pattern">
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Brain className="h-4 w-4 text-accent animate-pulse" />
              AI-Powered Analytics
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              Wage Fairness <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Real-time insights and trends powered by machine learning
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="glass-card p-6 hover:glow-primary transition-all">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium text-muted-foreground">Total Assessments</h3>
              </div>
              <p className="text-3xl font-bold">15,234</p>
              <p className="text-sm text-muted-foreground mt-1">+23% from last month</p>
            </Card>

            <Card className="glass-card p-6 hover:glow-primary transition-all">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium text-muted-foreground">Fair Wages</h3>
              </div>
              <p className="text-3xl font-bold text-primary">52%</p>
              <p className="text-sm text-muted-foreground mt-1">7,921 assessments</p>
            </Card>

            <Card className="glass-card p-6 hover:glow-accent transition-all">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-medium text-muted-foreground">AI Confidence</h3>
              </div>
              <p className="text-3xl font-bold text-accent">94%</p>
              <p className="text-sm text-muted-foreground mt-1">High accuracy rate</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Wage Fairness Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={wageDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {wageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Average Wage by Industry
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={industryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="industry" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="avgWage" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="glass-card p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent animate-pulse" />
              AI-Generated Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-lg border border-border/50 bg-muted/20 p-4 transition-all hover:bg-muted/30">
                <div className="h-2 w-2 mt-2 rounded-full bg-primary animate-pulse" />
                <div>
                  <p className="font-medium">Tech Sector Leading in Fair Compensation</p>
                  <p className="text-sm text-muted-foreground">
                    89% of tech positions show fair or above-market wages, driven by high demand
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border border-border/50 bg-muted/20 p-4 transition-all hover:bg-muted/30">
                <div className="h-2 w-2 mt-2 rounded-full bg-destructive animate-pulse" />
                <div>
                  <p className="font-medium">Retail Sector Requires Attention</p>
                  <p className="text-sm text-muted-foreground">
                    63% of retail positions are below market average, suggesting wage gap issues
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border border-border/50 bg-muted/20 p-4 transition-all hover:bg-muted/30">
                <div className="h-2 w-2 mt-2 rounded-full bg-accent animate-pulse" />
                <div>
                  <p className="font-medium">Experience Premium Increasing</p>
                  <p className="text-sm text-muted-foreground">
                    Workers with 5+ years experience show 45% higher compensation on average
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
