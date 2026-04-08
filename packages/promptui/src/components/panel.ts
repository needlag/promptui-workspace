import type { PanelDefinition } from "../types/public";

export function panel(config: Omit<PanelDefinition, "type">): PanelDefinition {
  return {
    ...config,
    type: "panel",
    surface: config.surface ?? "panel"
  };
}

export function dialog(config: Omit<PanelDefinition, "type" | "surface">): PanelDefinition {
  return panel({
    ...config,
    surface: "dialog"
  });
}
