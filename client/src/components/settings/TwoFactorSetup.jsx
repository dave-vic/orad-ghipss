import { useState } from 'react';
import { Shield, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import api from '../../api/axios.js';

export default function TwoFactorSetup({ user, onUpdated }) {
  const [step, setStep] = useState('idle'); // idle | setup | disabling
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/2fa/setup');
      setQrCode(res.data.qrCode);
      setStep('setup');
    } catch { setError('Failed to start setup'); }
    finally { setLoading(false); }
  };

  const handleEnable = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/2fa/enable', { token });
      onUpdated();
      setStep('idle');
      setToken('');
    } catch (err) { setError(err.response?.data?.error || 'Invalid code'); }
    finally { setLoading(false); }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/2fa/disable', { token });
      onUpdated();
      setStep('idle');
      setToken('');
    } catch (err) { setError(err.response?.data?.error || 'Invalid code'); }
    finally { setLoading(false); }
  };

  if (user?.twoFactorEnabled) {
    return (
      <div style={{ border: '1px solid #D0DCE8', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <ShieldCheck size={20} color="#1A9E5E" />
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C2D3E' }}>Two-Factor Authentication</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#1A9E5E', backgroundColor: '#DCF5EB', padding: '2px 8px', borderRadius: '999px' }}>Enabled</span>
        </div>
        <p style={{ fontSize: '13px', color: '#6B849A', margin: '0 0 16px' }}>Your account is protected with 2FA.</p>
        {step !== 'disabling' ? (
          <button onClick={() => setStep('disabling')} style={{ padding: '8px 16px', backgroundColor: '#FDECEA', color: '#C0392B', border: '1px solid #C0392B', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldOff size={13} /> Disable 2FA
          </button>
        ) : (
          <form onSubmit={handleDisable}>
            <p style={{ fontSize: '13px', color: '#1C2D3E', marginBottom: '10px' }}>Enter your current 6-digit code to disable 2FA:</p>
            {error && <div style={{ color: '#C0392B', fontSize: '13px', marginBottom: '10px' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" maxLength={6} placeholder="000000" value={token} onChange={e => setToken(e.target.value.replace(/\D/g,''))} style={{ padding: '8px 12px', border: '1px solid #D0DCE8', borderRadius: '8px', fontSize: '16px', width: '120px', letterSpacing: '6px', textAlign: 'center', outline: 'none' }} />
              <button type="submit" disabled={token.length !== 6 || loading} style={{ padding: '8px 16px', backgroundColor: '#C0392B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                {loading ? '...' : 'Confirm Disable'}
              </button>
              <button type="button" onClick={() => { setStep('idle'); setToken(''); setError(''); }} style={{ padding: '8px 16px', backgroundColor: '#F4F6F8', border: '1px solid #D0DCE8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: '#4A6080' }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #D0DCE8', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <Shield size={20} color="#6B849A" />
        <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C2D3E' }}>Two-Factor Authentication</span>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B849A', backgroundColor: '#EBF1F7', padding: '2px 8px', borderRadius: '999px' }}>Off</span>
      </div>

      {step === 'idle' && (
        <>
          <p style={{ fontSize: '13px', color: '#6B849A', margin: '0 0 16px' }}>Add an extra layer of security using an authenticator app like Google Authenticator.</p>
          <button onClick={handleStartSetup} disabled={loading} style={{ padding: '8px 16px', backgroundColor: '#0F1C2E', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={13} /> {loading ? 'Loading...' : 'Set Up 2FA'}
          </button>
        </>
      )}

      {step === 'setup' && (
        <div>
          <p style={{ fontSize: '13px', color: '#1C2D3E', marginBottom: '12px' }}>Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.</p>
          {qrCode && <img src={qrCode} alt="2FA QR Code" style={{ width: '180px', height: '180px', display: 'block', margin: '0 auto 16px', border: '1px solid #D0DCE8', borderRadius: '8px', padding: '8px' }} />}
          {error && <div style={{ color: '#C0392B', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
          <form onSubmit={handleEnable} style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <input type="text" maxLength={6} placeholder="000000" value={token} onChange={e => setToken(e.target.value.replace(/\D/g,''))} autoFocus style={{ padding: '10px 12px', border: '1px solid #D0DCE8', borderRadius: '8px', fontSize: '20px', width: '130px', letterSpacing: '8px', textAlign: 'center', outline: 'none' }} />
            <button type="submit" disabled={token.length !== 6 || loading} style={{ padding: '10px 18px', backgroundColor: '#1A9E5E', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
              {loading ? '...' : 'Verify & Enable'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
