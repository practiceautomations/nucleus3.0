import type React from 'react';
import { useEffect, useRef } from 'react';

const useOnceEffect = (
  func: () => void,
  deps: React.DependencyList | undefined
) => {
  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) {
      func();
    }
    return () => {
      didMount.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useOnceEffect;
