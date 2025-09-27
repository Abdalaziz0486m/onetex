import Joi from "joi";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [user, setUser] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate(); // ✅ هوك بيتاخد هنا مش جوه الفانكشن

  function getUser(e) {
    const { id, value } = e.target;
    setUser((prevuser) => ({ ...prevuser, [id]: value }));
  }

  const schema = Joi.object({
    password: Joi.string()
      .pattern(/^[a-zA-Z0-9]{3,30}$/)
      .required()
      .messages({
        "string.empty": "الرقم السري مطلوب.",
        "string.pattern.base":
          "كلمة المرور لازم تكون بين 3 و30 حرف أو رقم، من غير رموز خاصة.",
      }),
    phone: Joi.string()
      .pattern(
        /^((\+20)?1[0125][0-9]{8}|0?1[0125][0-9]{8}|(\+966)?5[0-9]{8}|05[0-9]{8})$/
      )
      .required()
      .messages({
        "string.empty": "رقم الجوال مطلوب.",
        "string.pattern.base":
          "رقم الجوال لازم يكون بصيغة مصرية أو سعودية صحيحة. أمثلة: 01012345678 أو +201012345678 أو 0551234567 أو +966551234567",
      }),
  });

  function mapJoiMessage(detail) {
    const key = detail.path && detail.path[0];
    if (key === "phone") {
      return (
        detail.message ||
        "الرجاء إدخال رقم جوال مصري أو سعودي بصيغة صحيحة (مثال: 01012345678 أو +966551234567)."
      );
    }
    if (key === "password") {
      return (
        detail.message ||
        "الرجاء إدخال كلمة مرور بين 3 و30 حرف/رقم بدون رموز خاصة."
      );
    }
    return detail.message || "هناك خطأ في الإدخال.";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { error } = schema.validate(user, { abortEarly: false });
    if (error) {
      const messages = Array.from(
        new Set(error.details.map((d) => mapJoiMessage(d)))
      );
      messages.forEach((msg) => toast.error(msg));
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(`${baseUrl}/api/auth/login`, user);
      toast.success("تم تسجيل الدخول بنجاح 🎉");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/"); // ✅ هنا بتتنادى صح
    } catch (err) {
      toast.error(
        err.response?.data?.message || "فشل تسجيل الدخول. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reg">
      <form
        className="d-flex flex-wrap align-items-center"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="mb-1 w-100">
          <label htmlFor="phone" className="form-label text-white fw-bold fs-5">
            رقم الجوال
          </label>
          <input
            type="text"
            id="phone"
            onChange={getUser}
            value={user.phone}
            className="form-control"
            dir="ltr"
            placeholder="مثال: 01012345678 أو +966551234567"
            inputMode="tel"
          />
        </div>

        <div className="mb-1 w-100">
          <label
            htmlFor="password"
            className="form-label text-white fw-bold fs-5"
          >
            الرقم السري
          </label>

          <div className="input-group">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={
                showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
              }
              title={showPassword ? "إخفاء" : "إظهار"}
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              onChange={getUser}
              value={user.password}
              className="form-control"
              dir="ltr"
              placeholder="أدخل كلمة المرور"
              autoComplete="current-password"
            />
          </div>
        </div>

        <div className="align-self-end w-100 text-center mt-3">
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "جاري التسجيل..." : "تسجيل"}
          </button>
        </div>
      </form>

      <ToastContainer position="top-center" />
    </div>
  );
}
