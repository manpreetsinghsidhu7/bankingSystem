import React, { useEffect, useRef, useState } from 'react';

/* ── tiny canvas confetti ── */
function ConfettiCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const COLORS = ['#22c55e', '#16a34a', '#86efac', '#bbf7d0', '#ffffff', '#4ade80', '#a3e635'];

    const pieces = Array.from({ length: 90 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 60,
      y: canvas.height * 0.32,
      vx: (Math.random() - 0.5) * 9,
      vy: -(Math.random() * 10 + 4),
      r: Math.random() * 7 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.25,
      gravity: 0.28 + Math.random() * 0.12,
      opacity: 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let anyAlive = false;
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.angle += p.spin;
        p.opacity = Math.max(0, p.opacity - 0.008);
        if (p.opacity <= 0) return;
        anyAlive = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        if (p.shape === 'rect') {
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      if (anyAlive) animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/* ── SVG animated check mark ── */
function AnimatedCheck() {
  return (
    <div className="payment-check-wrapper">
      <div className="payment-check-circle">
        <svg viewBox="0 0 52 52" className="payment-check-svg">
          <circle className="payment-check-circle-anim" cx="26" cy="26" r="25" fill="none" />
          <path className="payment-check-tick" fill="none" d="M14 27l8 8 16-16" />
        </svg>
      </div>
    </div>
  );
}

/* ── Row helper ── */
function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-surface-100 dark:border-surface-800 last:border-0">
      <span className="text-xs text-surface-400 font-medium">{label}</span>
      <span className={`text-xs font-semibold text-surface-900 dark:text-surface-100 text-right max-w-[60%] break-all ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

/* ── Main modal ── */
export function PaymentSuccessModal({ isOpen, onClose, txData }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const {
    amount,
    transactionNumber,
    time,
    senderAccount,
    receiverAccount,
    senderName,
    receiverName,
    description,
  } = txData || {};

  const fmt = (n) =>
    parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <>
      {/* Inline styles for animations */}
      <style>{`
        @keyframes psm-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes psm-card-in {
          from { opacity: 0; transform: scale(0.82) translateY(32px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes psm-check-scale-in {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(4deg); opacity: 1; }
          80%  { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes psm-circle-draw {
          from { stroke-dashoffset: 157; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes psm-tick-draw {
          from { stroke-dashoffset: 48; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes psm-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .payment-check-wrapper {
          display: flex; align-items: center; justify-content: center;
          animation: psm-check-scale-in 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.15s both;
          position: relative; z-index: 10;
        }
        .payment-check-circle {
          width: 80px; height: 80px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 50%;
          box-shadow: 0 0 0 8px rgba(34,197,94,0.15), 0 0 0 18px rgba(34,197,94,0.07);
          display: flex; align-items: center; justify-content: center;
        }
        .payment-check-svg { width: 52px; height: 52px; }
        .payment-check-circle-anim {
          stroke: rgba(255,255,255,0.25); stroke-width: 1;
          stroke-dasharray: 157; stroke-dashoffset: 157;
          animation: psm-circle-draw 0.5s ease 0.35s forwards;
        }
        .payment-check-tick {
          stroke: #fff; stroke-width: 4.5; stroke-linecap: round; stroke-linejoin: round;
          stroke-dasharray: 48; stroke-dashoffset: 48;
          animation: psm-tick-draw 0.4s ease 0.7s forwards;
        }

        .psm-backdrop {
          animation: psm-backdrop-in 0.2s ease forwards;
        }
        .psm-card {
          animation: psm-card-in 0.45s cubic-bezier(0.34,1.36,0.64,1) 0.05s both;
        }
        .psm-title {
          animation: psm-fade-up 0.4s ease 0.55s both;
        }
        .psm-subtitle {
          animation: psm-fade-up 0.4s ease 0.65s both;
        }
        .psm-rows {
          animation: psm-fade-up 0.4s ease 0.75s both;
        }
        .psm-btn {
          animation: psm-fade-up 0.4s ease 0.88s both;
        }
      `}</style>

      <div
        className="psm-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <div
          className="psm-card relative bg-surface-950 dark:bg-[#141414] rounded-3xl w-full max-w-sm overflow-hidden border border-surface-800/60 shadow-2xl"
          style={{ background: '#1a1a1a' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Confetti canvas */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <ConfettiCanvas />
          </div>

          {/* Content */}
          <div className="relative z-10 px-7 pt-10 pb-8 flex flex-col items-center">

            {/* Check mark */}
            <AnimatedCheck />

            {/* Amount */}
            <div className="psm-title text-center mt-5">
              <p className="text-[11px] font-semibold text-green-400 uppercase tracking-widest mb-1">Payment Successful</p>
              <h2 className="text-4xl font-extrabold text-white tracking-tight">
                ₹{fmt(amount)}
              </h2>
            </div>

            <p className="psm-subtitle text-[12px] text-surface-400 mt-2 text-center leading-relaxed max-w-[240px]">
              {description
                ? `"${description}"`
                : 'Your transaction was completed successfully.'}
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-surface-800 my-6" />

            {/* Transaction rows */}
            <div className="psm-rows w-full space-y-0">
              {transactionNumber && (
                <Row label="Transaction No." value={transactionNumber?.split('-')[0]?.toUpperCase()} mono />
              )}
              {time && (
                <Row
                  label="Time"
                  value={new Date(time).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                />
              )}
              {senderName && <Row label="From" value={senderName} />}
              {receiverName && <Row label="To" value={receiverName} />}
              {senderAccount && <Row label="Sender Account" value={`••••${senderAccount.slice(-4)}`} mono />}
              {receiverAccount && <Row label="Receiver Account" value={`••••${receiverAccount.slice(-4)}`} mono />}
            </div>

            {/* CTA */}
            <button
              onClick={onClose}
              className="psm-btn mt-7 w-full py-3.5 rounded-2xl font-bold text-sm bg-green-500 hover:bg-green-400 text-white transition-all active:scale-[0.97] shadow-lg shadow-green-500/30"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
