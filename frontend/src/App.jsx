import React, { useEffect, useState } from "react";
import { Form, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Brand from "./pages/Brand";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import Watch from "./pages/Watch";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import { ArrowUp } from "lucide-react";
import Orders from "./pages/Orders";

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

// protected route
function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem("authToken"));
  return isAuthenticated ? (
    children
  ) : (
    <Navigate to={"/login"} replace state={{ form: location }} />
  );
}

const App = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowButton(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Defensive client-only styles to prevent any accidental horizontal overflow. */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root =
      document.getElementById("root") || document.getElementById("app");

    // Prevent horizontal overflow:
    html.style.overflowX = "hidden";
    body.style.overflowX = "hidden";

    // Ensure no default body margin/padding cause layout gaps
    body.style.margin = "0";
    body.style.padding = "0";

    // Use stable scrollbar gutter so width changes from scrollbars don't shift layout
    html.style.scrollbarGutter = "stable";

    // Defensive: ensure root full width and no accidental overflow
    if (root) {
      root.style.maxWidth = "100%";
      root.style.overflowX = "hidden";
    }

    return () => {
      html.style.overflowX = "";
      body.style.overflowX = "";
      body.style.margin = "";
      body.style.padding = "";
      html.style.scrollbarGutter = "";
      if (root) {
        root.style.maxWidth = "";
        root.style.overflowX = "";
      }
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen w-full overflow-x-hidden antialiased bg-white text-slate-900">
      <ScrollToTopOnRouteChange />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/brands/:brandName" element={<Brand />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/watches" element={<Watch />} />
        <Route path="/contact" element={<Contact />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
      </Routes>

      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed right-6 bottom-6 z-50 flex items-center justify-center p-3 rounded-full shadow-lg transition-all duration-300
          ${
            showButton
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-6 pointer-events-none"
          }
          bg-gray-600 text-white hover:bg-amber-700`}
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
};

export default App;
