import { Root } from 'remotion';
import { Container } from './compositions';

/**
 * Root Remotion. Semua composition (silk, terrain, aurora, hex, ridges, car)
 * terdaftar melalui <Container> di src/compositions/index.ts.
 */
export const AppRoot = () => {
  return (
    <Root>
      <Container />
    </Root>
  );
};

export default AppRoot;
