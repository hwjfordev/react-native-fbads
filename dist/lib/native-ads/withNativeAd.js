var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
import React from 'react';
import { findNodeHandle, requireNativeComponent } from 'react-native';
import { AdIconView, MediaView } from '../index';
import { AdChoicesViewContext, AdIconViewContext, MediaViewContext, TriggerableContext } from './contexts';
import AdsManager from './NativeAdsManager';
import { areSetsEqual } from '../util/areSetsEqual';
// tslint:disable-next-line:variable-name
const NativeAdView = requireNativeComponent('CTKNativeAd');
export default (
// tslint:disable-next-line:variable-name
Component) => class NativeAdWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.registerMediaView = (mediaView) => this.setState({ mediaViewNodeHandle: findNodeHandle(mediaView) || -1 });
        this.unregisterMediaView = () => this.setState({ mediaViewNodeHandle: -1 });
        this.registerAdIconView = (adIconView) => this.setState({ adIconViewNodeHandle: findNodeHandle(adIconView) || -1 });
        this.unregisterAdIconView = () => this.setState({ adIconViewNodeHandle: -1 });
        this.registerClickableChild = (child) => {
            const handle = findNodeHandle(child);
            if (!handle) {
                return;
            }
            this.clickableChildrenNodeHandles.set(child, handle);
            this.setState({
                clickableChildren: this.state.clickableChildren.add(handle)
            });
        };
        this.unregisterClickableChild = (child) => {
            this.setState(({ clickableChildren }) => {
                const newClickableChildren = new Set(clickableChildren);
                newClickableChildren.delete(this.clickableChildrenNodeHandles.get(child));
                this.clickableChildrenNodeHandles.delete(child);
                return { clickableChildren: newClickableChildren };
            });
        };
        this.handleAdUpdated = () => this.state.ad &&
            this.props.onAdLoaded &&
            this.props.onAdLoaded(this.state.ad);
        this.handleAdLoaded = ({ nativeEvent }) => {
            this.setState({ ad: nativeEvent }, this.handleAdUpdated);
        };
        this.handleNativeAdViewMount = (ref) => {
            this.nativeAdViewRef = ref;
        };
        this.registerFunctionsForTriggerables = {
            register: this.registerClickableChild,
            unregister: this.unregisterClickableChild
        };
        this.registerFunctionsForMediaView = {
            unregister: this.unregisterMediaView,
            register: this.registerMediaView
        };
        this.registerFunctionsForAdIconView = {
            unregister: this.unregisterAdIconView,
            register: this.registerAdIconView
        };
        this.clickableChildrenNodeHandles = new Map();
        this.state = {
            // iOS requires a non-null value
            mediaViewNodeHandle: -1,
            adIconViewNodeHandle: -1,
            clickableChildren: new Set(),
            canRequestAds: false
        };
    }
    /**
     * On init, register for updates on `adsManager` to know when it becomes available
     */
    componentDidMount() {
        this.subscription = this.props.adsManager.onAdsLoaded(() => this.setState({ canRequestAds: true }));
        this.subscriptionError = this.props.adsManager.onAdsError(() => this.setState({ canRequestAds: false }));
    }
    componentDidUpdate(_, prevState) {
        if (this.state.mediaViewNodeHandle === -1 ||
            this.state.adIconViewNodeHandle === -1) {
            // Facebook's SDK requires both MediaView and AdIconView references in order to register
            // interactable views. If one of them is missing, we can't proceed with the registration.
            return;
        }
        const mediaViewNodeHandleChanged = this.state.mediaViewNodeHandle !== prevState.mediaViewNodeHandle;
        const adIconViewNodeHandleChanged = this.state.adIconViewNodeHandle !== prevState.adIconViewNodeHandle;
        const clickableChildrenChanged = areSetsEqual(prevState.clickableChildren, this.state.clickableChildren);
        if (mediaViewNodeHandleChanged ||
            adIconViewNodeHandleChanged ||
            clickableChildrenChanged) {
            const viewHandle = findNodeHandle(this.nativeAdViewRef);
            if (!viewHandle) {
                // Skip registration if the view is no longer valid.
                return;
            }
            AdsManager.registerViewsForInteractionAsync(viewHandle, this.state.mediaViewNodeHandle, this.state.adIconViewNodeHandle, [...this.state.clickableChildren]);
        }
    }
    /**
     * Clear subscription when component goes off screen
     */
    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.remove();
        }
        if (this.subscriptionError) {
            this.subscriptionError.remove();
        }
    }
    renderAdComponent(componentProps) {
        if (!this.state.ad) {
            return null;
        }
        return (<AdIconViewContext.Provider value={this.registerFunctionsForAdIconView}>
          <MediaViewContext.Provider value={this.registerFunctionsForMediaView}>
            <TriggerableContext.Provider value={this.registerFunctionsForTriggerables}>
              <AdChoicesViewContext.Provider value={this.props.adsManager.toJSON()}>
                

                <AdIconView style={{ width: 0, height: 0 }}/>
                <MediaView style={{ width: 0, height: 0 }}/>
                <Component {...componentProps} nativeAd={this.state.ad}/>
              </AdChoicesViewContext.Provider>
            </TriggerableContext.Provider>
          </MediaViewContext.Provider>
        </AdIconViewContext.Provider>);
    }
    render() {
        // Cast to any until https://github.com/Microsoft/TypeScript/issues/10727 is resolved
        const _a = this.props, { adsManager, onAdLoaded } = _a, rest = __rest(_a, ["adsManager", "onAdLoaded"]);
        if (!this.state.canRequestAds) {
            return null;
        }
        return (<NativeAdView ref={this.handleNativeAdViewMount} adsManager={adsManager.toJSON()} onAdLoaded={this.handleAdLoaded}>
          {this.renderAdComponent(rest)}
        </NativeAdView>);
    }
};
