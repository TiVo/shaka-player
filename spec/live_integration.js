/**
 * Copyright 2015 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @fileoverview Live integration tests.
 */

goog.require('shaka.dash.MpdRequest');
goog.require('shaka.media.Stream');
goog.require('shaka.player.Player');
goog.require('shaka.polyfill.installAll');
goog.require('shaka.util.EventManager');

describe('Player', function() {
  var originalTimeout;
  var video;
  var videoSource;
  var player;
  var eventManager;

  const liveManifestUrl =
      'http://vm2.dashif.org/livesim/testpic_6s/Manifest.mpd';

  beforeAll(function() {
    // Hijack assertions and convert failed assertions into failed tests.
    assertsToFailures.install();

    // Change the timeout.
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;  // ms

    // Install polyfills.
    shaka.polyfill.installAll();

    // Create a video tag.  This will be visible so that long tests do not
    // create the illusion of the test-runner being hung.
    video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.width = 600;
    video.height = 400;
    // Add it to the DOM.
    document.body.appendChild(video);
  });

  beforeEach(function() {
    // Create a new player.
    player = new shaka.player.Player(video);
    player.addEventListener('error', convertErrorToTestFailure, false);

    // Disable automatic adaptation unless it is needed for a test.
    // This makes test results more reproducible.
    player.enableAdaptation(false);

    eventManager = new shaka.util.EventManager();
  });

  afterEach(function(done) {
    eventManager.destroy();
    eventManager = null;

    player.destroy().then(function() {
      player = null;
      done();
    });
  });

  afterAll(function() {
    // Remove the video tag from the DOM.
    document.body.removeChild(video);

    // Restore the timeout.
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;

    // Restore normal assertion behavior.
    assertsToFailures.uninstall();
  });

  describe('live support for segment duration template', function() {
    beforeEach(function() {
      videoSource = newSource(liveManifestUrl);
    });

    it('requests MPD update in expected time', function(done) {
      // Reduce amount of time between MPD updates to prevent long running test.
      spyOn(videoSource, 'setUpdateTimer_').and.callFake(function() {
        videoSource.updateTimer_ =
            window.setTimeout(videoSource.onUpdate_.bind(videoSource), 1000);
      });
      // TODO: Update test to use a Timeline based stream.
      player.load(videoSource).then(function() {
        video.play();
        return waitForMpdRequest(liveManifestUrl);
      }).then(function() {
        expect(video.currentTime).toBeGreaterThan(0.0);
        done();
      }).catch(function(error) {
        fail(error);
        done();
      });
    });

    it('returns to seek range when seeking before start of range',
        function(done) {
          player.load(videoSource).then(function() {
            video.play();
            return waitForMovement(video, eventManager);
          }).then(function() {
            video.currentTime = videoSource.seekStartTime_ - 10000;
            return waitForMovement(video, eventManager);
          }).then(function() {
            expect(videoSource.video.currentTime).toBeGreaterThan(
                videoSource.seekStartTime_);
            done();
          }).catch(function(error) {
            fail(error);
            done();
          });
        });
  });

  /**
   * @param {string} targetMpdUrl The url that should be used in the MpdRequest.
   * {!Promise} resolved when an MpdRequest has been sent.
   */
  function waitForMpdRequest(targetMpdUrl) {
    var requestStatus = new shaka.util.PublicPromise();
    var MpdRequest = shaka.dash.MpdRequest;

    spyOn(window.shaka.dash, 'MpdRequest').and.callFake(function(mpdUrl) {
      expect(mpdUrl).toEqual(targetMpdUrl);
      var request = new MpdRequest(mpdUrl);
      spyOn(request, 'send').and.callFake(function() {
        requestStatus.resolve();
        return Promise.reject();
      });
      return request;
    });

    return requestStatus;
  }
});
