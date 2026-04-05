import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  ArrowRight,
  Eraser,
  Hammer,
  Image as ImageIcon,
  Plus,
  Sofa,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar";

const API_BASE = "http://localhost:8000";

const tools = [
  { icon: Sofa, label: "Virtual Staging", href: "/staging", color: "from-violet-600 to-purple-700", countKey: "staging" },
  { icon: Hammer, label: "Virtual Renovation", href: "/renovation", color: "from-orange-500 to-red-600", countKey: "renovation" },
  { icon: Sparkles, label: "Image Enhancement", href: "/enhancement", color: "from-cyan-500 to-blue-600", countKey: "enhance" },
  { icon: Eraser, label: "Item Removal", href: "/removal", color: "from-emerald-500 to-teal-600", countKey: "remove" },
];

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    axios
      .get(`${API_BASE}/gallery`)
      .then((res) => {
        if (!mounted) return;
        const items = Array.isArray(res.data) ? res.data : [];
        setProjects(items);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const recentProjects = useMemo(() => projects.slice(0, 6), [projects]);
  const countByType = (type) => projects.filter((item) => item.type === type).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />

      <div className="pt-20 max-w-7xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">
            Your <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Overview of your projects and activity.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm"
            >
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${tool.color} mb-3`}>
                <tool.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white">{countByType(tool.countKey)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">{tool.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                to={tool.href}
                className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${tool.color} text-white font-bold hover:opacity-90 transition hover:-translate-y-0.5 shadow-lg`}
              >
                <tool.icon className="w-5 h-5" />
                <span className="text-sm">{tool.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Recent Projects</h2>
            <Link
              to="/library"
              className="text-violet-600 dark:text-violet-400 font-bold text-sm flex items-center gap-1 hover:underline"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-2xl h-48 animate-pulse border border-gray-200 dark:border-gray-800"
                />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-16 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-black text-gray-900 dark:text-white text-xl mb-2">No projects yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first project using one of the tools above.</p>
              <Link
                to="/staging"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition"
              >
                <Plus className="w-4 h-4" /> Start Creating
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={`${project.id ?? project.image_url}-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden group hover:shadow-lg transition"
                >
                  <div className="h-36 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.style || "Design project"}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-300 dark:text-gray-700" />
                      </div>
                    )}

                    <span className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full bg-emerald-500 text-white">
                      completed
                    </span>
                  </div>

                  <div className="p-3">
                    <div className="font-bold text-gray-900 dark:text-white text-sm truncate">
                      {project.style || "Untitled Project"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                      {(project.type || "design").replace(/_/g, " ")}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
