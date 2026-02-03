import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyPaymentPage = () => {
  const [statusMsg, setStatusMsg] = useState("Verifying Payment...");
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search || "";

  useEffect(() => {
    let cancelled = false;
    const verifyPayment = async () => {
      const params = new URLSearchParams(search);
      const rawSession = params.get("session_id");
      const session_id = rawSession ? rawSession.trim() : null;
      const payment_status = params.get("payment_status");
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      if (payment_status === "cancel") {
        navigate("/checkout", { replace: true });
        return;
      }

      if (!session_id) {
        setStatusMsg("No session_id found in the URL");
        return;
      }

      try {
        setStatusMsg("Confirming Payment with the server");
        const API_BASE = "http://localhost:4000";
        const res = await axios.get(`${API_BASE}/api/orders/confirm`, {
          params: { session_id },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 15000,
        });

        if (cancelled) return;
        if (res?.data?.success) {
          setStatusMsg("Payment Verified! Redirecting to Orders...");
          navigate("/my-orders", { replace: true });
          return;
        } else {
          const msg = res?.data?.message || "Payment not completed.";
          setStatusMsg(msg);
        }
      } catch (err) {
        console.error("Verification error:", err);
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message;

        if (status === 404) {
          setStatusMsg(
            serverMsg ||
              "Payment session not found. If you were charged, contact support with your session id.",
          );
        } else if (status === 400) {
          setStatusMsg(
            serverMsg || "Payment not completed or invalid request.",
          );
        } else {
          setStatusMsg(
            serverMsg ||
              "There was an error confirming your payment. If you were charged, please contact support.",
          );
        }
      }
    };

    verifyPayment();
    return () => {
      cancelled = true;
    };
  }, [search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-800 p-4">
      <div className="text-center max-w-lg">
        <p className="mb-2">{statusMsg}</p>
        <p className="text-sm opacity-70">
          If this page shows "session not found", try creating the session
          again. Or contact with the supoort.
        </p>
      </div>
    </div>
  );
};

export default VerifyPaymentPage;
