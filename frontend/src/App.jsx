import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Staging from "./pages/Staging";
import Renovation from "./pages/Renovation";
import Enhancement from "./pages/Enhancement";
import Removal from "./pages/Removal";
import Auth from "./pages/Auth";

function RequireAuth({ children }) {
  const signedInEmail = localStorage.getItem("signedInEmail");
  if (!signedInEmail) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

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
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/library"
          element={
            <RequireAuth>
              <Library />
            </RequireAuth>
          }
        />
        <Route
          path="/staging"
          element={
            <RequireAuth>
              <Staging />
            </RequireAuth>
          }
        />
        <Route
          path="/renovation"
          element={
            <RequireAuth>
              <Renovation />
            </RequireAuth>
          }
        />
        <Route
          path="/enhancement"
          element={
            <RequireAuth>
              <Enhancement />
            </RequireAuth>
          }
        />
        <Route
          path="/removal"
          element={
            <RequireAuth>
              <Removal />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}