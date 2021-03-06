#import "EXInterstitialAdManager.h"
#import "EXUnversioned.h"

#import <FBAudienceNetwork/FBAudienceNetwork.h>
#import <React/RCTUtils.h>
#import <React/RCTLog.h>

@interface EXInterstitialAdManager () <FBInterstitialAdDelegate>

@property (nonatomic, strong) RCTPromiseResolveBlock resolve;
@property (nonatomic, strong) RCTPromiseRejectBlock reject;
@property (nonatomic, strong) FBInterstitialAd *interstitialAd;
@property (nonatomic, strong) UIViewController *adViewController;
@property (nonatomic) bool didClick;
@property (nonatomic) bool didLoad;
@property (nonatomic) bool showWhenLoaded;
@property (nonatomic) bool isBackground;

@end

@implementation EXInterstitialAdManager

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE(CTKInterstitialAdManager)

- (void)setBridge:(RCTBridge *)bridge
{
  _bridge = bridge;
  
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(bridgeDidForeground:)
                                               name:EX_UNVERSIONED(@"EXKernelBridgeDidForegroundNotification")
                                             object:self.bridge];
  
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(bridgeDidBackground:)
                                               name:EX_UNVERSIONED(@"EXKernelBridgeDidBackgroundNotification")
                                             object:self.bridge];
}

RCT_EXPORT_METHOD(
  showAd:(NSString *)placementId
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)
{
  RCTAssert(_resolve == nil && _reject == nil, @"Only one `showAd` can be called at once");
  RCTAssert(_isBackground == false, @"`showAd` can be called only when experience is running in foreground");
//  if (![EXFacebook facebookAppIdFromNSBundle]) {
//    RCTLogWarn(@"No Facebook app id is specified. Facebook ads may have undefined behavior.");
//  }
  
  _resolve = resolve;
  _reject = reject;
  
  _interstitialAd = [[FBInterstitialAd alloc] initWithPlacementID:placementId];
  _interstitialAd.delegate = self;
    _showWhenLoaded = true;
//  [EXUtil performSynchronouslyOnMainThread:^{
    [self->_interstitialAd loadAd];
//  }];
}


RCT_EXPORT_METHOD(
  preloadAd:(NSString *)placementId
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)
{
  RCTAssert(_resolve == nil && _reject == nil, @"Only one `preloadAd` can be called at once");
  RCTAssert(_isBackground == false, @"`preloadAd` can be called only when experience is running in foreground");
  
  _resolve = resolve;
  _reject = reject;
  
  _interstitialAd = [[FBInterstitialAd alloc] initWithPlacementID:placementId];
  _interstitialAd.delegate = self;
  _showWhenLoaded = false;
  [self->_interstitialAd loadAd];
}

RCT_EXPORT_METHOD(
  showPreloadedAd:(NSString *)placementId
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
  ) {
  // If already loaded, show it
  if(_didLoad) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [_interstitialAd showAdFromRootViewController:RCTPresentedViewController()];
    });
  } else {
    // If not make sure its shown asap
    _showWhenLoaded = true;
  }
  resolve(nil);
}

#pragma mark - FBInterstitialAdDelegate

- (void)interstitialAdDidLoad:(__unused FBInterstitialAd *)interstitialAd
{
     _didLoad = true;
    if (_showWhenLoaded) {
        [_interstitialAd showAdFromRootViewController:RCTPresentedViewController()];
    }
 
}

- (void)interstitialAd:(FBInterstitialAd *)interstitialAd didFailWithError:(NSError *)error
{
  _reject(@"E_FAILED_TO_LOAD", [error localizedDescription], error);
  
  [self cleanUpAd];
}

- (void)interstitialAdDidClick:(FBInterstitialAd *)interstitialAd
{
  _didClick = true;
}

- (void)interstitialAdDidClose:(FBInterstitialAd *)interstitialAd
{
  _resolve(@(_didClick));
  
  [self cleanUpAd];
}

- (void)bridgeDidForeground:(NSNotification *)notification
{
  _isBackground = false;
  
  if (_adViewController) {
    [RCTPresentedViewController() presentViewController:_adViewController animated:NO completion:nil];
    _adViewController = nil;
  }
}

- (void)bridgeDidBackground:(NSNotification *)notification
{
  _isBackground = true;
  
  if (_interstitialAd) {
    _adViewController = RCTPresentedViewController();
    [_adViewController dismissViewControllerAnimated:NO completion:nil];
  }
}

- (void)cleanUpAd
{
  _reject = nil;
  _resolve = nil;
  _interstitialAd = nil;
  _adViewController = nil;
  _didClick = false;
  _didLoad = false;
  _showWhenLoaded = false;
}

@end
