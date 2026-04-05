import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  BookImage,
  Download,
  Eraser,
  Heart,
  Image as ImageIcon,
  Search,
  Sofa,
  Hammer,
  Sparkles,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";

const API_BASE = "http://localhost:8000";
const FAVORITES_KEY = "designai-favorites";

const TOOL_FILTERS = [
  { value: "", label: "All", icon: BookImage },
  { value: "staging", label: "Staging", icon: Sofa },
  { value: "renovation", label: "Renovation", icon: Hammer },
  { value: "enhance", label: "Enhancement", icon: Sparkles },
  { value: "remove", label: "Removal", icon: Eraser },
];

function favoriteMapFromStorage() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function Library() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    setFavorites(favoriteMapFromStorage());

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

  const toggleFavorite = (project) => {
    const key = project.id ?? project.image_url ?? project.created_at ?? JSON.stringify(project);
    setFavorites((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (project) => {
    const key = project.id ?? project.image_url ?? project.created_at ?? JSON.stringify(project);
    return Boolean(favorites[key]);
  };

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchType = !filter || project.type === filter;
      const term = search.trim().toLowerCase();
      const matchSearch =
        !term ||
        project.style?.toLowerCase().includes(term) ||
        project.type?.toLowerCase().includes(term);
      return matchType && matchSearch;
    });
  }, [filter, projects, search]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />

      <div className="pt-20 max-w-7xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">
            Your <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">Library</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">All your saved design projects in one place.</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {TOOL_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap border transition ${
                  filter === item.value
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-400"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-2xl h-56 animate-pulse border border-gray-200 dark:border-gray-800"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
            <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <BookImage className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-black text-gray-900 dark:text-white text-2xl mb-2">
              {search || filter ? "No results found" : "Your library is empty"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {search || filter
                ? "Try a different search or filter."
                : "Save your AI-generated designs to see them here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((project, index) => (
                <motion.div
                  key={`${project.id ?? project.image_url}-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition cursor-pointer"
                  onClick={() => setSelected(project)}
                >
                  <div className="relative h-40 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.style || "Design project"}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(project);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-full transition ${
                        isFavorite(project)
                          ? "bg-red-500 text-white"
                          : "bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(project) ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <div className="p-3">
                    <div className="font-bold text-gray-900 dark:text-white text-sm truncate">
                      {project.style || "Untitled Project"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 capitalize">
                      {(project.type || "design").replace(/_/g, " ")}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {selected.image_url ? (
                  <img
                    src={selected.image_url}
                    alt={selected.style || "Design project"}
                    className="w-full h-72 object-cover"
                  />
                ) : (
                  <div className="w-full h-72 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3 gap-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{selected.style || "Untitled Project"}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {(selected.type || "design").replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    saved
                  </span>
                </div>

                {selected.created_at && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-5 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    Created at: {selected.created_at}
                  </p>
                )}

                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(selected)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition ${
                      isFavorite(selected)
                        ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600"
                        : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-300"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(selected) ? "fill-current" : ""}`} />
                    {isFavorite(selected) ? "Unfavorite" : "Favorite"}
                  </button>

                  {selected.image_url && (
                    <a
                      href={selected.image_url}
                      download
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-cyan-400 transition"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
