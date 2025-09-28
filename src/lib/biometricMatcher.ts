// src/lib/biometricMatcher.ts

// Face Matching (Browser-compatible)
export class FaceMatcher {
  private static instance: FaceMatcher;
  private embeddings: Map<string, Float32Array> = new Map();

  private constructor() {}

  public static getInstance(): FaceMatcher {
    if (!FaceMatcher.instance) {
      FaceMatcher.instance = new FaceMatcher();
    }
    return FaceMatcher.instance;
  }

  public storeFace(workerId: string, embedding: Float32Array): void {
    this.embeddings.set(workerId, embedding);
  }

  public matchFace(liveEmbedding: Float32Array, threshold: number = 0.6): string | null {
    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const [workerId, storedEmbedding] of this.embeddings.entries()) {
      const score = this.histogramCorrelation(liveEmbedding, storedEmbedding);
      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = workerId;
      }
    }

    return bestMatch;
  }

  private histogramCorrelation(hist1: Float32Array, hist2: Float32Array): number {
    if (hist1.length !== hist2.length) return 0;
    
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;
    const n = hist1.length;

    for (let i = 0; i < n; i++) {
      sum1 += hist1[i];
      sum2 += hist2[i];
      sum1Sq += hist1[i] * hist1[i];
      sum2Sq += hist2[i] * hist2[i];
      pSum += hist1[i] * hist2[i];
    }

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    return den === 0 ? 0 : num / den;
  }

  public clear(): void {
    this.embeddings.clear();
  }
}

// Fingerprint Matching (Placeholder)
export class FingerprintMatcher {
  private static instance: FingerprintMatcher;
  private templates: Map<string, Uint8Array> = new Map();

  private constructor() {}

  public static getInstance(): FingerprintMatcher {
    if (!FingerprintMatcher.instance) {
      FingerprintMatcher.instance = new FingerprintMatcher();
    }
    return FingerprintMatcher.instance;
  }

  public storeFingerprint(workerId: string, template: Uint8Array): void {
    this.templates.set(workerId, template);
  }

  public matchFingerprint(liveTemplate: Uint8Array, threshold: number = 0.7): string | null {
    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const [workerId, storedTemplate] of this.templates.entries()) {
      const score = this.minutiaeMatch(liveTemplate, storedTemplate);
      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = workerId;
      }
    }

    return bestMatch;
  }

  private minutiaeMatch(template1: Uint8Array, template2: Uint8Array): number {
    if (template1.length !== template2.length) return 0;
    let matches = 0;
    for (let i = 0; i < template1.length; i++) {
      if (template1[i] === template2[i]) matches++;
    }
    return matches / template1.length;
  }

  public clear(): void {
    this.templates.clear();
  }
}

export class BiometricManager {
  private faceMatcher = FaceMatcher.getInstance();
  private fingerprintMatcher = FingerprintMatcher.getInstance();

  public storeWorkerBiometrics(
    workerId: string,
    faceEmbedding?: Float32Array,
    fingerprintTemplate?: Uint8Array
  ): void {
    if (faceEmbedding) {
      this.faceMatcher.storeFace(workerId, faceEmbedding);
    }
    if (fingerprintTemplate) {
      this.fingerprintMatcher.storeFingerprint(workerId, fingerprintTemplate);
    }
  }

  public authenticateByFace(embedding: Float32Array, threshold: number = 0.6): string | null {
    return this.faceMatcher.matchFace(embedding, threshold);
  }

  public authenticateByFingerprint(template: Uint8Array, threshold: number = 0.7): string | null {
    return this.fingerprintMatcher.matchFingerprint(template, threshold);
  }

  public clearAll(): void {
    this.faceMatcher.clear();
    this.fingerprintMatcher.clear();
  }
}

export const biometricManager = new BiometricManager();