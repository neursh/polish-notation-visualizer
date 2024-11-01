import { memo } from 'react';

const Titlebar = memo(() => {
  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 flex items-center justify-between w-full h-12 pl-3 z-10 backdrop-blur-md"
    >
      <Title />
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
        Polish Notation Visualizer
      </p>
    </div>
  );
}

export default Titlebar;
