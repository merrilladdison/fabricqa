import { test as base, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Fixture to share data between tests
type TestFixtures = {
  savingsAccountNumber: string;
  username: string;
  password: string;
};

// Extend the base test with our fixtures
const test = base.extend<TestFixtures>({
  savingsAccountNumber: ['', { scope: 'test' }],
  username: ['', { scope: 'test' }],
  password: ['', { scope: 'test' }]
});

// Global data storage for the tests
const testData = {
  savingsAccountNumber: '',
  username: '',
  password: ''
};

test.describe('ParaBank User Registration, Login and Transactions', () => {
    test('should register new user and login successfully', async ({ page }) => {
        // Step 1: Navigate to ParaBank application
        await page.goto('https://parabank.parasoft.com/');
        
        // Step 2: Navigate to registration page
        await page.click('text=Register');
        
        // Generate random user data
        const randomNumber = faker.string.numeric(8); // 8-digit random number
        const randomWord = faker.word.sample().replace(/[^a-zA-Z]/g, '');
        const username = `${randomNumber}_${randomWord}`;
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const address = faker.location.streetAddress();
        const city = faker.location.city();
        const state = faker.location.state();
        const zipCode = faker.location.zipCode();
        const phone = faker.phone.number();
        const ssn = faker.string.numeric(9);
        const password = faker.internet.password();

        
        // Fill registration form
        await page.fill('input[name="customer.firstName"]', firstName);
        await page.fill('input[name="customer.lastName"]', lastName);
        await page.fill('input[name="customer.address.street"]', address);
        await page.fill('input[name="customer.address.city"]', city);
        await page.fill('input[name="customer.address.state"]', state);
        await page.fill('input[name="customer.address.zipCode"]', zipCode);
        await page.fill('input[name="customer.phoneNumber"]', phone);
        await page.fill('input[name="customer.ssn"]', ssn);
        await page.fill('input[name="customer.username"]', username);
        await page.fill('input[name="customer.password"]', password);
        await page.fill('input[name="repeatedPassword"]', password);
        
        // Submit registration form
        await page.click('input[value="Register"]');
        
        // Verify successful registration
        await expect(page.locator('text=Your account was created successfully. You are now logged in.')).toBeVisible();
        await expect(page.locator(`text=Welcome ${username}`)).toBeVisible();
        
        // 4. Verify Global Navigation Menu
        await expect(page.locator('ul.button')).toBeVisible();
        await expect(page.locator('text=Open New Account')).toBeVisible();
        await expect(page.locator('text=Accounts Overview')).toBeVisible();
        await expect(page.locator('text=Transfer Funds')).toBeVisible();
        await expect(page.locator('text=Bill Pay')).toBeVisible();
        await expect(page.locator('text=Find Transactions')).toBeVisible();
        await expect(page.locator('text=Update Contact Info')).toBeVisible();
        await expect(page.locator('text=Request Loan')).toBeVisible();
        await expect(page.locator('text=Log Out')).toBeVisible();


        // 5. Create Savings Account
        await page.click('text=Open New Account');
        await page.selectOption('#type', { label: 'SAVINGS' });
        await page.waitForLoadState('networkidle');
        await page.locator('//input[@value="Open New Account"]').click();
        await page.waitForLoadState('networkidle');

        
        // Verify account creation and capture account number
        await expect(page.locator('text=Congratulations, your account is now open.')).toBeVisible();
        // Wait for the account number to be present and visible
        await page.waitForSelector('#newAccountId', { state: 'visible' });
        const savingsAccountNumber = await page.locator('#newAccountId').innerText();
        // Verify account number is a valid number
        expect(savingsAccountNumber).toMatch(/^\d+$/);

        // 6. Validate Accounts Overview
        await page.click('text=Accounts Overview');
        
        // Wait for the accounts table to be visible
        await page.waitForSelector('#accountTable', { state: 'visible' });
        
        // Find the row containing the new account number
        const accountRow = page.locator(`#accountTable tr:has(a:text("${savingsAccountNumber}"))`);
        
        // Verify the account exists
        await expect(accountRow).toBeVisible();
        
        // Verify Balance is $100.00
        const balanceCell = accountRow.locator('td').nth(1);
        await expect(balanceCell).toHaveText('$100.00');
        
        // Verify Available Amount is $100.00
        const availableCell = accountRow.locator('td').nth(2);
        await expect(availableCell).toHaveText('$100.00');

        // 7. Transfer Funds
        await page.click('text=Transfer Funds');
        const transferAmount = '50';
        await page.fill('input#amount', transferAmount);
        await page.selectOption('select#fromAccountId', savingsAccountNumber!);

        // Select the first available account that's different from savings account
        const toAccount = await page.locator('select#toAccountId option:not([value="' + savingsAccountNumber + '"])').first();
        const toAccountNumber = await toAccount.getAttribute('value');
        await page.selectOption('select#toAccountId', toAccountNumber!);
        await page.waitForLoadState('networkidle');
        await page.click('input[value="Transfer"]');

        // Verify transfer success
        await expect(page.locator('text=Transfer Complete!')).toBeVisible();
        await expect(page.locator(`text=$${transferAmount}.00 has been transferred from account #${savingsAccountNumber} to account #${toAccountNumber}`)).toBeVisible();

        // Verify account balance after transfer
        await page.click('text=Accounts Overview');
        await page.waitForSelector('#accountTable', { state: 'visible' });
        const accountRowAfterTransfer = page.locator(`#accountTable tr:has(a:text("${savingsAccountNumber}"))`);
        await expect(accountRowAfterTransfer).toBeVisible();
        
        // Verify Balance is $50.00 after transfer
        const balanceCellAfterTransfer = accountRowAfterTransfer.locator('td').nth(1);
        await expect(balanceCellAfterTransfer).toHaveText('$50.00');

        // 8. Pay Bill
        await page.click('text=Bill Pay');
        await page.fill('input[name="payee.name"]', 'Test Payee');
        await page.fill('input[name="payee.address.street"]', address);
        await page.fill('input[name="payee.address.city"]', city);
        await page.fill('input[name="payee.address.state"]', state);
        await page.fill('input[name="payee.address.zipCode"]', zipCode);
        await page.fill('input[name="payee.phoneNumber"]', phone);
        await page.fill('input[name="payee.accountNumber"]', '1234567890');
        await page.fill('input[name="verifyAccount"]', '1234567890');
        await page.fill('input[name="amount"]', '25.00');
        await page.selectOption('select[name="fromAccountId"]', savingsAccountNumber!);
        await page.waitForLoadState('networkidle');
        await page.click('input[value="Send Payment"]');

        // Verify bill payment success
        await expect(page.locator('text=Bill Payment Complete')).toBeVisible();
        await expect(page.locator(`text=Bill Payment to Test Payee in the amount of $25.00 from account ${savingsAccountNumber}`)).toBeVisible();

        //Storing data for the api tests
        testData.savingsAccountNumber = savingsAccountNumber;
        testData.username = username;
        testData.password = password;
    });


test.describe('ParaBank API Tests', () => {
    test('should find transactions by date for a specific account', async ({ request }) => {
        // Get today's date in MM-DD-YYYY format
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const year = today.getFullYear();
        const formattedDate = `${month}-${day}-${year}`;
        
        // Use the account number and credentials from the UI test
        const savingsAccountNumber = testData.savingsAccountNumber;
        const username = testData.username;
        const password = testData.password;
        
        
        // 1. Login via API
        const loginResponse = await request.post('https://parabank.parasoft.com/parabank/login.htm', {
            form: {
                username: username,
                password: password
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        expect(loginResponse.ok()).toBeTruthy();
        
        // 2. Find transactions by date for the specific account
        const findTransactionsResponse = await request.get(
            `https://parabank.parasoft.com/parabank/services_proxy/bank/accounts/${savingsAccountNumber}/transactions/onDate/${formattedDate}`,
            {
                params: {
                    timeout: 30000
                }
            }
        );
        
        expect(findTransactionsResponse.ok()).toBeTruthy();
        
        // Parse and validate the response
        const transactions = await findTransactionsResponse.json();
        
        // Basic validation of the response structure
        expect(transactions).toBeDefined();
        
        // If transactions are returned as an array
        if (Array.isArray(transactions)) {
            // Verify we have transactions for today
            expect(transactions.length).toBeGreaterThan(0);
            
            // Look for our bill payment transaction
            const billPaymentTransaction = transactions.find(t => 
                t.description?.includes('Bill Payment') && 
                parseFloat(t.amount) === 25.00
            );
            
            // Print out all transactions if we can't find our bill payment
            if (!billPaymentTransaction) {
                console.log('Hmm, can\'t find the bill payment. Here are all the transactions we got:', transactions);
            }
            
            // Validate bill payment transaction
            expect(billPaymentTransaction).not.toBeUndefined();
            
            if (billPaymentTransaction) {
                expect(billPaymentTransaction).toHaveProperty('date');
                expect(billPaymentTransaction).toHaveProperty('amount', '25.00');
                expect(billPaymentTransaction).toHaveProperty('description');
                expect(billPaymentTransaction.description).toContain('Bill Payment');
                console.log('Found bill payment transaction:', billPaymentTransaction);
            }
        }
    });
});

}); 