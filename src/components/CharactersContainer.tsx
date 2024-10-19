import { State, useHookstate } from '@hookstate/core';
import { animate, motion, useMotionValue } from 'framer-motion';
import { memo, useCallback, useEffect, useMemo } from 'react';
import AppContext, { IterationResult, NotationType } from '../contextProvider';

const CharactersContainer = memo(() => {
  const calculating = useHookstate(AppContext.calculating);
  const keyList = useHookstate(AppContext.keyList);
  const result = useHookstate(AppContext.result);
  const displayingResult = useHookstate(AppContext.displayingResult);
  const currentDisplayResult = useHookstate(0);

  useEffect(() => {
    if (result.length > 0) {
      displayingResult.set(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    if (displayingResult.get()) {
      if (result.length - 1 < currentDisplayResult.get()) {
        AppContext.resetCalculation();
        currentDisplayResult.set(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayingResult, currentDisplayResult]);

  const highlight = useMemo(() => {
    if (displayingResult.get()) {
      return result[currentDisplayResult.get()].highlight.get();
    } else {
      return;
    }
  }, [currentDisplayResult, displayingResult, result]);

  return (
    <div className="flex flex-col w-full items-center justify-top mt-[calc(48px+5vh)] mb-4">
      <div className="min-h-[160px] w-2/3 flex items-start overflow-clip pt-2 pb-2 pr-4 pl-4 outline outline-gray-400 outline-2 rounded-lg">
        <div
          className="flex flex-wrap font-semibold text-3xl"
          id="character-container"
        >
          {displayingResult.get()
            ? result[currentDisplayResult.get()].rawData
                .get()
                .map((value, index) => (
                  <DisplayingCharacter
                    key={index}
                    highlightColor={
                      displayingResult.get() ? highlight?.get(index) : undefined
                    }
                    value={`${value}\u00A0\u00A0`}
                    delay={displayingResult.get() ? index * 0.025 : 0}
                  />
                ))
            : keyList
                .get()
                .map((value, index) => (
                  <TypingCharacter
                    value={value}
                    key={index}
                    id={`key-${index}`}
                  />
                ))}
        </div>
      </div>
      <CalculateButtons
        displayingResult={displayingResult}
        result={result}
        currentDisplayResult={currentDisplayResult}
        calculating={calculating}
      />
    </div>
  );
});

function DisplayingCharacter(props: {
  value: string | number;
  delay: number;
  highlightColor?: string;
}) {
  const opacity = useMotionValue(0);
  const translateX = useMotionValue(10);

  useEffect(() => {
    opacity.set(0);
    translateX.set(10);

    animate(opacity, 1, { ease: [0.25, 0.25, 0, 1], delay: props.delay });
    animate(translateX, 0, { ease: [0.25, 0.25, 0, 1], delay: props.delay });
  });

  return (
    <motion.p
      style={{ color: props.highlightColor, opacity, translateX }}
      transition={{ ease: [0.25, 0.25, 0, 1], delay: props.delay }}
    >
      {props.value === ' ' ? '\u00A0\u00A0' : props.value}
    </motion.p>
  );
}

const TypingCharacter = memo(
  (props: { value: string | number; id: string }) => {
    return (
      <motion.p
        id={props.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ease: [0.25, 0.25, 0, 1] }}
      >
        {props.value === ' ' ? '\u00A0\u00A0' : props.value}
      </motion.p>
    );
  }
);

function CalculateButtons(props: {
  displayingResult: State<boolean, object>;
  result: State<IterationResult[], object>;
  currentDisplayResult: State<number, object>;
  calculating: State<boolean, object>;
}) {
  const reset = useCallback(() => {
    props.result.set([]);
    props.currentDisplayResult.set(0);
    props.displayingResult.set(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex w-2/3 justify-between items-center">
      <p>
        {props.displayingResult.get()
          ? props.result[
              props.currentDisplayResult.get()
            ].calculationAboutToMake
              .get()
              .join(' ')
          : ''}
      </p>
      <div className="flex items-center gap-4 pt-2">
        {!props.displayingResult.get() && <Utilities />}
        {props.displayingResult.get() && (
          <a
            onClick={() =>
              props.currentDisplayResult.get() > 0
                ? props.currentDisplayResult.set((p) => p - 1)
                : reset()
            }
          >
            {props.currentDisplayResult.get() > 0 ? 'Previous' : 'Cancel'}
          </a>
        )}
        <a
          className={`bg-black rounded-full pt-2 pb-2 pl-4 pr-4 text-white ${
            props.calculating.get() ? 'pointer-events-none' : ''
          } `}
          onClick={() =>
            !props.displayingResult.get()
              ? AppContext.calculate()
              : props.currentDisplayResult.get() < props.result.length - 1
              ? props.currentDisplayResult.set((p) => p + 1)
              : reset()
          }
        >
          {!props.displayingResult.get()
            ? 'Calculate'
            : props.currentDisplayResult.get() < props.result.length - 1
            ? 'Next'
            : 'Finish'}
        </a>
      </div>
    </div>
  );
}

function Utilities() {
  return (
    <>
      <SelectNotationType />
      <a onClick={AppContext.clear}>
        <motion.svg
          whileTap={{ scale: 1.25 }}
          className="h-5 w-5 outline-none"
          viewBox="0 -960 960 960"
          fill="black"
        >
          <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
        </motion.svg>
      </a>
      <a onClick={AppContext.copy}>
        <motion.svg
          whileTap={{ scale: 1.25 }}
          className="h-5 w-5 outline-none"
          viewBox="0 -960 960 960"
          fill="black"
        >
          <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
        </motion.svg>
      </a>
      <a onClick={AppContext.paste}>
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
  );
}

function SelectNotationType() {
  const notationType = useHookstate(AppContext.notationType);

  const changeType = useCallback(() => {
    notationType.set(
      notationType.get() === NotationType.Normal
        ? NotationType.Reversed
        : NotationType.Normal
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const width = useMotionValue(100);
  const rotate = useMotionValue(0);
  useEffect(() => {
    if (notationType.get() === NotationType.Normal) {
      animate(width, 100, {
        ease: [0.25, 0.25, 0, 1],
      });
      animate(rotate, rotate.get() + 360, {
        ease: [0, 0, 0, 0],
        repeat: Infinity,
        duration: 4,
      });
    } else {
      animate(width, 110, {
        ease: [0.25, 0.25, 0, 1],
      });
      animate(rotate, rotate.get() - 360, {
        ease: [0, 0, 0, 0],
        repeat: Infinity,
        duration: 4,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notationType]);

  return (
    <motion.div
      className="flex items-center justify-center text-sm gap-3 pl-2 pr-2 h-5 rounded-full overflow-clip outline outline-1"
      style={{ width }}
      onClick={changeType}
    >
      <motion.svg
        className="h-4 w-4"
        style={{ rotate }}
        viewBox="0 -960 960 960"
        fill="black"
      >
        <path d="M204-318q-22-38-33-78t-11-82q0-134 93-228t227-94h7l-64-64 56-56 160 160-160 160-56-56 64-64h-7q-100 0-170 70.5T240-478q0 26 6 51t18 49l-60 60ZM481-40 321-200l160-160 56 56-64 64h7q100 0 170-70.5T720-482q0-26-6-51t-18-49l60-60q22 38 33 78t11 82q0 134-93 228t-227 94h-7l64 64-56 56Z" />
      </motion.svg>
      <p className="-translate-x-1">{NotationType[notationType.get()]}</p>
    </motion.div>
  );
}

export default CharactersContainer;
