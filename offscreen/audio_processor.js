/**
 * OmniDub - Audio Worklet Processor
 * Runs on Chrome's high-priority audio thread.
 * Emits raw PCM audio frames to offscreen document without ScriptProcessorNode deprecation.
 */
class OmniDubAudioWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isPaused = false;
    this.port.onmessage = (e) => {
      if (e.data && typeof e.data.paused === 'boolean') {
        this.isPaused = e.data.paused;
      }
    };
  }

  process(inputs, outputs, parameters) {
    if (this.isPaused) return true;

    const input = inputs[0];
    if (input && input.length > 0 && input[0]) {
      // Clone channel 0 Float32Array to post to main offscreen thread
      const channelData = input[0];
      const copy = new Float32Array(channelData.length);
      copy.set(channelData);
      this.port.postMessage(copy, [copy.buffer]);
    }
    return true;
  }
}

registerProcessor('omnidub-audio-processor', OmniDubAudioWorkletProcessor);

