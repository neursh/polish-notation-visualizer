import { useHookstate } from '@hookstate/core';
import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';
import { motion } from 'framer-motion';
import { memo, useCallback, useEffect, useMemo } from 'react';
import AppContext from '../contextProvider';

const CharactersContainer = memo(() => {
  const total = useHookstate(AppContext.total);
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

  const highlight = useHookstate<number>(-1);
  const highlightColors = useMemo(() => ['green', 'green', 'red'], []);

  useEffect(() => {
    if (result.length > 0) {
      displayingResult.set(true);
      highlight.set(
        result[currentDisplayResult.get()].highlightStartsFrom.get()
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    if (displayingResult.get()) {
      if (result.length - 1 < currentDisplayResult.get()) {
        result.set([]);
        currentDisplayResult.set(0);
        displayingResult.set(false);
        highlight.set(-1);
      }

      highlight.set(
        result[currentDisplayResult.get()].highlightStartsFrom.get()
      );
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
                highlightColor={
                  displayingResult.get()
                    ? highlightColors[index - highlight.get()]
                    : undefined
                }
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
        <div className="flex items-center gap-4 pt-2">
          {!displayingResult.get() && (
            <>
              <a
                onClick={async () => {
                  total.set(0);
                  keyList.set([]);
                }}
              >
                <motion.svg
                  whileTap={{ scale: 1.25 }}
                  className="h-5 w-5 outline-none"
                  viewBox="0 -960 960 960"
                  fill="black"
                >
                  <path d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z" />
                </motion.svg>
              </a>
              <a onClick={async () => await writeText(keyList.get().join(''))}>
                <motion.svg
                  whileTap={{ scale: 1.25 }}
                  className="h-5 w-5 outline-none"
                  viewBox="0 -960 960 960"
                  fill="black"
                >
                  <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
                </motion.svg>
              </a>
              <a
                onClick={async () => {
                  const text = (await readText()).split('');
                  let current = 0;
                  const total = text.length;
                  const recall = () =>
                    setTimeout(() => {
                      if (current < total) {
                        AppContext.addKey(text[current]);
                        current++;
                        recall();
                      }
                    }, 25);
                  recall();
                }}
              >
                <motion.svg
                  whileTap={{ scale: 1.25 }}
                  className="h-5 w-5 outline-none"
                  viewBox="0 -960 960 960"
                  fill="black"
                >
                  <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560h-80v120H280v-120h-80v560Zm280-560q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z" />
                </motion.svg>
              </a>
            </>
          )}
          {displayingResult.get() && (
            <a
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
            className="bg-black rounded-full pt-2 pb-2 pl-4 pr-4 text-white"
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
    highlightColor?: string;
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
        style={{ color: props.highlightColor }}
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
