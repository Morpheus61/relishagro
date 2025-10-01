interface SerialPort {
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<WritableStreamChunkType>;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  getInfo(): SerialPortInfo;
}

interface SerialOptions {
  baudRate: number;
}

interface SerialPortInfo {
  usbVendorId: number | null;
  usbProductId: number | null;
}

interface Navigator {
  readonly serial: {
    getPorts(): Promise<SerialPort[]>;
    requestPort(options: { filters: Array<{ usbVendorId: number; usbProductId: number }> }): Promise<SerialPort>;
  };
}