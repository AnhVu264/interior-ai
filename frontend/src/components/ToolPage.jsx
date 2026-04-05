import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { motion } from "framer-motion";
import { ReactSketchCanvas } from "react-sketch-canvas";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Eraser,
  Image as ImageIcon,
  Paintbrush2,
  Save,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import Navbar from "./Navbar";

const API_BASE = "http://localhost:8000";

const toolConfig = {
  virtual_staging: {
    apiEndpoint: "/staging",
    saveType: "staging",
    badge: "Virtual Staging",
    suggestions: [
      "Scandinavian living room with warm wood textures",
      "Luxury bedroom with layered lighting",
      "Minimalist office with clean modern furniture",
    ],
  },
  virtual_renovation: {
    apiEndpoint: "/staging",
    saveType: "renovation",
    badge: "Virtual Renovation",
    suggestions: [
      "Replace flooring with dark walnut wood",
      "Paint walls warm white and add a kitchen island",
      "Modernize the bathroom with stone textures",
    ],
  },
  image_enhancement: {
    apiEndpoint: "/enhance",
    saveType: "enhance",
    badge: "Image Enhancement",
    suggestions: [
      "Brighten the room and correct white balance",
      "Make details sharper and reduce noise",
      "Add soft natural light and richer contrast",
    ],
  },
  item_removal: {
    apiEndpoint: "/remove",
    saveType: "remove",
    badge: "Item Removal",
    suggestions: [
      "Remove the sofa from the center",
      "Erase the clutter near the shelves",
      "Clean the floor area and remove loose objects",
    ],
  },
};

