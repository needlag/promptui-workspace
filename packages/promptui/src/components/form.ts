import type { FormDefinition } from "../types/public";

export function form(config: Omit<FormDefinition, "type">): FormDefinition {
  return {
    ...config,
    type: "form"
  };
}
