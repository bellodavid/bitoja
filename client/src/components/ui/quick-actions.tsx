import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, ArrowUpDown, Clock } from "lucide-react";
import CreateAdModal from "./create-ad-modal";

export default function QuickActions() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Create Ad Button */}
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-bitoja-green hover:bg-bitoja-green-dark text-white p-4 h-auto flex-col"
            >
              <Plus className="w-8 h-8 mb-2" />
              <div className="text-center">
                <p className="font-medium">Create Ad</p>
                <p className="text-sm opacity-90">Post buy/sell offer</p>
              </div>
            </Button>

            {/* Browse Ads Button */}
            <Link href="/browse">
              <Button
                variant="outline"
                className="p-4 h-auto flex-col hover:bg-gray-50"
              >
                <Search className="w-8 h-8 mb-2" />
                <div className="text-center">
                  <p className="font-medium">Browse Ads</p>
                  <p className="text-sm text-gray-600">Find offers</p>
                </div>
              </Button>
            </Link>

            {/* Swap Tokens Button */}
            <Link href="/swap">
              <Button
                variant="outline"
                className="p-4 h-auto flex-col hover:bg-gray-50"
              >
                <ArrowUpDown className="w-8 h-8 mb-2" />
                <div className="text-center">
                  <p className="font-medium">Swap</p>
                  <p className="text-sm text-gray-600">BTC ↔ USDT</p>
                </div>
              </Button>
            </Link>

            {/* Transaction History Button */}
            <Link href="/history">
              <Button
                variant="outline"
                className="p-4 h-auto flex-col hover:bg-gray-50"
              >
                <Clock className="w-8 h-8 mb-2" />
                <div className="text-center">
                  <p className="font-medium">History</p>
                  <p className="text-sm text-gray-600">Your trades</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <CreateAdModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
