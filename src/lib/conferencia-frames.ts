export const CONFERENCIA_FRAME_COUNT = 48;

export function buildFrameUrls(count = CONFERENCIA_FRAME_COUNT): string[] {
  return Array.from(
    { length: count },
    (_, i) => `https://picsum.photos/seed/conferencia-mujeres-${i}/1920/1080`
  );
}
