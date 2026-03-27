# Manual Mail Workflow Screen Requirements Definition

## Purpose and Scope

- Provide a dashboard page that allows users to start a manual mail acquisition workflow.
- Treat `POST /manual-mail-workflows` as an acceptance endpoint rather than a completion endpoint.
- Show workflow execution history by using `GET /manual-mail-workflows`.
- Allow users to inspect stage-level details in a modal dialog.
- Refetch the history list on initial page load and after a successful workflow acceptance.

## Out of Scope

- Polling the workflow status endpoint.
- A dedicated workflow detail page.
- Additional search filters or sortable history columns.
- Backend implementation changes.

## Dependent APIs

### Mail account connections

- Endpoint:
  - `GET /mail-account-connections`
- Purpose:
  - Build `connection_id` options for the execution form
- Expected response:
  - `{ items: Array<{ id, provider, account_identifier, created_at, updated_at }> }`

### Start manual mail workflow

- Endpoint:
  - `POST /manual-mail-workflows`
- Purpose:
  - Accept a new workflow request
- Request:
  - `{ connection_id, label_name, since, until }`
- Response:
  - `{ message, workflow_id, status }`

### Manual mail workflow histories

- Endpoint:
  - `GET /manual-mail-workflows`
- Query:
  - `limit`
  - `offset`
- Response:
  - `{ items, total_count }`
- Frontend behavior:
  - Use `provider` and `account_identifier` when the backend includes them
  - Fallback to `Unknown` when either field is missing

## User Flow

- A logged-in user opens the manual mail workflow page from the dashboard.
- The page fetches mail connections and the first history page on load.
- The user enters `connection_id`, `label_name`, `since`, and `until`, then clicks `Run Analysis`.
- On successful acceptance, the form becomes locked and the history list is refreshed.
- The user can open a detail modal from the history table to inspect stage-level results.

## Screen Structure

- Intro card
- Execution conditions card
- Execution history card
- History detail modal

## Execution Conditions Card

- Inputs:
  - Mail connection
  - Label name
  - Date range
- Primary action:
  - `Run Analysis`
- Acceptance feedback:
  - Lock the form and show a short acceptance message

## Execution History Card

- History table columns:
  - `Accepted At`
  - `Email Address`
  - `Status`
  - `Current Stage`
  - `Details`
- Pagination:
  - `Previous`
  - `Next`
- Uses `limit / offset`

## Detail Modal

- Header:
  - `History Details`
  - `Executed At`
  - `Workflow ID`
- Search conditions section:
  - `Mail Service`
  - `Email Address`
  - `Label Name`
  - `Date Range`
- Stage summary table:
  - `Stage`
  - `Success`
  - `Business Failures`
  - `Technical Failures`
  - `Messages`

## State and Error Handling

- Show loading indicators while fetching connections or histories.
- Disable the form when no connections are available.
- Prevent duplicate submissions while the workflow request is pending or already accepted.
- Redirect to `/login` when a request still returns `401` after the existing refresh retry.
- Keep the modal closable via backdrop click and `Escape`.
- Make the modal table area scrollable within a bounded viewport.

## Definition of Done

- Users can start a workflow from the execution form.
- Users can browse the workflow history table.
- Users can paginate through history results.
- Users can open the detail modal and inspect stage summaries.
- `401` responses redirect the user back to the login page.
