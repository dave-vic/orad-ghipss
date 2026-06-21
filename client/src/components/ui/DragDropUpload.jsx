import { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';

export default function DragDropUpload({ onFilesSelected, multiple = true, accept }) {
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState([]);
  const inputRef = useRef();

  const handleFiles = (files) => {
    const arr = Array.from(files);
    setSelected(arr);
    onFilesSelected(arr);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `1.5px dashed ${dragging ? '#306196' : '#D1D5DB'}`,
          borderRadius: '12px',
          padding: '32px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragging ? '#EEF4FF' : '#F7F8FA',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: dragging ? '#306196' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', transition: 'background 0.15s' }}>
          <Upload size={22} color={dragging ? '#FFFFFF' : '#6B7280'} />
        </div>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#112235', marginBottom: '4px' }}>
          {dragging ? 'Drop your file here' : 'Drag & drop files here'}
        </div>
        <div style={{ fontSize: '12px', color: '#9CA3AF' }}>or <span style={{ color: '#306196', fontWeight: '600' }}>click to browse</span></div>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {selected.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {selected.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: '#EEF4FF', border: '1px solid #C7DEFF', borderRadius: '8px', fontSize: '13px' }}>
              <FileText size={14} color="#306196" />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#112235', fontWeight: '500' }}>{f.name}</span>
              <span style={{ color: '#6B7280', flexShrink: 0 }}>{(f.size / 1024).toFixed(0)} KB</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
