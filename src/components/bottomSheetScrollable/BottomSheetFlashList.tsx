import * as React from 'react';
import {FlashList, FlashListProps} from '@shopify/flash-list';

import Animated from 'react-native-reanimated';
import {
  BottomSheetScrollView,
  createBottomSheetScrollableComponent,
  SCROLLABLE_TYPE
} from "@gorhom/bottom-sheet";

const F2 = React.forwardRef((props: any, ref) => {
  return (
    <FlashList
      {...props}
      overrideProps={{
        ref,
      }}
      renderScrollComponent={BottomSheetScrollView}
    />
  );
});

const AnimatedFlashList = Animated.createAnimatedComponent<FlashListProps<any>>(
  F2 as any,
);

const BottomSheetFlashListComponent = createBottomSheetScrollableComponent(
  SCROLLABLE_TYPE.FLATLIST,
  AnimatedFlashList,
);

const BottomSheetFlashList = React.memo(BottomSheetFlashListComponent);
BottomSheetFlashList.displayName = 'BottomSheetFlashList';

export default BottomSheetFlashList as <T>(
  props: FlashListProps<T>
  // @ts-ignore
) => ReturnType<typeof FlashList>;
