import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";

type FlashlightPasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  flashlightOn: boolean;
  onToggleFlashlight: () => void;
  // Cac phan tu khac chi hien khi bi den chieu (vd: con cu); dung style `litByBeamStyle`.
  revealTargets?: RefObject<HTMLElement | null>[];
};

// Nua goc mo cua luong sang (do). Luong sang chi dai toi con tro chuot (--beam-len), roi tat dan.
const BEAM_HALF_ANGLE = 18;
// Luc moi bat den (chua di chuot): chieu gan nhu thang len troi, KHONG trung o mat khau
// hay con cu, de ca hai chi hien khi nguoi dung chu dong soi toi.
const DEFAULT_AIM_OFFSET = { x: -40, y: -300 };
// Con tro qua sat den pin (vd: vua bam vao nut) thi khong xac dinh duoc huong -> dung huong mac dinh.
const MIN_AIM_DISTANCE = 40;
// Doan tat dan o cuoi luong sang (sau vi tri con tro).
const BEAM_FADE_PX = 40;

// Goc theo quy uoc conic-gradient cua CSS: 0deg = huong len, tang theo chieu kim dong ho.
function cssAngle(fromX: number, fromY: number, toX: number, toY: number) {
  return (Math.atan2(toX - fromX, -(toY - fromY)) * 180) / Math.PI;
}

// Do dai luong sang: sang deu toi con tro, tat dan trong BEAM_FADE_PX sau do.
const beamReach = (x: string, y: string) =>
  `radial-gradient(circle at ${x} ${y}, #000 0px, #000 var(--beam-len, 0px), transparent calc(var(--beam-len, 0px) + ${BEAM_FADE_PX}px))`;
const beamBeyond = (x: string, y: string) =>
  `radial-gradient(circle at ${x} ${y}, transparent 0px, transparent var(--beam-len, 0px), #000 calc(var(--beam-len, 0px) + ${BEAM_FADE_PX}px))`;

const beamStyle: CSSProperties = {
  background: `conic-gradient(from calc(var(--beam-angle) - ${BEAM_HALF_ANGLE}deg) at var(--ox) var(--oy),
    rgba(255, 228, 150, 0.08) 0deg,
    rgba(255, 236, 170, 0.36) ${BEAM_HALF_ANGLE}deg,
    rgba(255, 228, 150, 0.08) ${BEAM_HALF_ANGLE * 2}deg,
    transparent ${BEAM_HALF_ANGLE * 2 + 0.5}deg)`,
  maskImage: beamReach("var(--ox)", "var(--oy)"),
  WebkitMaskImage: beamReach("var(--ox)", "var(--oy)"),
  mixBlendMode: "screen",
};

// Toa do goc den tinh theo chinh phan tu duoc soi (--fox/--foy).
// Fallback: truoc khung hinh dau tien, goc den nam xa phia tren va chieu len, do dai 0
// -> chu/con cu bi an (neu thieu fallback, mask khong hop le se lam lo toan bo).
const ORIGIN = ["var(--fox, 50%)", "var(--foy, -5000px)"] as const;

const insideCone = `conic-gradient(from calc(var(--beam-angle, 0deg) - ${BEAM_HALF_ANGLE}deg) at ${ORIGIN[0]} ${ORIGIN[1]},
  transparent 0deg, #000 4deg, #000 ${BEAM_HALF_ANGLE * 2 - 4}deg, transparent ${BEAM_HALF_ANGLE * 2}deg)`;
const outsideCone = `conic-gradient(from calc(var(--beam-angle, 0deg) - ${BEAM_HALF_ANGLE}deg) at ${ORIGIN[0]} ${ORIGIN[1]},
  #000 0deg, transparent 4deg, transparent ${BEAM_HALF_ANGLE * 2 - 4}deg, #000 ${BEAM_HALF_ANGLE * 2}deg)`;

// Sang = trong hinh non VA trong tam chieu (giao 2 lop mask).
export const litTextMask = `${insideCone}, ${beamReach(...ORIGIN)}`;
// Toi = ngoai hinh non HOAC qua tam chieu (cong 2 lop mask) -> dung cho lop dau cham.
const unlitMask = `${outsideCone}, ${beamBeyond(...ORIGIN)}`;

const litMaskStyle: CSSProperties = {
  maskImage: litTextMask,
  WebkitMaskImage: litTextMask,
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
};

