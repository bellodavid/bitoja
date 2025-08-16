import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Bitcoin,
  Shield,
  Zap,
  Users,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Globe,
  Lock,
  Smartphone,
  Clock,
  DollarSign,
  Star,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const { signUp, signIn, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBuyClick = () => {
    if (isAuthenticated) {
      setLocation("/buy");
    } else {
      toast({
        title: "Login Required",
        description: "Please sign in or create an account to start buying.",
        variant: "default",
      });
      setAuthMode("signin");
    }
  };

  const handleSellClick = () => {
    if (isAuthenticated) {
      setLocation("/sell");
    } else {
      toast({
        title: "Login Required",
        description: "Please sign in or create an account to start selling.",
        variant: "default",
      });
      setAuthMode("signin");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (authMode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "Please ensure both passwords match exactly.",
            variant: "destructive",
          });
          return;
        }
        if (formData.password.length < 6) {
          toast({
            title: "Password Too Short",
            description: "Password must be at least 6 characters long.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName,
          formData.username
        );
        if (error) {
          toast({
            title: "Signup Failed",
            description: error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome to BitOja",
            description:
              "Account created successfully. Please verify your email to continue.",
          });
          setFormData({
            email: formData.email,
            password: "",
            firstName: "",
            lastName: "",
            username: "",
            confirmPassword: "",
          });
          setAuthMode("signin");
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error || "Check your credentials.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back",
            description: "Redirecting to your dashboard...",
          });
          setLocation("/");
          // Redirect handled by useEffect as well
        }
      }
    } catch (err) {
      toast({
        title: "Connection Error",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f13] text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Bitcoin className="text-black h-6 w-6" />
          </div>
          <p className="text-gray-400 text-lg">Loading BitOja...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Shield,
      title: "Institutional Security",
      description:
        "Assets secured with audited safeguards and best-in-class encryption.",
    },
    {
      icon: Zap,
      title: "Fast Settlement",
      description:
        "Escrow-protected trades complete in minutes with transparent status.",
    },
    {
      icon: Globe,
      title: "Global Access",
      description:
        "Trade worldwide with local payment options and multi-currency support.",
    },
    {
      icon: Lock,
      title: "Trust by Design",
      description:
        "Clear policies, dispute resolution, and identity controls where needed.",
    },
    {
      icon: Smartphone,
      title: "Built for Mobile",
      description: "A seamless experience across devices with responsive UX.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Real people ready to help you around the clock.",
    },
    {
      icon: DollarSign,
      title: "Competitive Rates",
      description:
        "Best-in-market exchange rates with transparent fee structure.",
    },
    {
      icon: Star,
      title: "Trusted Reviews",
      description:
        "Community-driven ratings and verified trader feedback system.",
    },
  ];

  const stats = [
    { label: "Active Traders", value: "50,000+", icon: Users },
    { label: "Daily Volume", value: "$2.5M+", icon: TrendingUp },
    { label: "Success Rate", value: "99.8%", icon: CheckCircle },
    { label: "Countries", value: "120+", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b0f13,#0e1317)] text-gray-200">
      {/* Header */}
      <nav className="bg-black/40 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-lime-400 to-lime-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Bitcoin className="text-black h-5 w-5" />
                </div>
                <span className="ml-3 text-2xl font-bold text-white">
                  BitOja
                </span>
                <Badge
                  variant="outline"
                  className="ml-2 text-xs border-lime-400 text-lime-400"
                >
                  SECURE
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={authMode === "signin" ? "default" : "outline"}
                onClick={() => setAuthMode("signin")}
                className="hidden sm:inline-flex bg-lime-400 text-black hover:bg-lime-300 border-0"
              >
                Sign In
              </Button>
              <Button
                variant={authMode === "signup" ? "default" : "outline"}
                onClick={() => setAuthMode("signup")}
                className="hidden sm:inline-flex bg-transparent text-lime-400 border border-white/10 hover:border-lime-400"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className="text-lime-400 border-lime-400"
                >
                  Now Live
                </Badge>
                <Badge
                  variant="outline"
                  className="text-gray-300 border-white/10"
                >
                  Trusted by 50,000+ traders
                </Badge>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                Trade Bitcoin
                <span className="block text-lime-400">with confidence</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                BitOja is a secure, modern P2P marketplace for BTC and USDT.
                Built for speed, safety, and transparency.
              </p>

              {/* Buy/Sell Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={handleBuyClick}
                  className="h-12 px-8 text-base font-medium bg-gradient-to-r from-lime-400 to-lime-500 text-black hover:from-lime-300 hover:to-lime-400 flex items-center justify-center space-x-2"
                >
                  <DollarSign className="h-5 w-5" />
                  <span>Buy Bitcoin</span>
                </Button>
                <Button
                  onClick={handleSellClick}
                  variant="outline"
                  className="h-12 px-8 text-base font-medium bg-transparent text-lime-400 border-2 border-lime-400 hover:bg-lime-400 hover:text-black flex items-center justify-center space-x-2"
                >
                  <Bitcoin className="h-5 w-5" />
                  <span>Sell Bitcoin</span>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="text-center p-4 rounded-lg bg-white/[0.04] border border-white/10"
                >
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-5 w-5 text-lime-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.slice(0, 4).map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 rounded-lg bg-white/[0.04] border border-white/10"
                >
                  <feature.icon className="h-5 w-5 text-lime-400 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Auth */}
          <div className="lg:justify-self-end">
            <Card className="w-full max-w-md bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl font-bold text-white">
                  {authMode === "signin"
                    ? "Welcome Back"
                    : "Create Your Account"}
                </CardTitle>
                <CardDescription className="text-base text-gray-400">
                  {authMode === "signin"
                    ? "Access your trading dashboard"
                    : "Start trading Bitcoin in minutes"}
                </CardDescription>
                {/* Mobile switcher */}
                <div className="flex sm:hidden bg-white/[0.04] border border-white/10 rounded-lg p-1 mt-4">
                  <button
                    type="button"
                    onClick={() => setAuthMode("signin")}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      authMode === "signin"
                        ? "bg-black/40 text-white shadow-sm"
                        : "text-gray-400"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("signup")}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      authMode === "signup"
                        ? "bg-black/40 text-white shadow-sm"
                        : "text-gray-400"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 min-h-[320px]"
                >
                  {authMode === "signup" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="firstName"
                          className="text-sm text-gray-300"
                        >
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          required
                          className="h-11 bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="lastName"
                          className="text-sm text-gray-300"
                        >
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                          required
                          className="h-11 bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  )}
                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="username"
                        className="text-sm text-gray-300"
                      >
                        Username
                      </Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Preferred name (unique)"
                        required
                        className="h-11 bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-gray-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      required
                      className="h-11 bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-gray-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={
                          authMode === "signup"
                            ? "Create a strong password"
                            : "Enter your password"
                        }
                        required
                        minLength={6}
                        className="h-11 pr-12 bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {authMode === "signup" && (
                      <p className="text-xs text-gray-500">
                        Must be at least 6 characters long
                      </p>
                    )}
                  </div>

                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm text-gray-300"
                      >
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        required
                        minLength={6}
                        className="h-11 bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium bg-gradient-to-r from-lime-400 to-lime-500 text-black hover:from-lime-300 hover:to-lime-400 mt-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>
                          {authMode === "signin" ? "Sign In" : "Create Account"}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === "signin" ? "signup" : "signin");
                      setFormData({
                        email: formData.email,
                        password: "",
                        firstName: "",
                        lastName: "",
                        username: "",
                        confirmPassword: "",
                      });
                    }}
                    className="text-sm text-lime-400 hover:text-lime-300 font-medium"
                  >
                    {authMode === "signin"
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </button>
                </div>

                {authMode === "signup" && (
                  <div className="text-xs text-gray-500 text-center">
                    By creating an account, you agree to our{" "}
                    <a href="#" className="text-lime-400 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-lime-400 hover:underline">
                      Privacy Policy
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.slice(4).map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-white/[0.04] border border-white/10"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-lime-400 to-lime-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="text-black h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
