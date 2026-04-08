import type { TableDefinition } from "../types/public";

export function table(config: Omit<TableDefinition, "type">): TableDefinition {
  return {
    ...config,
    type: "table"
  };
}
