# Project instructions

## Verify features before integrating them

Before adding a feature to the project, validate it in isolation or in a temporary branch/worktree. Do not integrate it until its expected behavior has been exercised and the relevant checks pass.

- Identify user-visible behavior and acceptance criteria first.
- Exercise normal use, important edge cases, invalid input, and failure states.
- Add or update automated tests for the behavior. Run relevant tests, lint, type checks, and build before integration.
- For UI changes, verify rendering and interactions in the running app at relevant screen sizes; automated checks alone are not sufficient.
- If a check cannot run, report why and what remains unverified. Do not claim the feature is ready until the gap is resolved.
- After integration, run the relevant checks again against the integrated project.
- Prefer repeatable tests of observable behavior. Cover every acceptance criterion.

## Project conventions

- Keep the FastAPI backend in `backend/` and the React frontend in `frontend/`.
- Keep changes focused; avoid unrelated refactors and additional dependencies unless they are needed for the feature.
- Follow the existing naming, formatting, and component patterns. Keep UI components small and reuse shared styles.
- Keep API request and response shapes consistent, validate inputs at the API boundary, and return clear HTTP errors.

## Setup and commands

- Backend: create and activate a virtual environment in `backend/.venv`, install `backend/requirements.txt`, then run `uvicorn main:app --reload` from `backend/`.
- Frontend: run `npm install` and `npm run dev` from `frontend/`.
- Frontend checks: run `npm run build` from `frontend/`.
- Backend checks: run `py -m unittest discover -s tests` from `backend/` when backend tests are present.
- Update these commands whenever the project setup or scripts change.

## Quality, security, and data

- Handle loading, empty, success, and error states so failures are visible and recoverable.
- Keep keyboard operation, visible focus, semantic HTML, and sensible contrast in UI changes.
- Never commit credentials, tokens, or private user data. Read configuration from environment variables when needed.
- Validate and constrain user input; use parameterized database operations and avoid exposing internal errors to users.
- Preserve user-created data across restarts and avoid destructive migrations without a safe migration path.
- Update documentation when setup steps, API behavior, or user-visible behavior changes.

## Completion summary

When finishing a change, summarize what changed, the checks that ran and their results, and any remaining verification or limitations.
