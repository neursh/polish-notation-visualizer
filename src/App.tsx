import { motion, useSpring } from 'framer-motion';
import { useCallback, useEffect } from 'react';
import useAppContext from './context';
import { useScreen } from './hooks/screen';

export default function App() {
  const addKey = useAppContext((state) => state.addKey);

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
        <div className="relative w-1/2 h-40">
          <div className="w-full h-full overflow-clip pt-2 pb-2 pr-4 pl-4 outline outline-gray-300 outline-2 rounded-lg">
            <CharactersContainer />
          </div>
        </div>
      </motion.div>
      <Cursor />
    </>
  );
}

function CharactersContainer() {
  const keyList = useAppContext((state) => state.keyList);

  return (
    <div
      className="flex flex-wrap font-semibold select-none"
      id="character-container"
    >
      {keyList.map((value, index) => (
        <Character value={value} key={`key-${index}`} id={`key-${index}`} />
      ))}
    </div>
  );
}

function Character(props: { value: string; id: string }) {
  return (
    <p id={props.id} className="text-center text-3xl">
      <motion.span
        className="inline-block"
        initial={{ opacity: 0, scale: 1.25 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.25, 0.25, 0, 1] }}
      >
        {props.value === ' ' ? '\u00A0' : props.value}
      </motion.span>
    </p>
  );
}

function Cursor() {
  const screen = useScreen();
  const total = useAppContext((state) => state.total);

  const springPosition = {
    x: useSpring(0, { stiffness: 1000, damping: 100 }),
    y: useSpring(0, { stiffness: 1000, damping: 100 }),
  };

  useEffect(() => {
    const bounding = document
      .getElementById(`key-${total - 1}`)
      ?.getBoundingClientRect();
    if (bounding) {
      springPosition.x.set(bounding.x + bounding.width + 5);
      springPosition.y.set(bounding.y + 3);
    }
    if (total === 0) {
      const bounding = document
        .getElementById('character-container')!
        .getBoundingClientRect();
      // Only jumps once.
      if (springPosition.x.get() === 0) {
        springPosition.x.jump(bounding.x);
        springPosition.y.jump(bounding.y + 3);
      } else {
        springPosition.x.set(bounding.x);
        springPosition.y.set(bounding.y + 3);
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
