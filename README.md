# Algorand-dApp-Quick-Start-Template-TypeScript

This is a full-stack starter template for quickly building and testing Web3 ideas on Algorand. It includes:

- Wallet connection
- Send ALGO or USDC payments
- NFT minting (IPFS metadata via Pinata)
- Asset (ASA) creation
- Smart contract interaction demo

Use this template to kickstart your project, prototype ideas, and showcase a working proof-of-concept.

## 🌟 How To Get Started Instructions

### **Fork the Repo:**

To create your own copy of this repository:

a. **Go to the GitHub Repository:**
   - Navigate to the main page which is the current one your on.

b. **Click the "Fork" Button:**
   - In the top-right corner of the page, click the **Fork** button. This will create a copy of the repository under your GitHub account. Feel free to hit the ⭐️ aswell so you can find the Algorand-dApp-Quick-Start-Template-Typescript repo easily!

c. **Wait for the Forking Process to Complete:**
   - GitHub will take a few moments to create the fork. Once complete, you’ll be redirected to your newly created fork.


https://github.com/user-attachments/assets/92e746e1-3143-4769-8a5a-1339e4bd7a14


## 🚀 Start with Codespaces
This is the fastest way to get up and running!

1. **Create a Codespace:**

   - Click the green "Code" button at the top right of your forked repo.
   - Select "Create codespace on main".
   - Once your Codespace is fully loaded, you are ready to go!

Make sure to wait for algokit to be installed automatically - it should only take a few mins max!

2. **While in Codespace:**
   - Enter the workspace 
   <img width="2794" height="1524" alt="image" src="https://github.com/user-attachments/assets/41f25490-1284-4998-b342-27f7a0ffb420" />

3. **While in Workspace:**

   > 💡 **Note:** You can stay in the **root directory** of the project when running these commands.  
   > (This is usually the folder automatically opened when entering the Workspace, so you don’t need to move elsewhere.)

   - Run this command in your terminal:  
     ```bash
     npm run setup
     ```
   - Wait until all installations are completed.

   - **IMPORTANT: Environment Setup**  
     You need to create a new `.env` file in the following path:  

     
     `QuickStartTemplate-contracts/nft_mint_server`
   

     Inside that folder, you will already find a file named `.env.template`.  
     1. Copy all the contents of `.env.template`.  
     2. Create a new file named `.env` in the same folder.  
     3. Paste the copied content into your `.env`.  
     4. Follow the instructions inside `.env.template` to generate your **Pinata API Key** and **Secret Key**, and replace the placeholders in your new `.env` file.

   - **Final Step: Start the project**  
     Once your `.env` file is ready, run the command below to start the project, then open the localhost URL shown in your terminal:

     ```bash
     npm run dev
     ```
  
     After running this command, you’ll see a pop-up in the bottom-right corner (screenshot below). 👉 Click `Set public` and your ready to go!
     <img width="902" height="212" alt="image" src="https://github.com/user-attachments/assets/20178fa4-047b-4337-bd89-663c173a589d" />

   
**Pro Tip:** GitHub Codespaces is included with free accounts but comes with a monthly limit of 60 hours.  

To avoid losing your progress, be sure to **commit your changes regularly** — just like shown in the video demo below — so your updates are saved to your forked repository.

https://github.com/user-attachments/assets/dd452ea1-3070-4718-af34-bea978e208ab


## Project Structure Simplified

**Front-end Files**
- `projects/QuickStartTemplate-frontend/src/` — Frontend code files
- `projects/QuickStartTemplate-frontend/src/Home.tsx` - Homepage (you can design this page)
- `projects/QuickStartTemplate-frontend/src/App.tsx` — Main app layout and routing  
- `projects/QuickStartTemplate-frontend/src/components/Transact.tsx` — Simple transfer ALGO and USDC logic 
- `projects/QuickStartTemplate-frontend/src/components/NFTmint.tsx` — Simple NFT minting interface  
- `projects/QuickStartTemplate-frontend/src/components/Tokenmint.tsx` — Simple token (ASA) minting interface  
- `projects/QuickStartTemplate-frontend/src/components/AppCalls.tsx` — Smart contract interaction demo

**Back-end Files**
- `projects/QuickStartTemplate-contracts/smart_contracts/hello_world/contract.algo.ts` — Example TypeScript smart contract (Default AlgoKit Hello World)  
- `projects/QuickStartTemplate-contracts/nft_mint_server/` — Backend server for NFT minting (contains `.env.template` and where you create your own `.env`)  


## Reference Guide

Need more help? See the Algorand-dApp-Quick-Start-Template Reference Guide for step-by-step instructions, AI prompts, and troubleshooting tips:

[View the guide](https://docs.google.com/document/d/1f_ysbtFOLKM_Tjvey7VCcGYsAzOmyEVmsdC5si936wc/edit?usp=sharing)


