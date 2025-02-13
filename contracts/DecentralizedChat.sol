// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DecentralizedChat {
    struct Message {
        address sender;
        string message;
        uint256 timestamp;
    }

    // Mapping conversationId => array of messages
    mapping(bytes32 => Message[]) private conversations;

    /// @notice Returns a unique conversation identifier for two users (order-independent)
    /// @param user1 Address of the first user.
    /// @param user2 Address of the second user.
    function getConversationId(address user1, address user2) public pure returns (bytes32) {
        // Sort addresses to ensure the conversationId is the same regardless of order.
        if (user1 < user2) {
            return keccak256(abi.encodePacked(user1, user2));
        } else {
            return keccak256(abi.encodePacked(user2, user1));
        }
    }

    /// @notice Emitted when a message is sent.
    event MessageSent(address indexed from, address indexed to, string message, uint256 timestamp);

    /// @notice Sends a message from msg.sender to the specified receiver.
    /// @param receiver The address of the receiver.
    /// @param _message The text of the message.
    function sendMessage(address receiver, string calldata _message) external {
        require(receiver != address(0), "Receiver cannot be the zero address");

        bytes32 conversationId = getConversationId(msg.sender, receiver);
        Message memory newMessage = Message({
            sender: msg.sender,
            message: _message,
            timestamp: block.timestamp
        });
        conversations[conversationId].push(newMessage);

        emit MessageSent(msg.sender, receiver, _message, block.timestamp);
    }

    /// @notice Gets the number of messages in a conversation between two users.
    /// @param user1 Address of one user.
    /// @param user2 Address of the other user.
    function getMessageCount(address user1, address user2) external view returns (uint256) {
        bytes32 conversationId = getConversationId(user1, user2);
        return conversations[conversationId].length;
    }

    /// @notice Retrieves a specific message by index from a conversation.
    /// @param user1 Address of one user.
    /// @param user2 Address of the other user.
    /// @param index The index of the message in the conversation.
    /// @return sender The address of the sender.
    /// @return message The text of the message.
    /// @return timestamp The time the message was sent.
    function getMessage(address user1, address user2, uint256 index)
        external
        view
        returns (address sender, string memory message, uint256 timestamp)
    {
        bytes32 conversationId = getConversationId(user1, user2);
        require(index < conversations[conversationId].length, "Index out of bounds");
        Message storage m = conversations[conversationId][index];
        return (m.sender, m.message, m.timestamp);
    }
}
