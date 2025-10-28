import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { TrendingDown, TrendingUp, CheckCircle } from "lucide-react";

const Check = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status: string;
    confidence: number;
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    jobTitle: "",
    education: "",
    experience: "",
    location: "",
    wage: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate AI analysis (will be replaced with real backend call)
    setTimeout(() => {
      const wage = parseFloat(formData.wage);
      let status = "Fair Wage 👍";
      let confidence = 75;
      let message = "Your wage appears to be in line with market standards for your role and experience.";
      
      // Simple logic for demo
      if (wage < 30000) {
        status = "Below Market Average 💼";
        confidence = 82;
        message = "Based on your qualifications, your wage may be below market standards. Consider discussing with your employer.";
      } else if (wage > 80000) {
        status = "Above Market Average 🚀";
        confidence = 88;
        message = "Your compensation is above market average for your role and experience level.";
      }
      
      setResult({ status, confidence, message });
      setLoading(false);
      toast.success("Analysis complete!");
    }, 2000);
  };

  const getResultIcon = () => {
    if (!result) return null;
    if (result.status.includes("Below")) return <TrendingDown className="h-8 w-8 text-destructive" />;
    if (result.status.includes("Above")) return <TrendingUp className="h-8 w-8 text-primary" />;
    return <CheckCircle className="h-8 w-8 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Check Wage Fairness</h1>
            <p className="text-lg text-muted-foreground">
              Enter your employment details for an AI-powered fairness assessment
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education Level</Label>
                  <Select
                    value={formData.education}
                    onValueChange={(value) => setFormData({ ...formData, education: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nairobi">Nairobi</SelectItem>
                      <SelectItem value="mombasa">Mombasa</SelectItem>
                      <SelectItem value="kisumu">Kisumu</SelectItem>
                      <SelectItem value="nakuru">Nakuru</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wage">Annual Wage (KES)</Label>
                  <Input
                    id="wage"
                    type="number"
                    placeholder="e.g., 1200000"
                    value={formData.wage}
                    onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Analyzing..." : "Analyze Fairness"}
                </Button>
              </form>
            </Card>

            {result && (
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    {getResultIcon()}
                    <div>
                      <h3 className="text-2xl font-bold">{result.status}</h3>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {result.confidence}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-semibold">Assessment</h4>
                      <p className="text-muted-foreground">{result.message}</p>
                    </div>

                    <div className="rounded-lg bg-muted p-4">
                      <h4 className="mb-2 font-semibold">Your Details</h4>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Role:</dt>
                          <dd className="font-medium">{formData.jobTitle}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Education:</dt>
                          <dd className="font-medium">{formData.education}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Experience:</dt>
                          <dd className="font-medium">{formData.experience} years</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Location:</dt>
                          <dd className="font-medium">{formData.location}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Check;
