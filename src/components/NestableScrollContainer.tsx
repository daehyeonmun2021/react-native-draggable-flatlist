import React from "react";
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollViewProps } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { runOnUI } from "react-native-reanimated";
import {
  NestableScrollContainerProvider,
  useSafeNestableScrollContainerContext,
} from "../context/nestableScrollContainerContext";
import { useStableCallback } from "../hooks/useStableCallback";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function NestableScrollContainerInner(props: ScrollViewProps) {
  const {
    outerScrollOffset,
    containerSize,
    scrollViewSize,
    scrollableRef,
    outerScrollEnabled,
  } = useSafeNestableScrollContainerContext();

  const onLayout = useStableCallback((event: LayoutChangeEvent) => {
    const {
      nativeEvent: { layout },
    } = event;
    containerSize.value = layout.height;
  });

  const onContentSizeChange = useStableCallback((w: number, h: number) => {
    scrollViewSize.value = h;
    props.onContentSizeChange?.(w, h);
  });

  const handleScroll = useStableCallback((e:NativeSyntheticEvent<NativeScrollEvent>) => {
    props.onScroll?.(e);
    runOnUI((offsetY:number) => {
      outerScrollOffset.value = offsetY;
    })(e.nativeEvent.contentOffset.y);
  })

  return (
    <AnimatedScrollView
      {...props}
      onLayout={onLayout}
      onContentSizeChange={onContentSizeChange}
      scrollEnabled={outerScrollEnabled}
      ref={scrollableRef}
      scrollEventThrottle={1}
      onScroll={handleScroll}
    />
  );
}

export const NestableScrollContainer = React.forwardRef(
  (props: ScrollViewProps, forwardedRef?: React.ForwardedRef<ScrollView>) => {
    return (
      <NestableScrollContainerProvider
        forwardedRef={
          (forwardedRef as React.MutableRefObject<ScrollView>) || undefined
        }
      >
        <NestableScrollContainerInner {...props} />
      </NestableScrollContainerProvider>
    );
  }
);
