# Manual Mail Workflow Screen Basic Design

## Overview

The manual mail workflow screen is implemented under `/manual-mail-workflows` and serves two responsibilities:

- Start a new manual mail workflow request
- Browse accepted workflow histories and inspect stage details

The page uses Vite, React Router, TanStack Query, React Hook Form, and Zod.

## Routing

- Route:
  - `/manual-mail-workflows`
- Parent layout:
  - `DashboardLayout`
- Entry point:
  - `src/pages/manual-mail-workflows/page.tsx`

## File Structure

- `src/pages/manual-mail-workflows/ManualMailWorkflowContent.tsx`
- `src/pages/manual-mail-workflows/execution-conditions/WorkflowRequestForm.tsx`
- `src/pages/manual-mail-workflows/execution-history/WorkflowHistoryList.tsx`
- `src/pages/manual-mail-workflows/execution-history/WorkflowHistoryDetailModal.tsx`
- `src/pages/manual-mail-workflows/execution-history/workflow-history.shared.tsx`
- `src/pages/manual-mail-workflows/manual-mail-workflow.api.ts`
- `src/pages/manual-mail-workflows/manual-mail-workflow.schema.ts`
- `src/pages/manual-mail-workflows/manual-mail-workflow.types.ts`
- `src/pages/manual-mail-workflows/useConnectionOptions.ts`
- `src/pages/manual-mail-workflows/useManualMailWorkflowHistories.ts`
- `src/pages/manual-mail-workflows/useStartManualMailWorkflow.ts`

## Component Responsibilities

### ManualMailWorkflowContent

- Orchestrates page-level state
- Owns `offset` for history pagination
- Handles unauthorized redirects
- Composes the intro card, execution form, and history list

### WorkflowRequestForm

- Renders the execution conditions form
- Loads connection options
- Validates form input
- Starts the workflow mutation
- Locks the form after a successful acceptance

### WorkflowHistoryList

- Renders the history table
- Handles pagination actions
- Owns the selected history for the detail modal

### WorkflowHistoryDetailModal

- Renders execution metadata
- Renders search conditions
- Renders the stage summary table
- Supports bounded scrolling for long content

### workflow-history.shared

- Provides status labels
- Provides stage labels
- Provides date formatting
- Provides provider icon rendering
- Provides reusable history display helpers

## API Design in the Frontend

### Start workflow mutation

- Hook:
  - `useStartManualMailWorkflow`
- API function:
  - `startManualMailWorkflow`
- Retry behavior:
  - `retryOnUnauthorized: true`

### Histories query

- Hook:
  - `useManualMailWorkflowHistories`
- API function:
  - `fetchManualMailWorkflowHistories`
- Query key:
  - `['manual-mail-workflows', 'histories', { limit, offset }]`
- Current frontend page size:
  - `20`

### Connection options query

- Hook:
  - `useConnectionOptions`
- Shared API function:
  - `fetchMailAccountConnections`

## Frontend Data Flow

1. The page loads connection options and the first history page.
2. The user submits the execution form.
3. The workflow mutation sends normalized JST date-range strings.
4. On success:
   - The form becomes accepted and locked
   - If the current history page is the first page, the histories query is refetched
   - Otherwise, the page resets to `offset = 0`
5. The user can paginate by changing `offset`.
6. The user can open a history detail modal from the table.

## Unauthorized Handling

- The API client already retries once after attempting session refresh.
- If a page-level query or mutation still returns `401`, the screen:
  - clears the auth token
  - removes the auth session query
  - redirects to `/login`

## UI Details

### Execution form

- Title:
  - `Execution Conditions`
- Inputs:
  - Mail connection
  - Label name
  - Date range
- Button states:
  - `Run Analysis`
  - `Running Analysis...`
  - `Accepted`

### Execution history

- Title:
  - `Execution History`
- Table columns:
  - Accepted time
  - Email address
  - Status
  - Current stage
  - Details

### Detail modal

- Title:
  - `History Details`
- Search conditions:
  - Mail service with icon
  - Email address
  - Label name
  - Date range
- Stage names:
  - Fetch
  - AI Analysis
  - Payment Vendor Resolution
  - Billing Eligibility Check
  - Billing Save

## Testing Focus

- Loading and empty states
- Form validation
- Successful acceptance and history refetch
- History table rendering
- Detail modal rendering
- Pagination state updates
- Redirect on `401`
