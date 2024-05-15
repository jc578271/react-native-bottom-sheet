import React, { memo, useEffect, useCallback, useMemo } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SCROLLABLE_TYPE } from '../../constants';
import { useBottomSheetInternal } from '../../hooks';
import type { BottomSheetViewProps } from './types';
import { print } from '../../utilities';

function BottomSheetViewComponent({
  focusHook: useFocusHook = useEffect,
  enableFooterMarginAdjustment = false,
  onLayout,
  style,
  children,
  name = 'no_name_view',
  ...rest
}: BottomSheetViewProps) {
  //#region hooks
  const {
    animatedScrollableContentOffsetY,
    animatedScrollableType,
    animatedFooterHeight,
    enableDynamicSizing,
    animatedContentHeight,
    animatedContentHeightMap,
    animatedContentHeightMapRef
  } = useBottomSheetInternal();
  //#endregion

  //#region styles
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
    () => [style, containerAnimatedStyle],
    [style, containerAnimatedStyle]
  );
  //#endregion

  //#region callbacks
  const handleSettingScrollable = useCallback(() => {
    animatedScrollableContentOffsetY.value = 0;
    animatedScrollableType.value = SCROLLABLE_TYPE.VIEW;
  }, [animatedScrollableContentOffsetY, animatedScrollableType]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (enableDynamicSizing) {
        if (name) {
          animatedContentHeightMapRef.current = {
            ...animatedContentHeightMapRef.current,
            [name]: event.nativeEvent.layout.height
          }
          animatedContentHeightMap.value =  animatedContentHeightMapRef.current
        }
      }

      if (onLayout) {
        onLayout(event);
      }

      print({
        component: BottomSheetView.displayName,
        method: 'handleLayout',
        params: {
          height: event.nativeEvent.layout.height,
        },
      });
    },
    [onLayout, animatedContentHeight, enableDynamicSizing, name]
  );
  //#endregion

  // effects
  useFocusHook(handleSettingScrollable);

  //render
  return (
    <Animated.View style={[containerStyle, {overflow: "scroll"}]} {...rest}>
      <View onLayout={handleLayout}>
        {children}
      </View>
    </Animated.View>
  );
}

const BottomSheetView = memo(BottomSheetViewComponent);
BottomSheetView.displayName = 'BottomSheetView';

export default BottomSheetView;
