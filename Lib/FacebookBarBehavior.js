import { Animated,} from 'react-native';

export default class FacebookBarBehavior {
  constructor(config) {
    this.currentlySnapping = false
    this.snappingEnabled = true
    this.progress = 0.0
    this.previousYOffset = 0.0
    this.previousProgress = 0.0

    this.thresholdFromTop = 0.0
    this.thresholdNegativeDirection = 0.0
    this.thresholdPositiveDirection = 0.0

    this.elasticMaximumHeightAtTop = false

    this.progress = 0.0
    this.maximumBarHeight = 105.0
    this.minimumBarHeight = 20.0
    this.animation = null
    this.snappingPositions = null
    this.onProgress = null

    this._isCurrentlySnapping = () => this.currentlySnapping
    this._isSnappingEnabled = () => this.snappingEnabled

    if (config) {
      const {
        animation,
        snappingEnabled,
        thresholdNegativeDirection,
        snappingPositions,
        onProgress
      } = config
      if (thresholdNegativeDirection) this._setThresholdNegativeDirection(thresholdNegativeDirection)
      if (snappingPositions) this.snappingPositions = snappingPositions
      if (animation) this.animation = animation
      if (onProgress) this.onProgress = onProgress
    }
  }

  _setThresholdFromTop(thresholdFromTop) {
    this.thresholdFromTop = Math.max(thresholdFromTop, 0.0);
  }

  _setThresholdNegativeDirection(thresholdNegativeDirection) {
    this.thresholdNegativeDirection = Math.max(thresholdNegativeDirection, 0.0);
  }

  _setThresholdPositiveDirection(thresholdPositiveDirection) {
    this.thresholdPositiveDirection = Math.max(thresholdPositiveDirection, 0.0);
  }

  _applyFromTopProgressTrackingThreshold() {
    this.previousYOffset += this.thresholdFromTop;
  }

  _applyNegativeDirectionProgressTrackingThreshold() {
    if (this.progress == 1.0) {
      this.previousYOffset -= this.thresholdNegativeDirection;
    }
  }

  _applyPositiveDirectionProgressTrackingThreshold() {
    if (this.progress == 0.0) {
      this.previousYOffset += this.thresholdPositiveDirection;
    }
  }

  _setProgress(progress) {
    this.progress = Math.min(progress, 1.0);
    if (!this.elasticMaximumHeightAtTop) {
      this.progress = Math.max(this.progress, 0.0);
    }
    this.onProgress && this.onProgress(this.progress)
  }

  scrollViewWillBeginDragging(scrollView) {
    const scrollViewViewportHeight = scrollView.layoutMeasurement.height


    if ((scrollView.contentOffset.y + scrollView.contentInset.top) >= 0.0 && scrollView.contentOffset.y <= (scrollView.contentSize.height - scrollViewViewportHeight)) {
      this.previousYOffset = scrollView.contentOffset.y;
      this.previousProgress = this.progress;

      // Apply top threshold
      if ((scrollView.contentOffset.y + scrollView.contentInset.top) == 0.0) {
        this._applyFromTopProgressTrackingThreshold()
      } else {
        // Edge case (not true) - user is scrolling to the top but there isn't enough runway left to pass the threshold
        if ((scrollView.contentOffset.y + scrollView.contentInset.top) > (this.thresholdNegativeDirection + (this.maximumBarHeight - this.minimumBarHeight))) {
          this._applyNegativeDirectionProgressTrackingThreshold()
        }

        // Edge case (not true) - user is scrolling to the bottom but there isn't enough runway left to pass the threshold
        if (scrollView.contentOffset.y < (scrollView.contentSize.height - scrollViewViewportHeight - this.thresholdPositiveDirection)) {
          this._applyPositiveDirectionProgressTrackingThreshold()
        }
      }
    }
    // Edge case - user starts to scroll while the scroll view is stretched above the top
    else if ((scrollView.contentOffset.y + scrollView.contentInset.top) < 0.0) {
      this.previousYOffset = -scrollView.contentInset.top;
      this.previousProgress = 0.0;

      if (this.thresholdFromTop != 0.0) {
        this._applyFromTopProgressTrackingThreshold()
      } else {
        this._applyNegativeDirectionProgressTrackingThreshold()
        this._applyPositiveDirectionProgressTrackingThreshold()
      }
    }
    // Edge case - user starts to scroll while the scroll view is stretched below the bottom
    else if (scrollView.contentOffset.y > (scrollView.contentSize.height - scrollViewViewportHeight)) {
      if (scrollView.contentSize.height > scrollViewViewportHeight) {
        this.previousYOffset = scrollView.contentSize.height - scrollViewViewportHeight;
        this.previousProgress = 1.0;

        this._applyNegativeDirectionProgressTrackingThreshold()
        this._applyPositiveDirectionProgressTrackingThreshold()
      }
    }
  }

  scrollViewDidScroll(scrollView) {
    if (!this._isCurrentlySnapping()) {
      let deltaYOffset = scrollView.contentOffset.y - this.previousYOffset
      let deltaProgress = deltaYOffset / (this.maximumBarHeight - this.minimumBarHeight)

      this._setProgress(this.previousProgress + deltaProgress)
    }
  }

  _snapToProgress(progress) {
    const deltaProgress = progress - this.progress
    const deltaYOffset = (this.maximumBarHeight - this.minimumBarHeight) * deltaProgress
      //scrollView.contentOffset = CGPointMake(scrollView.contentOffset.x, scrollView.contentOffset.y+deltaYOffset);
    this._setProgress(progress)
    this.currentlySnapping = false
  }

  snapWithScrollView(scrollView) {

    if (!this._isCurrentlySnapping() && this._isSnappingEnabled() && this.progress >= 0.0) {
      this.currentlySnapping = true;
      console.log('we need to snap!', this.progress, this.snappingPositions);
      let snapPosition = Number.MAX_VALUE;

      const foundPosition = this.snappingPositions.find(snap => this.progress >= snap.start && this.progress < snap.end)
      if (foundPosition) snapPosition = foundPosition.progress

      if (snapPosition != Number.MAX_VALUE) {
        if (this.animation) {
          Animated.timing(this.animation, {
            toValue: snapPosition,
            duration: 250,
          }).start(() => {
            this._snapToProgress(snapPosition)
          })
        } else {
          this.currentlySnapping = false
        }
      } else {
        this.currentlySnapping = false;
      }
    }
  }
}
