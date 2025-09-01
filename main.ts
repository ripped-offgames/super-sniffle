import React, { useEffect, useRef, useState, useMemo } from "react";

// Mini Arcade – single-file React site with 3 games: Snake, Falling Blocks, Whack-a-Mole
// Styling via Tailwind (available in Canvas). No external assets required.
// Tip: Export this component into any React project or deploy as-is in frameworks like Vite/Next.

export default function MiniArcade() {
  const [view, setView] = useState<"home" | "snake" | "dodge" | "mole">("home");
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <Header onNav={setView} current={view} />
      <main className="max-w-6xl mx-auto px-4 pb-24">
        {view === "home" && <Home onPlay={setView} />}
        {view === "snake" && <Snake onBack={() => setView("home")} />}
        {view === "dodge" && <Dodge onBack={() => setView("home")} />}
        {view === "mole" && <WhackAMole onBack={() => setView("home")} />}
      </main>
      <Footer />
    </div>
  );
}

function Header({ onNav, current }: { onNav: (v: any) => void; current: string }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 shadow">
            🎮
          </span>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Mini Arcade</h1>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <NavButton active={current === "home"} onClick={() => onNav("home")}>Home</NavButton>
          <NavButton active={current === "snake"} onClick={() => onNav("snake")}>Snake</NavButton>
          <NavButton active={current === "dodge"} onClick={() => onNav("dodge")}>Dodge</NavButton>
          <NavButton active={current === "mole"} onClick={() => onNav("mole")}>Whack‑A‑Mole</NavButton>
        </nav>
      </div>
    </header>
  );
}

