// Toast.jsx
// Placeholder toast component
export default function Toast({ message, type = 'info' }) {
  if (!message) return null;
  const color = type === 'error' ? '#e53935' : type === 'success' ? '#43a047' : '#1976d2';
  return (
    <div style={{ padding: 12, border: `1px solid ${color}`, borderRadius: 6, color }}>
      {message}
    </div>
  );
}

