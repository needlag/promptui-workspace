import { startTransition, useEffect, useMemo, useState } from "react";
import type {
  PromptUIComponentDefinition,
  PromptUIInstance,
  SerializedActionDefinition,
  SerializedComponentDefinition
} from "promptui";
import { createRenderTree, renderToHTML } from "promptui";
import { createInvoiceReviewUI } from "./examples/invoice-review";
import { createLeadQualificationUI } from "./examples/lead-form";
import { createSupportPanelUI } from "./examples/support-panel";

type ExampleKey = "lead" | "invoice" | "support";
type InspectorMode = "serialize" | "inspect" | "schema" | "html";

interface DemoExample {
  id: ExampleKey;
  label: string;
  caption: string;
  ui: PromptUIInstance;
}

interface ActionLogEntry {
  id: string;
  timestamp: string;
  example: string;
  actionId: string;
  status: string;
  detail: string;
}

function collectFormDefaults(
  components: SerializedComponentDefinition[],
  output: Record<string, Record<string, string>> = {}
) {
  for (const component of components) {
    if (component.type === "form") {
      output[component.id] = Object.fromEntries(
        component.fields.map((field) => [field.id, field.defaultValue ?? ""])
      );
    }

    if ("children" in component && Array.isArray(component.children)) {
      collectFormDefaults(component.children, output);
    }
  }

  return output;
}

function useExamples(): DemoExample[] {
  return useMemo(
    () => [
      {
        id: "lead",
        label: "Lead Qualification Form",
        caption:
          "A submit action derives its payload schema directly from the form, so humans and agents operate against the same contract.",
        ui: createLeadQualificationUI()
      },
      {
        id: "invoice",
        label: "Invoice Review Card",
        caption:
          "Read-oriented components can still expose explicit intents, confirmations, and action metadata for approval workflows.",
        ui: createInvoiceReviewUI()
      },
      {
        id: "support",
        label: "Support Operations Panel",
        caption:
          "Panels and dialogs can combine operator context, nested forms, and machine-readable operational actions in a single tree.",
        ui: createSupportPanelUI()
      }
    ],
    []
  );
}

function classForAction(action: SerializedActionDefinition) {
  if (action.kind === "destructive" || action.kind === "reject") {
    return "action-button danger";
  }

  if (action.kind === "secondary") {
    return "action-button subtle";
  }

  return "action-button";
}

