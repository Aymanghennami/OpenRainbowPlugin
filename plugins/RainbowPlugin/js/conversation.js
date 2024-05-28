import rainbowSDK from '../rainbow-web-sdk/src/rainbow-sdk.min.js';

export function getRecentConversations() {

    let totalInvitations = 0;
    let totalMissedMessages = 0;

    // Get recent conversations and populate the flipper flesh
    rainbowSDK.conversations.getAllConversations()
        .then(function(conversations) {
            console.log("we're getting the convos");

            const flipperFlesh = document.getElementById('recentConversationsList');
            flipperFlesh.innerHTML = '';
            //flipperFlesh.style.display = 'block';

            conversations.forEach(conversation => {
                console.log("conversations", conversation)

                if (conversation.missedCounter > 0) {
                    totalMissedMessages += conversation.missedCounter;
                }
                if (conversation.type === 0) {
                    displayOneToOneConversation(conversation.dbId);
                }


                if (conversation.type === 1) {
                    displayBubbleConversation(conversation.dbId);
                }
            });

            totalInvitations = getInvitationsCount();
            sentCounts(totalInvitations, totalMissedMessages);
        })
        .catch(function(error) {
            console.error('Error getting conversations:', error);

        });
    updateNotificationCounter();

}

function displayOneToOneConversation(conversationId) {
    // Get contact ID from the conversation
    const conversation = rainbowSDK.conversations.getConversationById(conversationId);


    if (!conversation) {
        console.error('Conversation data not found');
        return;
    }
console.log("Fetching contact for conversation:", conversation);

    rainbowSDK.contacts.getContactById(conversation.contact.dbId)
        .then(contact => {
            var contactName = contact.firstname + ' ' + contact.lastname;
            var contactAvatar = contact.avatar;
            
            console.log("Fetched contact:", contact);

            // Create the conversation item container
            var conversationItem = document.createElement('div');
            conversationItem.classList.add('conversation-item');
            conversationItem.id = conversation.dbId;

            // Create the avatar container
            var avatarContainer = document.createElement('div');
            avatarContainer.classList.add('avatar-container');

            // Create the avatar element
            var avatarImg = document.createElement('img');
            avatarImg.classList.add('contact-avatar');
            avatarImg.alt = contactName;

            if (contactAvatar) {
                avatarImg.src = contactAvatar.src;
            } else {
                var initials = contactName.split(' ').map(part => part.charAt(0)).join('');
                avatarImg.src = `https://ui-avatars.com/api/?name=${initials}`;
            }

            // Create the status icon element
            var statusIcon = document.createElement('i');
            statusIcon.classList.add('status-icon');
            
            // Clear any existing status classes
            console.log("Contact status before setting icon:", contact.status);

            // Check the contact status and add the appropriate icon
            switch (contact.status){
                    case 'online':
                        statusIcon.classList.add('fas', 'fa-check-circle', 'online');
                        break;
                    case 'away':
                        statusIcon.classList.add('fas', 'fa-moon', 'away');
                        break;
                    case 'dnd':
                        statusIcon.classList.add('fas', 'fa-minus-circle', 'dnd');
                        break;
                    case 'unknown':
                        statusIcon.classList.add('fas', 'fa-circle', 'offline');
                        break;
                    case 'offline':
                    default:
                        statusIcon.classList.add('fas', 'fa-circle', 'offline');
                        break;
                }
                
                 console.log("Status icon classes after setting:", statusIcon.className);
            // Append the avatar and status indicator to the avatar container
            avatarContainer.appendChild(avatarImg);
            avatarContainer.appendChild(statusIcon);

            // Create the text container
            var textContainer = document.createElement('div');
            textContainer.classList.add('text-container');

            // Create the name element
            var nameSpan = document.createElement('span');
            nameSpan.classList.add('contact-name');
            nameSpan.textContent = contactName;

            // Create the last message element
            var lastMessageSpan = document.createElement('span');
            lastMessageSpan.classList.add('last-message'); // Add CSS class for styling

            // Retrieve the last message text
            var lastMessage = conversation.lastMessageText;

            // Update last message text if deleted (handle both null and empty string)
            if (!lastMessage) {
                lastMessageSpan.textContent = "Message deleted";
            } else {
                // Truncate the message if it's longer than 30 characters
                var truncatedMessage = lastMessage.length > 30 ? lastMessage.substring(0, 30) + '...' : lastMessage;
                lastMessageSpan.textContent = truncatedMessage;
            }

            // Create the missed messages count element
            var missedCountSpan = document.createElement('span');
            missedCountSpan.classList.add('missed-count');
            if (conversation.missedCounter > 0) {
                missedCountSpan.style.display = 'inline-block';
                missedCountSpan.textContent = conversation.missedCounter;
            }

            // Append name, last message, and missed count to the text container
            textContainer.appendChild(nameSpan);
            textContainer.appendChild(lastMessageSpan);


            // Append avatar container and text container to the conversation item
            conversationItem.appendChild(avatarContainer);
            conversationItem.appendChild(textContainer);
            conversationItem.appendChild(missedCountSpan);



            // Make the conversation item clickable
            conversationItem.addEventListener('click', function() {
                var contactId = contact.dbId;
                console.log("here is the conv one to one ID", conversation.dbId);
                handleConversationClick(conversation.dbId);

                // Add active class to the selected item and remove from others
                document.querySelectorAll('.conversation-item').forEach(item => {
                    item.classList.remove('active');
                });
                conversationItem.classList.add('active');
                rainbowSDK.im.markAllMessagesFromConversationAsRead(conversation.dbId)

                console.log("Messages marked as read:");

                updateMissedMessagesCounter(conversationItem, 0);

                handleDisplayContact(contactId);
            });
            // Append the conversation item to the flipper flesh
            document.getElementById('recentConversationsList').appendChild(conversationItem);
        })
        .catch(err => {
            console.log('[Hello World] :: Something went wrong while getting the contactById..', err);
        });
}

