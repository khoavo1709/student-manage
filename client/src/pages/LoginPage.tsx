import { FormEvent, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoginScene } from "../components/login/LoginScene";
import { Owl } from "../components/login/Owl";
import {
  FlashlightPasswordField,
  litByBeamStyle,
} from "../components/login/FlashlightPasswordField";

// Doi loi dang nhap sang thong bao tieng Viet cho nguoi dung.
function getLoginErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) return "Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại.";
    if (status === 429) return "Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.";
    if (status === 400) return "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.";
    if (!error.response) return "Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.";
  }
  return "Đăng nhập thất bại do lỗi hệ thống. Vui lòng thử lại sau.";
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Bat den pin = chuyen sang canh dem va soi duoc mat khau.
  const [flashlightOn, setFlashlightOn] = useState(false);
  const owlRef = useRef<HTMLDivElement>(null);
  const revealTargets = useRef([owlRef]).current;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate("/");
    } catch (err) {
      console.log("Login failed", err);
      setError(getLoginErrorMessage(err));
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  }

  const night = flashlightOn;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Nen: cung canh nui, lam mo */}
      <LoginScene night={night} className="absolute inset-0 h-full w-full" />
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          night ? "bg-slate-950/50" : "bg-white/20"
        }`}
      />

      <div
        className={`relative grid w-full max-w-3xl overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-xl transition-colors duration-700 md:grid-cols-2 ${
          night ? "border-white/10 bg-slate-900/40" : "border-white/60 bg-white/35"
        }`}
      >
        {/* Panel trai: minh hoa */}
        <div className="relative m-3 hidden overflow-hidden rounded-2xl md:block">
          <LoginScene night={night} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-6 pb-8 pt-16 text-center text-white">
            <h2 className="text-2xl font-semibold">Quản lý học sinh</h2>
            <p className="mt-2 text-sm text-white/80">
              Theo dõi lớp học, điểm số, lịch học và học phí ở cùng một nơi.
            </p>
          </div>
        </div>

        {/* Form dang nhap */}
        <form onSubmit={handleSubmit} className="relative px-8 py-10 sm:px-10">
          {/* Con cu: chi thay khi den pin roi toi */}
          <div
            ref={owlRef}
            className={`pointer-events-none absolute left-6 top-6 h-16 w-14 transition-opacity duration-500 ${
              flashlightOn ? "opacity-100" : "opacity-0"
            }`}
            style={litByBeamStyle}
          >
            <Owl className="h-full w-full" />
          </div>

          <h1
            className={`text-center text-2xl font-semibold transition-colors duration-700 ${
              night ? "text-slate-100" : "text-slate-800"
            }`}
          >
            Đăng nhập
          </h1>
          <p
            className={`mt-1 text-center text-sm transition-colors duration-700 ${
              night ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Chào mừng bạn quay lại 👋
          </p>

          <div className="mt-8 space-y-4">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              autoComplete="username"
              autoFocus
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors duration-700 ${
                night
                  ? "login-input-night border-white/25 bg-transparent text-slate-100 placeholder:text-slate-400 focus:border-amber-200/40"
                  : "login-input-day border-white/60 bg-white/60 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              }`}
            />

            <FlashlightPasswordField
              value={password}
              onChange={setPassword}
              flashlightOn={flashlightOn}
              onToggleFlashlight={() => setFlashlightOn((current) => !current)}
              revealTargets={revealTargets}
            />

            <p
              className={`text-right text-xs transition-colors duration-700 ${
                night ? "text-amber-200/70" : "text-slate-500"
              }`}
            >
              {flashlightOn
                ? "Di chuột để soi mật khẩu 🔦"
                : "Bấm vào con mắt để bật đèn pin"}
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-teal-900/20 transition hover:from-teal-500 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
              {!submitting && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </form>
      </div>

      {/* Popup bao loi dang nhap */}
      {error && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setError(null)}
        >
          <div
            role="alertdialog"
            aria-labelledby="login-error-title"
            className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
              !
            </div>
            <h2 id="login-error-title" className="mt-4 text-lg font-semibold text-gray-900">
              Đăng nhập thất bại
            </h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              autoFocus
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