const unlitMaskStyle: CSSProperties = {
  maskImage: unlitMask,
  WebkitMaskImage: unlitMask,
  maskComposite: "add",
  WebkitMaskComposite: "source-over",
};

// Khi con tro nam TRONG o mat khau: den o ben phai nen hien chu tu ky tu dang tro
// sang het ben phai; ben trai con tro la dau cham.
const REVEAL_EDGE_PX = 2;
function revealFromMask(revealX: number) {
  return `linear-gradient(to right, transparent ${revealX - REVEAL_EDGE_PX}px, #000 ${revealX}px)`;
}
function hideFromMask(revealX: number) {
  return `linear-gradient(to right, #000 ${revealX - REVEAL_EDGE_PX}px, transparent ${revealX}px)`;
}

function setMask(element: HTMLElement | null, mask: CSSProperties) {
  if (!element) return;
  element.style.maskImage = String(mask.maskImage);
  element.style.setProperty("-webkit-mask-image", String(mask.WebkitMaskImage));
  element.style.maskComposite = String(mask.maskComposite ?? "add");
  element.style.setProperty("-webkit-mask-composite", String(mask.WebkitMaskComposite ?? "source-over"));
}

function singleMask(mask: string): CSSProperties {
  return { maskImage: mask, WebkitMaskImage: mask };
}

// Style cho phan tu chi hien trong vung luong sang (can duoc truyen vao revealTargets).
export const litByBeamStyle: CSSProperties = litMaskStyle;

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Den pin huong sang trai (dau den o ben trai); xoay theo con tro qua CSS var.
function FlashlightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect x="11" y="9" width="11" height="6" rx="1.5" fill="#94a3b8" />
      <rect x="15" y="10.2" width="2.5" height="3.6" rx="0.6" fill="#475569" />
      <path d="M11 8 L5 6 L5 18 L11 16 Z" fill="#cbd5e1" />
      <rect x="3.6" y="6" width="1.8" height="12" rx="0.8" fill="#fde68a" />
    </svg>
  );
}

