import type {
  ActionDefinition,
  ActionRecord,
  BaseFieldDefinition,
  CardDefinition,
  FormDefinition,
  PanelDefinition,
  PromptUIComponentDefinition,
  PromptUIFieldDefinition,
  RootDefinition,
  SectionDefinition,
  SerializedActionDefinition,
  TableDefinition
} from "../types/public";
import type { BuildActionContext, PromptUIDocumentDefinition } from "../types/internal";
import { ensureId } from "./ids";

function normalizeAction(action: ActionDefinition, context: BuildActionContext): SerializedActionDefinition {
  return {
    ...action,
    id: ensureId(action.id, "Action"),
    label: action.label.trim(),
    kind: action.kind ?? "button",
    sourceComponentId: context.component?.id,
    sourceComponentType: context.component?.type
  };
}

export function normalizeField<T extends PromptUIFieldDefinition>(field: T): T {
  return {
    ...field,
    id: ensureId(field.id, "Field"),
    label: field.label.trim(),
    required: Boolean(field.required),
    runtimeValidators: field.runtimeValidators ?? []
  };
}

function normalizeSection(section: SectionDefinition): SectionDefinition {
  return {
    ...section,
    id: ensureId(section.id, "Section"),
    children: section.children.map(normalizeComponent),
    actions: section.actions ?? []
  };
}

function normalizeForm(form: FormDefinition): FormDefinition {
  return {
    ...form,
    id: ensureId(form.id, "Form"),
    fields: form.fields.map(normalizeField),
    actions: form.actions ?? []
  };
}

function normalizeCard(card: CardDefinition): CardDefinition {
  return {
    ...card,
    id: ensureId(card.id, "Card"),
    attributes: card.attributes.map((attribute) => ({
      ...attribute,
      id: ensureId(attribute.id, "Card attribute")
    })),
    children: card.children?.map(normalizeComponent),
    actions: card.actions ?? []
  };
}

function normalizeTable(table: TableDefinition): TableDefinition {
  return {
    ...table,
    id: ensureId(table.id, "Table"),
    actions: table.actions ?? []
  };
}

function normalizePanel(panel: PanelDefinition): PanelDefinition {
  return {
    ...panel,
    id: ensureId(panel.id, "Panel"),
    surface: panel.surface ?? "panel",
    children: panel.children?.map(normalizeComponent),
    actions: panel.actions ?? []
  };
}

export function normalizeComponent(component: PromptUIComponentDefinition): PromptUIComponentDefinition {
  switch (component.type) {
    case "section":
      return normalizeSection(component);
    case "form":
      return normalizeForm(component);
    case "card":
      return normalizeCard(component);
    case "table":
      return normalizeTable(component);
    case "panel":
      return normalizePanel(component);
    default:
      return component;
  }
}

export function normalizeRoot(root: RootDefinition): PromptUIDocumentDefinition {
  return {
    ...root,
    id: ensureId(root.id, "PromptUI root"),
    title: root.title.trim(),
    version: root.version ?? "1.0.0",
    components: (root.components ?? []).map(normalizeComponent)
  };
}

export function buildActionRecord(action: ActionDefinition, context: BuildActionContext): ActionRecord {
  return normalizeAction(action, context);
}

