import { useHookstate } from '@hookstate/core';
import { motion, useSpring } from 'framer-motion';
import { memo, useCallback, useEffect } from 'react';
import AppContext from '../contextProvider';
import { useScreen } from '../hooks/screen';

const Cursor = memo(() => {
  const screen = useScreen();
  const total = useHookstate(AppContext.total);

  const springPosition = {
    x: useSpring(0, { stiffness: 1000, damping: 100 }),
    y: useSpring(0, { stiffness: 1000, damping: 100 }),
  };

  const scrollOffset = useCallback(
    () => Math.max(window.scrollY, document.documentElement.scrollTop),
    []
  );

  useEffect(() => {
    const bounding = document
      .getElementById(`key-${total.get() - 1}`)
      ?.getBoundingClientRect();
    if (bounding) {
      springPosition.x.set(bounding.left + bounding.width + 3);
      springPosition.y.set(scrollOffset() + bounding.top + 2);
    }
    if (total.get() === 0) {
      const bounding = document
        .getElementById('character-container')!
        .getBoundingClientRect();
      // Only jumps once.
      if (springPosition.x.get() === 0) {
        springPosition.x.jump(bounding.left);
        springPosition.y.jump(bounding.top + 2);
      } else {
        springPosition.x.set(bounding.left);
        springPosition.y.set(bounding.top + 2);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, screen.width, screen.height]);

  return (
    <>
      <motion.div
        style={{ translateX: springPosition.x, translateY: springPosition.y }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-0 w-[2px] h-8 bg-gray-400"
      />
    </>
  );
});

export default Cursor;