export function FlashlightPasswordField({
  value,
  onChange,
  flashlightOn,
  onToggleFlashlight,
  revealTargets = [],
}: FlashlightPasswordFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!flashlightOn) return;

    let frame = 0;

    // Cap nhat CSS vars truc tiep tren DOM (khong setState) de chuot muot, khong re-render.
    const update = () => {
      frame = 0;
      const button = buttonRef.current;
      const field = fieldRef.current;
      if (!button || !field) return;

      const buttonRect = button.getBoundingClientRect();
      const originX = buttonRect.left + buttonRect.width / 2;
      const originY = buttonRect.top + buttonRect.height / 2;
      const pointer = pointerRef.current;
      const aim =
        pointer && Math.hypot(pointer.x - originX, pointer.y - originY) >= MIN_AIM_DISTANCE
          ? pointer
          : { x: originX + DEFAULT_AIM_OFFSET.x, y: originY + DEFAULT_AIM_OFFSET.y };
      const angle = cssAngle(originX, originY, aim.x, aim.y);
      const beamLength = Math.hypot(aim.x - originX, aim.y - originY);

      beamRef.current?.style.setProperty("--ox", `${originX}px`);
      beamRef.current?.style.setProperty("--oy", `${originY}px`);
      beamRef.current?.style.setProperty("--beam-angle", `${angle}deg`);
      beamRef.current?.style.setProperty("--beam-len", `${beamLength}px`);

      // Moi phan tu duoc soi can goc den tinh theo toa do cua chinh no.
      for (const target of [field, ...revealTargets.map((ref) => ref.current)]) {
        if (!target) continue;
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--fox", `${originX - rect.left}px`);
        target.style.setProperty("--foy", `${originY - rect.top}px`);
        target.style.setProperty("--beam-angle", `${angle}deg`);
        target.style.setProperty("--beam-len", `${beamLength}px`);
      }
      // Con tro nam trong o mat khau (tru nut den pin) -> hien chu den dung vi tri con tro;
      // ngoai o -> chu chi hien o vung luong den chieu toi.
      const fieldRect = field.getBoundingClientRect();
      const pointerInsideField =
        pointer !== null &&
        pointer.x >= fieldRect.left &&
        pointer.x < buttonRect.left &&
        pointer.y >= fieldRect.top &&
        pointer.y <= fieldRect.bottom;
      if (pointerInsideField) {
        // Hien tron ky tu: tu mep trai cua ky tu dang tro toi het ben phai.
        const dots = Array.from(dotsRef.current?.children ?? []);
        const pointedDot = dots.find((dot) => dot.getBoundingClientRect().right > pointer.x);
        const revealX = pointedDot
          ? pointedDot.getBoundingClientRect().left - fieldRect.left
          : fieldRect.width; // tro sau ky tu cuoi -> chua hien gi
        setMask(litRef.current, singleMask(revealFromMask(revealX)));
        setMask(dotsRef.current, singleMask(hideFromMask(revealX)));
      } else {
        setMask(litRef.current, litMaskStyle);
        setMask(dotsRef.current, unlitMaskStyle);
      }

      // Icon den pin ve san huong trai (-90deg) -> xoay them de chi theo con tro.
      button.style.setProperty("--icon-rotate", `${angle + 90}deg`);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      schedule();
    };

    schedule();
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
    // revealTargets la mang ref on dinh tu component cha.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashlightOn]);

  return (
    <div ref={fieldRef} className="relative">
      <input
        type={flashlightOn ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Mật khẩu"
        autoComplete="current-password"
        spellCheck={false}
        // -webkit-text-fill-color: trinh duyet ep mau chu cua o tu dien (autofill) bang !important,
        // chi thuoc tinh nay moi an duoc chu; chu that chi hien o lop "sang" ben duoi.
        style={
          flashlightOn
            ? { color: "transparent", WebkitTextFillColor: "transparent", caretColor: "#fde68a" }
            : undefined
        }
        className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm outline-none ${flashlightOn ? "font-mono tracking-normal" : "tracking-wider"} transition-colors duration-700 ${
          flashlightOn
            ? "login-input-night border-white/25 bg-transparent placeholder:text-slate-400 focus:border-amber-200/40"
            : "login-input-day border-white/60 bg-white/60 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        }`}
      />

      {/* Che do den pin: lop chu mo (gan nhu chim trong bong toi) + lop chu sang chi hien trong luong sang */}
      {flashlightOn && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Lop chim: chi hien dau cham (biet do dai, khong doc duoc chu) */}
          <div
            ref={dotsRef}
            className="absolute inset-0 flex items-center overflow-hidden whitespace-pre px-4 pr-12 text-sm font-mono tracking-normal text-white"
            style={unlitMaskStyle}
          >
            {/* Font don cach: moi ky tu rong bang nhau -> dau cham deu, sat nhau va thang cot voi lop chu sang */}
            {Array.from(value).map((char, index) => (
              <span key={index} className="relative">
                <span className="invisible">{char}</span>
                <span className="absolute inset-0 flex items-center justify-center">•</span>
              </span>
            ))}
          </div>
          <div
            ref={litRef}
            className="absolute inset-0 flex items-center overflow-hidden whitespace-pre px-4 pr-12 text-sm font-mono tracking-normal text-amber-100"
            style={{
              textShadow: "0 0 8px rgba(253, 230, 138, 0.8)",
              ...litMaskStyle,
            }}
          >
            {value}
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={onToggleFlashlight}
        aria-label={flashlightOn ? "Tắt đèn pin, ẩn mật khẩu" : "Bật đèn pin để soi mật khẩu"}
        aria-pressed={flashlightOn}
        className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition-colors ${
          flashlightOn ? "text-amber-200 hover:bg-white/10" : "text-slate-500 hover:bg-white/50 hover:text-slate-700"
        }`}
      >
        {flashlightOn ? (
          <span
            className="block transition-transform duration-75"
            style={{ transform: "rotate(var(--icon-rotate, 0deg))" }}
          >
            <FlashlightIcon />
          </span>
        ) : (
          <EyeIcon />
        )}
      </button>

      {/* Luong sang phu toan man hinh; portal ra body vi the cha co backdrop-blur
          (backdrop-filter lam position: fixed bi gioi han trong the). */}
      {flashlightOn &&
        createPortal(
          <div
            ref={beamRef}
            className="pointer-events-none fixed inset-0 z-40"
            style={beamStyle}
            aria-hidden="true"
          />,
          document.body
        )}
    </div>
  );
}
