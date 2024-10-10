import { motion } from 'framer-motion';
import { useCallback, useEffect } from 'react';

export default function App() {
  const keyboardEvent = useCallback(() => {
    window.addEventListener('keydown', (e) => {
      console.log(e.key);
    });
  }, []);

  useEffect(() => keyboardEvent, [keyboardEvent]);

  return (
    <>
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-1/2 h-40 overflow-y-scroll pt-2 pb-2 pr-4 pl-4 outline outline-gray-300 rounded-lg">
        <CharactersContainer />
      </div>
    </>
  );
}

function CharactersContainer() {
  return (
    <div className="flex flex-wrap gap-6 font-semibold select-none">
      <Character value="1" />
      <Character value="2" />
      <Character value="3" />
      <Character value="4" />
      <Character value="5" />
      <Character value="6" />
      <Character value="7" />
      <Character value="8" />
      <Character value="9" />
      <Character value="-" />
      <Character value="*" />
    </div>
  );
}

function Character(props: { value: string }) {
  return (
    <p className="rounded-sm text-center text-3xl">
      <motion.span
        className="inline-block"
        initial={{ scale: 1.25 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.25, ease: [0.25, 0.25, 0, 1] }}
      >
        {props.value}
      </motion.span>
    </p>
  );
}
