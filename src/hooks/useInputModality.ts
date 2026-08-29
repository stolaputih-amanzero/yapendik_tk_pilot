import { useState, useEffect, useCallback } from 'react';

export type InputModality = 'TOUCH' | 'STYLUS' | 'MOUSE' | 'KEYBOARD';

export function useInputModality(): {
  modality: InputModality;
  isCoarse: boolean;
  canHover: boolean;
} {
  const [modality, setModality] = useState<InputModality>(() => {
    if (typeof window === 'undefined') return 'MOUSE';
    if (window.matchMedia('(pointer: coarse)').matches) return 'TOUCH';
    return 'MOUSE';
  });

  const handlePointer = useCallback((e: PointerEvent) => {
    if (e.pointerType === 'touch') setModality('TOUCH');
    else if (e.pointerType === 'pen') setModality('STYLUS');
    else if (e.pointerType === 'mouse') setModality('MOUSE');
  }, []);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      setModality('KEYBOARD');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('pointerdown', handlePointer);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('pointerdown', handlePointer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [handlePointer, handleKey]);

  const isCoarse = modality === 'TOUCH';
  const canHover = modality === 'MOUSE' || modality === 'STYLUS';

  return { modality, isCoarse, canHover };
}
