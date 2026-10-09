# MHOMES loader

Run `python scripts/split-loader-logo.py` from the repository root (Pillow + numpy).
The source is 1536 x 1024. All four outputs keep that canvas and the original RGBA pixels.
The alpha analysis identifies touching emblem sections; explicit polygon boundaries split them.
Text and stray pixels outside the emblem box (542,142)-(1000,424) are excluded.
`public/loader/verification.json` records the comparison: 0 differing emblem pixels and 0 maximum channel difference; 52,513 full-source pixels differ because lettering/outside noise is intentionally omitted. Fully transparent hidden RGB is ignored.

The current root-layout loader uses the complete original `public/MHOMES-logo.png`, including lettering. The previous split PNGs are retained as unused assets. Four layered copies are clipped into aligned horizontal quarters; there is no raster editing or recoloring. The visual frame excludes the source canvas padding.

`src/components/Loader.module.css` follows the supplied l24 rhythm: .75s, infinite alternate, stops at 0/10/25/50/75/90/100%. Bands translate down one quarter sequentially, opening a moving gap, then reverse back to one seamless logo. Edit animation-duration to change speed. Reduced motion uses the complete static PNG.

`src/components/Loader.tsx` waits for initial document load and visible image decoding. There is no minimum display time. On completion, the slices crossfade to the static logo and the white overlay exits in 180ms (100ms reduced motion). Navbar logos remain unchanged. Normal client navigation does not replay the loader; refresh/full document loads do. Availability and coupon requests explicitly use `useRequestLoader` until their requests settle, including failures.
