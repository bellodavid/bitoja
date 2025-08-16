import { Link, useLocation } from "wouter";
import { Home, Search, FileText, Clock, User } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/browse", label: "Trade", icon: Search },
    { path: "/my-ads", label: "My Ads", icon: FileText },
    { path: "/history", label: "History", icon: Clock },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-lime-400 bg-white/[0.08]"
                    : "text-gray-400 hover:text-lime-400 hover:bg-white/[0.04]"
                }`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
