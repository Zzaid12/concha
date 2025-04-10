import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <div className="gradient-bg" style={{ pointerEvents: 'none' }} />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="main-content"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {children}
      </motion.main>
    </div>
  );
}
