/**
 * Hand-authored organic section boundary — the one recurring motif used
 * between homepage sections instead of a hard rule or flat spacer. `flip`
 * mirrors the curve vertically so consecutive dividers don't repeat
 * identically down the page; `tone` sets the fill to match the section
 * background it's sitting on top of.
 */
const TONE_FILL: Record<"ivory" | "sandstone" | "navy", string> = {
  ivory: "var(--color-ivory)",
  sandstone: "var(--color-sandstone-100)",
  navy: "var(--color-navy-950)",
};

export function SectionDivider({
  tone = "ivory",
  flip = false,
}: {
  tone?: "ivory" | "sandstone" | "navy";
  flip?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={flip ? "rotate-180" : undefined}
      style={{ lineHeight: 0 }}
    >
      <svg viewBox="0 0 1440 64" width="100%" height="40" preserveAspectRatio="none">
        <path
          d="M0,32 C240,64 480,0 720,20 C960,40 1200,4 1440,32 L1440,64 L0,64 Z"
          fill={TONE_FILL[tone]}
        />
      </svg>
    </div>
  );
}
