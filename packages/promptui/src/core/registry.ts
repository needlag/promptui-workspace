import type {
  ActionDefinition,
  PromptUIComponentDefinition,
  SerializedActionDefinition
} from "../types/public";
import type { PromptUIDocumentDefinition, PromptUIRegistry } from "../types/internal";
import { createActionPayloadSchema } from "../validation/schema";
import { buildActionRecord } from "../utils/normalize";

function attachSchema(
  action: SerializedActionDefinition,
  component?: PromptUIComponentDefinition
): SerializedActionDefinition {
  return {
    ...action,
    inputSchema: createActionPayloadSchema(component, action.inputSchema)
  };
}

function registerAction(
  registry: PromptUIRegistry,
  component: PromptUIComponentDefinition | undefined,
  action: ActionDefinition
): void {
  const built = buildActionRecord(action, { component, action });
  registry.actions.set(built.id, {
    action: attachSchema(built, component),
    component
  });
}

function walkComponents(
  components: PromptUIComponentDefinition[],
  registry: PromptUIRegistry
): void {
  for (const component of components) {
    registry.components.set(component.id, component);

    for (const action of component.actions ?? []) {
      registerAction(registry, component, action);
    }

    if ("children" in component && Array.isArray(component.children)) {
      walkComponents(component.children, registry);
    }
  }
}

export function createRegistry(document: PromptUIDocumentDefinition): PromptUIRegistry {
  const registry: PromptUIRegistry = {
    components: new Map(),
    actions: new Map()
  };

  walkComponents(document.components, registry);
  return registry;
}

