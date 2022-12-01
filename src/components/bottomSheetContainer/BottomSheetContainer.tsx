import React, { memo, useCallback, useMemo } from 'react';
import {
  LayoutChangeEvent,
  StatusBar,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedRef } from 'react-native-reanimated';
import { WINDOW_HEIGHT } from '../../constants';
import { print } from '../../utilities';
import { styles } from './styles';
import type { BottomSheetContainerProps } from './types';

function BottomSheetContainerComponent({
  containerHeight,
  containerOffset,
  topInset = useSharedValue(0),
  bottomInset = useSharedValue(0),
  shouldCalculateHeight = true,
  detached,
  style,
  children,
}: BottomSheetContainerProps) {
  const containerRef = useAnimatedRef<Animated.View>();
  //#region styles
  const containerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      style,
      styles.container,
      {
        overflow: detached ? 'visible' : 'hidden',
      },
    ],
    [style, detached, topInset, bottomInset]
  );

  const animatedStyles = useAnimatedStyle(() => ({
    top: topInset.value,
    bottom: bottomInset.value,
  }))

  //#endregion

  //#region callbacks
  const handleContainerLayout = useCallback(
    function handleContainerLayout({
      nativeEvent: {
        layout: { height },
      },
    }: LayoutChangeEvent) {
      containerHeight.value = height;

      containerRef.current?.measure(
        (_x, _y, _width, _height, _pageX, pageY) => {
          containerOffset.value = {
            top: pageY,
            left: 0,
            right: 0,
            bottom: Math.max(
              0,
              WINDOW_HEIGHT - (pageY + height + (StatusBar.currentHeight ?? 0))
            ),
          };
        }
      );

      print({
        component: BottomSheetContainer.displayName,
        method: 'handleContainerLayout',
        params: {
          height,
        },
      });
    },
    [containerHeight, containerOffset, containerRef]
  );
  //#endregion

  //#region render
  return (
    <Animated.View
      ref={containerRef}
      pointerEvents="box-none"
      onLayout={shouldCalculateHeight ? handleContainerLayout : undefined}
      style={[containerStyle, animatedStyles]}
      children={children}
    />
  );
  //#endregion
}

const BottomSheetContainer = memo(BottomSheetContainerComponent);
BottomSheetContainer.displayName = 'BottomSheetContainer';

export default BottomSheetContainer;
