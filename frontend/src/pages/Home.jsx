import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookImage,
  Eraser,
  Hammer,
  Shield,
  Sofa,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Navbar from "../components/Navbar";

const tools = [
  {
    icon: Sofa,
    title: "Virtual Staging",
    description: "Transform empty rooms into beautifully furnished spaces with AI-powered furniture placement.",
    color: "from-violet-600 to-purple-700",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    link: "/staging",
  },
  {
    icon: Hammer,
    title: "Virtual Renovation",
    description: "Visualize renovations before breaking a single wall. Change flooring, walls, and more.",
    color: "from-orange-500 to-red-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    link: "/renovation",
  },
  {
    icon: Sparkles,
    title: "Image Enhancement",
    description: "Elevate your interior photos with AI-driven lighting, color correction, and detail boost.",
    color: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-200 dark:border-cyan-800",
    link: "/enhancement",
  },
  {
    icon: Eraser,
    title: "Item Removal",
    description: "Cleanly erase unwanted objects, clutter, or furniture from any interior photo.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    link: "/removal",
  },
];

const stats = [
  { value: "50K+", label: "Projects Generated" },
  { value: "4.9★", label: "User Rating" },
  { value: "2 sec", label: "Avg. Processing" },
  { value: "99%", label: "Satisfaction Rate" },
];

const features = [
  {
    icon: Zap,
    title: "Fast generation",
    description: "Turn interior photos into styled concepts in just a few clicks.",
  },
  {
    icon: Shield,
    title: "Clean modern UI",
    description: "Professional interface with dashboard, library, and dedicated tool pages.",
  },
  {
    icon: Star,
    title: "Portfolio ready",
    description: "Save and organize your best AI results in a premium-looking gallery.",
  },
];

export default function Home() {
  const signedInEmail = localStorage.getItem("signedInEmail");
  const isAuthed = !!signedInEmail;
  const protectedLink = (link) => (isAuthed ? link : "/auth");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <Navbar />

      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-600/10 dark:from-violet-600/20 dark:to-cyan-600/20 pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[38rem] h-[38rem] rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-violet-200 dark:border-violet-700">
              <Zap className="w-4 h-4" /> AI-Powered Interior Design
            </span>

            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-tight mb-6">
              Design Spaces{" "}
              <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
                Instantly
              </span>
              <br />with AI
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              Stage, renovate, enhance, and clean your interior photos in seconds — no designer needed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={protectedLink("/staging")}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition shadow-lg shadow-violet-500/30 text-lg"
              >
                Start Creating <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={protectedLink("/library")}
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-white font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition border border-gray-200 dark:border-gray-800 text-lg"
              >
                <BookImage className="w-5 h-5" /> View Library
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16 rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 max-w-5xl mx-auto"
          >
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&q=80"
              alt="Interior Design Hero"
              className="w-full h-[420px] object-cover"
            />
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-gray-950 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="text-center"
            >
              <div className="text-3xl font-black text-white">{item.value}</div>
              <div className="text-gray-400 text-sm mt-1">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Four Powerful Tools
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Everything you need to perfect your interior photos and designs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={protectedLink(tool.link)}
                  className={`group block p-8 rounded-3xl border ${tool.bg} ${tool.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${tool.color} mb-5`}>
                    <tool.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-violet-600 group-hover:to-cyan-500 transition-all">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                    {tool.description}
                  </p>
                  <span className="inline-flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300 group-hover:gap-3 transition-all">
                    Try Now <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white flex items-center justify-center mb-5">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-violet-600 to-cyan-500 rounded-3xl p-12 text-center shadow-2xl">
          <Star className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h2 className="text-4xl font-black text-white mb-4">Ready to Transform Your Space?</h2>
          <p className="text-white/80 text-lg mb-8">
            Join thousands of designers and homeowners using DesignAI.
          </p>
          <Link
            to={protectedLink("/staging")}
            className="inline-flex items-center gap-2 bg-white text-violet-700 font-black px-10 py-4 rounded-2xl hover:bg-gray-100 transition text-lg shadow-lg"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4 text-center text-gray-500 dark:text-gray-500 text-sm">
        © 2026 DesignAI. All rights reserved.
      </footer>
    </div>
  );
}