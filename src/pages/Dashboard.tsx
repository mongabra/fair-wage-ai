import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Dashboard = () => {
  // Sample data for visualizations
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

  const COLORS = ["#ef4444", "#2ecc71", "#3b82f6"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12 md:py-16">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">Wage Fairness Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Anonymized data and insights on wage fairness trends
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Assessments</h3>
            <p className="text-3xl font-bold mt-2">150</p>
            <p className="text-sm text-muted-foreground mt-1">+12% from last month</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Fair Wages</h3>
            <p className="text-3xl font-bold mt-2 text-primary">50%</p>
            <p className="text-sm text-muted-foreground mt-1">75 of 150 assessments</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Confidence</h3>
            <p className="text-3xl font-bold mt-2">82%</p>
            <p className="text-sm text-muted-foreground mt-1">High accuracy rate</p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Wage Fairness Distribution</h3>
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Average Wage by Industry</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={industryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="industry" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgWage" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">Tech Industry Shows Strong Wage Equity</p>
                <p className="text-sm text-muted-foreground">
                  85% of tech positions assessed show fair or above-market wages
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <div className="h-2 w-2 mt-2 rounded-full bg-destructive" />
              <div>
                <p className="font-medium">Retail Sector Needs Attention</p>
                <p className="text-sm text-muted-foreground">
                  60% of retail positions are below market average
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">Experience Premium Growing</p>
                <p className="text-sm text-muted-foreground">
                  5+ years experience shows 40% higher average compensation
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
