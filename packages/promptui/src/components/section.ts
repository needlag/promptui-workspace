import type { SectionDefinition } from "../types/public";

export function section(config: Omit<SectionDefinition, "type">): SectionDefinition {
  return {
    ...config,
    type: "section"
  };
}
