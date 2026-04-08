import type {
  EmailFieldDefinition,
  EmailFieldInput,
  PromptUIFieldDefinition,
  RuntimeFieldValidator,
  SelectFieldDefinition,
  SelectFieldInput,
  TextareaFieldDefinition,
  TextareaFieldInput,
  TextFieldDefinition,
  TextFieldInput
} from "../types/public";

function toRuntimeValidators(
  input?: RuntimeFieldValidator | RuntimeFieldValidator[]
): RuntimeFieldValidator[] {
  if (!input) {
    return [];
  }

  return Array.isArray(input) ? input : [input];
}

function baseField<T extends PromptUIFieldDefinition>(
  type: T["type"],
  config: TextFieldInput | EmailFieldInput | TextareaFieldInput | SelectFieldInput
): Omit<T, "type"> & { type: T["type"] } {
  const { validate, ...rest } = config;

  return {
    ...rest,
    type,
    required: Boolean(config.required),
    runtimeValidators: toRuntimeValidators(validate)
  } as Omit<T, "type"> & { type: T["type"] };
}

export const field = {
  text(config: TextFieldInput): TextFieldDefinition {
    return baseField<TextFieldDefinition>("text", config);
  },
  email(config: EmailFieldInput): EmailFieldDefinition {
    return baseField<EmailFieldDefinition>("email", config);
  },
  textarea(config: TextareaFieldInput): TextareaFieldDefinition {
    return baseField<TextareaFieldDefinition>("textarea", config);
  },
  select(config: SelectFieldInput): SelectFieldDefinition {
    return baseField<SelectFieldDefinition>("select", config);
  }
};
