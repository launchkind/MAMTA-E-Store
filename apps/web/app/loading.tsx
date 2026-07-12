export default function Loading() {
  return (
    <div className="mamta-loader fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="mamta-loader__stage relative w-40 h-40 flex items-center justify-center">
        <svg
          className="mamta-loader__rings absolute inset-0 w-full h-full"
          viewBox="0 0 160 160"
        >
          <circle
            className="mamta-loader__ring mamta-loader__ring--1"
            cx="80"
            cy="80"
            r="72"
            strokeDasharray="320 132"
            strokeDashoffset="0"
          />
          <circle
            className="mamta-loader__ring mamta-loader__ring--2"
            cx="80"
            cy="80"
            r="58"
            strokeDasharray="230 134"
            strokeDashoffset="40"
          />
          <circle
            className="mamta-loader__ring mamta-loader__ring--3"
            cx="80"
            cy="80"
            r="44"
            strokeDasharray="170 106"
            strokeDashoffset="90"
          />
        </svg>

        <div className="mamta-loader__letter relative font-bold text-black">
          M
        </div>

        <div className="mamta-loader__text absolute -bottom-[46px] left-1/2 -translate-x-1/2 font-bold text-black whitespace-nowrap">
          MAMTA<span className="font-normal">-e-</span>STORE
        </div>
      </div>

      <style>{`
        .mamta-loader {
          font-family: Georgia, 'Times New Roman', serif;
        }
        .mamta-loader__ring {
          transform-origin: 80px 80px;
          fill: none;
          stroke: #000000;
          stroke-linecap: round;
        }
        .mamta-loader__ring--1 {
          stroke-width: 9;
          animation: mamta-spin 1.8s linear infinite;
        }
        .mamta-loader__ring--2 {
          stroke-width: 8;
          animation: mamta-spin-rev 2.6s linear infinite;
        }
        .mamta-loader__ring--3 {
          stroke-width: 7;
          animation: mamta-spin 3.6s linear infinite;
        }
        @keyframes mamta-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes mamta-spin-rev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        .mamta-loader__letter {
          font-size: 54px;
          line-height: 1;
          animation: mamta-pulse 1.8s ease-in-out infinite;
        }
        @keyframes mamta-pulse {
          0%, 100% { opacity: 1;    transform: scale(1);    }
          50%      { opacity: 0.55; transform: scale(0.92); }
        }
        .mamta-loader__text {
          font-size: 15px;
          letter-spacing: 1px;
        }
        @media (prefers-reduced-motion: reduce) {
          .mamta-loader__ring,
          .mamta-loader__letter {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
