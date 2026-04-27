import os
import io
import shutil
import uuid
import time
import json  
import httpx
from datetime import datetime, timedelta
from typing import Optional

import jwt
import bcrypt
# from passlib.context import CryptContext
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response, Cookie
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel 
from dotenv import load_dotenv
import replicate

# 1. Load biến môi trường
load_dotenv()

app = FastAPI()

# 2. Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Cấu hình thư mục static
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# File Database giả lập (Lưu dữ liệu vào file này)
DB_FILE = "database.json"

# ==========================================
# --- CẤU HÌNH AUTH ---
# ==========================================
SECRET_KEY = "your_super_secret_key_change_this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
USERS_FILE = "users.json"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

# ==========================================
# --- HÀM PHỤ TRỢ ---
# ==========================================

# Helpers cho Auth
def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Hàm tải ảnh từ URL về máy tính (Để lưu vĩnh viễn)
async def download_image_from_url(url: str):
    if not url or not url.startswith("http"):
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code == 200:
                # Tạo tên file mới
                file_extension = "png"
                new_filename = f"{uuid.uuid4()}.{file_extension}"
                file_path = f"{UPLOAD_DIR}/{new_filename}"
                
                # Lưu vào ổ cứng
                with open(file_path, "wb") as f:
                    f.write(response.content)
                
                # Trả về đường dẫn local
                return f"http://localhost:8000/{file_path}"
    except Exception as e:
        print(f"Lỗi tải ảnh: {e}")
    return None

# Hàm ghi dữ liệu vào file JSON
def save_to_json(data):
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r", encoding="utf-8") as f:
            try:
                current_data = json.load(f)
            except:
                current_data = []
    else:
        current_data = []
    current_data.insert(0, data) 
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(current_data, f, ensure_ascii=False, indent=4)

# ==========================================
# --- CÁC API ---
# ==========================================
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserAuth(BaseModel):
    email: str
    password: str

class SaveRequest(BaseModel):
    result_url: str
    type: str
    style: str

@app.get("/")
def read_root():
    return {"message": "Hello, AI Interior Design App is Ready!"}

@app.post("/register")
async def register(user_data: UserRegister):
    users = load_users()
    if any(u["email"] == user_data.email for u in users):
        raise HTTPException(status_code=400, detail="Email đã được đăng ký!")
    
    # hashed_password = pwd_context.hash(user_data.password)
    hashed_password = hash_password(user_data.password)
    new_user = {
        "email": user_data.email,
        "password": hashed_password,
        "name": user_data.name,
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user_data.email
    }
    
    users.append(new_user)
    save_users(users)
    return {"message": "Đăng ký thành công!"}

@app.post("/login")
async def login(user_data: UserAuth, response: Response):
    users = load_users()
    user = next((u for u in users if u["email"] == user_data.email), None)
    
    # if not user or not pwd_context.verify(user_data.password, user["password"]):
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
    
    access_token = create_access_token(data={"sub": user["email"]})
    
    response.set_cookie(
        key="access_token", 
        value=access_token, 
        httponly=True,  
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False 
    )
    return {"message": "Đăng nhập thành công", "user": {"email": user["email"], "name": user["name"]}}

@app.get("/me")
async def get_me(access_token: Optional[str] = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Chưa đăng nhập")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        users = load_users()
        user = next((u for u in users if u["email"] == email), None)
        if user:
            return {"email": user["email"], "name": user["name"], "avatar": user.get("avatar")}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

@app.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Đã đăng xuất"}

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    file_extension = file.filename.split(".")[-1]
    new_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"{UPLOAD_DIR}/{new_filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": new_filename,
        "url": f"http://localhost:8000/{file_path}"
    }

@app.post("/staging")
async def generate_staging(file: UploadFile = File(...), prompt: str = Form(...)):
    if not os.getenv("REPLICATE_API_TOKEN"):
        raise HTTPException(status_code=500, detail="Thiếu API Key")
    try:
        content = await file.read()
        print("Đang vẽ nội thất...")
        output = replicate.run(
            "adirik/interior-design:76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38",
            input={
                "image": io.BytesIO(content),
                "prompt": f"interior design, {prompt}, best quality, 4k, photorealistic",
                "negative_prompt": "lowres, watermark, banner, logo, watermark, text, bad anatomy, bad hands, missing fingers, text, watermark, blurry",
                "guidance_scale": 7.5,
                "num_inference_steps": 50
            }
        )
        print("Xong:", output)
        return {"result_url": str(output)}
    except Exception as e:
        print("Lỗi:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/remove")
async def remove_object(image: UploadFile = File(...), mask: UploadFile = File(...)):
    if not os.getenv("REPLICATE_API_TOKEN"):
        raise HTTPException(status_code=500, detail="Thiếu API Key")
    try:
        image_content = await image.read()
        mask_content = await mask.read()
        print("Đang xóa vật thể...")
        output = replicate.run(
            "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
            #"black-forest-labs/flux-fill-pro",
            input={
                "image": io.BytesIO(image_content),
                "mask": io.BytesIO(mask_content),
                "prompt": "remove object, empty background, clean walls, high resolution, realistic",
                "negative_prompt": "object, artifacts, blurry, distortion, text",
                "num_inference_steps": 50,
                "guidance_scale": 7.5
            }
        )
        print("Xong:", output)
        return {"result_url": str(output[0])}
    except Exception as e:
        print("Lỗi Remove:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhance")
async def enhance_image(file: UploadFile = File(...)):
    if not os.getenv("REPLICATE_API_TOKEN"):
        raise HTTPException(status_code=500, detail="Chưa cấu hình REPLICATE_API_TOKEN")
    try:
        content = await file.read()
        print("Đang làm nét ảnh...")
        output = replicate.run(
            "nightmareai/real-esrgan",
            #"recraft-ai/recraft-crisp-upscale",
            input={
                "image": io.BytesIO(content),
                # "scale": 2,
                # "face_enhance": False
            }
        )
        print("Xong:", output)
        return {"result_url": str(output)}
    except Exception as e:
        print("Lỗi Enhance:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# --- API MỚI: SAVE (LƯU VÀO JSON) ---
class SaveRequest(BaseModel):
    result_url: str
    type: str
    style: str

@app.post("/save")
async def save_design(data: SaveRequest):
    try:
        print("Đang lưu thiết kế...", data)
        
        # 1. Tải ảnh từ Replicate về máy mình (Để lưu vĩnh viễn)
        local_image_url = await download_image_from_url(data.result_url)
        
        if not local_image_url:
            raise HTTPException(status_code=500, detail="Không thể tải ảnh về")

        # 2. Tạo bản ghi dữ liệu
        record = {
            "id": str(uuid.uuid4()),
            "image_url": local_image_url, # Lưu link ảnh nội bộ
            "type": data.type,
            "style": data.style,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        # 3. Lưu vào file JSON
        save_to_json(record)

        return {"message": "Đã lưu thành công!", "record": record}

    except Exception as e:
        print("Lỗi Save:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# --- API MỚI: LẤY DANH SÁCH THIẾT KẾ (GALLERY) ---
@app.get("/gallery")
def get_gallery():
    # Kiểm tra xem file database có tồn tại không
    if not os.path.exists(DB_FILE):
        return [] # Trả về danh sách rỗng nếu chưa có gì
    
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data # Trả về danh sách ảnh
    except Exception as e:
        print("Lỗi đọc Gallery:", e)
        return []