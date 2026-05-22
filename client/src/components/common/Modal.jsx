// Modal.jsx
// Placeholder: reusable modal component
export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div style={{ background: '#fff', padding: 16, minWidth: 320 }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