function displayBubbleConversation(conversationId) {
    
        // Get contact ID from the conversation
    const conversation = rainbowSDK.conversations.getConversationById(conversationId);


    if (!conversation) {
        console.error('Conversation data not found');
        return;
    }
    
    // Create the conversation item
    var conversationItem = document.createElement('div');
    conversationItem.classList.add('conversation-item');
    conversationItem.id = conversation.dbId;

    // Create the avatar container
    var avatarContainer = document.createElement('div');
    avatarContainer.classList.add('avatar-container');

    // Create the avatar element
    var avatarImg = document.createElement('img');
    avatarImg.classList.add('contact-avatar');

    // Set the avatar source
    if (conversation.room.avatar) {
        avatarImg.src = conversation.room.avatar;
    } else {
        // If no avatar, use the first letter of the room name as initials
        var initials = conversation.room.name.charAt(0).toUpperCase();
        avatarImg.src = `https://ui-avatars.com/api/?name=${initials}`;
    }

    avatarContainer.appendChild(avatarImg);
    // Create the text container
    var textContainer = document.createElement('div');
    textContainer.classList.add('text-container');

    // Create the name element
    var nameSpan = document.createElement('span');
    nameSpan.classList.add('contact-name');
    nameSpan.textContent = conversation.room.name;

    var lastMessage = conversation.lastMessageText;

    var truncatedMessage = lastMessage.length > 30 ? lastMessage.substring(0, 30) + '...' : lastMessage;

    // Create the last message element
    var lastMessageSpan = document.createElement('span');
    lastMessageSpan.classList.add('last-message');
    lastMessageSpan.textContent = truncatedMessage;

    // Append name, last message, and missed count to the text container
    textContainer.appendChild(nameSpan);
    textContainer.appendChild(lastMessageSpan);

    // Create the missed messages count element
    var missedCountSpan = document.createElement('span');
    missedCountSpan.classList.add('missed-count');
    if (conversation.missedCounter > 0) {
        missedCountSpan.style.display = 'inline-block';
        missedCountSpan.textContent = conversation.missedCounter;
    }

    // Append avatar and name to the conversation item
    conversationItem.appendChild(avatarContainer);
    conversationItem.appendChild(textContainer);
    conversationItem.appendChild(missedCountSpan);


    // Make the conversation item clickable
    conversationItem.addEventListener('click', function() {

        handleBubbleClick(conversation.dbId);
        //handleDisplayContact(conversation.room.dbId);
        console.log("here is the conversation bubble ID", conversation.dbId);
        // Add active class to the selected item and remove from others
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        conversationItem.classList.add('active');
        rainbowSDK.im.markAllMessagesFromConversationAsRead(conversation.dbId)

        console.log("Messages marked as read:");

        updateMissedMessagesCounter(conversationItem, 0);

        handleDisplayBubble(conversation.room.dbId);

    });

    // Append the conversation item to the flipper flesh
    document.getElementById('recentConversationsList').appendChild(conversationItem);

}

function updateMissedMessagesCounter(conversationItem, count) {
  let missedCountSpan = conversationItem.querySelector('.missed-count');
  if (missedCountSpan) {
    // Update the count directly
    missedCountSpan.textContent = count;

    // Toggle visibility based on the count
    missedCountSpan.style.display = count > 0 ? 'inline-block' : 'none'; // Concise conditional expression
  }
}


function updateLastMessage(conversationId, newMessage) {
    const conversationItem = document.getElementById(conversationId);
    console.log("trying to update last message")
    if (conversationItem) {
        const lastMessageElement = conversationItem.querySelector('.last-message');
        lastMessageElement.textContent = newMessage;
    }
}

let onNewMessageReceived = function (event) {
  let message = event.detail.message;
  let conversation = event.detail.conversation;
  console.log('the conversation', conversation);
  console.log('You just received this Message:', message.data);

  // Get conversation item
  let conversationItem = document.getElementById(conversation.dbId);

  // Send a read receipt only if conversation is not active
  if (!conversationItem.classList.contains('active')) {
    rainbowSDK.im.markMessageFromConversationAsRead(conversation.dbId, message.id);
  }


  // Update missed messages counter
  let currentCount = parseInt(conversationItem.querySelector('.missed-count').textContent) || 0;
  if (conversation.type === 0) { // One-to-one conversation
    if (!conversationItem.classList.contains('active')) {
      currentCount++;
    }
  } else if (conversation.type === 1) { // Group (bubble) conversation
    if (!conversationItem.classList.contains('active')) {
      currentCount++;
    }
  }
  updateMissedMessagesCounter(conversationItem, currentCount);

  // Update last message
  updateLastMessage(conversation.dbId, message.data);

  // (Optional) Handle conversation click for displaying messages
  if (conversationItem.classList.contains('active')) {
    if (conversation.type === 0) {
      handleConversationClick(conversation.dbId);
    } else if (conversation.type === 1) {
      handleBubbleClick(conversation.dbId);
    }
  }
};

