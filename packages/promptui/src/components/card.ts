import type { CardDefinition } from "../types/public";

export function card(config: Omit<CardDefinition, "type">): CardDefinition {
  return {
    ...config,
    type: "card"
  };
}
