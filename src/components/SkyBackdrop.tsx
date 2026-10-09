import type { CSSProperties } from 'react'

// Only the sky above the roofline is visible. Slice fills every viewport without stretching.
export function SkyBackdrop({ style }: { style?: CSSProperties }) {
  return <svg viewBox="0 0 1672 245" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden', background: '#273d54', ...style }}><image href="/hotel-opening-v2.png" width="1672" height="940" /></svg>
}
