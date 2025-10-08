// src/pages/regetration/Signup.jsx
import Joi from "joi";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

export default function Signup() {
  const [user, setUser] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { signUp } = useAuth();

  function getUser(e) {
    const { id, value } = e.target;
    setUser((prev) => ({ ...prev, [id]: value }));
  }

  const schema = Joi.object({
    phone: Joi.string()
      .pattern(
        /^((\+20)?1[0125][0-9]{8}|0?1[0125][0-9]{8}|(\+966)?5[0-9]{8}|05[0-9]{8})$/
      )
      .required()
      .messages({
        "string.empty": "رقم الجوال مطلوب.",
        "string.pattern.base":
          "رقم الجوال لازم يكون بصيغة مصرية أو سعودية صحيحة.",
      }),

    password: Joi.string()
      .pattern(/^[a-zA-Z0-9]{3,30}$/)
      .required()
      .messages({
        "string.empty": "الرقم السري مطلوب.",
        "string.pattern.base":
          "كلمة المرور لازم تكون بين 3 و30 حرف أو رقم، من غير رموز خاصة.",
      }),

    confermPassword: Joi.any().valid(Joi.ref("password")).required().messages({
      "any.only": "تأكيد كلمة المرور غير مطابق.",
      "any.required": "تأكيد كلمة المرور مطلوب.",
    }),
  });

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());

    const { error } = schema.validate(values, { abortEarly: false });
    if (error) {
      const messages = [...new Set(error.details.map((d) => d.message))];
      messages.forEach((msg) => toast.error(msg));
      return;
    }

    try {
      setLoading(true);
      const result = await signUp({
        phone: values.phone,
        password: values.password,
      });

      if (result.success) {
        toast.success(result.data.message);
        console.log(result.data.otp);
        navigate(`/verify/${user.phone}`);
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("حدث خطأ غير متوقع. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="reg">
        <form
          className="d-flex flex-wrap align-items-center"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* phone */}
          <div className="mb-1 w-100">
            <label
              htmlFor="phone"
              className="form-label text-white fw-bold fs-5"
            >
              رقم الجوال
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              onChange={getUser}
              value={user.phone}
              className="form-control"
              dir="ltr"
              placeholder="مثال: 01012345678 أو +966551234567"
              inputMode="tel"
            />
          </div>

          {/* password */}
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
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                onChange={getUser}
                value={user.password}
                className="form-control"
                dir="ltr"
                placeholder="أدخل كلمة المرور"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* confermPassword */}
          <div className="mb-1 w-100">
            <label
              htmlFor="confermPassword"
              className="form-label text-white fw-bold fs-5"
            >
              تأكيد الرقم السري
            </label>
            <div className="input-group">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              <input
                type={showPassword ? "text" : "password"}
                id="confermPassword"
                name="confermPassword"
                className="form-control"
                dir="ltr"
                placeholder="أكد كلمة المرور"
                autoComplete="new-password"
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
    </>
  );
}
