import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-8xl mb-6"
      >
        🔍
      </motion.div>
      <h1 className="text-7xl font-extrabold text-primary-600 dark:text-primary-400 mb-4">
        404
      </h1>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Page Not Found
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/"
        className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition inline-block">
        Go Back Home
      </Link>
    </motion.div>
  </div>
);

export default NotFound;