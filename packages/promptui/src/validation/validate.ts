import type {
  FormDefinition,
  JSONSchemaDefinition,
  PromptUIFieldDefinition,
  ValidationIssue,
  ValidationResult
} from "../types/public";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function pushIssue(issues: ValidationIssue[], path: string, message: string, rule: string): void {
  issues.push({ path, message, rule });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateSchema(
  value: unknown,
  schema: JSONSchemaDefinition,
  path = "$"
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!schema.type) {
    return issues;
  }

  if (schema.type === "object") {
    if (!isPlainObject(value)) {
      pushIssue(issues, path, "Expected an object.", "type");
      return issues;
    }

    const required = schema.required ?? [];
    for (const key of required) {
      if (!(key in value)) {
        pushIssue(issues, `${path}.${key}`, "This field is required.", "required");
      }
    }

    if (schema.properties) {
      for (const [key, propertySchema] of Object.entries(schema.properties)) {
        if (key in value) {
          issues.push(...validateSchema(value[key], propertySchema, `${path}.${key}`));
        }
      }
    }

    if (schema.additionalProperties === false && schema.properties) {
      for (const key of Object.keys(value)) {
        if (!(key in schema.properties)) {
          pushIssue(issues, `${path}.${key}`, "Unexpected property.", "additionalProperties");
        }
      }
    }
  }

  if (schema.type === "array") {
    if (!Array.isArray(value)) {
      pushIssue(issues, path, "Expected an array.", "type");
      return issues;
    }

    if (typeof schema.minItems === "number" && value.length < schema.minItems) {
      pushIssue(issues, path, `Expected at least ${schema.minItems} items.`, "minItems");
    }

    if (typeof schema.maxItems === "number" && value.length > schema.maxItems) {
      pushIssue(issues, path, `Expected no more than ${schema.maxItems} items.`, "maxItems");
    }

    if (schema.items) {
      value.forEach((item, index) => {
        issues.push(...validateSchema(item, schema.items as JSONSchemaDefinition, `${path}[${index}]`));
      });
    }
  }

  if (schema.type === "string") {
    if (typeof value !== "string") {
      pushIssue(issues, path, "Expected a string.", "type");
      return issues;
    }

    if (typeof schema.minLength === "number" && value.length < schema.minLength) {
      pushIssue(issues, path, `Expected at least ${schema.minLength} characters.`, "minLength");
    }

    if (typeof schema.maxLength === "number" && value.length > schema.maxLength) {
      pushIssue(issues, path, `Expected no more than ${schema.maxLength} characters.`, "maxLength");
    }

    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      pushIssue(issues, path, "Value does not match the expected pattern.", "pattern");
    }

    if (schema.format === "email" && !EMAIL_PATTERN.test(value)) {
      pushIssue(issues, path, "Expected a valid email address.", "format");
    }

    if (schema.enum && !schema.enum.includes(value)) {
      pushIssue(issues, path, "Value must be one of the allowed options.", "enum");
    }
  }

  if (schema.type === "number" || schema.type === "integer") {
    if (typeof value !== "number") {
      pushIssue(issues, path, "Expected a number.", "type");
      return issues;
    }

    if (schema.type === "integer" && !Number.isInteger(value)) {
      pushIssue(issues, path, "Expected an integer.", "type");
    }

    if (typeof schema.minimum === "number" && value < schema.minimum) {
      pushIssue(issues, path, `Expected a value of at least ${schema.minimum}.`, "minimum");
    }

    if (typeof schema.maximum === "number" && value > schema.maximum) {
      pushIssue(issues, path, `Expected a value of no more than ${schema.maximum}.`, "maximum");
    }
  }

  if (schema.type === "boolean" && typeof value !== "boolean") {
    pushIssue(issues, path, "Expected a boolean.", "type");
  }

  return issues;
}

function validateFieldValue(
  field: PromptUIFieldDefinition,
  value: unknown,
  values: Record<string, unknown>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const path = `$.${field.id}`;

  if (field.required && (value === undefined || value === null || value === "")) {
    pushIssue(issues, path, `${field.label} is required.`, "required");
    return issues;
  }

  if (value === undefined || value === null || value === "") {
    return issues;
  }

  if (typeof value !== "string") {
    pushIssue(issues, path, `${field.label} must be a string.`, "type");
    return issues;
  }

  if (field.minLength && value.length < field.minLength) {
    pushIssue(issues, path, `${field.label} must be at least ${field.minLength} characters.`, "minLength");
  }

  if (field.maxLength && value.length > field.maxLength) {
    pushIssue(issues, path, `${field.label} must be no more than ${field.maxLength} characters.`, "maxLength");
  }

  if (field.type === "email" && !EMAIL_PATTERN.test(value)) {
    pushIssue(issues, path, `${field.label} must be a valid email address.`, "format");
  }

  if (field.type === "select") {
    const allowed = field.options.map((option) => option.value);
    if (!allowed.includes(value)) {
      pushIssue(issues, path, `${field.label} must be one of the allowed options.`, "enum");
    }
  }

  for (const validator of field.runtimeValidators) {
    const result = validator(value, { field, values });

    if (!result) {
      continue;
    }

    if (typeof result === "string") {
      pushIssue(issues, path, result, "custom");
      continue;
    }

    if (Array.isArray(result)) {
      issues.push(...result);
      continue;
    }

    issues.push(result);
  }

  return issues;
}

export function validateFormValues(
  form: FormDefinition,
  values: Record<string, unknown>
): ValidationResult {
  const issues = form.fields.flatMap((field) => validateFieldValue(field, values[field.id], values));
  return {
    valid: issues.length === 0,
    issues
  };
}

