class SilenceDetectorProcessor extends AudioWorkletProcessor {
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean {
        const input = inputs[0];
        const isSilent = !input.some(channel => channel.some(sample => Math.abs(sample) > 0.10)); // 임계값 조정 가능

        if (isSilent) {
            this.port.postMessage('silent');
        }

        return true; // 계속 처리
    }
}

registerProcessor('silence-detector-processor', SilenceDetectorProcessor);