export function App() {
  const examples = useExamples();
  const [currentId, setCurrentId] = useState<ExampleKey>("lead");
  const [inspectorMode, setInspectorMode] = useState<InspectorMode>("serialize");
  const [logs, setLogs] = useState<ActionLogEntry[]>([]);
  const current = examples.find((example) => example.id === currentId) ?? examples[0];
  const serialized = useMemo(() => current.ui.serialize(), [current.id]);
  const inspection = useMemo(() => current.ui.inspect(), [current.id]);
  const renderTree = useMemo(() => createRenderTree(serialized), [serialized]);
  const htmlPreview = useMemo(() => renderToHTML(serialized), [serialized]);

  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>(() =>
    collectFormDefaults(serialized.components)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, Record<string, string[]>>>({});

  useEffect(() => {
    setFormValues(collectFormDefaults(serialized.components));
    setFieldErrors({});
  }, [current.id]);

  const inspectorOutput = useMemo(() => {
    if (inspectorMode === "serialize") {
      return JSON.stringify(serialized, null, 2);
    }

    if (inspectorMode === "inspect") {
      return JSON.stringify(inspection, null, 2);
    }

    if (inspectorMode === "schema") {
      return JSON.stringify(current.ui.getSchema(), null, 2);
    }

    return htmlPreview;
  }, [current.id, current.ui, htmlPreview, inspection, inspectorMode, serialized]);
  const inspectorLines = useMemo(() => inspectorOutput.split("\n"), [inspectorOutput]);

  function appendLog(actionId: string, status: string, detail: string) {
    setLogs((entries) => [
      {
        id: `${actionId}-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        example: current.label,
        actionId,
        status,
        detail
      },
      ...entries
    ]);
  }

  async function runAction(action: SerializedActionDefinition, component?: PromptUIComponentDefinition) {
    const payload =
      component?.type === "form"
        ? { values: formValues[component.id] ?? {} }
        : {};
    const result = await current.ui.dispatch(action.id, payload);

    if (!result.ok && result.status === "validation_error" && component?.type === "form") {
      const nextErrors: Record<string, string[]> = {};
      for (const issue of result.issues ?? []) {
        const key = issue.path.replace(/^\$\.(values\.)?/, "");
        if (!key || key === "values") {
          continue;
        }
        nextErrors[key] ??= [];
        nextErrors[key].push(issue.message);
      }

      setFieldErrors((errors) => ({
        ...errors,
        [component.id]: nextErrors
      }));
      appendLog(action.id, result.status, `${result.issues?.length ?? 0} validation issues`);
      return;
    }

    if (component?.type === "form") {
      setFieldErrors((errors) => ({
        ...errors,
        [component.id]: {}
      }));
    }

    appendLog(
      action.id,
      result.status,
      result.ok ? JSON.stringify(result.data) : result.error?.message ?? "Handled without a registered worker."
    );
  }

  return (
    <div className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">PromptUI</p>
          <h1>Components designed for humans, agents, and automation.</h1>
          <p className="hero-copy">
            PromptUI defines UI once, then exposes the same interface as a human-facing surface, a structured action
            contract, and an inspectable semantic tree.
          </p>
        </div>
        <div className="hero-panel">
          <div>
            <strong>{inspection.components.length}</strong>
            <span>components</span>
          </div>
          <div>
            <strong>{inspection.actions.length}</strong>
            <span>actions</span>
          </div>
          <div>
            <strong>{Object.keys(inspection.schemas.forms).length}</strong>
            <span>form schemas</span>
          </div>
        </div>
      </header>

      <nav className="example-tabs" aria-label="Examples">
        {examples.map((example) => (
          <button
            key={example.id}
            className={example.id === current.id ? "example-tab active" : "example-tab"}
            onClick={() =>
              startTransition(() => {
                setCurrentId(example.id);
              })
            }
          >
            {example.label}
          </button>
        ))}
      </nav>

      <section className="caption-card">
        <p>{current.caption}</p>
      </section>

      <main className="workspace">
        <section className="panel-card">
          <div className="panel-header">
            <h2>Rendered UI</h2>
            <p>The same definition drives this human-facing view and the machine-readable output beside it.</p>
          </div>
          <div className="render-surface">
            {serialized.components.map((component) => (
              <ComponentRenderer
                key={component.id}
                component={component}
                runtimeComponent={current.ui.getComponentById(component.id)}
                formValues={formValues}
                fieldErrors={fieldErrors}
                onFieldChange={(formId, fieldId, value) =>
                  setFormValues((values) => ({
                    ...values,
                    [formId]: {
                      ...(values[formId] ?? {}),
                      [fieldId]: value
                    }
                  }))
                }
                onAction={runAction}
              />
            ))}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-header">
            <h2>Agent View</h2>
            <div className="mode-tabs">
              {(["serialize", "inspect", "schema", "html"] as const).map((mode) => (
                <button
                  key={mode}
                  className={mode === inspectorMode ? "mode-tab active" : "mode-tab"}
                  onClick={() => setInspectorMode(mode)}
                >
                  {mode === "serialize" ? "Serialized JSON" : mode === "inspect" ? "Inspect" : mode === "schema" ? "Schemas" : "HTML"}
                </button>
              ))}
            </div>
          </div>
          <div className="code-shell" aria-label="Machine-readable output">
            <div className="code-toolbar">
              <div className="code-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="code-meta">
                <span className="code-chip">
                  {inspectorMode === "serialize"
                    ? "document.json"
                    : inspectorMode === "inspect"
                      ? "inspect.json"
                      : inspectorMode === "schema"
                        ? "schemas.json"
                        : "render.html"}
                </span>
                <span className="code-chip muted">
                  {inspectorMode === "html" ? "html" : "json"}
                </span>
              </div>
            </div>
            <pre className="code-block">
              <code>
                {inspectorLines.map((line, index) => (
                  <span key={`${index}-${line}`} className="code-line">
                    <span className="line-number">{index + 1}</span>
                    <span className="line-content">{line || " "}</span>
                  </span>
                ))}
              </code>
            </pre>
          </div>
          <div className="mini-note">
            <span>{renderTree.length} top-level render nodes</span>
            <span>{inspection.actions.map((item) => item.intent).join(" · ")}</span>
          </div>
        </section>
      </main>

      <section className="panel-card log-panel">
        <div className="panel-header">
          <h2>Action Log</h2>
          <p>Structured dispatch results surface success, validation failures, unhandled intents, and errors.</p>
        </div>
        <div className="log-list">
          {logs.length === 0 ? (
            <p className="empty-log">Run an action to inspect the dispatch result.</p>
          ) : (
            logs.map((entry) => (
              <article key={entry.id} className="log-entry">
                <div>
                  <strong>
                    <code>{entry.actionId}</code>
                  </strong>
                  <span>{entry.example}</span>
                </div>
                <div>
                  <span className={`status-pill ${entry.status}`}>{entry.status}</span>
                  <time>{entry.timestamp}</time>
                </div>
                <p>
                  <code>{entry.detail}</code>
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

interface ComponentRendererProps {
  component: SerializedComponentDefinition;
  runtimeComponent?: PromptUIComponentDefinition;
  formValues: Record<string, Record<string, string>>;
  fieldErrors: Record<string, Record<string, string[]>>;
  onFieldChange: (formId: string, fieldId: string, value: string) => void;
  onAction: (action: SerializedActionDefinition, component?: PromptUIComponentDefinition) => Promise<void>;
}

function ComponentRenderer({
  component,
  runtimeComponent,
  formValues,
  fieldErrors,
  onFieldChange,
  onAction
}: ComponentRendererProps) {
  const errors =
    component.type === "form" ? fieldErrors[component.id] ?? {} : {};

  if (component.type === "section") {
    return (
      <section className="surface section-surface">
        <header className="surface-header">
          <h3>{component.title}</h3>
          <p>{component.description}</p>
        </header>
        <div className="surface-body">
          {component.children.map((child) => (
            <ComponentRenderer
              key={child.id}
              component={child}
              runtimeComponent={runtimeComponent && "children" in runtimeComponent
                ? runtimeComponent.children?.find((entry) => entry.id === child.id)
                : undefined}
              formValues={formValues}
              fieldErrors={fieldErrors}
              onFieldChange={onFieldChange}
              onAction={onAction}
            />
          ))}
        </div>
      </section>
    );
  }

  if (component.type === "form") {
    const values = formValues[component.id] ?? {};

    return (
      <form
        className="surface form-surface"
        onSubmit={(event) => {
          event.preventDefault();
          void onAction(component.actions[0], runtimeComponent);
        }}
      >
        <header className="surface-header">
          <h3>{component.title}</h3>
          <p>{component.description}</p>
        </header>
        <div className="field-grid">
          {component.fields.map((field) => (
            <label key={field.id} className="field">
              <span className="field-label">
                {field.label}
                {field.required ? <em>Required</em> : null}
              </span>
              {field.type === "textarea" ? (
                <textarea
                  rows={field.rows ?? 4}
                  value={values[field.id] ?? ""}
                  onChange={(event) => onFieldChange(component.id, field.id, event.target.value)}
                />
              ) : field.type === "select" ? (
                <select
                  value={values[field.id] ?? ""}
                  onChange={(event) => onFieldChange(component.id, field.id, event.target.value)}
                >
                  <option value="">Select an option</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={values[field.id] ?? ""}
                  onChange={(event) => onFieldChange(component.id, field.id, event.target.value)}
                />
              )}
              {field.description ? <small>{field.description}</small> : null}
              {errors[field.id]?.map((error) => (
                <small key={error} className="error-text">
                  {error}
                </small>
              ))}
            </label>
          ))}
        </div>
        <footer className="action-row">
          {component.actions.map((action) => (
            <button
              key={action.id}
              type={action.kind === "submit" ? "submit" : "button"}
              className={classForAction(action)}
              onClick={
                action.kind === "submit"
                  ? undefined
                  : () => {
                      void onAction(action, runtimeComponent);
                    }
              }
            >
              {action.label}
            </button>
          ))}
        </footer>
      </form>
    );
  }

  if (component.type === "card") {
    return (
      <article className="surface card-surface">
        <header className="surface-header">
          {component.eyebrow ? <p className="eyebrow">{component.eyebrow}</p> : null}
          <h3>{component.title}</h3>
          <p>{component.description}</p>
        </header>
        <dl className="attribute-grid">
          {component.attributes.map((attribute) => (
            <div key={attribute.id} className={attribute.emphasis ? "attribute emphasis" : "attribute"}>
              <dt>{attribute.label}</dt>
              <dd>{String(attribute.value)}</dd>
            </div>
          ))}
        </dl>
        {component.children?.length ? (
          <div className="nested-stack">
            {component.children.map((child) => (
              <ComponentRenderer
                key={child.id}
                component={child}
                runtimeComponent={runtimeComponent && "children" in runtimeComponent
                  ? runtimeComponent.children?.find((entry) => entry.id === child.id)
                  : undefined}
                formValues={formValues}
                fieldErrors={fieldErrors}
                onFieldChange={onFieldChange}
                onAction={onAction}
              />
            ))}
          </div>
        ) : null}
        {component.actions.length ? (
          <footer className="action-row">
            {component.actions.map((action) => (
              <button key={action.id} className={classForAction(action)} onClick={() => void onAction(action, runtimeComponent)}>
                {action.label}
              </button>
            ))}
          </footer>
        ) : null}
      </article>
    );
  }

  if (component.type === "table") {
    return (
      <section className="surface table-surface">
        <header className="surface-header compact">
          <h4>{component.title}</h4>
          <p>{component.description}</p>
        </header>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {component.columns.map((column) => (
                  <th key={column.id} style={{ textAlign: column.align ?? "left" }}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {component.rows.map((row, index) => (
                <tr key={index}>
                  {component.columns.map((column) => (
                    <td key={column.id} style={{ textAlign: column.align ?? "left" }}>
                      {String(row[column.id] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <aside className="surface panel-surface">
      <header className="surface-header">
        <h3>{component.title}</h3>
        <p>{component.description ?? component.body}</p>
      </header>
      {component.body ? <p className="panel-body-copy">{component.body}</p> : null}
      {component.children?.length ? (
        <div className="nested-stack">
          {component.children.map((child) => (
            <ComponentRenderer
              key={child.id}
              component={child}
              runtimeComponent={runtimeComponent && "children" in runtimeComponent
                ? runtimeComponent.children?.find((entry) => entry.id === child.id)
                : undefined}
              formValues={formValues}
              fieldErrors={fieldErrors}
              onFieldChange={onFieldChange}
              onAction={onAction}
            />
          ))}
        </div>
      ) : null}
      {component.actions.length ? (
        <footer className="action-row">
          {component.actions.map((action) => (
            <button key={action.id} className={classForAction(action)} onClick={() => void onAction(action, runtimeComponent)}>
              {action.label}
            </button>
          ))}
        </footer>
      ) : null}
    </aside>
  );
}