document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, onNewMessageReceived)

function getInvitationsCount() {
    const invitations = rainbowSDK.contacts.getInvitationsReceived();
    const count = invitations.length;
    return count;
}
// Function to update notification counter
export function updateNotificationCounter() {
    const invitations = rainbowSDK.contacts.getInvitationsReceived();
    const count = invitations.length;
    var counter = document.getElementById("notificationCounter");
    counter.innerText = count;
    if (count > 0) {
        counter.classList.remove("hide");
    } else {
        counter.classList.add("hide");
    }
}

function sentCounts(invitationCount, messagesCount) {

    const URL = window.WebsiteURL;
    jQuery.ajax({
        url: URL + 'plugins/RainbowPlugin/jsp/app/LoginInfo.jsp',
        type: 'POST',
        data: {
            invitationsCountParam: invitationCount,
            messagesCountParam: messagesCount
        },
        dataType: 'text', // Change dataType to text since the response is plain text
        success: function(response) {
            // Handle success scenario
            if (response === "Success") {
                console.log("Counts Sent successfully.");
                // Perform any additional actions on success, such as redirection or updating UI elements
            } else {
                console.error("Failed to save counts.");
            }
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });


}

function isSentByMe(conversationId) {
    // Get conversation history messages
    rainbowSDK.im.getMessagesFromConversation(conversationId, 30)
        .then(conversation => {
            var messages = conversation.messages;
            console.log("here are the messages " + messages)

        })
        .catch(error => {

            console.error('Error getting conversation history:', error);
        });

}

// function to handle the onlick of bubble conversation
function handleBubbleClick(conversationId) {
    // Get the main content element
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) {
        console.error('Element with ID mainContent not found');
        return;
    }

    const myUserId = rainbowSDK.contacts.getConnectedUser().dbId;

    // Get chat box and input container
    const chatBox = document.getElementById('chatBox');
    const inputContainer = document.querySelector('.input-container');
    if (!chatBox || !inputContainer) {
        console.error('Chat box or input container not found');
        return;
    }

    // Clear previous content in the chat box
    chatBox.innerHTML = '';

    chatBox.style.display = 'block';
    inputContainer.style.display = 'flex';

    // Get conversation data
    const conversationData = rainbowSDK.conversations.getConversationById(conversationId);
    if (!conversationData) {
        console.error('Conversation data not found');
        return;
    }

    // Get conversation history messages
    rainbowSDK.im.getMessagesFromConversation(conversationData.dbId, 30)
        .then(conversation => {
            console.log("New conversation", conversation);
            const messages = conversation.messages;
            console.log("Messages:", messages);

            if (Array.isArray(messages) && messages.length > 0) {
                messages.forEach(message => {
                    console.log("Message:", message);
                    const isMe = message.from.dbId === myUserId;
                    displayMessage(conversationData.dbId,message, isMe);
                });
            chatBox.scrollTop = chatBox.scrollHeight;
            
            } else {
                console.log('No messages found for this conversation.');
            }
        })
        .catch(error => {
            console.error('Error getting conversation history:', error);
        });

    // Add event listener to send button

    const sendMessageBtn = document.getElementById('sendMessageBtn');
    if (!sendMessageBtn) {
        console.error('Send message button not found');
        return;
    }

    sendMessageBtn.addEventListener('click', function() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) {
            console.error('Message input field not found');
            return;
        }
        const message = messageInput.value.trim();
        if (message !== '') {
            chatWithBubble(conversationId, message);
            messageInput.value = '';
        }
    });
}

function chatWithBubble(conversationId, message) {

    console.log('Starting chat with contact with ID :', contactId);

    const conversationData = rainbowSDK.conversations.getConversationById(conversationId);

    rainbowSDK.sendMessageToBubble(conversationData.room, message)
        .then(message => {
            console.log("here is ", message);
            handleBubbleClick(conversationData.dbId);
        })
        .catch(error => {

            console.log("soemthing went wrong while sending a message to the bubble", error);
        })
}