function NavButton({ active, children, ...props }: any) {
  return (
    <button
      className={`px-3 py-1.5 rounded-xl transition shadow-sm ${
        active ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

function Home({ onPlay }: { onPlay: (v: any) => void }) {
  const cards = [
    {
      key: "snake",
      title: "Snake",
      desc: "Classic grid snake. Eat, grow, avoid yourself.",
      emoji: "🟩",
    },
    {
      key: "dodge",
      title: "Falling Blocks",
      desc: "Dodge falling blocks as long as you can.",
      emoji: "🧱",
    },
    {
      key: "mole",
      title: "Whack‑A‑Mole",
      desc: "Tap moles before they hide again.",
      emoji: "🐹",
    },
  ] as const;

  return (
    <section className="pt-10">
      <div className="mb-8 max-w-3xl">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Pick a game & go!
        </h2>
        <p className="text-slate-300">
          Keyboard or touch-friendly. Works offline once loaded. Use the nav above to switch games.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c) => (
          <button
            key={c.key}
            onClick={() => onPlay(c.key)}
            className="group text-left rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition shadow-lg p-5"
          >
            <div className="text-4xl mb-3">{c.emoji}</div>
            <div className="font-semibold text-lg mb-1">{c.title}</div>
            <div className="text-slate-300 text-sm">{c.desc}</div>
            <div className="mt-4 text-xs text-slate-400 group-hover:text-slate-200">Click to play →</div>
          </button>
        ))}
      </div>
      <Tips />
    </section>
  );
}

function Tips() {
  return (
    <div className="mt-10 grid sm:grid-cols-3 gap-4">
      {[
        { t: "Snake", d: "WASD / Arrows to move. P to pause." },
        { t: "Dodge", d: "A/D or ←/→ to move. Phone: drag." },
        { t: "Mole", d: "Click/tap holes fast. 60s round." },
      ].map((x) => (
        <div key={x.t} className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4">
          <div className="font-semibold mb-1">{x.t} tips</div>
          <div className="text-sm text-slate-300">{x.d}</div>
        </div>
      ))}
    </div>
  );
}

function CardFrame({ title, onBack, children }: any) {
  return (
    <section className="pt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <button onClick={onBack} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700">
          ← Back
        </button>
      </div>
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl p-4">
        {children}
      </div>
    </section>
  );
}

/***************************
 * Game 1: Snake            *
 ***************************/
function Snake({ onBack }: { onBack: () => void }) {
  const size = 20; // grid size
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(120);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dir, setDir] = useState<[number, number]>([1, 0]);
  const [snake, setSnake] = useState<[number, number][]>([
    [5, 5],
    [4, 5],
  ]);
  const [food, setFood] = useState<[number, number]>([10, 8]);
  const cols = 24, rows = 18;

  const reset = () => {
    setSnake([
      [5, 5],
      [4, 5],
    ]);
    setDir([1, 0]);
    setFood([Math.floor(Math.random() * cols), Math.floor(Math.random() * rows)]);
    setScore(0);
    setRunning(true);
    setPaused(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "w"].includes(k) && dir[1] !== 1) setDir([0, -1]);
      else if (["arrowdown", "s"].includes(k) && dir[1] !== -1) setDir([0, 1]);
      else if (["arrowleft", "a"].includes(k) && dir[0] !== 1) setDir([-1, 0]);
      else if (["arrowright", "d"].includes(k) && dir[0] !== -1) setDir([1, 0]);
      else if (k === "p") setPaused((p) => !p);
      else if (k === "r") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dir]);

  useEffect(() => {
    if (!running || paused) return;
    const id = setInterval(() => tick(), speed);
    return () => clearInterval(id);
  }, [running, paused, snake, dir, speed]);

  const tick = () => {
    setSnake((sn) => {
      const head: [number, number] = [sn[0][0] + dir[0], sn[0][1] + dir[1]];
      // wrap
      head[0] = (head[0] + cols) % cols;
      head[1] = (head[1] + rows) % rows;
      const newBody = [head, ...sn];
      // eat
      if (head[0] === food[0] && head[1] === food[1]) {
        setScore((s) => s + 1);
        setFood([Math.floor(Math.random() * cols), Math.floor(Math.random() * rows)]);
        setSpeed((sp) => Math.max(60, sp - 2));
      } else {
        newBody.pop();
      }
      // self hit
      for (let i = 1; i < newBody.length; i++) {
        if (newBody[i][0] === head[0] && newBody[i][1] === head[1]) {
          setRunning(false);
          break;
        }
      }
      return newBody;
    });
  };

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;
    const w = cols * size, h = rows * size;
    cvs.width = w; cvs.height = h;
    // draw bg
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, w, h);
    // grid dots
    ctx.fillStyle = "#1e293b";
    for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) ctx.fillRect(x*size, y*size, 1, 1);
    // food
    ctx.fillStyle = "#f472b6";
    ctx.fillRect(food[0] * size, food[1] * size, size, size);
    // snake
    ctx.fillStyle = "#22d3ee";
    snake.forEach(([x, y], i) => {
      ctx.globalAlpha = Math.max(0.6, 1 - i * 0.02);
      ctx.fillRect(x * size, y * size, size, size);
    });
    ctx.globalAlpha = 1;
  }, [snake, food]);

  return (
    <CardFrame title="Snake" onBack={onBack}>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <canvas ref={canvasRef} className="rounded-2xl border border-slate-800 shadow w-full sm:w-auto" style={{imageRendering:"pixelated"}} />
        <div className="flex-1 space-y-3">
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4">
            <div className="text-sm text-slate-300">Score</div>
            <div className="text-3xl font-bold">{score}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setRunning(true)} className="rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-500">
              {running ? (paused ? "Resume" : "Running…") : "Start"}
            </button>
            <button onClick={() => setPaused((p) => !p)} className="rounded-xl px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700">
              {paused ? "Unpause" : "Pause"}
            </button>
            <button onClick={reset} className="rounded-xl px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 col-span-2">Reset (R)</button>
          </div>
          {!running && (
            <div className="text-slate-400 text-sm">Press arrows/WASD to move. Wrap-around enabled. Don't bite your tail!</div>
          )}
        </div>
      </div>
    </CardFrame>
  );
}

/***************************
 * Game 2: Falling Blocks   *
 ***************************/
function Dodge({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(() => {
    const v = localStorage.getItem("dodgeBest");
    return v ? Number(v) : 0;
  });

  const W = 420, H = 560;
  const player = useRef({ x: W / 2, y: H - 40, w: 22, h: 22, speed: 5 });
  const blocks = useRef<{ x: number; y: number; w: number; h: number; vy: number }[]>([]);
  const keys = useRef<Record<string, boolean>>({});
  const anim = useRef<number | null>(null);
  const last = useRef<number>(0);

  const reset = () => {
    blocks.current = [];
    setScore(0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.type === "keydown") keys.current[e.key.toLowerCase()] = true;
      else keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    const onTouch = (e: TouchEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      player.current.x = x;
    };
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  useEffect(() => {
    const step = (t: number) => {
      if (!running) return;
      const dt = Math.min(33, t - last.current);
      last.current = t;
      update(dt / 16);
      draw();
      anim.current = requestAnimationFrame(step);
    };
    if (running) {
      last.current = performance.now();
      anim.current = requestAnimationFrame(step);
    }
    return () => {
      if (anim.current) cancelAnimationFrame(anim.current);
    };
  }, [running]);

  const update = (dt: number) => {
    const p = player.current;
    if (keys.current["arrowleft"] || keys.current["a"]) p.x -= p.speed * dt * 3;
    if (keys.current["arrowright"] || keys.current["d"]) p.x += p.speed * dt * 3;
    p.x = Math.max(p.w / 2, Math.min(W - p.w / 2, p.x));

    // spawn
    if (Math.random() < 0.04 + score * 0.0005) {
      const bw = 20 + Math.random() * 40;
      blocks.current.push({ x: Math.random() * (W - bw), y: -40, w: bw, h: 14 + Math.random() * 18, vy: 2 + Math.random() * (2 + score * 0.02) });
    }

    // move blocks
    blocks.current.forEach((b) => (b.y += b.vy * dt * 3));
    // remove off-screen & score
    blocks.current = blocks.current.filter((b) => {
      if (b.y > H + 50) {
        setScore((s) => s + 1);
        return false;
      }
      return true;
    });

    // collisions
    for (const b of blocks.current) {
      if (Math.abs(b.x + b.w / 2 - p.x) < (b.w + p.w) / 2 && Math.abs(b.y + b.h / 2 - p.y) < (b.h + p.h) / 2) {
        setRunning(false);
        setBest((bd) => {
          const nb = Math.max(bd, score);
          localStorage.setItem("dodgeBest", String(nb));
          return nb;
        });
        break;
      }
    }
  };

  const draw = () => {
    const cvs = canvasRef.current; if (!cvs) return; const ctx = cvs.getContext("2d")!;
    cvs.width = W; cvs.height = H;
    ctx.fillStyle = "#0b1220"; ctx.fillRect(0, 0, W, H);
    // player
    ctx.fillStyle = "#a78bfa"; ctx.fillRect(player.current.x - player.current.w/2, player.current.y - player.current.h/2, player.current.w, player.current.h);
    // blocks
    ctx.fillStyle = "#22d3ee"; blocks.current.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
    // score
    ctx.fillStyle = "#94a3b8"; ctx.font = "16px ui-sans-serif"; ctx.fillText(`Score: ${score}`, 10, 22);
  };

  return (
    <CardFrame title="Falling Blocks – Dodge" onBack={onBack}>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <canvas ref={canvasRef} className="rounded-2xl border border-slate-800 shadow w-full sm:w-auto" />
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { reset(); setRunning(true); }} className="rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-500">Start</button>
            <button onClick={() => setRunning(false)} className="rounded-xl px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700">Stop</button>
          </div>
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4">
            <div className="text-sm text-slate-300">Score</div>
            <div className="text-3xl font-bold">{score}</div>
            <div className="text-sm text-slate-400 mt-2">Best: {best}</div>
          </div>
          <p className="text-slate-400 text-sm">Use A/D or ←/→ to move, or drag on mobile. Avoid the blocks. Score rises as you survive.</p>
        </div>
      </div>
    </CardFrame>
  );
}

/***************************
 * Game 3: Whack‑A‑Mole     *
 ***************************/
function WhackAMole({ onBack }: { onBack: () => void }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  const holes = useMemo(() => Array.from({ length: 9 }, (_, i) => i), []);
  const timerRef = useRef<number | null>(null);
  const moleRef = useRef<number | null>(null);

  const start = () => {
    setScore(0); setTimeLeft(60); setRunning(true); setActive(null);
    // countdown
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { stop(); return 0; }
        return t - 1;
      });
    }, 1000);
    // mole popping
    if (moleRef.current) clearInterval(moleRef.current);
    moleRef.current = window.setInterval(() => {
      const next = Math.floor(Math.random() * holes.length);
      setActive(next);
      // hide after random short time
      const hideAfter = 400 + Math.random() * 600;
      setTimeout(() => setActive((a) => (a === next ? null : a)), hideAfter);
    }, 700);
  };

  const stop = () => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (moleRef.current) clearInterval(moleRef.current);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); if (moleRef.current) clearInterval(moleRef.current); }, []);

  const whack = (i: number) => {
    if (!running) return;
    if (i === active) {
      setScore((s) => s + 1);
      setActive(null);
    } else {
      setScore((s) => Math.max(0, s - 1));
    }
  };

  return (
    <CardFrame title="Whack‑A‑Mole" onBack={onBack}>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="grid grid-cols-3 gap-4">
          {holes.map((i) => (
            <button key={i} onClick={() => whack(i)} className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-inner overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-slate-900/60" />
              <div className={`absolute inset-4 rounded-full transition-all duration-150 ${i === active ? "translate-y-0" : "translate-y-24"}`}>
                <div className="w-full h-full rounded-full bg-pink-400 shadow-lg flex items-center justify-center text-3xl">🐹</div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-3 min-w-[220px]">
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4">
            <div className="text-sm text-slate-300">Time</div>
            <div className="text-3xl font-bold">{timeLeft}s</div>
          </div>
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4">
            <div className="text-sm text-slate-300">Score</div>
            <div className="text-3xl font-bold">{score}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={start} className="rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-500">Start</button>
            <button onClick={stop} className="rounded-xl px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700">Stop</button>
          </div>
          <p className="text-slate-400 text-sm">Tap the moles as they pop up. Misses subtract 1 point. 60‑second round.</p>
        </div>
      </div>
    </CardFrame>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800/60 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>© {new Date().getFullYear()} Mini Arcade. Built with React & Tailwind.</div>
        <div className="flex gap-3">
          <a className="hover:text-slate-200" href="#">Privacy</a>
          <a className="hover:text-slate-200" href="#">About</a>
        </div>
      </div>
    </footer>
  );
}
