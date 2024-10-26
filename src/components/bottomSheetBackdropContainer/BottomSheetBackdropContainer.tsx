import React, { memo } from 'react';
import { styles } from './styles';
import type { BottomSheetBackdropContainerProps } from './types';

const BottomSheetBackdropContainerComponent = ({
  animatedIndex,
  animatedPosition,
  backdropComponent: BackdropComponent,
  animatedNextPositionIndex,
  animatedCurrentIndex,
}: BottomSheetBackdropContainerProps) => {
  return BackdropComponent ? (
    <BackdropComponent
      animatedCurrentIndex={animatedCurrentIndex}
      animatedNextPositionIndex={animatedNextPositionIndex}
      animatedIndex={animatedIndex}
      animatedPosition={animatedPosition}
      style={styles.container}
    />
  ) : null;
};

const BottomSheetBackdropContainer = memo(
  BottomSheetBackdropContainerComponent
);
BottomSheetBackdropContainer.displayName = 'BottomSheetBackdropContainer';

export default BottomSheetBackdropContainer;
