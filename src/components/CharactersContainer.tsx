import { useHookstate } from '@hookstate/core';
import { motion } from 'framer-motion';
import { memo } from 'react';
import AppContext from '../contextProvider';

const CharactersContainer = memo(() => {
  const keyList = useHookstate(AppContext.keyList);

  return (
    <div className="flex flex-col w-full items-center justify-top">
      <div className="min-h-[160px] w-2/3 flex items-start overflow-clip pt-2 mt-[calc(48px+5vh)] pb-2 mb-4 pr-4 pl-4 outline outline-gray-300 outline-2 rounded-lg">
        <div
          className="flex flex-wrap font-semibold select-none"
          id="character-container"
        >
          {keyList.get().map((value, index) => (
            <Character value={value} key={`key-${index}`} id={`key-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
});

const Character = memo((props: { value: string; id: string }) => {
  return (
    <motion.p
      id={props.id}
      className="text-center text-3xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {props.value === ' ' ? '\u00A0\u00A0' : props.value}
    </motion.p>
  );
});

export default CharactersContainer;
