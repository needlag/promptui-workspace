import type {
  ComponentInspectionItem,
  PromptUIComponentDefinition,
  PromptUIInspection
} from "../types/public";
import type { PromptUIDocumentDefinition } from "../types/internal";
import { serializeDocument } from "./serialize";
import { createRegistry } from "./registry";
import { createSchemaBundle } from "../validation/schema";

function collectComponents(
  components: PromptUIComponentDefinition[],
  items: ComponentInspectionItem[],
  parentId?: string,
  pathPrefix = ""
): void {
  for (const component of components) {
    const path = pathPrefix ? `${pathPrefix}/${component.id}` : component.id;
    items.push({
      id: component.id,
      type: component.type,
      title: component.title,
      description: component.description,
      purpose: component.purpose,
      tags: component.tags,
      path,
      parentId,
      actionIds: (component.actions ?? []).map((action) => action.id)
    });

    if ("children" in component && Array.isArray(component.children)) {
      collectComponents(component.children, items, component.id, path);
    }
  }
}

export function inspectDocument(document: PromptUIDocumentDefinition): PromptUIInspection {
  const root = serializeDocument(document);
  const registry = createRegistry(document);
  const components: ComponentInspectionItem[] = [];
  collectComponents(document.components, components);

  const actionIndex = Object.fromEntries(
    Array.from(registry.actions.values()).map(({ action }) => [action.id, action])
  );
  const componentIndex = Object.fromEntries(components.map((item) => [item.id, item]));
  const schemas = createSchemaBundle(document);

  for (const action of Object.values(actionIndex)) {
    schemas.actions[action.id] = action.inputSchema ?? {
      type: "object",
      additionalProperties: true
    };
  }

  return {
    root,
    components,
    componentIndex,
    actions: Object.values(actionIndex),
    actionIndex,
    schemas
  };
}

