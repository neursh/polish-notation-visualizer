import { motion, useSpring } from 'framer-motion';
import { useCallback, useEffect, useMemo } from 'react';
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
      <div className="flex flex-col w-full h-screen items-center justify-center">
        <div className="relative w-1/2 h-40">
          <div className="w-full h-full overflow-clip pt-2 pb-2 pr-4 pl-4 outline outline-gray-300 outline-2 rounded-lg">
            <CharactersContainer />
          </div>
        </div>
        <div className="flex w-1/2 justify-between">
          <div className="flex flex-col">
            <Counter />
            <p className="text-sm text-gray-700">
              * This only covers basic checking.
            </p>
          </div>
        </div>
      </div>
      <Cursor />
    </>
  );
}

function CharactersContainer() {
  const keyList = useAppContext((state) => state.keyList);

  return (
    <div
      className="flex flex-wrap gap-4 font-semibold select-none"
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
    <p id={props.id} className="rounded-sm text-center text-3xl">
      <motion.span
        className="inline-block"
        initial={{ opacity: 0, scale: 1.25 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.25, 0.25, 0, 1] }}
      >
        {props.value}
      </motion.span>
    </p>
  );
}

function Cursor() {
  const screen = useScreen();
  const numbers = useAppContext((state) => state.numbers);
  const operators = useAppContext((state) => state.operators);
  const pivot = useMemo(() => numbers - operators, [numbers, operators]);
  const areBothZero = useMemo(
    () => numbers === 0 && operators === 0,
    [numbers, operators]
  );

  const springPosition = {
    x: useSpring(0, { stiffness: 1000, damping: 100 }),
    y: useSpring(0, { stiffness: 1000, damping: 100 }),
  };

  useEffect(() => {
    const bounding = document
      .getElementById(`key-${numbers + operators - 1}`)
      ?.getBoundingClientRect();
    if (bounding) {
      springPosition.x.set(bounding.x + bounding.width + 5);
      springPosition.y.set(bounding.y + 3);
    }
    if (areBothZero) {
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
  }, [numbers, operators, screen.width, screen.height]);

  return (
    <>
      <motion.div
        style={{ translateX: springPosition.x, translateY: springPosition.y }}
        className={`absolute top-0 w-1 h-8 ${
          pivot === 1
            ? 'bg-green-500'
            : areBothZero
            ? 'bg-gray-400'
            : 'bg-red-500'
        }`}
      />
    </>
  );
}

function Counter() {
  const numbers = useAppContext((state) => state.numbers);
  const operators = useAppContext((state) => state.operators);
  const pivot = useMemo(() => numbers - operators, [numbers, operators]);
  const areBothZero = useMemo(
    () => numbers === 0 && operators === 0,
    [numbers, operators]
  );

  return (
    <div
      className={`flex gap-2 mt-2 pr-2 pl-2 rounded-lg outline outline-1 ${
        pivot === 1
          ? 'outline-green-500'
          : areBothZero
          ? 'outline-gray-400'
          : 'outline-red-500'
      }`}
    >
      <p>
        <span className="font-bold">{numbers}</span> numbers
      </p>
      <p>
        <span className="font-bold">{operators}</span> operators
      </p>
      <div
        className={`h-full w-[1px] ${
          pivot === 1
            ? 'bg-green-500'
            : areBothZero
            ? 'bg-gray-400'
            : 'bg-red-500'
        }`}
      />
      <p>
        {pivot > 1
          ? 'Too many numbers'
          : pivot < 1
          ? areBothZero
            ? 'Waiting for input...'
            : 'Too many operators'
          : 'Valid'}
      </p>
    </div>
  );
}
