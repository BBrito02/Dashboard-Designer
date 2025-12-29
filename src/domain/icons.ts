import type { VisualVariable, GraphType } from '../domain/types';

// Get the base URL configured in vite.config.ts (e.g., "/Dashboard-Designer/")
const BASE = import.meta.env.BASE_URL;

export const VISUAL_VAR_ICONS: Record<VisualVariable, string> = {
  Color: `${BASE}icons/visvar_color.png`,
  Shape: `${BASE}icons/visvar_shape.png`,
  Size: `${BASE}icons/visvar_size.png`,
  Text: `${BASE}icons/visvar_text.png`,
};

export const GRAPH_TYPE_ICONS: Record<GraphType, string> = {
  Dispersion: `${BASE}icons/graphtype_dispersion.png`,
  Line: `${BASE}icons/graphtype_line.png`,
  MultipleLines: `${BASE}icons/graphtype_multiplelines.png`,
  Area: `${BASE}icons/graphtype_area.png`,
  Bars: `${BASE}icons/graphtype_bars.png`,
  PilledBars: `${BASE}icons/graphtype_piledbars.png`,
  Pilled100: `${BASE}icons/graphtype_piled100.png`,
  Gantt: `${BASE}icons/graphtype_gantt.png`,
  Dots: `${BASE}icons/graphtype_dots.png`,
  Map: `${BASE}icons/graphtype_map.png`,
  ColorMap: `${BASE}icons/graphtype_colormap.png`,
  Hexabin: `${BASE}icons/graphtype_hexabin.png`,
  Table: `${BASE}icons/graphtype_table.png`,
  HeatMap: `${BASE}icons/graphtype_heatmap.png`,
  Clock: `${BASE}icons/graphtype_clock.png`,
};

export const activationIcons = {
  hover: `${BASE}icons/hover.png`,
  click: `${BASE}icons/click.png`,
} as const;

export type ActivationKey = keyof typeof activationIcons;