// Function to handle conversation click
export function handleConversationClick(conversationId) {

    // Get the main content element
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) {
        console.error('Element with ID mainContent not found');
        return;
    }

    const myUserId = rainbowSDK.contacts.getConnectedUser().dbId;

    // Get chat box and input container
    const chatBox = document.getElementById('chatBox');
    const inputContainer = document.querySelector('.input-container');
    if (!chatBox || !inputContainer) {
        console.error('Chat box or input container not found');
        return;
    }

    // Clear previous content in the chat box
    chatBox.innerHTML = '';

    chatBox.style.display = 'block';
    inputContainer.style.display = 'flex';

    // Get contact ID from the conversation
    const conversationData = rainbowSDK.conversations.getConversationById(conversationId);


    if (!conversationData) {
        console.error('Conversation data not found');
        return;
    }

    const contactId = conversationData.contact.dbId;

    displayClickedContact(contactId);

    rainbowSDK.im.getMessagesFromConversation(conversationData.dbId, 30)
        .then(conversation => {
            console.log("new conversation", conversation);
            const messages = conversation.messages;
            console.log("Messages:", messages);

            if (Array.isArray(messages) && messages.length > 0) {
                messages.forEach(message => {
                    console.log("Message:", message);
                    const isMe = message.from.dbId === myUserId;
                    displayMessage(conversation.dbId,message, isMe);
                });
                
                // Scroll chat box to bottom
                
                chatBox.scrollTop = chatBox.scrollHeight; // Set scroll position to bottom
            } else {
                console.log('No messages found for this conversation.');
            }
        })
        .catch(error => {
            console.error('Error getting conversation history:', error);
        });

    const sendMessageBtn = document.getElementById('sendMessageBtn');
    if (!sendMessageBtn) {
        console.error('Send message button not found');
        return;
    }

    sendMessageBtn.addEventListener('click', function() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) {
            console.error('Message input field not found');
            return;
        }
        const message = messageInput.value.trim();
        if (message !== '') {
            chatWithContact(contactId, message);
            messageInput.value = '';
        }
    });

}

function displayClickedContact(contactId) {
  rainbowSDK.contacts.getContactById(contactId)
    .then(function (contact) {
      console.log('The contact found:', contact);
      if (contact) {
        const contactInfoDiv = document.getElementById('contactInfo');
        contactInfoDiv.style.display = 'flex';
        contactInfoDiv.innerHTML = ''; // Clear previous content

        // Create and update avatar container and image
        const avatarContainer = document.createElement('div');
        avatarContainer.classList.add('clicked-avatar-container');

        const avatarImg = document.createElement('img');
        avatarImg.classList.add('contact-members-avatar');
        if (contact.avatarSrc) {
          avatarImg.src = contact.avatarSrc;
        } else {
          const initials = `${contact.firstname.charAt(0)}${contact.lastname.charAt(0)}`;
          avatarImg.src = `https://ui-avatars.com/api/?name=${initials}`;
        }
        avatarContainer.appendChild(avatarImg);

        // Create and update contact details container
        const contactDetails = document.createElement('div');
        contactDetails.classList.add('clicked-contact-details');

        // Create and update name element
        const nameElement = document.createElement('div');
        nameElement.classList.add('clicked-contact-name');
        nameElement.textContent = contact.firstname + ' ' + contact.lastname;
        contactDetails.appendChild(nameElement);

        // Create status container
        const statusContainer = document.createElement('div');
        statusContainer.classList.add('status-container');

        // Create and update status icon (logic remains unchanged)
        const statusIcon = document.createElement('div');
        statusIcon.classList.add('clicked-status-icon');
        switch (contact.status) {
          case 'online':
            statusIcon.classList.add('fas', 'fa-check-circle', 'online');
            break;
          case 'away':
            statusIcon.classList.add('fas', 'fa-moon', 'away');
            break;
          case 'dnd':
            statusIcon.classList.add('fas', 'fa-minus-circle', 'dnd');
            break;
          case 'unknown':
          case 'offline':
          default:
            statusIcon.classList.add('fas', 'fa-circle', 'offline');
            break;
        }
        
        statusContainer.appendChild(statusIcon);

        // Create and update status text conditionally
        const statusText = document.createElement('div');
        statusText.classList.add('clicked-status-text');
        statusText.textContent = getStatusText(contact.status); // Only status text for online/dnd

        // Append status text conditionally
        if (contact.status === 'away' || contact.status === 'offline') {
          const statusDuration = calculateStatusDuration(contact.lastSeen) || 'Last Seen: Unknown';
          statusText.textContent += ` - ${statusDuration}`;
        }
        statusContainer.appendChild(statusText);

        // Append status container to contact details
        contactDetails.appendChild(statusContainer);

        // Append elements to contactInfoDiv
        contactInfoDiv.appendChild(avatarContainer);
        contactInfoDiv.appendChild(contactDetails);

        // Create actions container and icons (unchanged)
        const actions = document.createElement('div');
        actions.classList.add('actions');
        const ellipsisIcon = document.createElement('i');
        ellipsisIcon.classList.add('fas', 'fa-ellipsis-v');
        const chevronIcon = document.createElement('i');
        chevronIcon.classList.add('fas', 'fa-chevron-right');
        actions.appendChild(ellipsisIcon);
        actions.appendChild(chevronIcon);

        contactInfoDiv.appendChild(actions);
      } else {
        console.log('Contact not found');
      }
    })
    .catch(function (err) {
      console.log('Error getting contact by ID:', err);
    });
}

function getStatusText(status) {
    switch (status) {
        case 'online':
            return 'Online';
        case 'unknown':
            return 'offline';
        case 'away':
            return 'away';
        case 'dnd':
            return 'Do not disturb';
        case 'offline':
        default:
            return 'Offline';
    }
}


// Helper function to calculate status duration (example implementation)
function calculateStatusDuration(lastSeenTimestamp) {
    const now = new Date().getTime();
    const lastSeenTime = new Date(lastSeenTimestamp).getTime();
    const diffInHours = Math.floor((now - lastSeenTime) / (1000 * 60 * 60));
    return `${diffInHours} hours ago`;
}

