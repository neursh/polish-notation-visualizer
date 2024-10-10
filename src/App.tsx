import { useHookstate } from '@hookstate/core';
import { motion, useSpring } from 'framer-motion';
import { memo, useCallback, useEffect } from 'react';
import { default as AppContext } from './context';
import { useScreen } from './hooks/screen';

export default function App() {
  const addKey = AppContext.addKey;

  const keyboardEvent = useCallback(
    (e: KeyboardEvent) => {
      addKey(e.key);
    },
    [addKey]
  );

  const keyboardEventRegister = useCallback(() => {
    window.addEventListener('keydown', keyboardEvent);
  }, [keyboardEvent]);

  const keyboardEventRemover = useCallback(() => {
    window.removeEventListener('keydown', keyboardEvent);
  }, [keyboardEvent]);

  useEffect(() => {
    keyboardEventRegister();

    return keyboardEventRemover;
  }, [keyboardEventRegister, keyboardEventRemover]);

  return (
    <>
      <motion.div
        className="flex flex-col w-full h-screen items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative w-1/2">
          <div className="min-h-[52px] w-full h-full flex items-end overflow-clip pt-2 pb-2 pr-4 pl-4 outline outline-gray-300 outline-2 rounded-lg">
            <CharactersContainer />
          </div>
        </div>
      </motion.div>
      <Cursor />
    </>
  );
}

function CharactersContainer() {
  const keyList = useHookstate(AppContext.keyList);

  return (
    <div
      className="flex flex-wrap font-semibold select-none"
      id="character-container"
    >
      {keyList.get().map((value, index) => (
        <Character value={value} key={`key-${index}`} id={`key-${index}`} />
      ))}
    </div>
  );
}

const Character = memo((props: { value: string; id: string }) => {
  return (
    <p id={props.id} className="text-center text-3xl">
      <motion.span
        className="inline-block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {props.value === ' ' ? '\u00A0\u00A0' : props.value}
      </motion.span>
    </p>
  );
});

function Cursor() {
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
      springPosition.x.set(bounding.left + bounding.width + 5);
      springPosition.y.set(scrollOffset() + bounding.top + 3);
    }
    if (total.get() === 0) {
      const bounding = document
        .getElementById('character-container')!
        .getBoundingClientRect();
      // Only jumps once.
      if (springPosition.x.get() === 0) {
        springPosition.x.jump(bounding.left);
        springPosition.y.jump(bounding.top - 33);
      } else {
        springPosition.x.set(bounding.left);
        springPosition.y.set(bounding.top - 33);
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
        className="absolute top-0 w-1 h-8 bg-gray-300"
      />
    </>
  );
}
