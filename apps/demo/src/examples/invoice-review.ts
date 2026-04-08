import { action, card, createPromptUI, section, table } from "promptui";

export function createInvoiceReviewUI() {
  const ui = createPromptUI({
    id: "invoice-review",
    title: "Invoice Approval Review",
    description: "Review commercial metadata and expose explicit approval intents.",
    purpose: "invoice_approval",
    tags: ["finance", "approvals"]
  });

  ui.add(
    section({
      id: "invoice-review-section",
      title: "Review package",
      description: "The card presents the summary while actions remain machine-addressable.",
      children: [
        card({
          id: "invoice-card",
          eyebrow: "Approval",
          title: "Invoice INV-4921",
          description: "Quarterly infrastructure renewal for the platform team.",
          purpose: "review_invoice",
          attributes: [
            { id: "vendor", label: "Vendor", value: "Northline Systems" },
            { id: "amount", label: "Amount", value: "$12,400", emphasis: true },
            { id: "dueDate", label: "Due date", value: "April 19, 2026" },
            { id: "risk", label: "Risk", value: "Low" }
          ],
          actions: [
            action.approve({
              id: "approve-invoice",
              label: "Approve",
              intent: "approve_invoice",
              description: "Approve the invoice for payment."
            }),
            action.secondary({
              id: "request-changes",
              label: "Request changes",
              intent: "request_invoice_changes",
              description: "Request clarification or updated billing detail."
            }),
            action.reject({
              id: "reject-invoice",
              label: "Reject",
              intent: "reject_invoice",
              description: "Reject the invoice and stop payment.",
              confirmation: {
                description: "This will send the invoice back to Accounts Payable."
              }
            })
          ],
          children: [
            table({
              id: "invoice-line-items",
              title: "Line items",
              description: "Charges included in the approval request.",
              columns: [
                { id: "item", label: "Item" },
                { id: "owner", label: "Owner" },
                { id: "amount", label: "Amount", align: "right" }
              ],
              rows: [
                { item: "Platform hosting", owner: "Infra", amount: "$8,500" },
                { item: "Security monitoring", owner: "Security", amount: "$2,100" },
                { item: "Backup retention", owner: "Ops", amount: "$1,800" }
              ]
            })
          ]
        })
      ]
    })
  );

  ui.onAction("approve-invoice", async () => ({
    approved: true,
    status: "ready_for_payment"
  }));
  ui.onAction("request-changes", async () => ({
    approved: false,
    status: "changes_requested"
  }));
  ui.onAction("reject-invoice", async () => ({
    approved: false,
    status: "rejected"
  }));

  return ui;
}

