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

  // Connect the user's wallet and create a contract instance with a signer (for writing)
  const connectWallet = async () => {
    if (provider) {
      const accounts = await provider.send("eth_requestAccounts", []);
      setCurrentAccount(accounts[0]);
      const signer = await provider.getSigner();
      const _contract = new ethers.Contract(
        contractAddress,
        DecentralizedChatABI,
        signer
      );
      setContract(_contract);
    }
  };

  // Send a message using the smart contract (requires specifying a receiver)
  const sendMessage = async () => {
    if (!contract || !receiver || !message) return;
    try {
      const tx = await contract.sendMessage(receiver, message);
      await tx.wait();
      console.log("Message sent");
      // After sending, refresh the message list
      fetchAllMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Fetch all messages for the current user by querying the MessageSent events
  const fetchAllMessages = async () => {
    if (!provider || !currentAccount) return;
    try {
      // Create a read-only contract instance using the provider
      const readContract = new ethers.Contract(
        contractAddress,
        DecentralizedChatABI,
        provider
      );

      // Create filters for events where currentAccount is the sender or receiver.
      const filterSent = readContract.filters.MessageSent(currentAccount, null);
      const filterReceived = readContract.filters.MessageSent(
        null,
        currentAccount
      );

      // Query the events from the blockchain
      const sentEvents = await readContract.queryFilter(filterSent);
      const receivedEvents = await readContract.queryFilter(filterReceived);

      // Merge and sort the events by timestamp
      const allEvents = [...sentEvents, ...receivedEvents];
      allEvents.sort((a, b) => {
        return Number(a.args.timestamp) - Number(b.args.timestamp);
      });

      const messagesArr = allEvents.map((event) => ({
        sender: event.args.from,
        receiver: event.args.to,
        text: event.args.message,
        timestamp: new Date(Number(event.args.timestamp) * 1000).toLocaleString(),
      }));
      

      setMessages(messagesArr);
    } catch (error) {
      console.error("Error fetching all messages:", error);
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
              placeholder="Receiver Address (for sending messages)"
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
            <button onClick={fetchAllMessages} style={{ padding: "10px 20px" }}>
              Refresh All Messages
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
                    <strong>{msg.sender}</strong> to{" "}
                    <strong>{msg.receiver}</strong> [{msg.timestamp}]:
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
