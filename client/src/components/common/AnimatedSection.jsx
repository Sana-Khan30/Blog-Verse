import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

const AnimatedSection = ({
  children,
  className = '',
  delay = 0,
  direction = 'up', // 'up', 'down', 'left', 'right', 'fade'
  distance = 50,
  duration = 0.6,
  once = true,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-50px' });
  const controls = useAnimation();

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? distance : 0,
      y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [isInView, controls, once]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;