// Function to display message
function displayMessage(conversationId,message, isMe) {
    
    const conversation = rainbowSDK.conversations.getConversationById(conversationId);
    const chatBox = document.getElementById('chatBox');

    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    // Append message element to avatar-message container
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
if (message.deleted) {
    if (isMe) {
      messageElement.textContent = 'You deleted this message';
      // Update last message only if the deleted message content matches last message text
      if (conversation.lastMessageText === message.data) {
        updateLastMessage(conversation.dbId, "Message deleted");
      }
    } else {
      messageElement.textContent = 'This message was deleted';
      // Update last message only if the deleted message content matches last message text
      if (conversation.lastMessageText === message.data) {
        updateLastMessage(conversation.dbId, "Message deleted");
      }
    }
  } else {
      
    messageElement.textContent = message.data;
  }
    
  
    // Create message metadata element (date)
    const metadataElement = document.createElement('div');
    metadataElement.classList.add('message-metadata');
    
  // Create receipt status indicator (applicable for all messages)

    // Function to format date as "May 21st 2:42 PM"
    function formatDate(date) {
        const options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        const formattedDate = new Date(date).toLocaleString('en-US', options);
        const day = new Date(date).getDate();
        let daySuffix;

        if (day > 3 && day < 21) {
            daySuffix = 'th';
        } else {
            switch (day % 10) {
                case 1: daySuffix = "st"; break;
                case 2: daySuffix = "nd"; break;
                case 3: daySuffix = "rd"; break;
                default: daySuffix = "th";
            }
        }

        return formattedDate.replace(day, day + daySuffix);
    }

    // Create message date element
    const messageDate = document.createElement('span');
    messageDate.classList.add('message-date');
    messageDate.textContent = formatDate(message.date);

    // Apply different styles based on sender (me or not me)
    if (isMe) {
        messageElement.classList.add('sent-message');
        messageElement.id = 'sentMessage'; // Add ID for sent message
        metadataElement.classList.add('sent-metadata');
        
    // Create receipt status indicator (only for sent messages)
    const receiptStatusIndicator = document.createElement('span');
    receiptStatusIndicator.classList.add('receipt-status');

    // Initial receipt status update
    updateReceiptStatus(receiptStatusIndicator, message.receiptStatus);

    // Append message date and receipt status to metadata element
    metadataElement.appendChild(messageDate);
    metadataElement.appendChild(receiptStatusIndicator);

        // Append message element to message container
        messageContainer.appendChild(messageElement);

        messageContainer.append(metadataElement);

    } else {

        messageElement.classList.add('received-message');
        messageElement.id = 'receivedMessage'; // Add ID for received message

        metadataElement.classList.add('recived-metadata');
        // Append avatar container to message container for received messages
        // Append message date to metadata element

        // Create a container for avatar and message
        const avatarMessageContainer = document.createElement('div');
        avatarMessageContainer.classList.add('avatar-message-container');

        // Create the avatar element
        const avatarImg = document.createElement('img');
        avatarImg.classList.add('contact-members-avatar');
        avatarImg.alt = message.from.name;

        if (message.from.avatarSrc) {
            avatarImg.src = message.from.avatarSrc;
        } else {
            // If no avatar, use initials
            const initials = `${message.from.firstname.charAt(0)}${message.from.lastname.charAt(0)}`;
            avatarImg.src = `https://ui-avatars.com/api/?name=${initials}`;
        }

        // Append the avatar image to avatar container
        avatarMessageContainer.appendChild(avatarImg);

        avatarMessageContainer.appendChild(messageElement);

        // Append message date to metadata element
        metadataElement.appendChild(messageDate);

        // Append avatar-message container to message container
        messageContainer.appendChild(avatarMessageContainer);
        messageContainer.append(metadataElement);
    }

    messageContainer.id = `message-container-${message.id}`;
    // Append message container to chat box
    chatBox.appendChild(messageContainer);
    // Set unique ID for message element

}

// Function to handle new receipt events
let onNewMessageReceiptReceived = function(event) {

  let message = event.detail.message;
  let conversation = event.detail.conversation;
  let type = event.detail.evt;
  
  console.log("here is the type of the recieved reciept",type)

  switch (type) {
    case "server":
      updateMessageReceiptStatus(message.id, 3);
      break;
    case "received":
      updateMessageReceiptStatus(message.id, 4);
      break;
    case "read":
      updateMessageReceiptStatus(message.id, 5);
      break;
    default:
      break;
  }
};

// Event listener for new receipt events
document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMRECEIPTRECEIVED, onNewMessageReceiptReceived);


// Function to update the receipt status of a message by its ID
function updateMessageReceiptStatus(messageId, receiptStatus) {
  // Find the message container element based on message ID (assuming a unique ID)
  const messageContainer = document.getElementById(`message-container-${messageId}`);
  if (messageContainer) {
    // Find the metadata element within the message container
    const metadataElement = messageContainer.querySelector('.message-metadata');
    if (metadataElement) {
      // Find the receipt status indicator within the metadata element
      const receiptStatusIndicator = metadataElement.querySelector('.receipt-status');
      if (receiptStatusIndicator) {
        updateReceiptStatus(receiptStatusIndicator, receiptStatus);
      }
    }
  }
}


