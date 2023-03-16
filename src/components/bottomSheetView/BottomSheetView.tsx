import React, { memo, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SCROLLABLE_TYPE } from '../../constants';
import { useBottomSheetInternal } from '../../hooks';
import type { BottomSheetViewProps } from './types';

function BottomSheetViewComponent({
  focusHook: useFocusHook = useEffect,
  enableFooterMarginAdjustment = false,
  style,
  children,
  onLayout,
  ...rest
}: BottomSheetViewProps) {
  // hooks
  const {
    animatedScrollableContentOffsetY,
    animatedScrollableType,
    animatedFooterHeight,
  } = useBottomSheetInternal();

  // styles
  const containerStylePaddingBottom = useMemo(() => {
    const flattenStyle = StyleSheet.flatten(style);
    const paddingBottom =
      flattenStyle && 'paddingBottom' in flattenStyle
        ? flattenStyle.paddingBottom
        : 0;
    return typeof paddingBottom === 'number' ? paddingBottom : 0;
  }, [style]);
  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      paddingBottom: enableFooterMarginAdjustment
        ? animatedFooterHeight.value + containerStylePaddingBottom
        : containerStylePaddingBottom,
    }),
    [containerStylePaddingBottom, enableFooterMarginAdjustment]
  );
  const containerStyle = useMemo(
    () => [style ,containerAnimatedStyle],
    [style, containerAnimatedStyle]
  );

  // callback
  const handleSettingScrollable = useCallback(() => {
    animatedScrollableContentOffsetY.value = 0;
    animatedScrollableType.value = SCROLLABLE_TYPE.VIEW;
  }, [animatedScrollableContentOffsetY, animatedScrollableType]);

  // effects
  useFocusHook(handleSettingScrollable);

  //render
  return (
    <Animated.View  {...rest} style={[containerStyle, {overflow: "scroll"}]}>
      <View onLayout={onLayout}>
        {children}
      </View>
    </Animated.View>
  );
}

const BottomSheetView = memo(BottomSheetViewComponent);
BottomSheetView.displayName = 'BottomSheetView';

export default BottomSheetView;
