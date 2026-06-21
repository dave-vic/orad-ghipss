import { useState, useEffect, useRef } from 'react';
import { X, Send, Trash2, MessageSquare, FileText } from 'lucide-react';
import api from '../../api/axios.js';
import { useAuth } from '../../hooks/useAuth.js';

const AVATAR_COLORS = ['#306196', '#059669', '#D97706', '#7C3AED', '#DC2626', '#0891B2'];

function getAvatarColor(name = '') {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function CommentsPanel({ doc, onClose }) {
  const { user } = useAuth();
  const [comments, setComments]   = useState([]);
  const [body, setBody]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const bottomRef = useRef();
  const textareaRef = useRef();

  const loadComments = () => {
    api.get(`/documents/${doc.id}/comments`).then(r => setComments(r.data)).catch(() => {});
  };

  useEffect(() => { loadComments(); }, [doc.id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [comments]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      await api.post(`/documents/${doc.id}/comments`, { body: body.trim() });
      setBody('');
      loadComments();
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (commentId) => {
    await api.delete(`/documents/${doc.id}/comments/${commentId}`);
    loadComments();
  };

  const isMine = (c) => c.user.id === user?.id;
  const canDelete = (c) => isMine(c) || user?.role === 'admin';

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, width: '380px', height: '100vh', backgroundColor: '#FFFFFF', borderLeft: '1px solid #E5E7EB', boxShadow: '-8px 0 32px rgba(0,0,0,0.10)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0F2744 0%, #1B3A5C 60%, #306196 100%)', padding: '20px 20px 22px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={16} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.2px' }}>Comments</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '1px' }}>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</div>
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: '5px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Doc pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 11px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '8px' }}>
          <FileText size={12} color="rgba(255,255,255,0.6)" />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
        </div>
      </div>

      {/* Comments list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: '#F7F8FA' }}>
        {comments.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={22} color="#306196" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#112235', marginBottom: '4px' }}>No comments yet</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Be the first to start the conversation</div>
            </div>
          </div>
        ) : (
          comments.map((c, idx) => {
            const mine = isMine(c);
            const prevSameUser = idx > 0 && comments[idx - 1].user.id === c.user.id;
            return (
              <div key={c.id}
                style={{ display: 'flex', flexDirection: mine ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end', marginTop: prevSameUser ? '2px' : '10px' }}
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Avatar — hide if same user as prev */}
                <div style={{ width: '30px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                  {!prevSameUser && (
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: getAvatarColor(c.user.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#FFFFFF' }}>
                      {getInitials(c.user.name)}
                    </div>
                  )}
                </div>

                <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                  {/* Name + time — always shown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexDirection: mine ? 'row-reverse' : 'row' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>{mine ? 'You' : c.user.name}</span>
                    <span style={{ fontSize: '10px', color: '#C4C9D4' }}>{relativeTime(c.createdAt)}</span>
                  </div>

                  {/* Bubble */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', flexDirection: mine ? 'row-reverse' : 'row' }}>
                    <div style={{
                      padding: '9px 13px',
                      borderRadius: mine ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                      backgroundColor: mine ? '#306196' : '#FFFFFF',
                      color: mine ? '#FFFFFF' : '#374151',
                      fontSize: '13px', lineHeight: 1.55, wordBreak: 'break-word',
                      boxShadow: mine ? '0 2px 8px rgba(48,97,150,0.2)' : '0 1px 3px rgba(0,0,0,0.07)',
                      border: mine ? 'none' : '1px solid #E5E7EB',
                    }}>
                      {c.body}
                    </div>

                    {/* Delete button on hover */}
                    {canDelete(c) && hoveredId === c.id && (
                      <button onClick={() => handleDelete(c.id)}
                        style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#FEE2E2', border: '1px solid #FECACA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FECACA'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                      >
                        <Trash2 size={11} color="#DC2626" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div style={{ padding: '12px 16px 16px', borderTop: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', flexShrink: 0 }}>
        {/* My avatar + input row */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: getAvatarColor(user?.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#FFFFFF', flexShrink: 0 }}>
            {getInitials(user?.name)}
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={textareaRef}
              value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder="Write a comment… (Enter to send)"
              rows={1}
              style={{ width: '100%', padding: '10px 44px 10px 13px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', color: '#112235', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box', transition: 'border-color 0.15s', backgroundColor: '#F7F8FA' }}
              onFocus={e => { e.target.style.borderColor = '#306196'; e.target.style.backgroundColor = '#FFFFFF'; }}
              onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.backgroundColor = '#F7F8FA'; }}
            />
            <button
              onClick={handleSubmit}
              disabled={!body.trim() || loading}
              style={{ position: 'absolute', right: '8px', bottom: '8px', width: '28px', height: '28px', borderRadius: '8px', backgroundColor: body.trim() && !loading ? '#306196' : '#E5E7EB', border: 'none', cursor: body.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (body.trim() && !loading) e.currentTarget.style.backgroundColor = '#245078'; }}
              onMouseLeave={e => { if (body.trim() && !loading) e.currentTarget.style.backgroundColor = '#306196'; }}
            >
              <Send size={13} color={body.trim() && !loading ? '#FFFFFF' : '#9CA3AF'} />
            </button>
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#C4C9D4', marginTop: '6px', marginLeft: '40px' }}>Shift+Enter for new line</div>
      </div>
    </div>
  );
}
