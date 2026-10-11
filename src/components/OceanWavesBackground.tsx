import React from 'react';

export const OceanWavesBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Deep Caribbean oceanic gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000d1e] via-[#001e3d] to-[#003865]" />

      {/* Radiant ocean glowing light spots */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[42rem] h-[26rem] bg-gradient-to-b from-[#00A3E0]/25 to-transparent rounded-full blur-[120px]" />
      <div className="absolute top-1/3 -left-32 w-[30rem] h-[30rem] bg-[#00e5ff]/15 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] bg-[#0077b6]/25 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Gentle Lighthouse Sweep effect across top night sky */}
      <div 
        className="absolute top-0 left-1/2 w-[120vw] h-[70vh] -translate-x-1/2 origin-top opacity-30 blur-2xl pointer-events-none"
        style={{
          background: 'conic-gradient(from 180deg at 50% 0%, transparent 40%, rgba(0, 229, 255, 0.18) 50%, transparent 60%)',
          animation: 'lighthouseSweep 16s ease-in-out infinite alternate',
        }}
      />

      {/* Multi-layered Animated Ocean Waves at the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-[48vh] sm:h-[55vh] flex flex-col justify-end overflow-hidden">
        {/* Ambient foam/mist above waves */}
        <div className="absolute bottom-20 inset-x-0 h-32 bg-gradient-to-t from-[#00A3E0]/15 to-transparent blur-xl" />

        {/* Wave Layer 1 (Deepest Ocean Current - Slow & Majestic) */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-48 sm:h-64 opacity-35 text-[#002855]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{
            animation: 'waveMoveSlow 24s linear infinite',
            fill: 'currentColor',
          }}
        >
          <path d="M0,0 C150,90 350,-40 500,50 C650,140 900,10 1200,40 L1200,120 L0,120 Z" />
        </svg>

        {/* Wave Layer 2 (Caribbean Turquoise Surge) */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-44 sm:h-56 opacity-45 text-[#005f9e]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{
            animation: 'waveMoveRev 18s linear infinite',
            fill: 'currentColor',
          }}
        >
          <path d="M0,30 C200,100 450,-20 700,60 C950,130 1100,20 1200,50 L1200,120 L0,120 Z" />
        </svg>

        {/* Wave Layer 3 (Vibrant Electric Cyan Water Crest) */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-36 sm:h-48 opacity-60 text-[#008ec4]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{
            animation: 'waveMoveFast 12s linear infinite',
            fill: 'currentColor',
          }}
        >
          <path d="M0,50 C300,110 500,10 800,70 C1050,120 1150,40 1200,65 L1200,120 L0,120 Z" />
        </svg>

        {/* Wave Layer 4 (Forefront Seafoam and Light Crest) */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-28 sm:h-36 opacity-75 text-[#00A3E0]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{
            animation: 'waveMoveUltra 9s linear infinite',
            fill: 'currentColor',
          }}
        >
          <path d="M0,70 C250,20 450,100 750,40 C1000,90 1100,50 1200,80 L1200,120 L0,120 Z" />
        </svg>

        {/* Wave Layer 5 (Crisp Surf Foam Trim & Highlights) */}
        <svg
          className="absolute bottom-0 left-0 w-[200%] h-16 sm:h-24 opacity-85 text-[#38d7ff]/40"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{
            animation: 'waveMoveFast 14s linear infinite reverse',
            fill: 'currentColor',
          }}
        >
          <path d="M0,85 C180,60 380,105 600,75 C850,110 1020,70 1200,90 L1200,120 L0,120 Z" />
        </svg>

        {/* Deep ocean floor gradient to anchor the waves */}
        <div className="w-full h-12 bg-gradient-to-t from-[#001733] to-transparent relative z-10" />
      </div>

      {/* Floating subtle bioluminescent ocean water particles */}
      <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:42px_42px] opacity-15" />

      {/* Embedded CSS animations for fluid, organic ocean wave motion */}
      <style>{`
        @keyframes waveMoveSlow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes waveMoveRev {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes waveMoveFast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes waveMoveUltra {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes lighthouseSweep {
          0% { transform: translateX(-50%) rotate(-35deg); }
          50% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(35deg); }
        }
      `}</style>
    </div>
  );
};
