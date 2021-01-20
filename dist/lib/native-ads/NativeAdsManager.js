var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { NativeModules, NativeEventEmitter } from 'react-native';
import { EventEmitter } from 'fbemitter';
const { CTKNativeAdManager, CTKNativeAdEmitter } = NativeModules;
const nativeAdEmitter = new NativeEventEmitter(CTKNativeAdEmitter);
const EVENT_DID_BECOME_VALID = 'AdsManagerDidBecomeValid';
const EVENT_DID_BECOME_INVALID = 'AdsManagerDidBecomeInvalid';
export default class NativeAdsManager {
    /**
     * Creates an instance of AdsManager with a given placementId and adsToRequest.
     * Default number of ads to request is `10`.
     *
     * AdsManager will become loading ads immediately
     */
    constructor(placementId, adsToRequest = 10) {
        // Indicates whether AdsManager is ready to serve ads
        this.isValid = false;
        this.eventEmitter = new EventEmitter();
        this.placementId = placementId;
        this.listenForStateChanges();
        this.listenForErrors();
        CTKNativeAdManager.init(placementId, adsToRequest);
    }
    static registerViewsForInteractionAsync(nativeAdViewTag, mediaViewTag, adIconViewTag, clickable) {
        return __awaiter(this, void 0, void 0, function* () {
            if (adIconViewTag > 0 && mediaViewTag > 0) {
                clickable.push(mediaViewTag, adIconViewTag);
            }
            else if (mediaViewTag > 0) {
                clickable.push(mediaViewTag);
            }
            else if (adIconViewTag > 0) {
                clickable.push(adIconViewTag);
            }
            const result = yield CTKNativeAdManager.registerViewsForInteraction(nativeAdViewTag, mediaViewTag, adIconViewTag, clickable);
            return result;
        });
    }
    /**
     * Listens for AdManager state changes and updates internal state. When it changes,
     * callers will be notified of a change
     */
    listenForStateChanges() {
        nativeAdEmitter.addListener('CTKNativeAdsManagersChanged', (managers) => {
            const isValidNow = managers[this.placementId];
            if (this.isValid !== isValidNow && isValidNow) {
                this.isValid = true;
                this.eventEmitter.emit(EVENT_DID_BECOME_VALID);
            }
        });
    }
    /**
     * Listens for AdManager errors. When error occures,
     * callers will be notified of it
     */
    listenForErrors() {
        nativeAdEmitter.addListener('onAdError', (error) => {
            this.isValid = false;
            this.eventEmitter.emit(EVENT_DID_BECOME_INVALID, error);
        });
    }
    /**
     * Used to listening for state changes
     *
     * If manager already became valid, it will call the function w/o registering
     * handler for events
     */
    onAdsLoaded(func) {
        if (this.isValid) {
            setTimeout(func);
            return {
                context: null,
                listener: () => { },
                remove: () => { }
            };
        }
        return this.eventEmitter.once(EVENT_DID_BECOME_VALID, func);
    }
    /**
     * Used to listening for errors from this native ad manager
     */
    onAdsError(func) {
        return this.eventEmitter.once(EVENT_DID_BECOME_INVALID, func);
    }
    /**
     * Disables auto refreshing for this native ad manager
     */
    disableAutoRefresh() {
        CTKNativeAdManager.disableAutoRefresh(this.placementId);
    }
    /**
     * Set the native ads manager caching policy. This controls which media from
     * the native ads are cached before the onAdsLoaded is called.
     * The default is to not block on caching.
     */
    setMediaCachePolicy(cachePolicy) {
        CTKNativeAdManager.setMediaCachePolicy(this.placementId, cachePolicy);
    }
    toJSON() {
        return this.placementId;
    }
}
