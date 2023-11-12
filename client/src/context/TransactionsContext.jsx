import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionsContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const ethereum = window.ethereum;
  if (!ethereum) {
    console.log("Ethereum provider not found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  if (!provider) {
    console.error("Provider is not available.");
    return;
  }

  const signer = provider.getSigner();

  if (!signer) {
    console.error("Signer is not available.");
    return;
  }

  const transactionsContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  console.log(
    {
      provider,
      signer,
      transactionsContract,
    },
    "👋 Connected to the Contract!"
  );
  return transactionsContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = getEthereumContract();

        const availableTransactions = await transactionsContract;

        console.log(availableTransactions);
        const structuredTransactions = availableTransactions.map((transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / (10 ** 18)
        }));

        console.log(structuredTransactions);

        setTransactions(structuredTransactions);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllTransactions();
      } else {
        console.log("No accounts found!");
      }

      console.log(accounts);
    } catch (error) {
      console.log(error);
      throw new Error("Wallet not connected!");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      throw new Error("Unable to connect to the wallet!");
    }
  };

  const checkIfTransactionsExists = async () => {
    try {
      if (ethereum) {
        const transactionsContract = getEthereumContract();
        const transactionCount =
          await transactionsContract.getTransactionCount();

        window.localStorage.setItem("transactionCount", transactionCount);
      }
    } catch (error) {
      console.log(error);

      throw new Error("No transactions exists");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask");

      //get the data from the form...
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract(
        ethereum,
        contractAddress,
        contractABI
      );
      const parsedAmount = ethers.parseEther(amount);
      console.log(parsedAmount);

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", //21000 GWEI
            //! parsedAmount.toString is not sending the right amount
            value: parsedAmount.toString(),
          },
        ],
      });
      //!Not yet functional doing research
      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionCount();

      setTransactionCount(transactionCount.toNumber());
      console.log("Success good job");
    } catch (error) {
      console.log(error);
      throw new Error("Unable to send transactions");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExists();
  }, );

  return (
    <TransactionsContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
        isLoading,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};
