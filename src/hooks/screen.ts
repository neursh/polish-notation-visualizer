import { useEffect, useState } from 'react';

export function useScreen() {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    function setScreen() {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }

    window.addEventListener('resize', setScreen, { passive: true });

    return () => {
      window.removeEventListener('resize', setScreen);
    };
  }, []);

  return { width: width, height: height };
}
