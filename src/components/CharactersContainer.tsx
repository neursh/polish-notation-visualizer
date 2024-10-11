import { useHookstate } from '@hookstate/core';
import { motion } from 'framer-motion';
import { memo, useCallback, useEffect, useMemo } from 'react';
import AppContext from '../contextProvider';

const CharactersContainer = memo(() => {
  const keyList = useHookstate(AppContext.keyList);
  const result = useHookstate(AppContext.result);
  const displayingResult = useHookstate(AppContext.displayingResult);
  const currentDisplayResult = useHookstate(0);

  const reset = useCallback(() => {
    result.set([]);
    currentDisplayResult.set(0);
    displayingResult.set(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goThrough = useCallback(() => {
    if (result.length > 0) {
      displayingResult.set(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(goThrough, [goThrough]);

  useEffect(() => {
    if (
      displayingResult.get() &&
      result.length - 1 < currentDisplayResult.get()
    ) {
      result.set([]);
      currentDisplayResult.set(0);
      displayingResult.set(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayingResult, currentDisplayResult]);

  return (
    <div className="flex flex-col w-full items-center justify-top mt-[calc(48px+5vh)] mb-4">
      <div className="min-h-[160px] w-2/3 flex items-start overflow-clip pt-2 pb-2 pr-4 pl-4 outline outline-gray-400 outline-2 rounded-lg">
        <div
          className="flex flex-wrap font-semibold text-3xl"
          id="character-container"
        >
          {(displayingResult.get()
            ? result[currentDisplayResult.get()].rawData
            : keyList
          )
            .get()
            .map((value, index) => (
              <Character
                value={displayingResult.get() ? `${value}\u00A0\u00A0` : value}
                key={`${index}${displayingResult.get() ? Math.random() : ''}`}
                type={displayingResult.get() ? 'r' : 'e'}
                delay={displayingResult.get() ? index * 0.025 : 0}
                id={`key-${index}`}
              />
            ))}
        </div>
      </div>
      <div className="flex w-2/3 justify-between items-center">
        <p>
          {displayingResult.get()
            ? result[currentDisplayResult.get()].calculationAboutToMake
                .get()
                .join(' ')
            : ''}
        </p>
        <div className="flex items-center gap-4">
          {displayingResult.get() && (
            <a
              className="pt-2"
              onClick={() =>
                currentDisplayResult.get() > 0
                  ? currentDisplayResult.set((p) => p - 1)
                  : reset()
              }
            >
              {currentDisplayResult.get() > 0 ? 'Previous' : 'Cancel'}
            </a>
          )}
          <a
            className="bg-black rounded-full mt-2 pt-2 pb-2 pl-4 pr-4 text-white"
            onClick={() =>
              !displayingResult.get()
                ? AppContext.calculate()
                : currentDisplayResult.get() < result.length - 1
                ? currentDisplayResult.set((p) => p + 1)
                : reset()
            }
          >
            {!displayingResult.get()
              ? 'Calculate'
              : currentDisplayResult.get() < result.length - 1
              ? 'Next'
              : 'Finish'}
          </a>
        </div>
      </div>
    </div>
  );
});

const Character = memo(
  (props: {
    value: string | number;
    id: string;
    type: string;
    delay: number;
  }) => {
    const variants = useMemo(
      () => ({
        hidden: { opacity: 0 },
        hiddenWithOffset: { opacity: 0, translateX: 10 },
        show: { opacity: 1 },
        showSnapBack: { opacity: 1, translateX: 0 },
      }),
      []
    );
    return (
      <motion.p
        id={props.id}
        variants={variants}
        initial={props.type === 'r' ? 'hiddenWithOffset' : 'hidden'}
        animate={props.type === 'r' ? 'showSnapBack' : 'show'}
        transition={{ ease: [0.25, 0.25, 0, 1], delay: props.delay }}
      >
        {props.value === ' ' ? '\u00A0\u00A0' : props.value}
      </motion.p>
    );
  }
);

export default CharactersContainer;
