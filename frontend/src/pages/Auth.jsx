import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sofa,
  Hammer,
  Eraser,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const features = [
  { icon: Sofa, text: "Virtual Staging" },
  { icon: Hammer, text: "Virtual Renovation" },
  { icon: Sparkles, text: "Image Enhancement" },
  { icon: Eraser, text: "Item Removal" },
];

const INPUT_BASE =
  "w-full pl-11 pr-4 py-4 rounded-2xl border bg-slate-100/80 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition text-sm font-medium";
const BORDER = "border-slate-200";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Trạng thái loading khi gọi API
  const [isLoading, setIsLoading] = useState(false);

  // Lấy hàm login và register từ AuthContext
  const { login, register } = useAuth();

  const getStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
  };

  const strength = getStrength(password);
  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  const switchMode = (m) => {
    setMode(m);
    setSubmitted(false);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!name || !email || !password || !confirmPassword) {
        setError("Please fill in all fields.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please check again.");
        return;
      }
      if (strength < 2) {
        setError("Password is too weak. Use at least 6 characters.");
        return;
      }
      if (!agreed) {
        setError("Please agree to the Terms of Service.");
        return;
      }

      setIsLoading(true);
      try {
        // Gọi API Đăng ký
        await register(name, email, password);
        setSubmitted(true);
      } catch (err) {
        // Lấy thông báo lỗi từ Backend trả về, nếu không có thì hiện lỗi mặc định
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === "login") {
      if (!email || !password) {
        setError("Please enter your email and password.");
        return;
      }
      setIsLoading(true);
      try {
        // Gọi API Đăng nhập
        await login(email, password);
        // Chuyển hướng về trang chủ sau khi đăng nhập thành công
        navigate("/");
      } catch (err) {
        setError(err.response?.data?.message || "Invalid email or password.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === "forgot") {
      if (!email) {
        setError("Please enter your email address.");
        return;
      }
      setIsLoading(true);
      // Tạm thời mô phỏng Quên mật khẩu (Nếu Backend có API này thì thay vào đây)
      setTimeout(() => {
        setIsLoading(false);
        setSubmitted(true);
      }, 1500);
    }
  };

  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=85"
          alt="Interior"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/85 via-violet-900/55 to-cyan-900/65" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 flex flex-col h-full w-full p-12 xl:p-14">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-violet-500 to-cyan-500 p-3 rounded-2xl shadow-lg shadow-violet-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black text-[2rem] tracking-tight">
              DesignAI
            </span>
          </Link>

          <div className="my-auto max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl xl:text-7xl font-black text-white leading-[1.04] mb-6"
            >
              Design Spaces
              <br />
              <span className="bg-gradient-to-r from-violet-300 to-cyan-400 bg-clip-text text-transparent">
                with AI Power
              </span>
            </motion.h1>

            <p className="text-white/70 text-2xl leading-relaxed max-w-md mb-10">
              Transform any interior photo in seconds. No design experience needed.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              {features.map((f) => (
                <div
                  key={f.text}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-4 shadow-lg"
                >
                  <div className="bg-gradient-to-br from-violet-500 to-cyan-500 p-2 rounded-xl">
                    <f.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-base font-semibold leading-tight">
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[470px] xl:w-[500px] bg-white flex items-center justify-center px-6 py-10 md:px-10">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-gradient-to-br from-violet-600 to-cyan-500 p-2 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent font-black text-xl">
              DesignAI
            </span>
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-8">
                <h1 className="text-[2.5rem] font-black text-gray-900 mb-2 leading-tight">
                  {isLogin && "Welcome back 👋"}
                  {isSignup && "Create account"}
                  {isForgot && "Reset password"}
                </h1>

                <p className="text-gray-500 text-lg">
                  {isLogin && "Sign in to continue designing with AI."}
                  {isSignup && "Create your account to start using DesignAI."}
                  {isForgot && "We’ll send a reset link to your email."}
                </p>
              </div>

              {submitted && mode === "forgot" && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-700 text-sm font-semibold">
                  Reset link sent! Check your inbox.
                </div>
              )}

              {submitted && mode === "signup" && (
                <div className="text-center py-6">
                  <div className="text-5xl mb-4">🎉</div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">
                    Account Created!
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Your account is ready. Sign in to start designing.
                  </p>
                  <button
                    onClick={() => switchMode("login")}
                    className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white hover:opacity-90 transition shadow-lg shadow-violet-500/30"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Go to Sign In
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm font-semibold">
                  {error}
                </div>
              )}

              {!(submitted && mode === "signup") && (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {isSignup && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`${INPUT_BASE} ${BORDER}`}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${INPUT_BASE} ${BORDER}`}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {!isForgot && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                          Password
                        </label>
                        {isLogin && (
                          <button
                            type="button"
                            onClick={() => switchMode("forgot")}
                            className="text-xs text-violet-600 font-bold hover:underline"
                            disabled={isLoading}
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`${INPUT_BASE} ${BORDER} pr-11`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {isSignup && password.length > 0 && (
                        <div className="mt-2 flex items-center gap-1">
                          {[0,1,2,3].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                i < strength
                                  ? strengthColors[strength - 1]
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-400 ml-1 whitespace-nowrap">
                            {strengthLabels[strength - 1] || ""}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {isSignup && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`${INPUT_BASE} pr-11 ${
                            confirmPassword && password !== confirmPassword
                              ? "border-red-400 focus:ring-red-400"
                              : confirmPassword && password === confirmPassword
                              ? "border-emerald-400 focus:ring-emerald-400"
                              : BORDER
                          }`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                          disabled={isLoading}
                        >
                          {showConfirm ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1 font-semibold">
                          Passwords do not match
                        </p>
                      )}
                      {confirmPassword && password === confirmPassword && (
                        <p className="text-xs text-emerald-500 mt-1 font-semibold">
                          ✓ Passwords match
                        </p>
                      )}
                    </div>
                  )}

                  {isSignup && (
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div
                        onClick={() => !isLoading && setAgreed(!agreed)}
                        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                          agreed
                            ? "bg-violet-600 border-violet-600"
                            : "border-gray-300 group-hover:border-violet-400"
                        } ${isLoading && "opacity-50 cursor-not-allowed"}`}
                      >
                        {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-sm text-gray-600">
                        I agree to the{" "}
                        <a href="#" className="text-violet-600 font-bold hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-violet-600 font-bold hover:underline">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full mt-2 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-500/30 transition ${
                      isLoading ? "opacity-75 cursor-not-allowed" : "hover:opacity-95"
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isLogin ? (
                      <>
                        <ArrowRight className="w-5 h-5" />
                        Sign In
                      </>
                    ) : isSignup ? (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Sign Up
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="text-center mt-7 text-sm text-gray-500">
                {isLogin && (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => switchMode("signup")}
                      disabled={isLoading}
                      className="text-violet-600 font-black hover:underline disabled:opacity-50"
                    >
                      Sign Up
                    </button>
                  </>
                )}

                {isSignup && (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => switchMode("login")}
                      disabled={isLoading}
                      className="text-violet-600 font-black hover:underline disabled:opacity-50"
                    >
                      Sign In
                    </button>
                  </>
                )}

                {isForgot && (
                  <>
                    Remember your password?{" "}
                    <button
                      onClick={() => switchMode("login")}
                      disabled={isLoading}
                      className="text-violet-600 font-black hover:underline disabled:opacity-50"
                    >
                      Back to Sign In
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}