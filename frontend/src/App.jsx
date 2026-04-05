import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Staging from "./pages/Staging";
import Renovation from "./pages/Renovation";
import Enhancement from "./pages/Enhancement";
import Removal from "./pages/Removal";

function NotFound() {
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "16px",
            padding: "14px 16px",
            fontWeight: 600,
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/staging" element={<Staging />} />
        <Route path="/renovation" element={<Renovation />} />
        <Route path="/enhancement" element={<Enhancement />} />
        <Route path="/removal" element={<Removal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
