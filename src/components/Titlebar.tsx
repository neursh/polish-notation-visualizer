import { useHookstate } from '@hookstate/core';
import { getCurrentWindow, Window } from '@tauri-apps/api/window';
import { memo, useCallback, useEffect, useMemo } from 'react';

const Titlebar = memo(() => {
  const appWindow = useMemo(() => getCurrentWindow(), []);

  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 flex items-center justify-between w-full h-12 pl-3 z-10 backdrop-blur-md"
    >
      <Title />
      <div className="flex items-center">
        <Minimize appWindow={appWindow} />
        <MaximizeToggle appWindow={appWindow} />
        <Close appWindow={appWindow} />
      </div>
    </div>
  );
});

function Title() {
  return (
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
  );
}

const Minimize = memo((props: { appWindow: Window }) => {
  return (
    <div
      className="w-12 h-12 flex justify-center items-center"
      onClick={() => props.appWindow.minimize()}
    >
      <svg width="10" height="1" viewBox="0 0 10 1">
        <line y1="0.5" x2="10" y2="0.5" stroke="black" />
      </svg>
    </div>
  );
});

const MaximizeToggle = memo((props: { appWindow: Window }) => {
  const isMaximized = useHookstate(false);

  const windowResizeListener = useCallback(
    () =>
      props.appWindow.onResized(async () => {
        isMaximized.set(await props.appWindow.isMaximized());
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.appWindow]
  );

  useEffect(() => {
    const listener = windowResizeListener();
    return () => {
      listener.then((unlisten) => unlisten());
    };
  }, [windowResizeListener]);

  return (
    <div
      className="w-12 h-12 flex justify-center items-center"
      onClick={() => props.appWindow.toggleMaximize()}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        {isMaximized.get() ? (
          <>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5 1H7C8.10457 1 9 1.89543 9 3V5C9 6.10457 8.10457 7 7 7V8C8.65685 8 10 6.65685 10 5V3C10 1.34315 8.65685 0 7 0H5C3.34315 0 2 1.34315 2 3H3C3 1.89543 3.89543 1 5 1Z"
              fill="black"
            />
            <rect
              x="0.5"
              y="2.5"
              width="7"
              height="7"
              rx="2.5"
              stroke="black"
            />
          </>
        ) : (
          <rect x="0" y="0" width="10" height="10" rx="4" stroke="black" />
        )}
      </svg>
    </div>
  );
});

const Close = memo((props: { appWindow: Window }) => {
  return (
    <div
      className="w-12 h-12 flex justify-center items-center"
      onClick={() => props.appWindow.close()}
    >
      <svg width="10" height="10" viewBox="0 0 11 11">
        <path
          d="M0.903934 0.903867L10.0963 10.0963M0.903934 10.0963L10.0963 0.903867"
          stroke="black"
        />
      </svg>
    </div>
  );
});

export default Titlebar;
