import { motion } from 'framer-motion';

// Har page ke liye smooth fade + slide animation
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}   // Start: transparent, thoda neeche
    animate={{ opacity: 1, y: 0 }}    // End: visible, normal position
    exit={{ opacity: 0, y: -20 }}     // Exit: transparent, upar jaata hai
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

export default PageTransition;