import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { toast } from "sonner";
import { CreditCard, CheckCircle, Zap, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Billing = () => {
  const [company, setCompany] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('created_by', user.id)
        .maybeSingle();

      if (companyData) {
        setCompany(companyData);

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('company_id', companyData.id)
          .maybeSingle();

        setSubscription(subData);

        const { data: paymentData } = await supabase
          .from('payments')
          .select('*')
          .eq('company_id', companyData.id)
          .order('created_at', { ascending: false });

        setPayments(paymentData || []);
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast.error("Failed to load billing data");
    }
  };

  const plans = [
    {
      name: "Starter",
      price: 5000,
      credits: 10,
      features: ["10 wage assessments", "Basic analytics", "Email support"],
    },
    {
      name: "Professional",
      price: 15000,
      credits: 50,
      features: ["50 wage assessments", "Advanced analytics", "Priority support", "Export reports"],
      popular: true,
    },
    {
      name: "Enterprise",
      price: 40000,
      credits: 200,
      features: ["200 wage assessments", "Premium analytics", "24/7 support", "Custom reports", "API access"],
    },
  ];

  const handlePurchase = async (plan: any) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!company || !selectedPlan) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to continue");
        return;
      }

      console.log('Initiating payment with auth token');

      // Call edge function to initialize Intasend payment
      const { data, error } = await supabase.functions.invoke('intasend-payment', {
        body: {
          planName: selectedPlan.name,
          amount: selectedPlan.price,
          credits: selectedPlan.credits,
          companyId: company.id,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.intasendUrl) {
        console.log('Redirecting to Intasend payment page');
        // Redirect to Intasend payment page
        window.location.href = data.intasendUrl;
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen neural-pattern">
        <Navbar />
        
        <div className="container py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Billing & <span className="gradient-text">Subscription</span>
            </h1>
            <p className="text-muted-foreground">Manage your credits and subscription</p>
          </div>

          {subscription && (
            <Card className="glass-card p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2">Current Plan: {subscription.tier}</h2>
                  <p className="text-muted-foreground">
                    {subscription.credits_remaining} of {subscription.total_credits} credits remaining
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {subscription.credits_remaining}
                  </div>
                  <p className="text-sm text-muted-foreground">Credits</p>
                </div>
              </div>

              <div className="mt-4 h-2 bg-background/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${(subscription.credits_remaining / subscription.total_credits) * 100}%` }}
                />
              </div>
            </Card>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Purchase Credits</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`glass-card p-6 relative ${plan.popular ? 'border-primary border-2' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                        POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-3xl font-bold">KES {plan.price.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.credits} credits
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePurchase(plan)}
                    className={`w-full ${plan.popular ? 'glow-primary' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Purchase Plan
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          <Card className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6">Payment History</h2>
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.credits_purchased} Credits</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">KES {payment.amount.toLocaleString()}</p>
                    <p className={`text-sm ${payment.status === 'completed' ? 'text-accent' : 'text-muted-foreground'}`}>
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))}

              {payments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No payment history yet
                </div>
              )}
            </div>
          </Card>
        </div>

        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-6">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{selectedPlan?.name} Plan</h3>
                <p className="text-3xl font-bold text-primary mb-2">
                  KES {selectedPlan?.price.toLocaleString()}
                </p>
                <p className="text-muted-foreground">
                  {selectedPlan?.credits} assessment credits
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">
                  You will be redirected to Intasend to complete your payment securely.
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports M-Pesa, card payments, and other payment methods.
                </p>
              </div>

              <Button onClick={processPayment} className="w-full glow-primary">
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
};

export default Billing;
