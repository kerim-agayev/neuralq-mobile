import React from 'react';
import { QuestionOption } from '../../types';
import TextOptions from './TextOptions';
import ImageOptions from './ImageOptions';

interface MixedOptionsProps {
  options: QuestionOption[];
  selectedIndex: number | null;
  correctIndex: number | null;
  disabled: boolean;
  onSelect: (index: number) => void;
}

export default function MixedOptions(props: MixedOptionsProps) {
  // If any option has an image, use image grid layout
  const hasImages = props.options.some((o) => o.imageUrl);

  if (hasImages) {
    return <ImageOptions {...props} />;
  }

  return <TextOptions {...props} />;
}
