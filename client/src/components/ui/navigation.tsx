import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell } from "lucide-react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/browse", label: "Trade" },
    { path: "/my-ads", label: "My Ads" },
    { path: "/history", label: "History" },
  ];

  const NavLink = ({
    path,
    label,
    onClick,
  }: {
    path: string;
    label: string;
    onClick?: () => void;
  }) => (
    <Link href={path}>
      <a
        onClick={onClick}
        className={`px-3 py-2 text-sm font-medium transition-colors ${
          location === path
            ? "text-bitoja-green"
            : "text-gray-600 hover:text-bitoja-green"
        }`}
      >
        {label}
      </a>
    </Link>
  );

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center">
              <div className="w-8 h-8 bg-bitoja-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="ml-2 text-xl font-bold text-bitoja-black">
                BitOja
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <NavLink key={item.path} path={item.path} label={item.label} />
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="w-5 h-5" />
            </Button>

            {/* User Avatar */}
            <div className="flex items-center space-x-2">
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={
                  user?.profileImageUrl ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                }
                alt="User profile"
              />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="hidden md:inline-flex text-sm"
              >
                Logout
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        path={item.path}
                        label={item.label}
                        onClick={() => setIsOpen(false)}
                      />
                    ))}
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="justify-start"
                    >
                      Logout
                    </Button>
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
