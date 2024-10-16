import { useHookstate } from '@hookstate/core';
import CharactersContainer from './components/CharactersContainer';
import Cursor from './components/Cursor';
import Titlebar from './components/Titlebar';
import AppContext from './contextProvider';
import KeyRecord from './utils/KeyRecord';

export default function App() {
  return (
    <>
      <Titlebar />
      <CharactersContainer />
      <Utilities />
    </>
  );
}

function Utilities() {
  const calculating = useHookstate(AppContext.calculating);
  const displayingResult = useHookstate(AppContext.displayingResult);
  return (
    <>
      {!calculating.get() && !displayingResult.get() && (
        <>
          <KeyRecord />
          <Cursor />
        </>
      )}
    </>
  );
}
