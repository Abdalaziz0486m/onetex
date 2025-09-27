import axios from "axios";
import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VerifyOTP() {
  const params = useParams();
  const phone = params.phone;
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  // نخزن الأرقام كل رقم في index
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  // تحديث الرقم اللي في كل input
  const handleChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otpDigits];
      newOtp[index] = value;
      setOtpDigits(newOtp);

      // التنقل للـ input اللي بعده
      if (value && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  // عند الضغط على Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // عند عمل Paste
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

  // عند ارسال الفورم
  async function handleSubmit(e) {
    e.preventDefault();
    const otp = otpDigits.join("");

    if (otp.length !== 6) {
      toast.error("من فضلك أدخل الكود كاملاً");
      return;
    }

    const payload = { phone, otp };

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${baseUrl}/api/auth/verify-otp`,
        payload
      );
      toast.success("تم التحقق بنجاح ✅");
      console.log("Response:", data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/"); // ✅ هنا بتتنادى صح
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "كود التحقق غير صحيح ❌");
      setOtpDigits(Array(6).fill("")); // تصفير الحقول
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

      {/* Toast notifications */}
      <ToastContainer position="top-center" />
    </div>
  );
}
