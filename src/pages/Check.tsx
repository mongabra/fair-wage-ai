import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { toast } from "sonner";
import { TrendingDown, TrendingUp, CheckCircle, Brain, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Check = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    status: string;
    confidence: number;
    message: string;
    predictedWage?: number;
    modelVersion?: string;
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
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('assess-wage', {
        body: formData,
      });

      if (error) throw error;

      setResult(data);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error('Assessment error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze wage");
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    if (result.status.includes("Below")) return <TrendingDown className="h-8 w-8 text-destructive" />;
    if (result.status.includes("Above")) return <TrendingUp className="h-8 w-8 text-accent" />;
    return <CheckCircle className="h-8 w-8 text-primary" />;
  };

  const getResultColor = () => {
    if (!result) return "";
    if (result.status.includes("Below")) return "text-destructive";
    if (result.status.includes("Above")) return "text-accent";
    return "text-primary";
  };

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Navbar />
        
        <div className="container py-12 md:py-16 neural-pattern">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                <Brain className="h-4 w-4 text-primary animate-pulse" />
                AI-Powered Assessment
              </div>
              <h1 className="mb-4 text-3xl font-bold md:text-4xl">
                Check Wage <span className="gradient-text">Fairness</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Enter your details for an intelligent AI-powered fairness assessment
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="glass-card p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Software Engineer"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">Education Level</Label>
                    <Select
                      value={formData.education}
                      onValueChange={(value) => setFormData({ ...formData, education: value })}
                      required
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
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
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                      required
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="nairobi">Nairobi</SelectItem>
                        <SelectItem value="mombasa">Mombasa</SelectItem>
                        <SelectItem value="kisumu">Kisumu</SelectItem>
                        <SelectItem value="nakuru">Nakuru</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wage">Monthly Wage (KES)</Label>
                    <Input
                      id="wage"
                      type="number"
                      placeholder="e.g., 100000"
                      value={formData.wage}
                      onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>

                  <Button type="submit" className="w-full glow-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <Brain className="mr-2 h-4 w-4 animate-pulse" />
                        AI Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze Fairness
                      </>
                    )}
                  </Button>
                </form>
              </Card>

              {result && (
                <Card className="glass-card p-6 animate-fade-in">
                  <div className="space-y-6">
                    {/* ML Model Badge */}
                    {result.modelVersion && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        <Brain className="h-3 w-3" />
                        ML Model {result.modelVersion} • {result.confidence}% confidence
                      </div>
                    )}

                    {/* Wage Comparison */}
                    {result.predictedWage && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Your Current Wage</p>
                          <p className="text-2xl font-bold">KES {Number(formData.wage).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Market Prediction</p>
                          <p className="text-2xl font-bold text-primary">
                            KES {result.predictedWage.toLocaleString()}
                          </p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-border">
                          <p className="text-sm text-muted-foreground mb-1">Difference</p>
                          <p className={`text-lg font-semibold ${getResultColor()}`}>
                            {(((Number(formData.wage) - result.predictedWage) / result.predictedWage) * 100).toFixed(1)}%
                            {Number(formData.wage) < result.predictedWage ? ' below' : Number(formData.wage) > result.predictedWage ? ' above' : ' within'} market average
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status and Explanation */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {getResultIcon()}
                        <div>
                          <h3 className={`text-xl font-semibold ${getResultColor()}`}>
                            {result.status}
                          </h3>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{result.message}</p>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
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
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Check;
