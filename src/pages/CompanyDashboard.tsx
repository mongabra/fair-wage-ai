import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { toast } from "sonner";
import { Building2, Upload, Users, TrendingUp, Brain, Plus, X, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface Employee {
  employeeName: string;
  jobTitle: string;
  education: string;
  experience: string;
  location: string;
  currentWage: string;
}

const CompanyDashboard = () => {
  const [company, setCompany] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    industry: "",
    size: "",
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has HR role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'hr')
        .single();

      if (!roleData) {
        toast.error("You need HR role to access this page");
        return;
      }

      // Load company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('created_by', user.id)
        .maybeSingle();

      if (companyError) throw companyError;

      if (companyData) {
        setCompany(companyData);

        // Load subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('company_id', companyData.id)
          .maybeSingle();

        setSubscription(subData);

        // Load assessments
        const { data: assessmentData } = await supabase
          .from('batch_assessments')
          .select('*')
          .eq('company_id', companyData.id)
          .order('created_at', { ascending: false });

        setAssessments(assessmentData || []);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      toast.error("Failed to load company data");
    }
  };

  const createCompany = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyForm.name,
          industry: companyForm.industry,
          size: companyForm.size,
          created_by: user.id,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create subscription with 3 free credits
      await supabase
        .from('subscriptions')
        .insert({
          company_id: newCompany.id,
          tier: 'free',
          credits_remaining: 3,
          total_credits: 3,
        });

      toast.success("Company created successfully!");
      setShowCreateCompany(false);
      loadCompanyData();
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error("Failed to create company");
    }
  };

  const addEmployee = () => {
    setEmployees([...employees, {
      employeeName: "",
      jobTitle: "",
      education: "",
      experience: "",
      location: "",
      currentWage: "",
    }]);
  };

  const removeEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const updateEmployee = (index: number, field: string, value: string) => {
    const updated = [...employees];
    updated[index] = { ...updated[index], [field]: value };
    setEmployees(updated);
  };

  const handleBatchAssessment = async () => {
    if (employees.length === 0) {
      toast.error("Please add at least one employee");
      return;
    }

    if (!subscription || subscription.credits_remaining < employees.length) {
      toast.error(`Insufficient credits. You need ${employees.length} credits but have ${subscription?.credits_remaining || 0}`);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('assess-batch', {
        body: {
          employees,
          companyId: company.id,
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error === 'Insufficient credits') {
          toast.error(`Insufficient credits. Need ${data.creditsNeeded}, have ${data.creditsAvailable}`);
        } else {
          toast.error(data.error);
        }
        return;
      }

      toast.success(`Successfully assessed ${data.results.length} employees!`);
      setEmployees([]);
      loadCompanyData();
    } catch (error) {
      console.error('Batch assessment error:', error);
      toast.error("Failed to process batch assessment");
    } finally {
      setLoading(false);
    }
  };

  if (!company) {
    return (
      <AuthGuard>
        <div className="min-h-screen">
          <Navbar />
          <div className="container py-12">
            <Card className="glass-card p-8 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Welcome to Company Dashboard</h1>
                <p className="text-muted-foreground">Create your company profile to get started</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>

                <div>
                  <Label htmlFor="size">Company Size</Label>
                  <Select value={companyForm.size} onValueChange={(value) => setCompanyForm({ ...companyForm, size: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={createCompany} className="w-full glow-primary">
                  Create Company
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const avgDeviation = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + ((a.predicted_wage - a.current_wage) / a.current_wage * 100), 0) / assessments.length
    : 0;

  return (
    <AuthGuard>
      <div className="min-h-screen neural-pattern">
        <Navbar />
        
        <div className="container py-12">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {company.name} <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-muted-foreground">{company.industry} • {company.size} employees</p>
              </div>
              
              <Card className="glass-card p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Credits Remaining</p>
                  <p className="text-2xl font-bold text-primary">{subscription?.credits_remaining || 0}</p>
                  <Button variant="link" className="text-xs" onClick={() => window.location.href = '/billing'}>
                    Get More Credits
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Assessments</p>
                  <p className="text-2xl font-bold">{assessments.length}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Wage Deviation</p>
                  <p className="text-2xl font-bold">{avgDeviation.toFixed(1)}%</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">AI Confidence</p>
                  <p className="text-2xl font-bold">
                    {assessments.length > 0
                      ? Math.round(assessments.reduce((sum, a) => sum + a.confidence, 0) / assessments.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Batch Wage Assessment</h2>
              <Button onClick={addEmployee} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {employees.map((emp, index) => (
                <Card key={index} className="p-4 bg-background/50">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold">Employee {index + 1}</h3>
                    <Button variant="ghost" size="sm" onClick={() => removeEmployee(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={emp.employeeName}
                        onChange={(e) => updateEmployee(index, 'employeeName', e.target.value)}
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <Label>Job Title</Label>
                      <Input
                        value={emp.jobTitle}
                        onChange={(e) => updateEmployee(index, 'jobTitle', e.target.value)}
                        placeholder="Job title"
                      />
                    </div>

                    <div>
                      <Label>Education</Label>
                      <Select value={emp.education} onValueChange={(value) => updateEmployee(index, 'education', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select education" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high-school">High School</SelectItem>
                          <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                          <SelectItem value="master">Master's Degree</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Experience (years)</Label>
                      <Input
                        type="number"
                        value={emp.experience}
                        onChange={(e) => updateEmployee(index, 'experience', e.target.value)}
                        placeholder="Years"
                      />
                    </div>

                    <div>
                      <Label>Location</Label>
                      <Select value={emp.location} onValueChange={(value) => updateEmployee(index, 'location', value)}>
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

                    <div>
                      <Label>Monthly Wage (KES)</Label>
                      <Input
                        type="number"
                        value={emp.currentWage}
                        onChange={(e) => updateEmployee(index, 'currentWage', e.target.value)}
                        placeholder="e.g., 100000"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {employees.length > 0 && (
              <Button onClick={handleBatchAssessment} className="w-full mt-6 glow-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-pulse" />
                    Processing {employees.length} Employee{employees.length > 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Assess {employees.length} Employee{employees.length > 1 ? 's' : ''} ({employees.length} credit{employees.length > 1 ? 's' : ''})
                  </>
                )}
              </Button>
            )}
          </Card>

          <Card className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6">Assessment History</h2>
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="p-6 bg-background/50">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{assessment.employee_name}</h3>
                        <p className="text-sm text-muted-foreground">{assessment.job_title}</p>
                      </div>
                      {assessment.model_version && (
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                          (assessment.confidence || 0) >= 80
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <Brain className="h-3 w-3" />
                          {assessment.model_version}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Education</p>
                        <p className="font-medium">{assessment.education}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Experience</p>
                        <p className="font-medium">{assessment.experience} years</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{assessment.location}</p>
                       </div>
                       <div>
                         <p className="text-muted-foreground">Confidence</p>
                         <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             {assessment.confidence && assessment.confidence >= 80 && (
                               <Zap className="h-3.5 w-3.5 text-yellow-500" />
                             )}
                             <p className="font-medium">{assessment.confidence}%</p>
                           </div>
                           <Progress value={assessment.confidence || 0} className="h-2" />
                           {assessment.confidence && assessment.confidence >= 80 && (
                             <p className="text-xs text-green-600 dark:text-green-400 font-medium">High</p>
                           )}
                         </div>
                       </div>
                    </div>

                    {/* Wage Comparison */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Wage</p>
                        <p className="text-lg font-bold">KES {assessment.current_wage.toLocaleString()}</p>
                      </div>
                      {assessment.predicted_wage && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Market Average</p>
                          <p className="text-lg font-bold text-primary">
                            KES {assessment.predicted_wage.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {assessment.predicted_wage && (
                        <div className="col-span-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-1">Gap</p>
                          <p className={`text-sm font-semibold ${
                            assessment.assessment_status === 'Below Market Average' ? 'text-red-600' :
                            assessment.assessment_status === 'Above Market Average' ? 'text-blue-600' :
                            'text-green-600'
                          }`}>
                            {(((assessment.current_wage - assessment.predicted_wage) / assessment.predicted_wage) * 100).toFixed(1)}%
                            {assessment.current_wage < assessment.predicted_wage ? ' underpaid' : 
                             assessment.current_wage > assessment.predicted_wage ? ' overpaid' : ' fair'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          assessment.assessment_status === 'Below Market Average' ? 'bg-red-100 text-red-800' :
                          assessment.assessment_status === 'Above Market Average' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {assessment.assessment_status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{assessment.message}</p>
                    </div>
                  </div>
                </Card>
              ))}

              {assessments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No assessments yet. Add employees above to get started.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default CompanyDashboard;
