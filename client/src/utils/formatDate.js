// formatDate.js
// Placeholder helper to format dates in a user-friendly way.

export default function formatDate(input) {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}

