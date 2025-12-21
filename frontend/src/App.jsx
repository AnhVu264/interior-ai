import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import { ReactSketchCanvas } from 'react-sketch-canvas'
import toast, { Toaster } from 'react-hot-toast' // <--- MỚI: Thư viện thông báo đẹp

function App() {
  // --- STATE ---
  const [view, setView] = useState('create') 
  const [galleryItems, setGalleryItems] = useState([]) 
  const [mode, setMode] = useState('staging') 
  
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [loading, setLoading] = useState(false)

  // Inputs
  const [style, setStyle] = useState('Modern Living Room')
  const [renovateWall, setRenovateWall] = useState('')
  const [renovateFloor, setRenovateFloor] = useState('')

  const canvasRef = useRef(null)

  // --- API CALLS ---
  const fetchGallery = async () => {
    try {
      const res = await axios.get('http://localhost:8000/gallery')
      setGalleryItems(res.data)
    } catch (error) {
      console.error("Lỗi lấy Gallery:", error)
      toast.error("Không thể tải thư viện ảnh!") // <--- Dùng Toast thay alert
    }
  }

  useEffect(() => {
    if (view === 'gallery') fetchGallery()
  }, [view])

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setResultImage(null)
    toast.success("Đã chọn ảnh thành công!") // <--- Thông báo nhỏ
  }, [])
  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  // --- LOGIC XỬ LÝ CHUNG ---
  const processImage = async (apiEndpoint, formData) => {
    setLoading(true)
    const loadingToast = toast.loading("AI đang suy nghĩ... Đợi chút nhé!") // <--- Hiện thông báo đang xử lý

    try {
      const res = await axios.post(`http://localhost:8000${apiEndpoint}`, formData)
      setResultImage(res.data.result_url)
      toast.success("Xử lý xong! Đẹp tuyệt vời! ✨", { id: loadingToast }) // <--- Xong thì báo thành công
    } catch (e) { 
      console.error(e)
      toast.error("Có lỗi xảy ra rồi! Thử lại nhé.", { id: loadingToast })
    } finally { 
      setLoading(false) 
    }
  }

  // 1. GENERATE (Staging & Renovation)
  const handleGenerate = async () => {
    if (!selectedFile) return toast.error("Bạn chưa chọn ảnh nào cả!")
    
    const formData = new FormData()
    formData.append('file', selectedFile)

    let finalPrompt = style
    if (mode === 'renovation') {
        const details = []
        if (renovateWall) details.push(`${renovateWall} walls`)
        if (renovateFloor) details.push(`${renovateFloor} floor`)
        finalPrompt = `renovation, ${details.join(', ')}, keep furniture, realistic, 4k`
    }
    formData.append('prompt', finalPrompt)

    await processImage('/staging', formData)
  }

  // 2. REMOVE
  const handleRemoveObject = async () => {
    if (!selectedFile) return toast.error("Chọn ảnh trước đã!")
    
    const maskDataURL = await canvasRef.current.exportImage("png")
    const maskBlob = await (await fetch(maskDataURL)).blob()
    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('mask', maskBlob)
    
    await processImage('/remove', formData)
  }

  // 3. ENHANCE
  const handleEnhance = async () => {
    if (!selectedFile) return toast.error("Chọn ảnh đi bạn ơi!")
    const formData = new FormData()
    formData.append('file', selectedFile)
    await processImage('/enhance', formData)
  }

  // 4. SAVE
  const handleSave = async () => {
    if (!resultImage) return toast.error("Chưa có ảnh kết quả!")
    const saveToast = toast.loading("Đang lưu vào thư viện...")
    try {
      const payload = {
        result_url: resultImage, 
        type: mode,
        style: mode === 'staging' ? style : (mode === 'renovation' ? 'Renovation' : 'Custom')
      }
      await axios.post('http://localhost:8000/save', payload)
      toast.success("Đã lưu an toàn! 💾", { id: saveToast })
      fetchGallery()
    } catch (error) { 
      toast.error("Lỗi khi lưu!", { id: saveToast })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Cấu hình Toast */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* HEADER: Responsive tốt hơn */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-3xl">🏡</span>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Interior Design
                </h1>
            </div>
            
            <div className="bg-gray-100 p-1 rounded-full flex gap-1">
                <button onClick={() => setView('create')} className={`px-4 md:px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all ${view==='create' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    Tạo Mới
                </button>
                <button onClick={() => setView('gallery')} className={`px-4 md:px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all ${view==='gallery' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    Thư Viện
                </button>
            </div>
          </div>
      </header>

      {/* --- MÀN HÌNH CHÍNH --- */}
      <main className="max-w-6xl mx-auto p-4 md:py-8">
        
        {view === 'create' && (
            <>
                {/* THANH CHỌN MODE - ĐÃ CHỈNH MÀU ĐẸP HƠN */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                    {
                        id: 'staging', 
                        label: 'Vẽ Nội Thất', 
                        active: 'bg-blue-600 text-white shadow-blue-200 shadow-lg border-blue-600',
                        inactive: 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'
                    },
                    {
                        id: 'renovation', 
                        label: 'Cải Tạo', 
                        active: 'bg-blue-600 text-white shadow-blue-200 shadow-lg border-blue-600',
                        inactive: 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'
                    },
                    {
                        id: 'remove', 
                        label: 'Xóa Vật Thể', 
                        active: 'bg-blue-600 text-white shadow-blue-200 shadow-lg border-blue-600',
                        inactive: 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'
                    },
                    {
                        id: 'enhance', 
                        label: 'Làm Nét Ảnh', 
                        active: 'bg-blue-600 text-white shadow-blue-200 shadow-lg border-blue-600',
                        inactive: 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'
                    }
                ].map((m) => (
                    <button 
                        key={m.id}
                        onClick={() => { setMode(m.id); setResultImage(null); }}
                        className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 border-2 ${
                            mode === m.id 
                            ? `${m.active} scale-105` 
                            : `${m.inactive} hover:-translate-y-1`
                        }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* CỘT TRÁI: INPUT */}
                    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-lg font-bold text-gray-700">Ảnh đầu vào</h2>
                             {preview && <button onClick={()=>{setPreview(null); setSelectedFile(null)}} className="text-red-500 text-xs font-bold hover:underline">Xóa ảnh</button>}
                        </div>
                        
                        {/* DROPZONE */}
                        <div className="relative aspect-[4/3] w-full border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 transition-colors hover:border-blue-400 group">
                            {!preview ? (
                                <div {...getRootProps()} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                                    <input {...getInputProps()} />
                                    <div className="p-4 rounded-full bg-blue-50 text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <p className="text-gray-500 font-medium text-sm text-center px-4">Chạm để tải ảnh lên <br/> hoặc kéo thả vào đây</p>
                                </div>
                            ) : (
                                <>
                                    {mode !== 'remove' && <img src={preview} className="w-full h-full object-contain" />}
                                    {mode === 'remove' && <ReactSketchCanvas ref={canvasRef} strokeWidth={20} strokeColor="white" canvasColor="transparent" backgroundImage={preview} exportWithBackgroundImage={false} className="w-full h-full cursor-crosshair" />}
                                </>
                            )}
                        </div>

                        {/* CONTROLS */}
                        {preview && (
                            <div className="mt-6 animate-fade-in space-y-4">
                                {mode === 'staging' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Chọn phong cách</label>
                                        <select value={style} onChange={(e)=>setStyle(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                            <option value="Modern Living Room">Phòng khách Hiện đại</option>
                                            <option value="Scandinavian Bedroom">Phòng ngủ Bắc Âu</option>
                                            <option value="Luxury Office">Văn phòng Sang trọng</option>
                                            <option value="Minimalist Kitchen">Nhà bếp Tối giản</option>
                                        </select>
                                    </div>
                                )}

                                {mode === 'renovation' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Màu tường</label>
                                            <input placeholder="Vd: Blue, White..." value={renovateWall} onChange={(e)=>setRenovateWall(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Sàn nhà</label>
                                            <input placeholder="Vd: Wood, Tile..." value={renovateFloor} onChange={(e)=>setRenovateFloor(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                                        </div>
                                    </div>
                                )}

                                {mode === 'remove' && (
                                    <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                                        <span className="text-sm text-blue-800">Tô trắng vào vật cần xóa</span>
                                        <button onClick={()=>canvasRef.current.clearCanvas()} className="text-xs font-bold text-blue-600 hover:underline">Xóa nét vẽ</button>
                                    </div>
                                )}

                                <button 
                                    onClick={
                                        mode === 'remove' ? handleRemoveObject :
                                        mode === 'enhance' ? handleEnhance :
                                        handleGenerate
                                    }
                                    disabled={loading}
                                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                                        ${mode === 'enhance' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' : 
                                          mode === 'remove' ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' :
                                          'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'}
                                    `}
                                >
                                    {loading ? 'Đang xử lý...' : 
                                     mode === 'staging' ? '✨ TẠO NỘI THẤT' : 
                                     mode === 'renovation' ? '🛠️ BẮT ĐẦU CẢI TẠO' : 
                                     mode === 'remove' ? '🪄 XÓA VẬT THỂ' : '⚡ LÀM NÉT 4K'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* CỘT PHẢI: KẾT QUẢ */}
                    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Kết quả AI</h2>
                        <div className="flex-1 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 relative group">
                            {loading ? (
                                <div className="text-center p-8">
                                    {/* Loading Animation Đẹp */}
                                    <div className="relative w-20 h-20 mx-auto mb-4">
                                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
                                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                    </div>
                                    <p className="text-gray-500 font-medium animate-pulse">AI đang làm phép... ✨</p>
                                    <p className="text-xs text-gray-400 mt-2">Mất khoảng 5-10 giây</p>
                                </div>
                            ) : resultImage ? (
                                <>
                                    <img src={resultImage} className="w-full h-full object-contain" />
                                    {/* Overlay Buttons */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                        <a href={resultImage} target="_blank" className="bg-white text-gray-900 px-5 py-2.5 rounded-full font-bold shadow-lg hover:bg-gray-100 flex items-center gap-2 transform hover:scale-105 transition-all">
                                            <span>⬇</span> Tải Về
                                        </a>
                                        <button onClick={handleSave} className="bg-green-500 text-white px-5 py-2.5 rounded-full font-bold shadow-lg hover:bg-green-600 flex items-center gap-2 transform hover:scale-105 transition-all">
                                            <span>💾</span> Lưu Lại
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-gray-300">
                                    <p className="text-6xl mb-4">🎨</p>
                                    <p>Kết quả sẽ hiện ở đây</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* --- MÀN HÌNH THƯ VIỆN --- */}
        {view === 'gallery' && (
            <div className="animate-fade-in">
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Bộ Sưu Tập ({galleryItems.length})</h2>
                </div>
                
                {galleryItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-6xl mb-4 opacity-50">📂</p>
                        <p className="text-gray-500 text-lg">Chưa có thiết kế nào được lưu.</p>
                        <button onClick={() => setView('create')} className="mt-4 text-blue-600 font-bold hover:underline">Tạo thiết kế đầu tiên ngay!</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {galleryItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden group">
                                <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                                    <img src={item.image_url} alt="Design" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                                        <a href={item.image_url} target="_blank" className="text-white text-xs font-bold hover:underline">Xem Full HD ↗</a>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wide
                                            ${item.type==='staging'?'bg-blue-100 text-blue-700':
                                              item.type==='remove'?'bg-red-100 text-red-700':
                                              item.type==='enhance'?'bg-purple-100 text-purple-700':
                                              'bg-orange-100 text-orange-700'}`}>
                                            {item.type}
                                        </span>
                                        <span className="text-xs text-gray-400">{item.created_at?.split(' ')[0]}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium truncate" title={item.style}>{item.style}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

      </main>
    </div>
  )
}

export default App