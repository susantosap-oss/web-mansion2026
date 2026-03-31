export default function Loading() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a2342', zIndex: 9999,
    }}>
      <style>{`
        @keyframes mansion-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(0.95); }
        }
        @keyframes mansion-spin {
          to { transform: rotate(360deg); }
        }
        .mansion-logo-wrap { animation: mansion-pulse 1.8s ease-in-out infinite; }
        .mansion-ring {
          border: 3px solid rgba(212,175,55,0.3);
          border-top-color: #d4af37;
          border-radius: 50%;
          width: 72px; height: 72px;
          animation: mansion-spin 0.9s linear infinite;
          position: absolute;
        }
      `}</style>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
        <div className="mansion-ring" />
        <div className="mansion-logo-wrap" style={{
          width: 52, height: 52, background: '#d4af37', borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#0a2342', fontWeight: 800, fontSize: 26, fontFamily: 'serif', letterSpacing: '-1px' }}>M</span>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: 2, fontFamily: 'serif' }}>
          MANSION <span style={{ color: '#d4af37' }}>Realty</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 6, letterSpacing: 1 }}>
          Memuat...
        </div>
      </div>
    </div>
  )
}
