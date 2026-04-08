export type PromptUIValue =
  | string
  | number
  | boolean
  | null
  | PromptUIValue[]
  | { [key: string]: PromptUIValue };

export interface JSONSchemaDefinition {
  $id?: string;
  $schema?: string;
  title?: string;
  description?: string;
  type?: "object" | "array" | "string" | "number" | "integer" | "boolean" | "null";
  format?: "email" | string;
  enum?: Array<string | number | boolean | null>;
  const?: string | number | boolean | null;
  default?: PromptUIValue;
  properties?: Record<string, JSONSchemaDefinition>;
  required?: string[];
  items?: JSONSchemaDefinition;
  minItems?: number;
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  additionalProperties?: boolean;
}

export type PromptUIComponentType = "section" | "form" | "card" | "table" | "panel";
export type PromptUIFieldType = "text" | "email" | "textarea" | "select";
export type PromptUIActionKind =
  | "button"
  | "submit"
  | "secondary"
  | "destructive"
  | "approve"
  | "reject"
  | (string & {});

export interface SemanticMeta {
  purpose?: string;
  tags?: string[];
  meta?: Record<string, unknown>;
}

export interface RootDefinition extends SemanticMeta {
  id: string;
  title: string;
  description?: string;
  version?: string;
  components?: PromptUIComponentDefinition[];
}

export interface ActionDefinition extends SemanticMeta {
  id: string;
  label: string;
  kind?: PromptUIActionKind;
  intent: string;
  description?: string;
  target?: string;
  inputSchema?: JSONSchemaDefinition;
  outputSchema?: JSONSchemaDefinition;
  confirmation?: {
    title?: string;
    description: string;
  };
  disabled?: boolean;
}

export interface ActionRecord extends ActionDefinition {
  kind: PromptUIActionKind;
  sourceComponentId?: string;
  sourceComponentType?: PromptUIComponentType;
  inputSchema?: JSONSchemaDefinition;
}

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
}

export interface RuntimeFieldValidatorContext {
  field: PromptUIFieldDefinition;
  values: Record<string, unknown>;
}

export interface ValidationIssue {
  path: string;
  message: string;
  rule: string;
}

export type RuntimeFieldValidator = (
  value: unknown,
  context: RuntimeFieldValidatorContext
) => string | ValidationIssue | ValidationIssue[] | null | undefined;

export interface BaseFieldInput extends SemanticMeta {
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
  validate?: RuntimeFieldValidator | RuntimeFieldValidator[];
}

export interface BaseFieldDefinition extends Omit<BaseFieldInput, "validate"> {
  type: PromptUIFieldType;
  required: boolean;
  runtimeValidators: RuntimeFieldValidator[];
}

export interface TextFieldDefinition extends BaseFieldDefinition {
  type: "text";
}

export interface EmailFieldDefinition extends BaseFieldDefinition {
  type: "email";
}

export interface TextareaFieldDefinition extends BaseFieldDefinition {
  type: "textarea";
  rows?: number;
}

export interface SelectFieldDefinition extends BaseFieldDefinition {
  type: "select";
  options: FieldOption[];
}

export type PromptUIFieldDefinition =
  | TextFieldDefinition
  | EmailFieldDefinition
  | TextareaFieldDefinition
  | SelectFieldDefinition;

export type TextFieldInput = BaseFieldInput;
export type EmailFieldInput = BaseFieldInput;
export interface TextareaFieldInput extends BaseFieldInput {
  rows?: number;
}
export interface SelectFieldInput extends BaseFieldInput {
  options: FieldOption[];
}

export interface BaseComponentDefinition extends SemanticMeta {
  id: string;
  type: PromptUIComponentType;
  title?: string;
  description?: string;
  actions?: ActionDefinition[];
}

export interface SectionDefinition extends BaseComponentDefinition {
  type: "section";
  children: PromptUIComponentDefinition[];
}

export interface FormDefinition extends BaseComponentDefinition {
  type: "form";
  fields: PromptUIFieldDefinition[];
  actions?: ActionDefinition[];
}

export interface CardAttribute {
  id: string;
  label: string;
  value: string | number | boolean;
  tone?: "default" | "positive" | "warning" | "critical";
  emphasis?: boolean;
}

export interface CardDefinition extends BaseComponentDefinition {
  type: "card";
  eyebrow?: string;
  attributes: CardAttribute[];
  children?: PromptUIComponentDefinition[];
}

export interface TableColumn {
  id: string;
  label: string;
  align?: "left" | "right" | "center";
}

export interface TableDefinition extends BaseComponentDefinition {
  type: "table";
  columns: TableColumn[];
  rows: Array<Record<string, string | number | boolean>>;
}

export interface PanelDefinition extends BaseComponentDefinition {
  type: "panel";
  surface?: "panel" | "dialog";
  body?: string;
  children?: PromptUIComponentDefinition[];
}

export type PromptUIComponentDefinition =
  | SectionDefinition
  | FormDefinition
  | CardDefinition
  | TableDefinition
  | PanelDefinition;

