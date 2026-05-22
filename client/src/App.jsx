import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import Layout from "./components/common/Layout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import ScrollProgress from "./components/ui/ScrollProgress.jsx";
import CursorGlow from "./components/ui/CursorGlow.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import NotFound from "./pages/NotFound.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import BlogDetail from "./pages/BlogDetail.jsx";
import CreateBlog from "./pages/CreateBlog.jsx";
import EditBlog from "./pages/EditBlog.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";

const AppContent = () => {
  const location = useLocation();

  return (
    <>
      {/* Global UI Elements */}
      <CursorGlow />
      <ScrollProgress />

      {/* Page Transitions */}
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="*" element={<NotFound />} />

          {/* Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-blog"
            element={
              <ProtectedRoute>
                <CreateBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-blog/:id"
            element={
              <ProtectedRoute>
                <EditBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
              background: "#1f1f2a",
              color: "#f1f5f9",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
        <Layout>
          <AppContent />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;