export type LogoMetrics = { width: number; height: number; inkCoverage: number };

/** Fit the trimmed artwork to the layout, preserving proportions and room for Large. */
export function logoDisplaySize(metrics: LogoMetrics | undefined, maxWidth: number, maxHeight: number, scale = 1, largeMaxWidth = maxWidth * 1.25) {
  const ratio = metrics && metrics.width > 0 && metrics.height > 0 ? metrics.width / metrics.height : maxWidth / maxHeight;
  // Small/Normal stay at 70%/90%; Large grows to 125%, subject to panel width.
  // Ink density must not make a sparse wordmark smaller than a solid crest.
  const size = Math.max(0.1, Math.min(1.25, scale <= 1 ? 0.9 + (scale - 1) * 0.8 : 0.9 + (scale - 1) * 1.4));
  const width = Math.min(Math.min(maxWidth, maxHeight * ratio) * size, largeMaxWidth);
  const height = width / ratio;
  return { width, height };
}
