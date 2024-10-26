import React, { memo, useEffect, useCallback, useMemo } from 'react';
import {
  type LayoutChangeEvent,
  StyleSheet,
  type ViewStyle,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SCROLLABLE_TYPE } from '../../constants';
import { useBottomSheetInternal } from '../../hooks';
import { print } from '../../utilities';
import type { BottomSheetViewProps } from './types';

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
    animatedContentHeightMapRef,
    routeKey,
  } = useBottomSheetInternal();
  //#endregion

  //#region styles
  const flattenStyle = useMemo<ViewStyle | undefined>(
    () => StyleSheet.flatten(style),
    [style]
  );
  const containerStyle = useAnimatedStyle(() => {
    if (!enableFooterMarginAdjustment) {
      return flattenStyle ?? {};
    }

    const marginBottom =
      typeof flattenStyle?.marginBottom === 'number'
        ? flattenStyle.marginBottom
        : 0;

    return {
      ...(flattenStyle ?? {}),
      marginBottom: marginBottom + animatedFooterHeight.value,
    };
  }, [flattenStyle, enableFooterMarginAdjustment, animatedFooterHeight]);
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
            [routeKey]: {
              ...animatedContentHeightMapRef.current[routeKey],
              [name]: event.nativeEvent.layout.height
            }
          }
          animatedContentHeightMap.value =  animatedContentHeightMapRef.current
        }
      }

      if (onLayout) {
        onLayout(event);
      }

      if (__DEV__) {
        print({
          component: BottomSheetView.displayName,
          method: 'handleLayout',
          category: 'layout',
          params: {
            height: event.nativeEvent.layout.height,
          },
        });
      }
    },
    [onLayout, animatedContentHeight, enableDynamicSizing]
  );
  //#endregion

  // effects
  // useFocusHook(handleSettingScrollable);

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
