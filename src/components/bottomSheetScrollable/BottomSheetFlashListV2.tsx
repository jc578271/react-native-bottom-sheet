import React, {forwardRef} from 'react';
import Animated from 'react-native-reanimated';
import {
  BottomSheetScrollView,
  createBottomSheetScrollableComponent,
  SCROLLABLE_TYPE
} from "@gorhom/bottom-sheet";
import {FlashList, FlashListProps} from '@shopify/flash-list';

const _FlashList = forwardRef((props: any, ref) => {
  return (
    <FlashList
      ref={ref}
      {...props}
      renderScrollComponent={BottomSheetScrollView}
    />
  );
});

const AnimatedFlashList = Animated.createAnimatedComponent<FlashListProps<any>>(
  _FlashList as any,
);

const BottomSheetFlashListComponent = createBottomSheetScrollableComponent(
  SCROLLABLE_TYPE.FLATLIST,
  AnimatedFlashList,
);

const BottomSheetFlashListV2 = React.memo(BottomSheetFlashListComponent);
BottomSheetFlashListV2.displayName = 'BottomSheetFlashListV2';

export default BottomSheetFlashListV2 as <T>(
  props: FlashListProps<T>
  // @ts-ignore
) => ReturnType<typeof FlashList>;
