import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Lock, User, ArrowRight, Eye, EyeOff, ChevronDown } from 'lucide-react';


// Payment network node positions [x%, y%]
const NODES = [
  [8,12],[22,5],[38,18],[55,8],[72,15],[88,6],
  [5,38],[18,48],[32,35],[50,42],[65,30],[80,45],[94,38],
  [10,65],[25,72],[42,60],[58,68],[74,58],[90,70],
  [6,88],[20,92],[36,84],[52,90],[68,82],[85,88],[95,78],
];
const EDGES = [
  [0,1],[1,2],[2,3],[3,4],[4,5],[0,6],[2,7],[3,8],[4,9],[5,10],
  [6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[6,13],[8,14],[9,15],
  [10,16],[11,17],[12,18],[13,14],[14,15],[15,16],[16,17],[17,18],
  [13,19],[15,20],[16,21],[17,22],[18,23],[19,20],[20,21],[21,22],[22,23],[23,24],[24,25],
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/directory');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#040C18', position: 'relative', overflow: 'hidden', fontFamily: 'inherit' }}>

      {/* ── Network map background ── */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} preserveAspectRatio="xMidYMid slice">
        {/* Connection lines */}
        {EDGES.map(([a, b], i) => (
          <line key={i}
            x1={`${NODES[a][0]}%`} y1={`${NODES[a][1]}%`}
            x2={`${NODES[b][0]}%`} y2={`${NODES[b][1]}%`}
            stroke="rgba(48,97,150,0.13)" strokeWidth="1"
          />
        ))}
        {/* Nodes */}
        {NODES.map(([x, y], i) => (
          <circle key={i} cx={`${x}%`} cy={`${y}%`} r={i % 5 === 0 ? 3 : 1.8}
            fill={i % 5 === 0 ? 'rgba(48,97,150,0.5)' : 'rgba(48,97,150,0.3)'}
          />
        ))}
        {/* Highlighted accent nodes */}
        {[2, 9, 16].map(i => (
          <circle key={`hl-${i}`} cx={`${NODES[i][0]}%`} cy={`${NODES[i][1]}%`} r="5"
            fill="none" stroke="rgba(111,168,214,0.25)" strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* Glow — top left */}
      <div style={{ position: 'absolute', left: '-200px', top: '-200px', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(48,97,150,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
      {/* Glow — bottom right */}
      <div style={{ position: 'absolute', right: '-150px', bottom: '-150px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,58,92,0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {/* Center ambient */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '900px', height: '900px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(4,12,24,0) 30%, rgba(4,12,24,0.85) 70%)', pointerEvents: 'none' }} />

      {/* ── Main content ── */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '460px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Brand block */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img
            src="/ghipss-logo.svg"
            alt="GhIPSS"
            style={{ width: '72px', height: '72px', display: 'block', margin: '0 auto 18px', filter: 'drop-shadow(0 4px 16px rgba(48,97,150,0.5))' }}
          />
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-1.2px', lineHeight: 1.05, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            ORAD Portal
          </div>
        </div>

        {/* Form card */}
        <div style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: '20px', boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 40px 80px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
          {/* Top gradient accent */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #1A3A5C, #306196 40%, #6FA8D6 60%, #306196)' }} />

          <div style={{ padding: '32px 36px 28px' }}>
            <h1 style={{ fontSize: '19px', fontWeight: '800', color: '#112235', letterSpacing: '-0.4px', marginBottom: '4px' }}>Welcome back</h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '26px' }}>Sign in to access the operations portal</p>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', marginBottom: '18px', color: '#DC2626', fontSize: '13px', fontWeight: '500' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#DC2626', flexShrink: 0 }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} color={focused === 'u' ? '#306196' : '#D1D5DB'} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color 0.15s' }} />
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    onFocus={() => setFocused('u')} onBlur={() => setFocused(null)}
                    required autoFocus placeholder="Enter your username"
                    style={{ width: '100%', padding: '12px 14px 12px 40px', boxSizing: 'border-box', border: `1.5px solid ${focused === 'u' ? '#306196' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '13px', color: '#112235', outline: 'none', backgroundColor: focused === 'u' ? '#F5F9FF' : '#F7F8FA', transition: 'all 0.15s' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} color={focused === 'p' ? '#306196' : '#D1D5DB'} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color 0.15s' }} />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('p')} onBlur={() => setFocused(null)}
                    required placeholder="••••••••"
                    style={{ width: '100%', padding: '12px 42px 12px 40px', boxSizing: 'border-box', border: `1.5px solid ${focused === 'p' ? '#306196' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '13px', color: '#112235', outline: 'none', backgroundColor: focused === 'p' ? '#F5F9FF' : '#F7F8FA', transition: 'all 0.15s' }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#C4C9D4', display: 'flex', padding: '2px' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#6B7280'}
                    onMouseLeave={e => e.currentTarget.style.color = '#C4C9D4'}
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{ marginTop: '4px', width: '100%', padding: '13px', background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #1A3A5C 0%, #306196 100%)', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 4px 18px rgba(48,97,150,0.45)', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 6px 24px rgba(48,97,150,0.6)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 4px 18px rgba(48,97,150,0.45)'; e.currentTarget.style.transform = 'none'; } }}
              >
                {loading ? 'Signing in…' : <><span>Sign in to ORAD</span><ArrowRight size={15} /></>}
              </button>
            </form>
          </div>

          {/* Demo credentials — collapsible */}
          <div style={{ borderTop: '1px solid #F3F4F6' }}>
            <button
              onClick={() => setShowDemo(v => !v)}
              style={{ width: '100%', padding: '14px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', backgroundColor: showDemo ? '#F7F8FA' : 'transparent', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F7F8FA'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = showDemo ? '#F7F8FA' : 'transparent'}
            >
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Demo credentials</span>
              <ChevronDown size={14} color="#C4C9D4" style={{ transform: showDemo ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {showDemo && (
              <div style={{ padding: '4px 36px 20px', backgroundColor: '#F7F8FA', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { creds: 'admin / Ghipps2024!', role: 'Admin', color: '#DC2626', bg: '#FEE2E2' },
                  { creds: 'sarah / Member2024!', role: 'Member', color: '#059669', bg: '#D1FAE5' },
                  { creds: 'kofi / Viewer2024!',  role: 'Viewer', color: '#D97706', bg: '#FEF3C7' },
                ].map(({ creds, role, color, bg }) => (
                  <div key={creds} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6B7280' }}>{creds}</span>
                    <span style={{ fontSize: '10px', fontWeight: '700', color, backgroundColor: bg, padding: '2px 8px', borderRadius: '5px' }}>{role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
