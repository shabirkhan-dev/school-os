/**
 * Minimal ambient types for the native BarcodeDetector API and the Web NFC API.
 * These are not yet in TypeScript's standard DOM lib, so we declare just enough
 * surface area for the attendance scanner hooks.
 */

export type DetectedBarcode = {
	rawValue: string;
	format: string;
};

export type BarcodeDetectorOptions = {
	formats?: string[];
};

export interface BarcodeDetectorLike {
	detect(source: CanvasImageSource | ImageBitmap | Blob): Promise<DetectedBarcode[]>;
}

declare global {
	interface Window {
		BarcodeDetector?: {
			new (options?: BarcodeDetectorOptions): BarcodeDetectorLike;
			getSupportedFormats?: () => Promise<string[]>;
		};
	}

	/** Web NFC (Chrome on Android). */
	class NDEFReader {
		constructor();
		scan(options?: { signal?: AbortSignal }): Promise<void>;
		addEventListener(type: "reading", listener: (event: NDEFReadingEvent) => void): void;
		removeEventListener(type: "reading", listener: (event: NDEFReadingEvent) => void): void;
	}

	interface NDEFReadingEvent extends Event {
		serialNumber: string;
		message?: {
			records: Array<{
				recordType: string;
				data: ArrayBuffer | string;
				toText?: () => string;
			}>;
		};
	}
}