function cls(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function ToolPage({
  toolType,
  title,
  description,
  icon: Icon,
  accentColor,
  roomTypes = [],
  styles = [],
  promptPlaceholder,
}) {
  const config = toolConfig[toolType] ?? toolConfig.virtual_staging;
  const canvasRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedRoomType, setSelectedRoomType] = useState(roomTypes?.[0] ?? "Living Room");
  const [selectedStyle, setSelectedStyle] = useState(styles?.[0] ?? "Modern");
  const [notes, setNotes] = useState("");
  const [renovateWall, setRenovateWall] = useState("");
  const [renovateFloor, setRenovateFloor] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    setSelectedRoomType(roomTypes?.[0] ?? "Living Room");
  }, [roomTypes]);

  useEffect(() => {
    setSelectedStyle(styles?.[0] ?? "Modern");
  }, [styles]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);
    const objectUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreview(objectUrl);
    setResultImage(null);
    toast.success("Đã chọn ảnh thành công.");
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] } });

  const showStyleSelect = Array.isArray(styles) && styles.length > 0;
  const isRenovation = toolType === "virtual_renovation";
  const isEnhancement = toolType === "image_enhancement";
  const isRemoval = toolType === "item_removal";

  const quickInfo = useMemo(
    () => [
      { label: "AI Mode", value: config.badge },
      { label: "Output", value: "High Resolution" },
      { label: "Workflow", value: isRemoval ? "Mask + Generate" : "Upload + Generate" },
    ],
    [config.badge, isRemoval]
  );

  const buildPrompt = () => {
    if (toolType === "virtual_staging") {
      return [selectedStyle, selectedRoomType, notes].filter(Boolean).join(", ");
    }

    if (toolType === "virtual_renovation") {
      const parts = [
        "renovation",
        selectedRoomType,
        renovateWall ? `${renovateWall} walls` : "",
        renovateFloor ? `${renovateFloor} floor` : "",
        notes,
        "realistic",
        "4k",
      ].filter(Boolean);

      return parts.join(", ");
    }

    if (toolType === "image_enhancement") {
      return [selectedStyle, selectedRoomType, notes].filter(Boolean).join(", ");
    }

    return notes;
  };

  const processImage = async () => {
    if (!selectedFile) {
      toast.error("Bạn cần chọn ảnh trước.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("AI đang xử lý ảnh...");

    try {
      if (isRemoval) {
        const maskDataURL = await canvasRef.current.exportImage("png");
        const maskBlob = await (await fetch(maskDataURL)).blob();
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("mask", maskBlob);

        const res = await axios.post(`${API_BASE}${config.apiEndpoint}`, formData);
        setResultImage(res.data.result_url);
      } else {
        const formData = new FormData();
        formData.append("file", selectedFile);

        if (!isEnhancement) {
          formData.append("prompt", buildPrompt());
        }

        const res = await axios.post(`${API_BASE}${config.apiEndpoint}`, formData);
        setResultImage(res.data.result_url);
      }

      toast.success("Đã tạo ảnh thành công.", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi xử lý ảnh.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!resultImage) {
      toast.error("Chưa có ảnh kết quả để lưu.");
      return;
    }

    const savingToast = toast.loading("Đang lưu vào thư viện...");

    try {
      const styleSummary =
        toolType === "virtual_renovation"
          ? [renovateWall && `${renovateWall} walls`, renovateFloor && `${renovateFloor} floor`, notes]
              .filter(Boolean)
              .join(", ") || title
          : [selectedStyle, selectedRoomType, notes].filter(Boolean).join(", ") || title;

      await axios.post(`${API_BASE}/save`, {
        result_url: resultImage,
        type: config.saveType,
        style: styleSummary,
      });

      toast.success("Đã lưu ảnh vào thư viện.", { id: savingToast });
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu ảnh vào thư viện.", { id: savingToast });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <Navbar />

      <main className="pt-20 pb-12">
        <section className="relative overflow-hidden px-4 pt-8 pb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/10 dark:from-violet-600/20 dark:to-cyan-500/20 pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-sm font-semibold px-4 py-2 rounded-full mb-5 border border-violet-200 dark:border-violet-800">
                <Sparkles className="w-4 h-4" />
                {config.badge}
              </span>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className={cls("inline-flex p-3 rounded-2xl bg-gradient-to-br mb-5", accentColor)}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                    {title} for <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">beautiful spaces</span>
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                    {description} Upload an image, adjust the details, and generate a polished result with a modern AI workflow.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:min-w-[420px]">
                  {quickInfo.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 shadow-sm px-4 py-4">
                      <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 font-bold mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1.06fr_0.94fr] gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 lg:p-7"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Upload & Configure</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Set up your prompt and generate a refined output.
                  </p>
                </div>

                {preview && (
                  <button
                    type="button"
                    onClick={() => {
                      if (preview) URL.revokeObjectURL(preview);
                      setPreview(null);
                      setSelectedFile(null);
                      setResultImage(null);
                    }}
                    className="text-sm font-bold text-red-500 hover:underline"
                  >
                    Clear image
                  </button>
                )}
              </div>

              <div
                {...(!preview ? getRootProps() : {})}
                className={cls(
                  "relative aspect-[4/3] w-full rounded-3xl border-2 border-dashed overflow-hidden transition-colors bg-gray-50 dark:bg-gray-950/40",
                  isDragActive
                    ? "border-violet-500"
                    : "border-gray-300 dark:border-gray-700 hover:border-violet-400"
                )}
              >
                {!preview && <input {...getInputProps()} />}

                {!preview ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 cursor-pointer">
                    <div className="p-4 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-300 mb-4">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Upload your interior image</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                      Drag and drop a photo here, or click to browse your files. Large, clear room photos work best.
                    </p>
                  </div>
                ) : isRemoval ? (
                  <ReactSketchCanvas
                    ref={canvasRef}
                    strokeWidth={22}
                    strokeColor="white"
                    canvasColor="transparent"
                    backgroundImage={preview}
                    exportWithBackgroundImage={false}
                    className="w-full h-full cursor-crosshair"
                  />
                ) : (
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 block">
                      Room Type
                    </label>
                    <select
                      value={selectedRoomType}
                      onChange={(e) => setSelectedRoomType(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {roomTypes.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {showStyleSelect ? (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 block">
                        Style Preset
                      </label>
                      <select
                        value={selectedStyle}
                        onChange={(e) => setSelectedStyle(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        {styles.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                        Workflow
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {isRemoval ? "Brush on the object to erase" : "Automatic AI enhancement"}
                      </p>
                    </div>
                  )}
                </div>

                {isRenovation && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 block">
                        Wall Finish
                      </label>
                      <input
                        value={renovateWall}
                        onChange={(e) => setRenovateWall(e.target.value)}
                        placeholder="e.g. warm white paint, stone texture"
                        className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 block">
                        Floor Material
                      </label>
                      <input
                        value={renovateFloor}
                        onChange={(e) => setRenovateFloor(e.target.value)}
                        placeholder="e.g. oak wood, large concrete tiles"
                        className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                )}

                {isRemoval && preview && (
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Eraser className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-800 dark:text-emerald-300">Paint the object in white</p>
                        <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                          Brush over furniture, clutter, or objects that you want the AI to remove.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => canvasRef.current?.clearCanvas()}
                      className="shrink-0 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold"
                    >
                      Clear Mask
                    </button>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 block">
                    Custom Prompt
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder={promptPlaceholder}
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 block">
                    Prompt Ideas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {config.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setNotes(suggestion)}
                        className="px-3 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-300 transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={processImage}
                  disabled={loading}
                  className={cls(
                    "w-full inline-flex items-center justify-center gap-2 rounded-2xl text-white font-black py-4 shadow-xl transition-all",
                    "hover:opacity-95 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
                    `bg-gradient-to-r ${accentColor}`
                  )}
                >
                  {loading ? <Wand2 className="w-5 h-5 animate-pulse" /> : <Paintbrush2 className="w-5 h-5" />}
                  {loading ? "Generating..." : `Generate ${title}`}
                </button>
              </div>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 lg:p-7 min-h-[560px] flex flex-col"
              >
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Result Preview</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Your final output appears here after generation.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/30 px-3 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AI Ready
                  </div>
                </div>

                <div className="flex-1 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 relative group flex items-center justify-center">
                  {loading ? (
                    <div className="text-center p-10">
                      <div className="relative w-20 h-20 mx-auto mb-5">
                        <div className="absolute inset-0 rounded-full border-4 border-violet-200 dark:border-violet-900 animate-ping" />
                        <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 font-semibold">AI is creating your image...</p>
                      <p className="text-sm text-gray-400 mt-2">This usually takes a few seconds.</p>
                    </div>
                  ) : resultImage ? (
                    <>
                      <img src={resultImage} alt="AI result" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={resultImage}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-gray-900 font-bold shadow-lg hover:bg-gray-100"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={handleSave}
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 text-white font-bold shadow-lg hover:bg-emerald-600"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center px-6">
                      <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
                        <ImageIcon className="w-10 h-10 text-gray-300 dark:text-gray-700" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Ready for generation</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Upload a room image, adjust your options, and the generated result will appear in this panel.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white p-6 shadow-2xl"
              >
                <Sparkles className="w-8 h-8 text-white/90 mb-4" />
                <h3 className="text-2xl font-black mb-2">Craft polished images faster</h3>
                <p className="text-white/80 leading-relaxed mb-6">
                  Use detailed prompts, select the right room type, and save your best generations to build a premium looking design portfolio.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-4">
                    <p className="text-xs uppercase tracking-wide text-white/70 font-bold mb-1">Best input</p>
                    <p className="font-semibold">Bright, straight, uncluttered room photo</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-4">
                    <p className="text-xs uppercase tracking-wide text-white/70 font-bold mb-1">Best prompt</p>
                    <p className="font-semibold">Describe mood, materials, colors, and furniture style</p>
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    to="/library"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white text-violet-700 px-5 py-3 font-black hover:bg-gray-100 transition"
                  >
                    Open Library <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
