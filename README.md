# Parabank Fabric QA Challenge

## Project Overview
This project contains automated tests for the Parabank demo banking application using Playwright.

## Prerequisites

### Environment Setup
- Node.js (version 16 or later)
- npm (Node Package Manager)

### Installation Steps
1. Clone the repository
git clone https://github.com/merrilladdison/fabricqa.git

npm init -y
npm install -D @playwright/test
npx playwright install

### Runnings Tests
npx playwright test

### Bugs and Limitations
1. A bug was found while automating bill pay wherein the transactions are not appearing in the accounts overview after a successful payment

2. The bug on mentioned on above is causing the api test (findTransactions) to fail as expected

3. The api test on find transactions is using today's date because find transaction by transaction id is returning an error: 

{ "type": "about:blank", "title": "Not Found", "status": 404, "detail": "No endpoint GET }

FYI: We used the find transaction by date which is always dated by today
