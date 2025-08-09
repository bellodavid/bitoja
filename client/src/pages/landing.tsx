import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bitcoin, Shield, Zap, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { login } = useAuth();

  const handleGetStarted = () => {
    // Create a demo user and log them in
    const demoUser = {
      id: "demo-user-123",
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: "https://via.placeholder.com/150",
      btcBalance: "0.001",
      usdtBalance: "100",
    };
    login(demoUser);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-bitoja-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="ml-2 text-xl font-bold text-bitoja-black">
                BitOja
              </span>
            </div>
            <Button
              onClick={handleGetStarted}
              className="bg-bitoja-green hover:bg-bitoja-green-dark text-white"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-bitoja-black mb-6">
            Simple P2P Crypto Trading
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Trade Bitcoin and USDT with ease. Create ads, find traders, and
            complete secure transactions with built-in escrow protection.
          </p>
          <Button
            onClick={handleGetStarted}
            className="bg-bitoja-green hover:bg-bitoja-green-dark text-white text-lg px-8 py-3"
            size="lg"
          >
            Start Trading Now
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-bitoja-black mb-4">
            Why Choose BitOja?
          </h2>
          <p className="text-gray-600 text-lg">
            Ultra-simple crypto trading designed for everyone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-bitoja-green rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete trades in minutes with our streamlined interface and
                instant messaging.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-bitoja-green rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Secure Escrow</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your funds are protected with our automatic escrow system until
                trade completion.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-bitoja-green rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <CardTitle>BTC & USDT</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Trade the most popular cryptocurrencies with built-in swap
                functionality.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-bitoja-green rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>P2P Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect directly with other traders for the best rates and
                fastest settlements.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
