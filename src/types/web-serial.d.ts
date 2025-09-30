// src/types/web-serial.d.ts

interface SerialPort {
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<Uint8Array>;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  getInfo(): SerialPortInfo;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
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

declare var SerialPort: {
  prototype: SerialPort;
  new(): SerialPort;
};