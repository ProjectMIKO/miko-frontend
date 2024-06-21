class SilenceDetectorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._lastActiveTime = currentTime;
    this._isSilent = true;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const channelData = input[0];
    let isSilent = true;

    if (channelData) {
      // 샘플의 RMS(root mean square)를 계산하여 소리 크기를 평가
      let sumSquares = 0;
      for (let i = 0; i < channelData.length; i++) {
        sumSquares += channelData[i] * channelData[i];
      }
      const rms = Math.sqrt(sumSquares / channelData.length);

      // 소리 크기가 임계값을 초과하면 소리 발생으로 간주
      if (rms > 0.1) { // RMS 임계값 조정 가능
        isSilent = false;
        this._lastActiveTime = currentTime;
      }
    }

    if (currentTime - this._lastActiveTime > 3) { // 2초 침묵 감지
      if (!this._isSilent) {
        this._isSilent = true;
        this.port.postMessage({ isSilent: true });
      }
    } else {
      if (this._isSilent) {
        this._isSilent = false;
        this.port.postMessage({ isSilent: false });
      }
    }

    return true;
  }
}

registerProcessor('silence-detector-processor', SilenceDetectorProcessor);
