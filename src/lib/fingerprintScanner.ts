// src/lib/fingerprintScanner.ts

export class FingerprintScanner {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  async connect(): Promise<boolean> {
    try {
      // Request access to serial port (MARC11 L1 / MFS110)
      const ports = await navigator.serial.getPorts();
      let selectedPort = ports[0];

      if (!selectedPort) {
        // Prompt user to select a port
        this.port = await navigator.serial.requestPort({
          filters: [
            { usbVendorId: 0x04d8, usbProductId: 0xf372 }, // MFS110
            { usbVendorId: 0x10c4, usbProductId: 0xea60 }  // MARC11 L1
          ]
        });
      } else {
        this.port = selectedPort;
      }

      // Open connection
      await this.port.open({ baudRate: 9600 });

      // Start reading responses
      this.reader = this.port.readable.getReader();

      return true;
    } catch (err) {
      console.error('Failed to connect to fingerprint scanner:', err);
      return false;
    }
  }

  async captureTemplate(): Promise<Uint8Array | null> {
    if (!this.port || !this.reader) {
      throw new Error("Scanner not connected");
    }

    try {
      // Send "capture" command (replace with actual MFS110/MARC11 protocol)
      const encoder = new TextEncoder();
      const command = encoder.encode("CAPTURE\n"); // Replace with real binary packet
      const writer = this.port.writable.getWriter();
      await writer.write(command);
      writer.releaseLock();

      // Read response
      const { value, done } = await this.reader.read();
      if (done) return null;

      return value;
    } catch (err) {
      console.error('Fingerprint capture failed:', err);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
  }
}