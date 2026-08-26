export const FILS_PER_JOD = 1000;

export function filsToJod(fils: number): number {
  return fils / FILS_PER_JOD;
}

export function jodToFils(jod: number): number {
  return Math.round(jod * FILS_PER_JOD);
}

export function formatJod(fils: number): string {
  return filsToJod(fils).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}
