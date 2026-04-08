import type {
  ActionRecord,
  CardAttribute,
  PromptUIComponentDefinition,
  SerializedPromptUIDocument
} from "../types/public";

export interface RenderNode {
  id: string;
  type: string;
  title?: string;
  description?: string;
  role?: string;
  actions: ActionRecord[];
  fields?: Array<{ id: string; label: string; type: string; required: boolean }>;
  attributes?: CardAttribute[];
  columns?: Array<{ id: string; label: string }>;
  rows?: Array<Record<string, string | number | boolean>>;
  children?: RenderNode[];
}

function toNode(component: PromptUIComponentDefinition): RenderNode {
  const base: RenderNode = {
    id: component.id,
    type: component.type,
    title: component.title,
    description: component.description,
    role: component.purpose,
    actions: (component.actions ?? []).map((action) => ({
      ...action,
      kind: action.kind ?? "button"
    }))
  };

  if (component.type === "form") {
    base.fields = component.fields.map((field) => ({
      id: field.id,
      label: field.label,
      type: field.type,
      required: field.required
    }));
  }

  if (component.type === "card") {
    base.attributes = component.attributes;
    base.children = component.children?.map(toNode);
  }

  if (component.type === "table") {
    base.columns = component.columns;
    base.rows = component.rows;
  }

  if (component.type === "section" || component.type === "panel") {
    base.children = component.children?.map(toNode);
  }

  return base;
}

export function createRenderTree(document: SerializedPromptUIDocument): RenderNode[] {
  return document.components.map((component) => toNode(component as PromptUIComponentDefinition));
}

