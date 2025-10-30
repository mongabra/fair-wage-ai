import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { toast } from "sonner";
import { Building2, Upload, Users, TrendingUp, Brain, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
                <Card key={assessment.id} className="p-4 bg-background/50">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">{assessment.employee_name}</h3>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Role:</dt>
                          <dd className="font-medium">{assessment.job_title}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Experience:</dt>
                          <dd className="font-medium">{assessment.experience} years</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Location:</dt>
                          <dd className="font-medium">{assessment.location}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-primary">{assessment.assessment_status}</h4>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Current Wage:</dt>
                          <dd className="font-medium">KES {assessment.current_wage.toLocaleString()}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Predicted Wage:</dt>
                          <dd className="font-medium text-accent">KES {assessment.predicted_wage?.toLocaleString()}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Difference:</dt>
                          <dd className={`font-medium ${(assessment.predicted_wage - assessment.current_wage) > 0 ? 'text-destructive' : 'text-accent'}`}>
                            KES {Math.abs(assessment.predicted_wage - assessment.current_wage).toLocaleString()}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Confidence:</dt>
                          <dd className="font-medium">{assessment.confidence}%</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">{assessment.message}</p>
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
