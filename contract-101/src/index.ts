import 'reflect-metadata';
import {v4 as uuidv4} from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle'; 
import express from 'express';

class Account {
    id: string;
    balance: number;
    // status: string; //set conditions for open, or inactive.
    // deposit: string;
    // withdraw: string;
    createdAt: Date;
    updatedAt: Date | null;
    txs: Array<string>
}

const bankAccounts = StableBTreeMap<string, Account>(0);


export default Server(() => {
    const exApp = express();
    exApp.use(express.json());

    // add account
    exApp.post("/accounts", (req, res) => {
        const account: Account = {id: uuidv4(), balance:0, createdAt: getCurrentDate(), updatedAt: getCurrentDate(), txs: []};
        bankAccounts.insert(account.id, account);
        res.json(account);
        // const formattedRes = JSON.stringify(account, null, 2).replace(/\n/g, '\\n')
        // res.end(formattedRes)
    });

// query param and url param
     //get specific txn
     exApp.get("/accounts/account/:id", (req, res) =>{
        const accountId = req.params.id;
        const account = bankAccounts.get(accountId);
            if ("None" in account) {
                res.status(404).send(`The account with id=${accountId} not found`);
                return;
            } 
            
            res.json(account.Some); 
            
    });



    exApp.put("/deposit/:id", (req, res) => {
        const accountId = req.params.id;
        const account = bankAccounts.get(accountId);
        if ("None" in account) {
            res.status(400).send(`Couldn't update a transaction with id=${accountId}. Transaction not found.`)
        } else {
            const _account = account.Some;
            const depositAmount = req.body.amount;
            _account.balance += depositAmount;
            _account.updatedAt = getCurrentDate();
            _account.txs.push(`Deposited : ${depositAmount}`)
            bankAccounts.insert(accountId,  _account);
            res.json(_account);
        }

    });

    exApp.put("/withdraw/:id", (req, res) => {
        const accountId = req.params.id;
        const account = bankAccounts.get(accountId);
        if ("None" in account) {
            res.status(400).send(`Couldn't update a transaction with id=${accountId}. Transaction not found.`);
            return;
        } 
        const _account = account.Some;
        const withdrawAmount = req.body.amount;
            
        if ( _account.balance - withdrawAmount < 0) {
            res.status(500).send(`Account=${accountId} withdrawal failed: Insufficient funds.`)
            return;
        } 
        _account.balance -= withdrawAmount;
        _account.updatedAt = getCurrentDate();
        bankAccounts.insert(accountId,  _account);
        res.json(_account);
        
    });


    return exApp.listen();
});


function getCurrentDate() {
    const timestamp = new Number(ic.time());
    return new Date(timestamp.valueOf() / 1000_000);
}
