// BlogList.jsx
// Placeholder blog list
import BlogCard from './BlogCard';

export default function BlogList({ blogs = [] }) {
  if (!blogs?.length) return <div>No blogs yet.</div>;
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
      {blogs.map((b) => (
        <BlogCard key={b?._id || b?.id} blog={b} />
      ))}
    </div>
  );
}

