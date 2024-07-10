# Simple Banking App

- This simple banking app allows you to perform basic operations such as adding an account, retrieving a specific account using a unique ID, depositing, and withdrawing. 
- The balance is updated according to the activity performed.


## How It Works
1. **Create an Account:**
```
Use the POST method to create a new account.
```


2. **Retrieve an Account:**

```
Use the GET method with the unique account ID to retrieve the account details.
```

3. **Deposit and Withdraw:**

```
Use the PUT method to update the balance by depositing or withdrawing funds.
```


**NB: Ensure your request payload contains the amount to deposit or withdraw in the following format:**

```
{"amount": amount to deposit/withdraw}
```


**EXAMPLE:**

```
curl -X PUT http://your-canister-id.localhost:8000/your-appropriate-endpoint/unique-id-of-account -H "Content-type: application/json" -d '{"amount": amount to deposit/withdraw}'
```