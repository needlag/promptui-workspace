import type {
  ActionDefinition,
  PromptUIComponentDefinition,
  RootDefinition,
  SerializedActionDefinition
} from "./public";

export interface PromptUIDocumentDefinition extends RootDefinition {
  components: PromptUIComponentDefinition[];
}

export interface ActionRegistryEntry {
  action: SerializedActionDefinition;
  component?: PromptUIComponentDefinition;
}

export interface PromptUIRegistry {
  components: Map<string, PromptUIComponentDefinition>;
  actions: Map<string, ActionRegistryEntry>;
}

export interface BuildActionContext {
  component?: PromptUIComponentDefinition;
  action: ActionDefinition;
}

