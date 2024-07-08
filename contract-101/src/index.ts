import 'reflect-metadata';
import {v4 as uuidv4} from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle'; 
import express from 'express';

class Bank {
    id: string;
    balance: number = 0;
    status: string //set conditions for open, closed, or inactive.
    deposit: string;
    withdraw: string;
    isAccount: boolean;
    createdAt: Date;
    updatedAt: Date | null
}

const bankingActivity = StableBTreeMap<string, Bank>(0);

export default Server(() => {
    const exApp = express();
    exApp.use(express.json());

    // add account
    exApp.post("/bank", (req, res) => {
        const activity: Bank = {id: uuidv4(), createdAt: getCurrentDate(), ...req.body};
        bankingActivity.insert(activity.id, activity);
        const formattedRes = JSON.stringify(activity, null, 2).replace(/\n/g, '\\n')
        res.end(formattedRes)
    });

    //get all transactions
    exApp.get("/transactions", (req, res) => {
        const transactions = Array.from(bankingActivity.values())
        res.json(transactions);
    });

    //get specific txn
    exApp.get("/transactions/:id", (req, res) =>{
        const activityId = req.params.id;
        const account = bankingActivity.get(activityId);
            if ("None" in account) {
                res.status(404).send(`The transaction with id=${activityId} not found`);
            } else {
                res.json(account.Some); 
            }
    });

    //add txn
    exApp.put("/add/:id", (req, res) => {
        const activityId = req.params.id;
        const add = bankingActivity.put(activityId);
        if ("None" in add) {
            res.status(400).send(`Added a transaction with id=${activityId}.`);
        } else {
            res.json(add.Some);
        }

    });
    
    //remove txn
    exApp.delete("/delete/:id", (req, res) => {
        const activityId = req.params.id;
        const withdrawal = bankingActivity.remove(activityId);
        if ("None" in withdrawal) {
            res.status(400).send(`Couldn't delete a transaction with id=${activityId}. Transaction not found`);
        } else {
            res.json(withdrawal.Some);
        }
    });

    //check status
    exApp.get("/status/:id", (req, res) =>  {
        const activityId = req.params.id;
        const account = bankingActivity.get(activityId);
        if ("None" in account) {
            res.status(400).send(`Account with id=${activityId} not found.`);
        } else {
            const transaction = account.Some;
            if (transaction.balance > 0){
                transaction.status = "active";
            } else{
                transaction.status = "inactive";
            }
            res.json({id: transaction.id, transaction.status}); 
        }
    });

    // deposit
    exApp.put("/deposit/:id", (req, res) => {
        const activityId = req.params.id;
        const account = bankingActivity.get(activityId);
        if ("None" in account) {
            res.status(400).send(`Couldn't update a transaction with id=${activityId}. Transaction not found.`)
        } else {
            const transaction = account.Some;
            const depositAmount = req.body.amount;
            transaction.balance += depositAmount;
            transaction.updatedAt = getCurrentDate();
            bankingActivity.insert(transaction.id, transaction);
            res.json(transaction);
        }

    });

    //withdraw
    exApp.put("/withdraw/:id", (req, res) => {
        const activityId = req.params.id;
        const account = bankingActivity.get(activityId);

        if ("None" in account) {
            res.status(400).send(`Couldn't update a transaction with id=${activityId}. Transaction not found.`)
        } else {
            const transaction = account.Some;
            const withdrawAmount = req.body.amount;
            if (transaction.balance >= withdrawAmount){
                transaction.balance -= withdrawAmount;
                transaction.updatedAt = getCurrentDate();
                bankingActivity.insert(transaction.id, transaction);
                res.json(transaction);
                
            } else {
                res.status(400).send(`Insufficient funds for transaction with id=${activityId}!`)
            }
        }
    });


    //balance
    exApp.get("/balance/:id", (req, res) => {
        const activityId = req.params.id;
        const account = bankingActivity.get(activityId);
        if ("None" in account) {
            res.status(404).send(`Transaction with id=${activityId} not found`);
        } else {
            const transaction = account.Some;
            res.json({id: transaction.id, balance: transaction.balance}); 
        }
    });

    return exApp.listen();
});


function getCurrentDate() {
    const timestamp = new Number(ic.time());
    return new Date(timestamp.valueOf() / 1000_000);
}
