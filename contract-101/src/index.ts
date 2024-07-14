import 'reflect-metadata';
import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';
import express, { Request, Response } from 'express';

class Account {
    id: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date | null;
    transactions: Array<string>;

    constructor() {
        this.id = uuidv4();
        this.balance = 0;
        this.createdAt = getCurrentDate();
        this.updatedAt = null;
        this.transactions = [];
    }
}

const bankAccounts = StableBTreeMap<string, Account>(0);

export default Server(() => {
    const app = express();
    app.use(express.json());

    // Add account
    app.post("/accounts", (req: Request, res: Response) => {
        const account = new Account();
        bankAccounts.insert(account.id, account);
        res.status(201).json(account);
    });

    // Get specific account
    app.get("/accounts/account/:id", (req: Request, res: Response) => {
        const accountId = req.params.id;
        const account = bankAccounts.get(accountId);
        if ("None" in account) {
            res.status(404).send(`The account with id=${accountId} not found`);
            return;
        }
        res.json(account.Some);
    });

    // Get all accounts
    app.get("/accounts", (req: Request, res: Response) => {
        const accounts = bankAccounts.values();
        res.json(accounts);
    });

    // Deposit amount to account
    app.put("/deposit/:id", (req: Request, res: Response) => {
        const accountId = req.params.id;
        const depositAmount = req.body.amount;
        
        if (typeof depositAmount !== 'number' || depositAmount <= 0) {
            res.status(400).send(`Invalid deposit amount: ${depositAmount}`);
            return;
        }

        const account = bankAccounts.get(accountId);
        if ("None" in account) {
            res.status(404).send(`Couldn't find an account with id=${accountId}`);
            return;
        }

        const _account = account.Some;
        _account.balance += depositAmount;
        _account.updatedAt = getCurrentDate();
        _account.transactions.push(`Deposited: ${depositAmount}`);
        bankAccounts.insert(accountId, _account);
        res.json(_account);
    });

    // Withdraw amount from account
    app.put("/withdraw/:id", (req: Request, res: Response) => {
        const accountId = req.params.id;
        const withdrawAmount = req.body.amount;

        if (typeof withdrawAmount !== 'number' || withdrawAmount <= 0) {
            res.status(400).send(`Invalid withdrawal amount: ${withdrawAmount}`);
            return;
        }

        const account = bankAccounts.get(accountId);
        if ("None" in account) {
            res.status(404).send(`Couldn't find an account with id=${accountId}`);
            return;
        }

        const _account = account.Some;
        if (_account.balance < withdrawAmount) {
            res.status(400).send(`Account=${accountId} withdrawal failed: Insufficient funds.`);
            return;
        }

        _account.balance -= withdrawAmount;
        _account.updatedAt = getCurrentDate();
        _account.transactions.push(`Withdrew: ${withdrawAmount}`);
        bankAccounts.insert(accountId, _account);
        res.json(_account);
    });

    // Get transactions of an account
    app.get("/accounts/account/:id/transactions", (req: Request, res: Response) => {
        const accountId = req.params.id;
        const account = bankAccounts.get(accountId);
        if ("None" in account) {
            res.status(404).send(`The account with id=${accountId} not found`);
            return;
        }
        res.json(account.Some.transactions);
    });

    return app.listen();
});

function getCurrentDate(): Date {
    const timestamp = Number(ic.time());
    return new Date(timestamp / 1000000);
}