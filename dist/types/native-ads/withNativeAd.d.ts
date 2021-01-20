import { EventSubscription } from 'fbemitter';
import React from 'react';
import { ComponentOrClass } from './contexts';
import { HasNativeAd, NativeAd } from './nativeAd';
import AdsManager from './NativeAdsManager';
interface AdWrapperState {
    ad?: NativeAd;
    canRequestAds: boolean;
    mediaViewNodeHandle: number;
    adIconViewNodeHandle: number;
    clickableChildren: Set<number>;
}
interface AdWrapperProps {
    adsManager: AdsManager;
    onAdLoaded?: (ad: NativeAd) => void;
}
declare const _default: <T extends HasNativeAd>(Component: React.ComponentType<T>) => {
    new (props: AdWrapperProps & T): {
        subscription?: EventSubscription | undefined;
        subscriptionError?: EventSubscription | undefined;
        nativeAdViewRef?: React.Component<{}, {}, any> | undefined;
        registerFunctionsForTriggerables: import("./contexts").MultipleRegisterablesContextValueType;
        registerFunctionsForMediaView: import("./contexts").RegisterableContextValueType;
        registerFunctionsForAdIconView: import("./contexts").RegisterableContextValueType;
        clickableChildrenNodeHandles: Map<ComponentOrClass, number>;
        /**
         * On init, register for updates on `adsManager` to know when it becomes available
         */
        componentDidMount(): void;
        componentDidUpdate(_: AdWrapperProps, prevState: AdWrapperState): void;
        /**
         * Clear subscription when component goes off screen
         */
        componentWillUnmount(): void;
        registerMediaView: (mediaView: ComponentOrClass) => void;
        unregisterMediaView: () => void;
        registerAdIconView: (adIconView: ComponentOrClass) => void;
        unregisterAdIconView: () => void;
        registerClickableChild: (child: ComponentOrClass) => void;
        unregisterClickableChild: (child: ComponentOrClass) => void;
        handleAdUpdated: () => void | undefined;
        handleAdLoaded: ({ nativeEvent }: {
            nativeEvent: NativeAd;
        }) => void;
        handleNativeAdViewMount: (ref: React.Component<{}, {}, any>) => void;
        renderAdComponent(componentProps: T): React.ReactNode;
        render(): JSX.Element | null;
        setState<K extends "ad" | "canRequestAds" | "mediaViewNodeHandle" | "adIconViewNodeHandle" | "clickableChildren">(state: AdWrapperState | ((prevState: Readonly<AdWrapperState>, props: Readonly<AdWrapperProps & T>) => AdWrapperState | Pick<AdWrapperState, K> | null) | Pick<AdWrapperState, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        readonly props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<AdWrapperProps & T>;
        state: Readonly<AdWrapperState>;
        context: any;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
};
export default _default;
