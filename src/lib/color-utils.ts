import { oklch, formatHex, converter } from "culori";

export type PaletteStep = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | "950";

export interface ColorPalette {
  [key: string]: string;
}

export interface PaletteResult {
  palette: ColorPalette;
  baseStep: PaletteStep;
}

/**
 * High-precision OKLCH Lightness targets for key Tailwind color families.
 * These values are derived from Tailwind CSS v3.4 defaults.
 */
const REFERENCE_CURVES: Record<string, { hue: number; lightness: Record<PaletteStep, number>; chroma: Record<PaletteStep, number> }> = {
  red: {
    hue: 29,
    lightness: { "50": 0.98, "100": 0.94, "200": 0.88, "300": 0.80, "400": 0.71, "500": 0.63, "600": 0.54, "700": 0.46, "800": 0.38, "900": 0.30, "950": 0.22 },
    chroma: { "50": 0.02, "100": 0.05, "200": 0.11, "300": 0.18, "400": 0.23, "500": 0.26, "600": 0.23, "700": 0.19, "800": 0.15, "900": 0.12, "950": 0.09 }
  },
  yellow: {
    hue: 95,
    lightness: { "50": 0.98, "100": 0.96, "200": 0.92, "300": 0.87, "400": 0.81, "500": 0.76, "600": 0.67, "700": 0.58, "800": 0.48, "900": 0.38, "950": 0.28 },
    chroma: { "50": 0.02, "100": 0.04, "200": 0.09, "300": 0.14, "400": 0.17, "500": 0.18, "600": 0.17, "700": 0.15, "800": 0.13, "900": 0.10, "950": 0.07 }
  },
  green: {
    hue: 145,
    lightness: { "50": 0.98, "100": 0.95, "200": 0.89, "300": 0.81, "400": 0.72, "500": 0.63, "600": 0.54, "700": 0.45, "800": 0.37, "900": 0.29, "950": 0.21 },
    chroma: { "50": 0.02, "100": 0.05, "200": 0.10, "300": 0.15, "400": 0.18, "500": 0.19, "600": 0.17, "700": 0.14, "800": 0.11, "900": 0.09, "950": 0.07 }
  },
  blue: {
    hue: 255,
    lightness: { "50": 0.98, "100": 0.94, "200": 0.87, "300": 0.78, "400": 0.68, "500": 0.59, "600": 0.50, "700": 0.42, "800": 0.34, "900": 0.27, "950": 0.19 },
    chroma: { "50": 0.02, "100": 0.05, "200": 0.11, "300": 0.17, "400": 0.20, "500": 0.21, "600": 0.19, "700": 0.16, "800": 0.13, "900": 0.10, "950": 0.07 }
  },
  indigo: {
    hue: 275,
    lightness: { "50": 0.98, "100": 0.93, "200": 0.86, "300": 0.76, "400": 0.66, "500": 0.55, "600": 0.46, "700": 0.38, "800": 0.31, "900": 0.24, "950": 0.17 },
    chroma: { "50": 0.02, "100": 0.05, "200": 0.12, "300": 0.19, "400": 0.22, "500": 0.23, "600": 0.21, "700": 0.18, "800": 0.14, "900": 0.11, "950": 0.08 }
  }
};

const STEPS: PaletteStep[] = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

/**
 * Interpolates a value between two reference curves based on hue.
 */
function interpolateCurveValue(hue: number, step: PaletteStep, property: 'lightness' | 'chroma'): number {
  const h = ((hue % 360) + 360) % 360;
  const families = Object.values(REFERENCE_CURVES);
  
  // Sort families by hue distance
  const sorted = [...families].sort((a, b) => {
    const distA = Math.min(Math.abs(a.hue - h), 360 - Math.abs(a.hue - h));
    const distB = Math.min(Math.abs(b.hue - h), 360 - Math.abs(b.hue - h));
    return distA - distB;
  });

  const f1 = sorted[0];
  const f2 = sorted[1];

  // Calculate interpolation factor t
  const d1 = Math.min(Math.abs(f1.hue - h), 360 - Math.abs(f1.hue - h));
  const d2 = Math.min(Math.abs(f2.hue - h), 360 - Math.abs(f2.hue - h));
  const t = d1 / (d1 + d2);

  const v1 = f1[property][step];
  const v2 = f2[property][step];

  return v1 + t * (v2 - v1);
}

export function generatePalette(baseColor: string): PaletteResult {
  const toOklch = converter("oklch");
  const color = toOklch(baseColor);
  
  if (!color) return { palette: {}, baseStep: "500" };

  const hue = color.h || 0;

  // Step 1: Find the best base step by comparing input L to interpolated curves
  let baseStep: PaletteStep = "500";
  let minDiff = Infinity;

  STEPS.forEach((step) => {
    const targetL = interpolateCurveValue(hue, step, 'lightness');
    const diff = Math.abs(color.l - targetL);
    if (diff < minDiff) {
      minDiff = diff;
      baseStep = step;
    }
  });

  const palette: Record<string, string> = {};
  
  // Step 2: Calculate the "Chroma Ratio" to preserve the user's input vibrancy
  // relative to the Tailwind standard for that hue.
  const standardChroma = interpolateCurveValue(hue, baseStep, 'chroma');
  const chromaRatio = standardChroma > 0 ? color.c / standardChroma : 1;

  // Step 3: Generate the shades
  STEPS.forEach((step) => {
    if (step === baseStep) {
      palette[step] = formatHex(color);
      return;
    }

    const targetL = interpolateCurveValue(hue, step, 'lightness');
    const targetC = interpolateCurveValue(hue, step, 'chroma') * chromaRatio;

    // Subtle hue shifting for more natural shadows (towards blue/indigo)
    let targetH = hue;
    if (parseInt(step) > 500) {
      const shiftFactor = (parseInt(step) - 500) / 450;
      const dist = ((270 - hue + 540) % 360) - 180;
      targetH = hue + dist * 0.1 * shiftFactor;
    }

    palette[step] = formatHex({
      mode: "oklch",
      l: targetL,
      c: targetC,
      h: targetH
    });
  });

  return { palette, baseStep };
}

export function getTailwindConfig(palette: ColorPalette, name: string = "brand"): string {
  const lines = Object.entries(palette)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([step, hex]) => `          ${step}: '${hex}',`)
    .join("\n");

  return `module.exports = {
  theme: {
    extend: {
      colors: {
        ${name}: {
${lines}
        }
      }
    }
  }
}`;
}

export function getCssVariables(palette: ColorPalette, name: string = "brand"): string {
  return Object.entries(palette)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([step, hex]) => `--color-${name}-${step}: ${hex};`)
    .join("\n");
}
