# ICP Challenges


## About
- This repository is for conducting ICP challenges using **TypeScript (Azle)**.


## Challenges
- To see the challenge implementation:

    1. **Clone the repository:**

        ```
        git clone https://github.com/Sandile88/ICP-Challenges.git
        ```
    2. **Navigate to the challenge directory** (e.g. contract-101):

        ```
        cd ICP-Challenges/contract-101
        ```

    3. **Read the README in each directory for more details.**

    
## How to Run a Challenge
1. **Open a terminal and run the following command to start the local DFINITY canister:**

    ```
    dfx start --host 127.0.0.1:8000
    ```

**Note: If you have made changes after the initial start, use the following command to clean and restart:**

    dfx start --host 127.0.0.1:8000 --clean
    
2. **Open a second terminal and deploy the canister:**

    ```
    dfx deploy
    ```
