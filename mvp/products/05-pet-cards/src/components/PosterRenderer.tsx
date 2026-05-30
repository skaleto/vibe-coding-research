'use client';

import { forwardRef } from 'react';
import type { PetCardResult, PosterStyle } from '@/lib/types';
import { PosterStyle1 } from './PosterStyle1';
import { PosterStyle2 } from './PosterStyle2';
import { PosterStyle3 } from './PosterStyle3';

type Props = {
  result: PetCardResult;
  style: PosterStyle;
};

export const PosterRenderer = forwardRef<HTMLDivElement, Props>(function PosterRenderer(
  { result, style },
  ref
) {
  if (style === 'style2') return <PosterStyle2 ref={ref} result={result} />;
  if (style === 'style3') return <PosterStyle3 ref={ref} result={result} />;
  return <PosterStyle1 ref={ref} result={result} />;
});
