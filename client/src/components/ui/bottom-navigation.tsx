import { Link, useLocation } from "wouter";
import { Home, Search, Plus, Clock } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: Home,
    },
    {
      path: "/browse",
      label: "Trade",
      icon: Search,
    },
    {
      path: "/my-ads",
      label: "My Ads",
      icon: Plus,
    },
    {
      path: "/history",
      label: "History",
      icon: Clock,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex flex-col items-center py-2 px-1 transition-colors ${
                  isActive ? "text-bitoja-green" : "text-gray-600"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
