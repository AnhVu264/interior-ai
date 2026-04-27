import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// 1. Cấu hình Axios đặc biệt cho Auth
const api = axios.create({
    baseURL: 'http://localhost:8000', // Đổi lại nếu backend bạn chạy cổng khác
    withCredentials: true, // 🔥 CỰC KỲ QUAN TRỌNG: Dòng này cho phép trình duyệt gửi HttpOnly Cookie lên Backend
});

// 2. Tạo kho chứa
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Trạng thái chờ load lần đầu

    // 3. Tự động kiểm tra đăng nhập mỗi khi F5 lại trang
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/me');
                setUser(response.data); // Nếu có token hợp lệ, lưu thông tin user
            } catch (error) {
                setUser(null); // Không có token hoặc token hết hạn
            } finally {
                setLoading(false); // Báo hiệu đã load xong
            }
        };
        checkAuth();
    }, []);

    // 4. Các hàm thao tác với Backend
    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        // Gọi lại /me để lấy thông tin đầy đủ nhất (bao gồm cả avatar) sau khi có cookie
        const meResponse = await api.get('/me'); 
        setUser(meResponse.data);
        return response.data;
    };

    const register = async (name, email, password) => {
        const response = await api.post('/register', { name, email, password });
        return response.data;
    };

    const logout = async () => {
        await api.post('/logout');
        setUser(null); // Xóa user khỏi kho chứa
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// 5. Hook rút gọn để các component khác dễ dàng sử dụng
export const useAuth = () => useContext(AuthContext);