function updateReceiptStatus(receiptStatusIndicator, receiptStatus) {
    console.log("updating the status reciepts ");
    switch (receiptStatus) {
        case 0:
            receiptStatusIndicator.style.color = 'gray';
            receiptStatusIndicator.textContent = '🕓'; // No receipt received yet
            break;
        case 1:
            receiptStatusIndicator.style.color = 'gray';
            receiptStatusIndicator.textContent = '❓'; // No receipt received after a while, the server doesn't answer
            break;
        case 2:
            receiptStatusIndicator.style.color = 'blue';
            receiptStatusIndicator.textContent = '🔄'; // Receipt in progress
            break;
        case 3:
            receiptStatusIndicator.style.color = 'gray';
            receiptStatusIndicator.textContent = '✔'; // The server has confirmed the reception of the message
            break;
        case 4:
            receiptStatusIndicator.style.color = 'gray';
            receiptStatusIndicator.textContent = '✔✔'; // The message has been received but not read
            break;
        case 5:
            receiptStatusIndicator.style.color = 'blue';
            receiptStatusIndicator.textContent = '✔✔'; // The message has been read
            break;
        default:
            receiptStatusIndicator.style.color = 'gray';
            receiptStatusIndicator.textContent = '❓'; // Unknown status
            break;
    }
}
// Function to start a chat with the specified contact
function chatWithContact(contactId, message) {
    console.log('Starting chat with contact with ID :', contactId);

    rainbowSDK.contacts.getContactById(contactId)
        .then(function(selectedContact) {
            console.log('the contact found:', selectedContact);
            if (selectedContact) {
                // Contact found, do something with it
                var associatedConversation = null;
                rainbowSDK.conversations.getConversationByContactId(selectedContact.dbId)
                    .then(function(conversation) {
                        associatedConversation = conversation;
                        var lastMessage = associatedConversation.lastMessageText;
                        console.log('Last message:', lastMessage);
                        // Send an answer
                        rainbowSDK.im.sendMessageToConversation(associatedConversation.dbId, message)
                        // Reload conversation after sending message
                        handleConversationClick(associatedConversation.dbId);
                          // Update last message
                          
                        updateLastMessage(associatedConversation.dbId, message);
                    })
                    .catch(function(err) {
                        console.log('Error getting the associated conversation:', err);
                        reject(err); // Reject the promise if there's an error getting the conversation
                    });
            } else {
                console.log('Contact not found');
                reject(new Error('Contact not found')); // Reject the promise if the contact is not found
            }
        })
        .catch(function(err) {
            console.log('Error getting contact by ID:', err);
            reject(err); // Reject the promise if there's an error getting the contact by ID
        });
}



function handleDisplayContact(contactId) {
    const detailContact = document.getElementById('detailContact');
    detailContact.style.display = 'flex';



    // Initially display the profile section
    displayProfile(contactId);

    // Set up event listeners for section icons
    document.getElementById('profileSection').addEventListener('click', () => {
        setActiveSection('profileSection');
        displayProfile(contactId);
    });
    document.getElementById('callsSection').addEventListener('click', () => {
        setActiveSection('callsSection');
        displayCalls(contactId);
    });
    document.getElementById('filesSection').addEventListener('click', () => {
        setActiveSection('filesSection');
        displayFiles(contactId);
    });
}

