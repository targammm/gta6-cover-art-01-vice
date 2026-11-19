// Vice Cover Maker — central tuning: sizes, layouts, grades, palette.
// Every number the renderer and the editor agree on lives here.
const VICE_SIZES = {
  square: { label: "Square 1080 x 1080", w: 1080, h: 1080 },
  portrait: { label: "Portrait 1080 x 1350", w: 1080, h: 1350 },
  wide: { label: "Wide 1920 x 1080", w: 1920, h: 1080 },
};

const VICE_LAYOUTS = {
  trio: { label: "Trio", panels: 3 },
  duo: { label: "Duo", panels: 2 },
  strip: { label: "Strip", panels: 3 },
};

const VICE_GRADES = {
  sunset: {
    label: "Sunset",
    filter: "saturate(1.45) contrast(1.08) sepia(0.30) hue-rotate(-8deg)",
    sky: ["rgba(255,94,58,0.34)", "rgba(255,46,136,0.22)", "rgba(255,179,71,0.10)"],
    sun: "rgba(255,196,92,0.85)",
  },
  neon: {
    label: "Neon",
    filter: "saturate(1.75) contrast(1.15) hue-rotate(14deg)",
    sky: ["rgba(255,46,136,0.30)", "rgba(64,224,255,0.20)", "rgba(128,0,255,0.14)"],
    sun: "rgba(255,46,200,0.80)",
  },
  noir: {
    label: "Noir",
    filter: "grayscale(1) contrast(1.22) brightness(0.96)",
    sky: ["rgba(0,0,0,0.30)", "rgba(0,0,0,0.10)", "rgba(255,255,255,0.05)"],
    sun: "rgba(240,240,240,0.55)",
  },
  palm: {
    label: "Palm",
    filter: "saturate(1.25) sepia(0.35) hue-rotate(-16deg) contrast(1.05)",
    sky: ["rgba(0,190,170,0.22)", "rgba(255,150,60,0.22)", "rgba(255,220,120,0.08)"],
    sun: "rgba(255,214,120,0.85)",
  },
};

const VICE_PALETTE = {
  bg: "#0b0b12",
  panel: "#14141f",
  ink: "#f5f1e8",
  muted: "#9a93a8",
  orange: "#ff5e3a",
  amber: "#ffb347",
  pink: "#ff2e88",
  cyan: "#40e0ff",
  gutter: "#0b0b12",
};

const VICE_SAMPLES = [
  { id: "pier", label: "Pier sunset", src: "samples/pier.jpg" },
  { id: "boulevard", label: "Boulevard", src: "samples/boulevard.jpg" },
];

const VICE_DEFAULT_CAPTION = "SUNSET HEIST";
const VICE_DEFAULT_SUB = "ONE LAST SCORE";
const VICE_DEFAULT_PLACE = "VICE CITY";
