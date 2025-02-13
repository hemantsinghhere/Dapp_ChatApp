import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
// Import the contract ABI. Ensure that DecentralizedChatABI.json is generated after compiling your Solidity contract.
import DecentralizedChatABI from "./contracts/DecentralizedChat.ABI.json";

const contractAddress = "0x73e4c2BDE1e9653F670611b7412140466d3a5AD7"; // Replace with your contract's address

function ChatApp() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Initialize provider on component mount using ethers.BrowserProvider (Ethers v6)
  useEffect(() => {
    if (window.ethereum) {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(_provider);
    } else {
      console.error("Please install Metamask");
    }
  }, []);

  // Connect the user's wallet
  const connectWallet = async () => {
    if (provider) {
      const accounts = await provider.send("eth_requestAccounts", []);
      setCurrentAccount(accounts[0]);
      const signer = provider.getSigner();
      const _contract = new ethers.Contract(
        contractAddress,
        DecentralizedChatABI,
        signer
      );
      setContract(_contract);
    }
  };

  // Send a message using the smart contract
  const sendMessage = async () => {
    if (!contract || !receiver || !message) return;
    try {
      const tx = await contract.sendMessage(receiver, message);
      await tx.wait();
      console.log("Message sent");
      // Optionally, refresh the message list after sending
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Fetch messages from the contract for the current conversation
  const fetchMessages = async () => {
    if (!contract || !currentAccount || !receiver) return;
    try {
      // Get the number of messages in the conversation
      const count = await contract.getMessageCount(currentAccount, receiver);
      const messagesArr = [];
      for (let i = 0; i < count; i++) {
        const messageData = await contract.getMessage(
          currentAccount,
          receiver,
          i
        );
        messagesArr.push({
          sender: messageData[0],
          text: messageData[1],
          // Convert timestamp from seconds to a JavaScript Date string
          timestamp: new Date(
            messageData[2].toNumber() * 1000
          ).toLocaleString(),
        });
      }
      setMessages(messagesArr);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Decentralized Chat App</h1>
      {currentAccount ? (
        <div>
          <p>Connected as: {currentAccount}</p>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Receiver Address"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              style={{ width: "300px", padding: "8px", marginRight: "10px" }}
            />
            <textarea
              placeholder="Enter message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: "300px",
                height: "100px",
                padding: "8px",
                marginRight: "10px",
              }}
            ></textarea>
            <button onClick={sendMessage} style={{ padding: "10px 20px" }}>
              Send Message
            </button>
          </div>
          <div>
            <button onClick={fetchMessages} style={{ padding: "10px 20px" }}>
              Refresh Messages
            </button>
          </div>
          <div style={{ marginTop: "20px" }}>
            <h2>Chat History</h2>
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}
                >
                  <p>
                    <strong>{msg.sender}</strong> [{msg.timestamp}]:
                  </p>
                  <p>{msg.text}</p>
                </div>
              ))
            ) : (
              <p>No messages yet.</p>
            )}
          </div>
        </div>
      ) : (
        <button onClick={connectWallet} style={{ padding: "10px 20px" }}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default ChatApp;
