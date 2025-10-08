// src/pages/regetration/VerifyOTP.jsx
import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../contexts/AuthContext";

export default function VerifyOTP() {
  const params = useParams();
  const phone = params.phone;
  const navigate = useNavigate();
  const { verifyOTP } = useAuth();

  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otpDigits];
      newOtp[index] = value;
      setOtpDigits(newOtp);

      if (value && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      while (newOtp.length < 6) newOtp.push("");
      setOtpDigits(newOtp);
      newOtp.forEach((digit, i) => {
        if (inputsRef.current[i]) {
          inputsRef.current[i].value = digit;
        }
      });
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const otp = otpDigits.join("");

    if (otp.length !== 6) {
      toast.error("من فضلك أدخل الكود كاملاً");
      return;
    }

    try {
      setLoading(true);
      const result = await verifyOTP(phone, otp);

      if (result.success) {
        toast.success("تم التحقق بنجاح ✅");
        navigate("/");
      } else {
        toast.error(result.error);
        setOtpDigits(Array(6).fill(""));
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع. حاول مرة أخرى.");
      setOtpDigits(Array(6).fill(""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reg">
      <form
        className="d-flex flex-wrap align-items-center"
        onSubmit={handleSubmit}
      >
        <h3 className="text-center text-white w-100">
          أدخل الرقم المتغير المرسل الى هاتفك
        </h3>

        <div
          className="w-100 text-center justify-content-center"
          style={{ display: "flex", gap: "10px" }}
        >
          {otpDigits.map((digit, index) => (
            <input
              className="form-control"
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              style={{
                width: "40px",
                height: "40px",
                textAlign: "center",
                fontSize: "20px",
              }}
            />
          ))}
        </div>

        <div className="align-self-end w-100">
          <button
            className="btn btn-primary w-100"
            type="submit"
            style={{ marginTop: "20px" }}
            disabled={loading}
          >
            {loading ? "جاري التحقق..." : "تأكيد"}
          </button>
        </div>
      </form>

      <ToastContainer position="top-center" />
    </div>
  );
}
