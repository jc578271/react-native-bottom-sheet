import React, { memo, useCallback, useMemo, useState } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  interpolate,
  Extrapolate,
  useAnimatedStyle,
  useAnimatedReaction,
  useAnimatedGestureHandler,
  runOnJS,
  useSharedValue,
  withTiming,
  useDerivedValue
} from "react-native-reanimated";
import {
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { useBottomSheet } from '../../hooks';
import {
  DEFAULT_OPACITY,
  DEFAULT_APPEARS_ON_INDEX,
  DEFAULT_DISAPPEARS_ON_INDEX,
  DEFAULT_ENABLE_TOUCH_THROUGH,
  DEFAULT_PRESS_BEHAVIOR,
} from './constants';
import { styles } from './styles';
import type { BottomSheetDefaultBackdropProps } from './types';

const BottomSheetBackdropComponent = ({
  animatedIndex,
  animatedNextPositionIndex,
  animatedCurrentIndex,
  opacity: _providedOpacity,
  appearsOnIndex: _providedAppearsOnIndex,
  disappearsOnIndex: _providedDisappearsOnIndex,
  enableTouchThrough: _providedEnableTouchThrough,
  pressBehavior = DEFAULT_PRESS_BEHAVIOR,
  onPress,
  style,
  children,
  isAnimation = true,
  isCustomAnimatedIndex,
  customAnimatedDuration = 300
}: BottomSheetDefaultBackdropProps) => {
  //#region hooks
  const { snapToIndex, close } = useBottomSheet();
  //#endregion

  //#region defaults
  const opacity = _providedOpacity ?? DEFAULT_OPACITY;
  const appearsOnIndex = _providedAppearsOnIndex ?? DEFAULT_APPEARS_ON_INDEX;
  const disappearsOnIndex =
    _providedDisappearsOnIndex ?? DEFAULT_DISAPPEARS_ON_INDEX;
  const enableTouchThrough =
    _providedEnableTouchThrough ?? DEFAULT_ENABLE_TOUCH_THROUGH;
  //#endregion

  //#region variables
  const [pointerEvents, setPointerEvents] = useState<
    ViewProps['pointerEvents']
  >(enableTouchThrough ? 'none' : 'auto');
  //#endregion

  //#region callbacks
  const handleOnPress = useCallback(() => {
    onPress?.();

    if (pressBehavior === 'close') {
      close();
    } else if (pressBehavior === 'collapse') {
      snapToIndex(disappearsOnIndex as number);
    } else if (typeof pressBehavior === 'number') {
      snapToIndex(pressBehavior);
    }
  }, [snapToIndex, close, disappearsOnIndex, pressBehavior, onPress]);
  const handleContainerTouchability = useCallback(
    (shouldDisableTouchability: boolean) => {
      setPointerEvents(shouldDisableTouchability ? 'none' : 'auto');
    },
    []
  );
  //#endregion

  //#region tap gesture
  const gestureHandler =
    useAnimatedGestureHandler<TapGestureHandlerGestureEvent>(
      {
        onFinish: () => {
          runOnJS(handleOnPress)();
        },
      },
      [handleOnPress]
    );
  //#endregion

  const customAnimatedIndex = useSharedValue(-1)

  if (isCustomAnimatedIndex) {
    useAnimatedReaction(() => ({
      _curIndex: animatedCurrentIndex.value,
      _nextIndex: animatedNextPositionIndex.value
    })
    , _cur => {
      const {_curIndex, _nextIndex} = _cur
      const _val = _nextIndex === -Infinity ? _curIndex : _nextIndex
      customAnimatedIndex.value = withTiming(_val, {duration: customAnimatedDuration})
    }, [customAnimatedDuration])
  }

  const _animatedIndex = useDerivedValue(() => {
    return isCustomAnimatedIndex ? customAnimatedIndex.value : animatedIndex.value
  }, [isCustomAnimatedIndex])

  //#region styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        _animatedIndex.value,
        [-1, disappearsOnIndex, appearsOnIndex],
        [0, 0, opacity],
        Extrapolate.CLAMP
      ),
      flex: 1,
    }
  });
  const containerStyle = useMemo(
    () => [
      styles.container,
      style,
      isAnimation
        ? containerAnimatedStyle
        : (
          opacity == 0
            ? {backgroundColor: 'transparent'}
            : {opacity}
        )
    ],
    [style, containerAnimatedStyle, isAnimation, opacity]
  );
  //#endregion

  //#region effects
  useAnimatedReaction(
    () => animatedIndex.value <= disappearsOnIndex,
    (shouldDisableTouchability, previous) => {
      if (shouldDisableTouchability === previous) {
        return;
      }
      runOnJS(handleContainerTouchability)(shouldDisableTouchability);
    },
    [disappearsOnIndex]
  );
  //#endregion

  return pressBehavior !== 'none' ? (
    <TapGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={containerStyle}
        pointerEvents={pointerEvents}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Bottom Sheet backdrop"
        accessibilityHint={`Tap to ${
          typeof pressBehavior === 'string' ? pressBehavior : 'move'
        } the Bottom Sheet`}
      >
        {children}
      </Animated.View>
    </TapGestureHandler>
  ) : (
    <Animated.View pointerEvents={pointerEvents} style={containerStyle}>
      {children}
    </Animated.View>
  );
};

const BottomSheetBackdrop = memo(BottomSheetBackdropComponent);
BottomSheetBackdrop.displayName = 'BottomSheetBackdrop';

export default BottomSheetBackdrop;
