// Button.jsx
// Placeholder: reusable button component
export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`px-4 py-2 bg-gray-800 text-white rounded-lg transition-all duration-200 hover:bg-gray-700 active:bg-gray-900 ${className}`}
      style={{ cursor: 'pointer' }}
      {...props}
    >
      {children}
    </button>
  );
}

