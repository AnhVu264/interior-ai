# Hướng Dẫn Chạy Frontend và Backend

## 📋 Yêu Cầu Hệ Thống

- **Python 3.8+** (đã có venv trong backend)
- **Node.js 16+** và npm
- **REPLICATE_API_TOKEN** (API key từ Replicate.com)

---

## 🔧 Bước 1: Cấu Hình Backend

### 1.1. Tạo file `.env` trong thư mục `backend`

Tạo file `.env` với nội dung:
```
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

**Lưu ý:** Thay `your_replicate_api_token_here` bằng API token thực tế của bạn từ [Replicate.com](https://replicate.com)

### 1.2. Kích hoạt môi trường ảo Python

Mở terminal/PowerShell và chạy:

**Windows (PowerShell):**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
cd backend
venv\Scripts\activate.bat
```

### 1.3. Cài đặt dependencies (nếu chưa có)

Nếu các package chưa được cài đặt, chạy:
```bash
pip install fastapi uvicorn python-multipart python-dotenv replicate httpx
```

### 1.4. Chạy Backend Server

Trong thư mục `backend` (với venv đã kích hoạt), chạy:
```bash
uvicorn main:app --reload
```

Backend sẽ chạy tại: **http://localhost:8000**

Bạn có thể kiểm tra bằng cách mở: http://localhost:8000

---

## 🎨 Bước 2: Chạy Frontend

### 2.1. Cài đặt dependencies (nếu chưa có)

Mở terminal/PowerShell mới và chạy:
```powershell
cd frontend
npm install
```

### 2.2. Chạy Frontend Development Server

Trong thư mục `frontend`, chạy:
```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173** (hoặc port khác nếu 5173 đã được sử dụng)

---

## 🚀 Chạy Cả Hai Cùng Lúc

Bạn cần **2 terminal windows**:

### Terminal 1 - Backend:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

### Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

---

## ✅ Kiểm Tra

1. **Backend:** Mở http://localhost:8000 - sẽ thấy `{"message": "Hello, AI Interior Design App is Ready!"}`
2. **Frontend:** Mở http://localhost:5173 - sẽ thấy giao diện ứng dụng

---

## 🔍 Troubleshooting

### Lỗi: "Thiếu API Key"
- Kiểm tra file `.env` trong thư mục `backend` đã có `REPLICATE_API_TOKEN` chưa
- Đảm bảo không có khoảng trắng thừa trong file `.env`

### Lỗi: "Module not found"
- Backend: Kích hoạt lại venv và cài đặt lại dependencies
- Frontend: Chạy `npm install` lại

### Lỗi: Port đã được sử dụng
- Backend: Thay đổi port bằng cách thêm `--port 8001` vào lệnh uvicorn
- Frontend: Vite sẽ tự động chọn port khác, kiểm tra terminal để xem port mới

### Lỗi CORS
- Backend đã được cấu hình CORS để cho phép tất cả origins
- Nếu vẫn lỗi, kiểm tra lại cấu hình CORS trong `main.py`

---

## 📝 Lưu Ý

- Backend cần chạy trước khi frontend có thể kết nối
- Đảm bảo cả hai đang chạy cùng lúc khi sử dụng ứng dụng
- File `.env` không nên commit lên git (thêm vào `.gitignore`)