export interface SerializedBaseFieldDefinition extends Omit<BaseFieldDefinition, "runtimeValidators"> {
  meta?: Record<string, unknown>;
}

export interface SerializedTextFieldDefinition extends SerializedBaseFieldDefinition {
  type: "text";
}

export interface SerializedEmailFieldDefinition extends SerializedBaseFieldDefinition {
  type: "email";
}

export interface SerializedTextareaFieldDefinition extends SerializedBaseFieldDefinition {
  type: "textarea";
  rows?: number;
}

export interface SerializedSelectFieldDefinition extends SerializedBaseFieldDefinition {
  type: "select";
  options: FieldOption[];
}

export type SerializedFieldDefinition =
  | SerializedTextFieldDefinition
  | SerializedEmailFieldDefinition
  | SerializedTextareaFieldDefinition
  | SerializedSelectFieldDefinition;

export interface SerializedActionDefinition extends ActionRecord {}

export interface SerializedBaseComponent extends Omit<BaseComponentDefinition, "actions"> {
  actions: SerializedActionDefinition[];
}

export interface SerializedSectionDefinition extends SerializedBaseComponent {
  type: "section";
  children: SerializedComponentDefinition[];
}

export interface SerializedFormDefinition extends SerializedBaseComponent {
  type: "form";
  fields: SerializedFieldDefinition[];
}

export interface SerializedCardDefinition extends SerializedBaseComponent {
  type: "card";
  eyebrow?: string;
  attributes: CardAttribute[];
  children?: SerializedComponentDefinition[];
}

export interface SerializedTableDefinition extends SerializedBaseComponent {
  type: "table";
  columns: TableColumn[];
  rows: Array<Record<string, string | number | boolean>>;
}

export interface SerializedPanelDefinition extends SerializedBaseComponent {
  type: "panel";
  surface: "panel" | "dialog";
  body?: string;
  children?: SerializedComponentDefinition[];
}

export type SerializedComponentDefinition =
  | SerializedSectionDefinition
  | SerializedFormDefinition
  | SerializedCardDefinition
  | SerializedTableDefinition
  | SerializedPanelDefinition;

export interface SerializedPromptUIDocument extends SemanticMeta {
  kind: "promptui";
  version: string;
  id: string;
  title: string;
  description?: string;
  components: SerializedComponentDefinition[];
}

export interface ComponentInspectionItem {
  id: string;
  type: PromptUIComponentType;
  title?: string;
  description?: string;
  purpose?: string;
  tags?: string[];
  path: string;
  parentId?: string;
  actionIds: string[];
}

export interface PromptUISchemaBundle {
  document: JSONSchemaDefinition;
  forms: Record<string, JSONSchemaDefinition>;
  actions: Record<string, JSONSchemaDefinition>;
}

export interface PromptUIInspection {
  root: SerializedPromptUIDocument;
  components: ComponentInspectionItem[];
  componentIndex: Record<string, ComponentInspectionItem>;
  actions: SerializedActionDefinition[];
  actionIndex: Record<string, SerializedActionDefinition>;
  schemas: PromptUISchemaBundle;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface ActionDispatchSuccess<T = unknown> {
  ok: true;
  status: "success";
  actionId: string;
  data: T;
}

export interface ActionDispatchFailure {
  ok: false;
  status: "validation_error" | "failed" | "disabled" | "unhandled";
  actionId: string;
  issues?: ValidationIssue[];
  error?: {
    message: string;
  };
}

export type ActionDispatchResult<T = unknown> = ActionDispatchSuccess<T> | ActionDispatchFailure;

export interface ActionDispatchContext {
  action: SerializedActionDefinition;
  component?: PromptUIComponentDefinition;
  ui: PromptUIInstance;
  inspect: () => PromptUIInspection;
  timestamp: string;
}

export type ActionHandler = (
  payload: Record<string, unknown>,
  context: ActionDispatchContext
) => unknown | Promise<unknown>;

export interface StateAdapter<T> {
  get: () => T;
  set: (next: T) => void;
  patch: (patch: Partial<T>) => void;
  subscribe: (listener: (next: T) => void) => () => void;
}

export interface PromptUIInstance {
  add: (...components: PromptUIComponentDefinition[]) => PromptUIInstance;
  inspect: () => PromptUIInspection;
  serialize: () => SerializedPromptUIDocument;
  getActions: () => SerializedActionDefinition[];
  getComponentById: (id: string) => PromptUIComponentDefinition | undefined;
  getSchema: () => PromptUISchemaBundle;
  onAction: (actionId: string, handler: ActionHandler) => PromptUIInstance;
  offAction: (actionId: string) => PromptUIInstance;
  dispatch: <T = unknown>(
    actionId: string,
    payload?: Record<string, unknown>
  ) => Promise<ActionDispatchResult<T>>;
  bindState: <T>(componentId: string, adapter: StateAdapter<T>) => PromptUIInstance;
  getStateAdapter: <T>(componentId: string) => StateAdapter<T> | undefined;
}
