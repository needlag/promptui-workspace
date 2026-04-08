import type {
  FormDefinition,
  PanelDefinition,
  PromptUIComponentDefinition,
  SectionDefinition
} from "../types/public";

export function isSection(component: PromptUIComponentDefinition): component is SectionDefinition {
  return component.type === "section";
}

export function isForm(component: PromptUIComponentDefinition): component is FormDefinition {
  return component.type === "form";
}

export function isPanel(component: PromptUIComponentDefinition): component is PanelDefinition {
  return component.type === "panel";
}

export function hasChildren(
  component: PromptUIComponentDefinition
): component is SectionDefinition | PanelDefinition {
  return component.type === "section" || component.type === "panel";
}

