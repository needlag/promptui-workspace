import { describe, expect, it } from "vitest";
import {
  PromptUIActionNotFoundError,
  action,
  card,
  createPromptUI,
  field,
  form,
  section,
  table,
  validateSchema
} from "../src";

function createLeadUI() {
  const ui = createPromptUI({
    id: "lead-qualification",
    title: "Lead Qualification",
    description: "Capture inquiry details and next-step eligibility"
  });

  ui.add(
    section({
      id: "lead-section",
      title: "Lead flow",
      children: [
        form({
          id: "contact-form",
          title: "Get in touch",
          fields: [
            field.text({
              id: "fullName",
              label: "Full name",
              required: true
            }),
            field.email({
              id: "email",
              label: "Email",
              required: true
            }),
            field.select({
              id: "inquiryType",
              label: "Inquiry type",
              required: true,
              options: [
                { value: "sales", label: "Sales" },
                { value: "support", label: "Support" }
              ]
            }),
            field.textarea({
              id: "message",
              label: "Message",
              minLength: 10,
              validate: (value) =>
                String(value).includes("http")
                  ? "Links are not allowed in the first outreach."
                  : null
            })
          ],
          actions: [
            action.submit({
              id: "submit-lead",
              label: "Submit",
              intent: "create_lead"
            })
          ]
        })
      ]
    })
  );

  return ui;
}

describe("PromptUI core", () => {
  it("serializes a stable document shape", () => {
    const ui = createLeadUI();
    const snapshot = ui.serialize();

    expect(snapshot.kind).toBe("promptui");
    expect(snapshot.components[0]?.type).toBe("section");
    expect(snapshot.components[0] && "children" in snapshot.components[0]).toBe(true);
  });

  it("inspects components and actions with indexes", () => {
    const ui = createLeadUI();
    const inspection = ui.inspect();

    expect(inspection.componentIndex["contact-form"]?.path).toBe("lead-section/contact-form");
    expect(inspection.actionIndex["submit-lead"]?.intent).toBe("create_lead");
    expect(inspection.schemas.forms["contact-form"]?.type).toBe("object");
  });

  it("builds derived schemas for form actions", () => {
    const ui = createLeadUI();
    const submit = ui.getActions().find((item) => item.id === "submit-lead");

    expect(submit?.inputSchema?.properties?.values?.type).toBe("object");
    expect(submit?.inputSchema?.required).toContain("values");
  });

  it("dispatches actions to registered handlers", async () => {
    const ui = createLeadUI();

    ui.onAction("submit-lead", async (payload) => ({
      received: payload.values
    }));

    const result = await ui.dispatch("submit-lead", {
      values: {
        fullName: "Mario Moreno",
        email: "mario@example.com",
        inquiryType: "sales",
        message: "I want a product walkthrough"
      }
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        received: {
          fullName: "Mario Moreno",
          email: "mario@example.com",
          inquiryType: "sales",
          message: "I want a product walkthrough"
        }
      });
    }
  });

  it("returns structured validation errors for invalid payloads", async () => {
    const ui = createLeadUI();

    const result = await ui.dispatch("submit-lead", {
      values: {
        fullName: "",
        email: "bad-email",
        inquiryType: "unknown",
        message: "http://example.com"
      }
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe("validation_error");
      expect(result.issues?.some((issue) => issue.path === "$.fullName")).toBe(true);
      expect(result.issues?.some((issue) => issue.path === "$.email")).toBe(true);
      expect(result.issues?.some((issue) => issue.rule === "custom")).toBe(true);
    }
  });

  it("throws for missing actions", async () => {
    const ui = createLeadUI();

    await expect(ui.dispatch("missing-action")).rejects.toBeInstanceOf(PromptUIActionNotFoundError);
  });

  it("returns unhandled when no action handler is registered", async () => {
    const ui = createLeadUI();
    const result = await ui.dispatch("submit-lead", {
      values: {
        fullName: "Mario Moreno",
        email: "mario@example.com",
        inquiryType: "sales",
        message: "Following up after a referral"
      }
    });

    expect(result).toEqual({
      ok: false,
      status: "unhandled",
      actionId: "submit-lead"
    });
  });

  it("finds nested components by id", () => {
    const ui = createLeadUI();
    const component = ui.getComponentById("contact-form");

    expect(component?.type).toBe("form");
  });

  it("normalizes action kinds and validates raw schemas", () => {
    const ui = createPromptUI({
      id: "invoice-review",
      title: "Invoice Review",
      components: [
        card({
          id: "invoice-card",
          title: "Invoice 4921",
          attributes: [
            { id: "amount", label: "Amount", value: "$12,400", emphasis: true }
          ],
          actions: [
            action({
              id: "approve-invoice",
              label: "Approve",
              intent: "approve_invoice"
            })
          ],
          children: [
            table({
              id: "invoice-items",
              title: "Line items",
              columns: [
                { id: "item", label: "Item" },
                { id: "amount", label: "Amount", align: "right" }
              ],
              rows: [{ item: "Services", amount: "$12,400" }]
            })
          ]
        })
      ]
    });

    expect(ui.getActions()[0]?.kind).toBe("button");
    expect(validateSchema({ amount: 5 }, { type: "object", properties: { amount: { type: "number" } } })).toEqual(
      []
    );
  });
});

