'use strict';
import React, {
  NativeModules,
  NativeEventEmitter,
  Platform,
} from 'react-native';

const { Voice } = NativeModules;
const voiceEmitter = new NativeEventEmitter(Voice);

class RCTVoice {
  constructor() {
    this._loaded = false;
    this._listeners = null;
    this._events = {
      'onSpeechStart': this._onSpeechStart.bind(this),
      'onSpeechRecognized': this._onSpeechRecognized.bind(this),
      'onSpeechEnd': this._onSpeechEnd.bind(this),
      'onSpeechError': this._onSpeechError.bind(this),
      'onSpeechResults': this._onSpeechResults.bind(this),
      'onSpeechPartialResults': this._onSpeechPartialResults.bind(this),
      'onSpeechVolumeChanged': this._onSpeechVolumeChanged.bind(this),
      'onSpeechVolumeLevel' : this._onSpeechVolumeLevel.bind(this),
    };
    voiceEmitter.addListener("onSpeechStart",this._onSpeechStart.bind(this));
  }
  removeAllListeners() {
    // Voice.onSpeechStart = null;
    Voice.onSpeechRecognized = null;
    Voice.onSpeechEnd = null;
    Voice.onSpeechError = null;
    Voice.onSpeechResults = null;
    Voice.onSpeechPartialResults = null;
    Voice.onSpeechVolumeChanged = null;
  }
  destroy() {
    if (Platform.OS === 'android' && !this._loaded && !this._listeners) {
      return;
    }
    return new Promise((resolve, reject) => {
      Voice.destroySpeech((error) => {
        if (error) {
          reject(new Error(error));
        } else {
          if (this._listeners) {
            this._listeners.map((listener, index) => listener.remove());
            this._listeners = null;
          }
          resolve();
        }
      });
    });
  }
  start(locale, options = {}) {
    if (!this._loaded && !this._listeners) {
      this._listeners = Object.keys(this._events)
        .map((key, index) => voiceEmitter.addListener(key, this._events[key]));
    }

    return new Promise((resolve, reject) => {
      const callback = (error) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve();
        }
      };
      if (Platform.OS === 'android') {
        Voice.startSpeech(locale, Object.assign({
          EXTRA_LANGUAGE_MODEL: "LANGUAGE_MODEL_FREE_FORM",
          EXTRA_MAX_RESULTS: 5,
          EXTRA_PARTIAL_RESULTS: true,
          REQUEST_PERMISSIONS_AUTO: true,
        }, options), callback);
      } else {
        Voice.startSpeech(locale, callback);
      }
    });
  }
  stop() {
    if (!this._loaded && !this._listeners) {
      return;
    }
    return new Promise((resolve, reject) => {
      Voice.stopSpeech((error) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve();
        }
      });
    });
  }
  cancel() {
    if (!this._loaded && !this._listeners) {
      return;
    }
    return new Promise((resolve, reject) => {
      Voice.cancelSpeech((error) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve();
        }
      });
    });
  }
  isAvailable() {
    return new Promise((resolve, reject) => {
      Voice.isSpeechAvailable((isAvailable, error) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(isAvailable);
        }
      });
    });
  }
  isRecognizing() {
    return new Promise((resolve, reject) => {
      Voice.isRecognizing(isRecognizing => resolve(isRecognizing));
    });
  }
  _onSpeechStart(e) {
    if (this.onSpeechStart) {
      this.onSpeechStart(e);
    }
  }
  _onSpeechVolumeLevel(e) {
    if (this.onSpeechVolumeLevel){
      this.onSpeechVolumeLevel(e);
    }
  }
  _onSpeechRecognized(e) {
    if (this.onSpeechRecognized) {
      this.onSpeechRecognized(e);
    }
  }
  _onSpeechEnd(e) {
    if (this.onSpeechEnd) {
      this.onSpeechEnd(e);
    }
  }
  _onSpeechError(e) {
    if (this.onSpeechError) {
      this.onSpeechError(e);
    }
  }
  _onSpeechResults(e) {
    if (this.onSpeechResults) {
      this.onSpeechResults(e);
    }
  }
  _onSpeechPartialResults(e) {
    if (this.onSpeechPartialResults) {
      this.onSpeechPartialResults(e);
    }
  }
  _onSpeechVolumeChanged(e) {
    if (this.onSpeechVolumeChanged) {
      this.onSpeechVolumeChanged(e);
    }
  }
}

export default new RCTVoice();
