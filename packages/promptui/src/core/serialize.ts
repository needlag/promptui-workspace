import type {
  ActionDefinition,
  CardDefinition,
  FormDefinition,
  PanelDefinition,
  PromptUIComponentDefinition,
  PromptUIFieldDefinition,
  RootDefinition,
  SectionDefinition,
  SerializedActionDefinition,
  SerializedComponentDefinition,
  SerializedFieldDefinition,
  SerializedPromptUIDocument,
  SerializedTableDefinition,
  TableDefinition
} from "../types/public";
import type { PromptUIDocumentDefinition } from "../types/internal";
import { createActionPayloadSchema } from "../validation/schema";

function serializeField(field: PromptUIFieldDefinition): SerializedFieldDefinition {
  const { runtimeValidators, ...rest } = field;
  return rest;
}

function serializeAction(
  action: ActionDefinition,
  component?: PromptUIComponentDefinition
): SerializedActionDefinition {
  return {
    ...action,
    kind: action.kind ?? "button",
    sourceComponentId: component?.id,
    sourceComponentType: component?.type,
    inputSchema: createActionPayloadSchema(component, action.inputSchema)
  };
}

function serializeSection(section: SectionDefinition): SerializedComponentDefinition {
  return {
    ...section,
    actions: (section.actions ?? []).map((action) => serializeAction(action, section)),
    children: section.children.map(serializeComponent)
  };
}

function serializeForm(form: FormDefinition): SerializedComponentDefinition {
  return {
    ...form,
    actions: (form.actions ?? []).map((action) => serializeAction(action, form)),
    fields: form.fields.map(serializeField)
  };
}

function serializeCard(card: CardDefinition): SerializedComponentDefinition {
  return {
    ...card,
    actions: (card.actions ?? []).map((action) => serializeAction(action, card)),
    children: card.children?.map(serializeComponent)
  };
}

function serializeTable(table: TableDefinition): SerializedTableDefinition {
  return {
    ...table,
    actions: (table.actions ?? []).map((action) => serializeAction(action, table))
  };
}

function serializePanel(panel: PanelDefinition): SerializedComponentDefinition {
  return {
    ...panel,
    surface: panel.surface ?? "panel",
    actions: (panel.actions ?? []).map((action) => serializeAction(action, panel)),
    children: panel.children?.map(serializeComponent)
  };
}

export function serializeComponent(component: PromptUIComponentDefinition): SerializedComponentDefinition {
  switch (component.type) {
    case "section":
      return serializeSection(component);
    case "form":
      return serializeForm(component);
    case "card":
      return serializeCard(component);
    case "table":
      return serializeTable(component);
    case "panel":
      return serializePanel(component);
    default:
      return component as never;
  }
}

export function serializeDocument(document: PromptUIDocumentDefinition): SerializedPromptUIDocument {
  return {
    kind: "promptui",
    version: document.version ?? "1.0.0",
    id: document.id,
    title: document.title,
    description: document.description,
    purpose: document.purpose,
    tags: document.tags,
    meta: document.meta,
    components: document.components.map(serializeComponent)
  };
}
