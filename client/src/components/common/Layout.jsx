import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

const Layout = ({ children }) => (
  <div
    className="min-h-screen flex flex-col transition-colors duration-300"
    style={{ background: 'var(--bg)', color: 'var(--text)' }}
  >
    <Navbar />
    <main
      className="flex-1 transition-colors duration-300"
      style={{ background: 'var(--bg)' }}
    >
      {children}
    </main>
    <Footer />
  </div>
);

export default Layout;
