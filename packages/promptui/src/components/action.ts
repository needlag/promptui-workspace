import type { ActionDefinition } from "../types/public";

export function defineAction(config: ActionDefinition): ActionDefinition {
  return {
    ...config,
    kind: config.kind ?? "button"
  };
}

export const action = Object.assign(defineAction, {
  button: (config: ActionDefinition): ActionDefinition => defineAction({ ...config, kind: "button" }),
  submit: (config: ActionDefinition): ActionDefinition => defineAction({ ...config, kind: "submit" }),
  secondary: (config: ActionDefinition): ActionDefinition =>
    defineAction({ ...config, kind: "secondary" }),
  destructive: (config: ActionDefinition): ActionDefinition =>
    defineAction({ ...config, kind: "destructive" }),
  approve: (config: ActionDefinition): ActionDefinition => defineAction({ ...config, kind: "approve" }),
  reject: (config: ActionDefinition): ActionDefinition => defineAction({ ...config, kind: "reject" })
});

