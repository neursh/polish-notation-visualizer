import { useHookstate } from '@hookstate/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { motion, useSpring } from 'framer-motion';
import { memo, useCallback, useEffect, useMemo } from 'react';
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
      <Titlebar />
      <div className="flex flex-col w-full h-[calc(100vh-48px)] items-center justify-center">
        <div className="relative w-1/2">
          <div className="min-h-[52px] w-full h-full flex items-end overflow-clip pt-2 pb-2 pr-4 pl-4 outline outline-gray-300 outline-2 rounded-lg">
            <CharactersContainer />
          </div>
        </div>
      </div>
      <Cursor />
    </>
  );
}

function Titlebar() {
  const appWindow = useMemo(() => getCurrentWindow(), []);

  return (
    <div
      data-tauri-drag-region
      className="relative top-0 flex items-center justify-between select-none w-full h-12 pl-3"
    >
      <div data-tauri-drag-region className="flex gap-2 items-center">
        <svg data-tauri-drag-region className="w-6 h-6" viewBox="0 0 256 256">
          <path
            d="M64 213.333V192L133.333 128L64 64V42.6667H192V74.6667H114.933L172.267 128L114.933 181.333H192V213.333H64Z"
            fill="black"
          />
        </svg>
        <p data-tauri-drag-region className="text-sm font-medium">
          Reverse Polish Notation Visualizer
        </p>
      </div>
      <div className="flex items-center">
        <div
          className="w-12 h-12 flex justify-center items-center"
          onClick={() => appWindow.minimize()}
        >
          <svg width="10" height="1" viewBox="0 0 10 1">
            <line y1="0.5" x2="10" y2="0.5" stroke="black" />
          </svg>
        </div>
        <div
          className="w-12 h-12 flex justify-center items-center"
          onClick={() => appWindow.toggleMaximize()}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="0.5" y1="2" x2="0.5" y2="10" stroke="black" />
            <line x1="1" y1="9.5" x2="8" y2="9.5" stroke="black" />
            <line x1="1" y1="2.5" x2="8" y2="2.5" stroke="black" />
            <line x1="7.5" y1="9" x2="7.5" y2="3" stroke="black" />
            <line x1="2.5" y1="2" x2="2.5" stroke="black" />
            <line x1="3" y1="0.5" x2="10" y2="0.5" stroke="black" />
            <line x1="9.5" y1="1" x2="9.5" y2="7" stroke="black" />
            <line x1="8" y1="7.5" x2="10" y2="7.5" stroke="black" />
          </svg>
        </div>
        <div
          className="w-12 h-12 flex justify-center items-center"
          onClick={() => appWindow.close()}
        >
          <svg width="10" height="10" viewBox="0 0 11 11">
            <path
              d="M0.903934 0.903867L10.0963 10.0963M0.903934 10.0963L10.0963 0.903867"
              stroke="black"
            />
          </svg>
        </div>
      </div>
    </div>
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
        className="absolute top-0 w-[2px] h-8 bg-gray-300"
      />
    </>
  );
}
