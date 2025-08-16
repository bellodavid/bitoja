import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Bell,
  Bitcoin,
  Home,
  Search,
  FileText,
  Clock,
  LogOut,
  User,
} from "lucide-react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/browse", label: "Trade", icon: Search },
    { path: "/my-ads", label: "My Ads", icon: FileText },
    { path: "/history", label: "History", icon: Clock },
  ];

  const NavLink = ({
    path,
    label,
    icon: Icon,
    onClick,
  }: {
    path: string;
    label: string;
    icon: any;
    onClick?: () => void;
  }) => (
    <Link href={path}>
      <a
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          location === path
            ? "text-lime-400 bg-white/[0.08]"
            : "text-gray-300 hover:text-lime-400 hover:bg-white/[0.04]"
        }`}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </a>
    </Link>
  );

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="bg-black/40 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-lime-400 to-lime-500 rounded-xl flex items-center justify-center shadow-lg">
                <Bitcoin className="text-black h-5 w-5" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">BitOja</span>
              <Badge
                variant="outline"
                className="ml-2 text-xs border-lime-400 text-lime-400"
              >
                SECURE
              </Badge>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  path={item.path}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-gray-400 hover:text-lime-400 hover:bg-white/[0.04]"
            >
              <Bell className="w-5 h-5" />
            </Button>

            {/* User Avatar & Info */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2">
                <img
                  className="h-8 w-8 rounded-full object-cover border border-white/20"
                  src={
                    user?.profileImageUrl ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  }
                  alt="User profile"
                />
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {user?.displayName || "Trader"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.email?.split("@")[0]}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="hidden md:flex text-gray-400 hover:text-red-400 hover:bg-white/[0.04]"
                size="icon"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-lime-400 hover:bg-white/[0.04]"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="bg-[#0b0f13] border-l border-white/10 text-gray-200"
                >
                  <div className="flex flex-col space-y-6 mt-8">
                    {/* Mobile User Info */}
                    <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                      <img
                        className="h-10 w-10 rounded-full object-cover border border-white/20"
                        src={
                          user?.profileImageUrl ||
                          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        }
                        alt="User profile"
                      />
                      <div>
                        <p className="font-medium text-white">
                          {user?.displayName || "Trader"}
                        </p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                      </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="space-y-2">
                      {navItems.map((item) => (
                        <NavLink
                          key={item.path}
                          path={item.path}
                          label={item.label}
                          icon={item.icon}
                          onClick={() => setIsOpen(false)}
                        />
                      ))}
                    </div>

                    {/* Mobile Actions */}
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-400 hover:text-lime-400 hover:bg-white/[0.04]"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-white/[0.04]"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
