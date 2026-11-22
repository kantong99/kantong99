import { Container } from './compositions';

/**
 * Root Remotion. Semua composition (silk, terrain, aurora, hex, ridges, car)
 * terdaftar melalui <Container> di src/compositions/index.ts.
 */
export const AppRoot = () => {
  return <Container />;
};

export default AppRoot;
