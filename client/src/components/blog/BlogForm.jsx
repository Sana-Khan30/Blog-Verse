// BlogForm.jsx
// Placeholder blog form (create/edit)
export default function BlogForm({ initialValues = {}, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: collect fields and validate
        onSubmit?.(initialValues);
      }}
      style={{ display: 'grid', gap: 10, maxWidth: 520 }}
    >
      <input placeholder="Title" defaultValue={initialValues.title || ''} />
      <textarea placeholder="Content" defaultValue={initialValues.content || ''} rows={6} />
      <button type="submit" style={{ padding: '10px 14px' }}>
        Save
      </button>
    </form>
  );
}

