import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

type LoginSceneProps = {
  night: boolean;
  className?: string;
};

// Vi tri sao co dinh (khong random moi lan render de tranh nhap nhay).
const STARS = [
  [40, 30, 1.2], [95, 60, 0.8], [150, 22, 1], [210, 48, 1.4], [265, 18, 0.9],
  [320, 55, 1.1], [370, 28, 0.8], [60, 95, 0.9], [180, 85, 0.7], [300, 100, 1],
  [345, 80, 0.7], [120, 120, 0.8], [240, 115, 0.9], [25, 140, 0.7], [385, 135, 1],
];

const TREES = [
  [28, 300, 1], [52, 308, 0.8], [330, 298, 1.1], [358, 306, 0.85], [378, 312, 0.7],
];

// Thien the cu lan xuong sau nui (SET_MS), xong thien the moi moi ngoi len (RISE_MS).
const SET_MS = 700;
const RISE_MS = 800;
// Khoang cach (don vi viewBox) de thien the khuat han sau day nui.
const HIDDEN_OFFSET = 260;

const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Tinh vi tri bang JS va ghi vao thuoc tinh transform cua SVG (khong dung CSS animation:
// trinh duyet co the ve sai trang thai cuoi cua CSS animation tren phan tu SVG khi ve lai).
function useCelestialOffsets(night: boolean) {
  const [elapsed, setElapsed] = useState<number | null>(null); // null = khong chuyen canh
  // So voi gia tri truoc (khong dung co "lan dau") vi StrictMode chay effect 2 lan khi mount.
  const previousNight = useRef(night);

  useEffect(() => {
    if (previousNight.current === night) return;
    previousNight.current = night;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const time = now - start;
      if (time >= SET_MS + RISE_MS) {
        setElapsed(null);
        return;
      }
      setElapsed(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [night]);

  // Thien the dang hien (moi) va dang lan (cu).
  let incoming = 0;
  let outgoing = HIDDEN_OFFSET;
  if (elapsed !== null) {
    outgoing = elapsed < SET_MS ? HIDDEN_OFFSET * easeIn(elapsed / SET_MS) : HIDDEN_OFFSET;
    incoming =
      elapsed < SET_MS ? HIDDEN_OFFSET : HIDDEN_OFFSET * (1 - easeOut((elapsed - SET_MS) / RISE_MS));
  }
  return night ? { sun: outgoing, moon: incoming } : { sun: incoming, moon: outgoing };
}

// Doi mau tu tu cho troi/nui; chi mat troi, mat trang la di chuyen.
const COLOR_TRANSITION: CSSProperties = { transition: "fill 900ms ease, stop-color 900ms ease" };

function Tree({ x, y, scale, color }: { x: number; y: number; scale: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={{ ...COLOR_TRANSITION, fill: color }}>
      <polygon points="0,-46 -12,-22 12,-22" />
      <polygon points="0,-34 -15,-8 15,-8" />
      <polygon points="0,-20 -18,8 18,8" />
      <rect x="-2" y="8" width="4" height="8" />
    </g>
  );
}

// Canh nui ngay/dem dung chung cho nen trang va panel trai cua the dang nhap.
// Khi doi canh: thien the cu "lan" xuong sau day nui, thien the moi tu tren troi di xuong.
export function LoginScene({ night, className }: LoginSceneProps) {
  // Nhieu canh cung luc tren trang -> id gradient phai rieng, neu khong se lay nham mau cua canh khac.
  const uid = useId().replace(/:/g, "");
  const skyId = `login-sky-${uid}`;
  const sunId = `login-sun-${uid}`;
  const moonId = `login-moon-${uid}`;

  const offsets = useCelestialOffsets(night);

  const sky = night ? ["#0b1224", "#1c2a4a"] : ["#cfe6ec", "#9cc7d1"];
  const far = night ? "#26365a" : "#a9cdd5";
  const mid = night ? "#1b2846" : "#7fb0bc";
  const near = night ? "#111b33" : "#5b93a2";
  const tree = night ? "#0a1224" : "#3f7685";

  return (
    <svg
      viewBox="0 0 400 340"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ ...COLOR_TRANSITION, stopColor: sky[0] }} />
          <stop offset="100%" style={{ ...COLOR_TRANSITION, stopColor: sky[1] }} />
        </linearGradient>
        <radialGradient id={sunId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8d6" />
          <stop offset="70%" stopColor="#ffe69a" />
          <stop offset="100%" stopColor="#ffd56b" />
        </radialGradient>
        <radialGradient id={moonId} cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#9aa8bf" />
        </radialGradient>
      </defs>

      <rect width="400" height="340" fill={`url(#${skyId})`} />

      {/* Sao: hien dan khi dem xuong */}
      <g
        fill="#e2e8f0"
        style={{ transition: "opacity 900ms ease", opacity: night ? 1 : 0 }}
      >
        {STARS.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>

      {/* Mat troi / mat trang ve truoc nui -> nui che khi "lan" xuong. */}
      <g transform={`translate(0 ${offsets.sun})`}>
        <circle cx="130" cy="80" r="44" fill="#fff4c2" opacity="0.35" />
        <circle cx="130" cy="80" r="30" fill={`url(#${sunId})`} />
      </g>
      <g transform={`translate(0 ${offsets.moon})`}>
        <circle cx="200" cy="78" r="34" fill="#cbd5e1" opacity="0.12" />
        <circle cx="200" cy="78" r="22" fill={`url(#${moonId})`} />
        <circle cx="193" cy="72" r="4" fill="#8f9bb0" opacity="0.5" />
        <circle cx="207" cy="85" r="3" fill="#8f9bb0" opacity="0.4" />
      </g>

      {/* Nui va cay dung yen, chi doi mau */}
      <polygon points="0,230 70,150 130,205 200,130 270,200 330,155 400,215 400,340 0,340" style={{ ...COLOR_TRANSITION, fill: far }} />
      <polygon points="0,265 80,200 150,250 230,190 310,245 400,205 400,340 0,340" style={{ ...COLOR_TRANSITION, fill: mid }} />
      <polygon points="0,300 90,262 190,292 290,258 400,290 400,340 0,340" style={{ ...COLOR_TRANSITION, fill: near }} />

      {TREES.map(([x, y, scale]) => (
        <Tree key={`${x}-${y}`} x={x} y={y} scale={scale} color={tree} />
      ))}
    </svg>
  );
}