// Function to set the active section
function setActiveSection(sectionId) {
    const sections = document.querySelectorAll('.user-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Function to display profile content
function displayProfile(contactId) {
    const detailContact = document.getElementById('detailContact');
    detailContact.innerHTML = '';

    rainbowSDK.contacts.getContactById(contactId)
        .then(contact => {
            const avatar = document.createElement('img');
            avatar.src = contact.avatar.src || ''; // Use contact avatar if available, otherwise empty string
            avatar.alt = 'Contact Avatar';
            avatar.classList.add('contact-detail-avatar');
            detailContact.appendChild(avatar);

            const buttonsDiv = document.createElement('div');
            buttonsDiv.classList.add('contact-buttons');

            const favoriteButton = document.createElement('button');
            favoriteButton.textContent = 'Favorite';
            favoriteButton.classList.add('favorite-button');
            favoriteButton.addEventListener('click', () => {
                Favorite(contact.dbId, 'user');
            });
            buttonsDiv.appendChild(favoriteButton);

            const inviteButton = document.createElement('button');
            inviteButton.textContent = 'Invite';
            inviteButton.classList.add('invite-button');
            inviteButton.addEventListener('click', () => {
                inviteContact(contact.dbId);
            });
            buttonsDiv.appendChild(inviteButton);

            detailContact.appendChild(buttonsDiv);

            const nameCompanyDiv = document.createElement('div');
            nameCompanyDiv.classList.add('name-company-container');

            const fullName = document.createElement('h2');
            fullName.textContent = `${contact.firstname} ${contact.lastname}`;
            fullName.classList.add('contact-display-name');
            nameCompanyDiv.appendChild(fullName);

            const organizerCompany = document.createElement('div');
            organizerCompany.textContent = contact.company.filterName; // Adjust according to available data
            organizerCompany.classList.add('contact-company');
            nameCompanyDiv.appendChild(organizerCompany);

            detailContact.appendChild(nameCompanyDiv);

            const contactInfoDiv = document.createElement('div');
            contactInfoDiv.classList.add('contact-information');

            const infoTitle = document.createElement('h3');
            infoTitle.textContent = 'Contact Information';
            contactInfoDiv.appendChild(infoTitle);

            const emailDiv = document.createElement('div');
            emailDiv.classList.add('contact-info-item');
            const emailIcon = document.createElement('i');
            emailIcon.classList.add('fas', 'fa-envelope');
            const emailLabel = document.createElement('span');
            emailLabel.textContent = ' Work Email:';
            emailLabel.classList.add('info-label');
            const emailValue = document.createElement('span');
            emailValue.textContent = contact.loginEmail || '';
            emailDiv.appendChild(emailIcon);
            emailDiv.appendChild(emailLabel);
            emailDiv.appendChild(emailValue);
            contactInfoDiv.appendChild(emailDiv);

            const locationDiv = document.createElement('div');
            locationDiv.classList.add('contact-info-item');
            const locationIcon = document.createElement('i');
            locationIcon.classList.add('fas', 'fa-map-marker-alt');
            const locationLabel = document.createElement('span');
            locationLabel.textContent = ' Country:';
            locationLabel.classList.add('info-label');
            const locationValue = document.createElement('span');
            locationValue.textContent = contact.country || 'N/A';
            locationDiv.appendChild(locationIcon);
            locationDiv.appendChild(locationLabel);
            locationDiv.appendChild(locationValue);
            contactInfoDiv.appendChild(locationDiv);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove from Network';
            removeButton.classList.add('remove-from-network-button');
            removeButton.addEventListener('click', () => {
                removeFromNetwork(contact.dbId);
            });
            contactInfoDiv.appendChild(removeButton);

            detailContact.appendChild(contactInfoDiv);
            detailContact.style.display = 'block';
        })
        .catch(err => {
            console.error('Error getting contact info:', err);
        });
}

// Function to display calls content
function displayCalls(contactId) {
    const detailContact = document.getElementById('detailContact');
    detailContact.innerHTML = ''; // Clear previous content

    // Create and append content related to calls
    const callsDiv = document.createElement('div');
    callsDiv.classList.add('section-content');
    callsDiv.textContent = `Displaying calls for contact ID: ${contactId}`;
    detailContact.appendChild(callsDiv);
}

// Function to display files content
function displayFiles(contactId) {
    const detailContact = document.getElementById('detailContact');
    detailContact.innerHTML = ''; // Clear previous content

    // Create and append content related to files
    const filesDiv = document.createElement('div');
    filesDiv.classList.add('section-content');
    filesDiv.textContent = `Displaying files for contact ID: ${contactId}`;
    detailContact.appendChild(filesDiv);
}

// Function to handle the onclick of bubble conversation
function handleDisplayBubble(conversationId) {
    const detailContact = document.getElementById('detailContact');
    detailContact.style.display = 'flex';

    // Get conversation data
    const conversationData = rainbowSDK.conversations.getConversationById(conversationId);
    console.log("Here is the room", conversationData.room);

    // Initially display the profile section
    displayRoomProfile(conversationData);

    // Set up event listeners for section icons
    document.getElementById('profileSection').addEventListener('click', () => {
        setActiveSection('profileSection');
        displayRoomProfile(conversationData.room);
    });
    document.getElementById('callsSection').addEventListener('click', () => {
        setActiveSection('callsSection');
        displayRoomCalls(conversationData.room);
    });
    document.getElementById('filesSection').addEventListener('click', () => {
        setActiveSection('filesSection');
        displayRoomFiles(conversationData.room);
    });
}

// Function to display profile content
function displayRoomProfile(conversationData) {
    const detailContact = document.getElementById('detailContact');
    detailContact.innerHTML = '';

    // Room avatar
    const roomAvatar = document.createElement('img');
    roomAvatar.classList.add('room-avatar');

    // Set the avatar source
    if (conversationData.room.avatar) {
        roomAvatar.src = conversationData.room.avatar;
    } else {
        // If no avatar, use the first letter of the room name as initials
        const initials = conversationData.room.name.charAt(0).toUpperCase();
        roomAvatar.src = `https://ui-avatars.com/api/?name=${initials}`;
    }
    detailContact.appendChild(roomAvatar);

    // Organizers
    if (conversationData.room.organizers && conversationData.room.organizers.length > 0) {
        const organizersTitle = document.createElement('h4');
        organizersTitle.textContent = 'ORGANIZER';
        organizersTitle.classList.add('section-title');
        detailContact.appendChild(organizersTitle);

        conversationData.room.organizers.forEach(org => {
            const organizer = org.contact;

            const organizerDiv = document.createElement('div');
            organizerDiv.classList.add('contact-item');

            // Create the avatar container
            const avatarContainer = document.createElement('div');
            avatarContainer.classList.add('avatar-container');

            // Create the avatar element
            const avatarImg = document.createElement('img');
            avatarImg.classList.add('contact-members-avatar');
            avatarImg.alt = organizer.name;

            if (organizer.avatarSrc) {
                avatarImg.src = organizer.avatarSrc;
            } else {
                avatarImg.src = organizer.initials;
            }

            // Create the status icon element
            const statusIcon = document.createElement('i');
            statusIcon.classList.add('status-icon');

            // Check the contact status and add the appropriate icon
            switch (organizer.status) {
                case 'online':
                    statusIcon.classList.add('fas', 'fa-check-circle', 'online');
                    break;
                case 'unknown':
                    statusIcon.classList.add('fas', 'fa-moon', 'away');
                    break;
                case 'dnd':
                    statusIcon.classList.add('fas', 'fa-minus-circle', 'dnd');
                    break;
                case 'offline':
                default:
                    statusIcon.classList.add('fas', 'fa-circle', 'offline');
                    break;
            }

            // Append the avatar and status indicator to the avatar container
            avatarContainer.appendChild(avatarImg);
            avatarContainer.appendChild(statusIcon);

            organizerDiv.appendChild(avatarContainer);

            const organizerInfo = document.createElement('div');
            organizerInfo.classList.add('contact-info');

            const organizerName = document.createElement('div');
            organizerName.textContent = `${organizer.firstname} ${organizer.lastname}`;
            organizerName.classList.add('contact-display-name');
            organizerInfo.appendChild(organizerName);

            const organizerCompany = document.createElement('div');
            organizerCompany.textContent = organizer.company.filterName; // Adjust according to available data
            organizerCompany.classList.add('contact-company');
            organizerInfo.appendChild(organizerCompany);

            organizerDiv.appendChild(organizerInfo);

            // Crown icon for organizer
            const crownIcon = document.createElement('i');
            crownIcon.classList.add('fas', 'fa-crown', 'organizer-icon');
            organizerDiv.appendChild(crownIcon);

            detailContact.appendChild(organizerDiv);
        });
    }

    // Members
    if (conversationData.room.members && conversationData.room.members.length > 0) {
        const membersTitle = document.createElement('h4');
        membersTitle.textContent = `MEMBERS (${conversationData.room.members.length})`;
        membersTitle.classList.add('section-title');
        detailContact.appendChild(membersTitle);

        conversationData.room.members.forEach(ber => {
            const member = ber.contact;
            const memberDiv = document.createElement('div');
            memberDiv.classList.add('contact-item');

            // Create the avatar container
            const avatarContainer = document.createElement('div');
            avatarContainer.classList.add('avatar-container');

            // Create the avatar element
            const avatarImg = document.createElement('img');
            avatarImg.classList.add('contact-members-avatar');
            avatarImg.alt = member.name;

            if (member.avatarSrc) {
                avatarImg.src = member.avatarSrc;
            } else {
                var initials = '';
                if (member.firstname) {
                    initials += member.firstname.charAt(0).toUpperCase();
                }
                if (member.lastname) {
                    initials += member.lastname.charAt(0).toUpperCase();
                }

                avatarImg.src = `https://ui-avatars.com/api/?name=${initials}`;
            }

            avatarContainer.append(avatarImg);

            if (ber.status === 'accepted') {

                // Create the status icon element
                const statusIcon = document.createElement('i');
                statusIcon.classList.add('status-icon');

                // Check the contact status and add the appropriate icon
                switch (member.status) {
                    case 'online':
                        statusIcon.classList.add('fas', 'fa-check-circle', 'online');
                        break;
                    case 'unknown':
                        statusIcon.classList.add('fas', 'fa-moon', 'away');
                        break;
                    case 'dnd':
                        statusIcon.classList.add('fas', 'fa-minus-circle', 'dnd');
                        break;
                    case 'offline':
                    default:
                        statusIcon.classList.add('fas', 'fa-circle', 'offline');
                        break;
                }

                avatarContainer.appendChild(statusIcon);
            }


            memberDiv.appendChild(avatarContainer);

            const memberInfo = document.createElement('div');
            memberInfo.classList.add('contact-info');

            const memberName = document.createElement('div');
            memberName.textContent = `${member.firstname} ${member.lastname}`;
            memberName.classList.add('contact-display-name');
            memberInfo.appendChild(memberName);

            const memberCompany = document.createElement('div');
            memberCompany.textContent = member.company.filterName; // Adjust according to available data
            memberCompany.classList.add('contact-company');
            memberInfo.appendChild(memberCompany);

            memberDiv.appendChild(memberInfo);

            // Black ticking clock icon for invited members
            if (ber.status === 'invited') {
                const invitedIcon = document.createElement('i');
                invitedIcon.classList.add('fas', 'fa-clock', 'invited-icon');
                memberDiv.appendChild(invitedIcon);
            }
            detailContact.appendChild(memberDiv);
        });
    }
}


// Function to display calls content
function displayRoomCalls(contactId) {
    const detailContact = document.getElementById('detailContact');
    detailContact.innerHTML = ''; // Clear previous content

    // Create and append content related to calls
    const callsDiv = document.createElement('div');
    callsDiv.classList.add('section-content');
    callsDiv.textContent = `Displaying calls for contact ID: ${contactId}`;
    detailContact.appendChild(callsDiv);
}

// Function to display files content
function displayRoomFiles(contactId) {
    const detailContact = document.getElementById('detailContact');
    detailContact.innerHTML = ''; // Clear previous content

    // Create and append content related to files
    const filesDiv = document.createElement('div');
    filesDiv.classList.add('section-content');
    filesDiv.textContent = `Displaying files for contact ID: ${contactId}`;
    detailContact.appendChild(filesDiv);
}

