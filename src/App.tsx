import { useCallback, useEffect } from 'react';
import CharactersContainer from './components/CharactersContainer';
import Cursor from './components/Cursor';
import Titlebar from './components/Titlebar';
import { default as AppContext } from './contextProvider';

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
      <CharactersContainer />
      <Cursor />
    </>
  );
}
