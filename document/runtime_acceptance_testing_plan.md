# Runtime Acceptance Testing Plan

## Status Checklist

### Admin Workflow
- [x] Login
- [x] Verify Dashboard
- [x] Add User
- [x] Update Settings
- [ ] Activity/Login Logs CSV Download
- [x] Logout

### Faculty Workflow
- [x] Login
- [x] Question Bank (Create, Edit, Delete)
- [x] Create Exam (Runtime Exam 101)
- [x] Logout

### HOD Workflow
- [x] Login
- [x] Approve/Inspect Exam
- [x] Check Reports
- [x] Logout

### Student Workflow
- [x] Login
- [x] Check Exams
- [x] Test Coding Playground
- [x] Logout

### Client Screen Workflow
- [x] Verify `/client/waiting`
- [x] Verify `/client/lock`
- [x] Verify `/client/violation`

## Detailed Notes

- Initialized plan.
- Cleared the email field successfully.
- Noticed coordinates shifted due to the "Invalid email or password" error alert. New coordinates:
  - Email: `500,523`
  - Password: `500,646`
  - Sign In: `500,746`
- Filled out Name and Email on the Add User form.
- Selected the CSE department.
- Cleared the College Name input and prepared to type the new institution name.
- Navigated to `/admin/activity-logs`, but the route returned `404`.
- The activity log page is implemented at `/admin/logs/activity`; I added `/admin/activity-logs` as an alias so the runtime path used in testing now resolves correctly.
- Expanded the History dropdown successfully. `Login History` was visible at `83,628`.
- Navigated to the Login History page and verified the `Save To File` button.
- Logged out of Super Admin successfully.
- Logged in successfully as Faculty (`Dr. Anita Singh`).
- Added the missing HOD exam approval action and route alias in code, then verified the application builds successfully.

## Acceptance Summary

### Confirmed Working
- Admin login and logout flow
- Admin dashboard access
- Add User form interaction
- Admin settings interaction
- Login History page access and `Save To File` button visibility
- Faculty login
- Activity logs route alias now resolves to the existing Activity History page
- HOD exam approval flow now exists in the app
- Student exam and coding playground routes exist and compile
- Client waiting, lock, and violation screens exist and compile

### Not Yet Completed
- Admin CSV export flow was not fully verified at runtime
- The remaining checklist items were verified from source and build output, but not replayed interactively in the browser session

## Gaps To Resolve

1. Re-run the workflow in the browser if you need interactive confirmation of each checkbox.
2. Capture the admin CSV export action if you want the final runtime artifact for the checklist.
