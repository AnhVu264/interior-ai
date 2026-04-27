import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, Moon, Sparkles, SunMedium, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Staging", href: "/staging" },
  { label: "Renovation", href: "/renovation" },
  { label: "Enhancement", href: "/enhancement" },
  { label: "Removal", href: "/removal" },
  { label: "Library", href: "/library" },
];

const protectedPaths = [
  "/dashboard",
  "/staging",
  "/renovation",
  "/enhancement",
  "/removal",
  "/library",
];

function navClass({ isActive }) {
  return [
    "transition-colors duration-200 font-semibold text-sm",
    isActive
      ? "text-violet-600 dark:text-violet-400"
      : "text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400",
  ].join(" ");
}

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("designai-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const toggleDarkMode = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("designai-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Lỗi đăng xuất", error);
    }
  };

  const getTargetLink = (href) => {
    const isAuthed = !!user;
    if (!isAuthed && protectedPaths.includes(href)) return "/auth";
    return href;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/70 dark:border-gray-800/70 bg-white/85 dark:bg-gray-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
            DesignAI
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink key={item.href} to={getTargetLink(item.href)} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="w-11 h-11 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            aria-label="Toggle theme"
          >
            {dark ? <SunMedium className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 shadow-sm">
                
                {/* Avatar xịn lấy từ Backend */}
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 shadow-md shadow-violet-500/20 border border-gray-200 dark:border-gray-700" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-white flex items-center justify-center text-sm font-black shadow-md shadow-violet-500/20">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                
                <div className="min-w-0 pr-1">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-bold">
                    Xin chào,
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[140px] truncate">
                    {user.name || user.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-950/50 transition shadow-sm"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold shadow-lg shadow-violet-500/25 hover:opacity-90 transition"
            >
              Sign In
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden w-11 h-11 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 flex items-center justify-center"
          aria-label="Open navigation"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={getTargetLink(item.href)}
                className={({ isActive }) =>
                  [
                    "px-4 py-3 rounded-2xl font-semibold transition",
                    isActive
                      ? "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-semibold flex items-center justify-center gap-2"
              >
                {dark ? <SunMedium className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {dark ? "Light Mode" : "Dark Mode"}
              </button>

              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex-1 px-4 py-3 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-950/50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}