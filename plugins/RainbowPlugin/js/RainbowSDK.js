import rainbowSDK from '../rainbow-web-sdk/src/rainbow-sdk.min.js'; 

let onReady = function onReady() {
    console.log('[Hello World] :: On SDK Ready!');
    fetchLoginInfo();
    setupMessageListener()
}

function fetchLoginInfo() {
    // Send an AJAX GET Request to get the login infos from the LoginInfo.jsp
    $.ajax({
        url: 'http://localhost:8080/jcms/plugins/RainbowPlugin/jsp/app/LoginInfo.jsp',
        type: 'GET',
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json',
        },
        success: function(data) {
            let token = data.token;
            // If token isn't null then we do the signing to Rainbow with the token
            if (token) {
                rainbowSDK.connection.signinWithToken(token)
                    .then(function(account) {
                        console.log('[Hello World] :: Signed in Successfully');
                        console.log('Account:', account);
                        getConversations(); // Fetch conversations after successful sign-in
                       
                    })
                    .catch(function(err) {
                        console.log('[Hello World] :: Something went wrong with the signing...', err);
                    });
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching login information:', textStatus, errorThrown);
        }
    });
}


function handleSearch() {
    // Get the search keyword from the input field
    let keyword = document.getElementById('searchInput').value;
    console.log('[Hello World] :: Search By ' + keyword);

    rainbowSDK.contacts.searchByName(keyword, 10)
        .then(function (usersFound) {
            // Get the container to display search results
            let searchResultsContainer = document.getElementById('recentConversationsList');
            searchResultsContainer.innerHTML = '';

            if (usersFound.length > 0) {
                // At least one user has been found
                usersFound.forEach(function (user) {
                    // Create a conversation item similar to recent conversations
                    var contactName = user.firstname + ' ' + user.lastname;
                    var contactAvatar = user.avatar;

                    // Create the conversation item
                    var conversationItem = document.createElement('div');
                    conversationItem.classList.add('conversation-item');

                    // Create the avatar element
                    var avatarImg = document.createElement('img');
                    avatarImg.classList.add('contact-avatar');
                    avatarImg.src = contactAvatar;
                    avatarImg.alt = contactName;

                    if (contactAvatar) {
                        // If avatar exists, use it
                        avatarImg.src = contactAvatar.src;
                    } else {
                        // If avatar is null, use first letter of the name
                        var initials = contactName.split(' ').map(part => part.charAt(0)).join('');
                        avatarImg.src = `https://ui-avatars.com/api/?name=${initials}`;
                    }

                    // Create the name element
                    var nameSpan = document.createElement('span');
                    nameSpan.textContent = contactName;

                    // Append avatar and name to the conversation item
                    conversationItem.appendChild(avatarImg);
                    conversationItem.appendChild(nameSpan);

                    // Make the conversation item clickable
                    conversationItem.addEventListener('click', function () {

                        console.log('the id of selected contact', user.dbId)

                        rainbowSDK.conversations.getConversationByContactId(user.dbId).then(function (conversation) {
                            console.log('the conversation for the selected contact', conversation);
                            handleConversationClick(conversation.dbId);

                        }).catch(function (err) {
                            console.log('something went Wrong while getting the conversation for each search result', err)
                        });

                        handleDisplayContact(user.dbId);
                    });

                    // Append the conversation item to the search results container
                    searchResultsContainer.appendChild(conversationItem);
                });
            }
            else {
                // No contact returned
                searchResultsContainer.textContent = 'No contacts found.';
            }
        })
        .catch(function (error) {
            // Handle any errors that occur during the search
            console.error('[Hello World] :: Error occurred during search:', error);
        });
}

// Add event listener to the search input
document.getElementById('searchInput').addEventListener('input', handleSearch);
function getConversations(){
    rainbowSDK.conversations.getAllConversations()
                    .then(function (conversations) {
                        const flipperFlesh = document.getElementById('recentConversationsList');
                        flipperFlesh.innerHTML = '';

                        conversations.forEach(conversation => {
                            var lastMessage = conversation.lastMessageText;
                            console.log('test laste message' , lastMessage)
                            

                            if (conversation.type === 0) {

                                rainbowSDK.contacts.getContactById(conversation.contact.dbId)
                                    .then(contact => {

                                       /* console.log('the conversation id', conversation);*/
                                        var contactName = contact.firstname + ' ' + contact.lastname;
                                        var contactAvatar = contact.avatar;
                                        
                                        //var name=contact.name;
                                        

                                        // Create the conversation item
                                        var conversationItem = document.createElement('div');
                                        conversationItem.classList.add('conversation-item');
                                        // Create the avatar element
                                        var avatarImg = document.createElement('img');
                                        avatarImg.classList.add('contact-avatar');

                                        avatarImg.src = contactAvatar;
                                        avatarImg.alt = contactName;

                                        // Create the avatar element
                                        var avatarImg = document.createElement('img');
                                        avatarImg.classList.add('contact-avatar');
                                        avatarImg.alt = contactName;

                                        if (contactAvatar) {
                                            // If avatar exists, use it
                                            avatarImg.src = contactAvatar.src;
                                        } else {
                                            // If avatar is null, use first letter of the name
                                            var initials = contactName.split(' ').map(part => part.charAt(0)).join('');
                                            avatarImg.src = `https://ui-avatars.com/api/?name=${initials}`;
                                        }

                                        // Set the size of the avatar
                                      

                                        // Create the name element
                                        var nameSpan = document.createElement('span');
                                        nameSpan.classList.add('name');
                                        nameSpan.textContent = contactName;
                                        // Create the last message element
                                        var lastMessageSpan = document.createElement('span');
                                        lastMessageSpan.classList.add('Last-Massage');
                                        lastMessageSpan.textContent = lastMessage;
                                        

                                        // Append avatar and name to the conversation item
                                        conversationItem.appendChild(avatarImg);
                                        conversationItem.appendChild(nameSpan);
                                        conversationItem.appendChild(lastMessageSpan);

                                        // Make the conversation item clickable
                                        conversationItem.addEventListener('click', function () {
                                            var contactId = contact.dbId;
                                            handleConversationClick(conversation.dbId);
                                            handleDisplayContact(contactId);

                                        });

                                        // Append the conversation item to the flipper flesh
                                        flipperFlesh.appendChild(conversationItem);
                                    })
                                    .catch(err => {
                                        console.log('[Hello World] :: Something went wrong while getting the contactById..', err)
                                    });

                            }

                            if (conversation.type === 1) {
                                // Create the conversation item
                                var conversationItem = document.createElement('div');
                                conversationItem.classList.add('conversation-item');

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

                                // Create the name element
                                var nameSpan = document.createElement('span');
                                nameSpan.classList.add('name');
                                nameSpan.textContent = conversation.room.name;
                                
                                 // Create the last message element
                                        var lastMessageSpan = document.createElement('span');
                                        lastMessageSpan.classList.add('Last-Massage');
                                        lastMessageSpan.textContent = lastMessage;
                                        

                                // Append avatar and name to the conversation item
                                conversationItem.appendChild(avatarImg);
                                conversationItem.appendChild(nameSpan);
                                conversationItem.appendChild(lastMessageSpan);

                                // Make the conversation item clickable
                                conversationItem.addEventListener('click', function () {
                                    handleConversationClick(conversation.dbId);
                                    // Optionally, you can handle other actions when a bubble conversation item is clicked
                                });

                                // Append the conversation item to the flipper flesh
                                flipperFlesh.appendChild(conversationItem);
                            }



                        });
                    })
                    .catch(function (error) {
                        console.error('Error getting conversations:', error);
                    });
}


function handleDisplayContact(contactId) {
    const detailContact = document.getElementById('detailContact');
    detailContact.innerHTML = '';

    // Get contact info and display in detail-contact
    rainbowSDK.contacts.getContactById(contactId)
        .then(contact => {
            // Create and append the avatar
            const avatar = document.createElement('img');
            avatar.src = contact.avatar.src || ''; // Use contact avatar if available, otherwise empty string
            avatar.alt = 'Contact Avatar';
            avatar.classList.add('contact-detail-avatar');
            detailContact.appendChild(avatar);

            // Create and append the buttons div
            const buttonsDiv = document.createElement('div');
            buttonsDiv.classList.add('contact-buttons');

            // Create and append the favorite button
            const favoriteButton = document.createElement('button');
            favoriteButton.textContent = 'Favorite';
            favoriteButton.classList.add('favorite-button');
            favoriteButton.addEventListener('click', () => {
                Favorite(contact.dbId, 'user');
            });
            buttonsDiv.appendChild(favoriteButton);

            // Create and append the invite button
            const inviteButton = document.createElement('button');
            inviteButton.textContent = 'Invite';
            inviteButton.classList.add('invite-button');
            inviteButton.addEventListener('click', () => {
                inviteContact(contact.dbId);
            });
            buttonsDiv.appendChild(inviteButton);

            detailContact.appendChild(buttonsDiv);

            // Create and append the full name
            const fullName = document.createElement('h2');
            fullName.textContent = `${contact.firstname} ${contact.lastname}`;
            fullName.classList.add('contact-name');
            detailContact.appendChild(fullName);

            // Create and append contact information
            const contactInfoDiv = document.createElement('div');
            contactInfoDiv.classList.add('contact-information');

            // Email
            const emailDiv = document.createElement('div');
            const emailLabel = document.createElement('span');
            emailLabel.textContent = 'Email:';
            const emailValue = document.createElement('span');
            emailValue.textContent = contact.loginEmail || '';
            emailDiv.appendChild(emailLabel);
            emailDiv.appendChild(emailValue);
            contactInfoDiv.appendChild(emailDiv);

            // Add other contact information here

            // Create and append the remove from network button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove from Network';
            removeButton.classList.add('remove-from-network-button');
            removeButton.addEventListener('click', () => {
                removeFromNetwork(contact.dbId);
            });
            contactInfoDiv.appendChild(removeButton);

            detailContact.appendChild(contactInfoDiv);

            // Show the detail contact section
            detailContact.style.display = 'block';
            const mainContent = document.getElementById('mainContent');
            mainContent.style.flex = 'auto';
        })
        .catch(err => {
            console.error('Error getting contact info:', err);
        });
}

  document.getElementById("recentConversationsHeader").addEventListener("click", function () {
            this.parentElement.classList.toggle("expanded");
        });
        
        function handleConversationClick(conversationId) {
    // Get the main content element
    const mainContent = document.getElementById('mainContent');

    const myUserId = rainbowSDK.contacts.getConnectedUser().dbId;
    console.log('my user id', myUserId);

    // Show the main content
    mainContent.style.display = 'block';

    // Get chat box and input container
    const chatBox = document.getElementById('chatBox');
    const inputContainer = document.querySelector('.input-container');
    // Clear previous content in the main content
    chatBox.innerHTML = '';

    chatBox.style.display = 'block';
    inputContainer.style.display = 'block';

    // Get contact ID from the conversation
    const contactId = rainbowSDK.conversations.getConversationById(conversationId).contact.dbId;

    // Get conversation history messages
    rainbowSDK.im.getMessagesFromConversation(conversationId, 30)
        .then(conversation => {
            var messages = conversation.messages;
            // Check if messages is an array
            if (messages && messages.length > 0) {
                // Process the messages, for example, display them in the chat box
                messages.forEach(message => {
                    // Determine if message sender is me (adjust this based on your message structure)
                    const isMe = message.from.dbId === myUserId; // Adjust myUserId according to your implementation

                    // Display the message
                    displayMessage(message.data, isMe);
                });
            } else {
                console.log('No messages found for this conversation.');
            }
        })
        .catch(error => {
            console.error('Error getting conversation history:', error);
        });

    // Add event listener to send button
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    sendMessageBtn.addEventListener('click', function () {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim(); // Trim whitespace from the message
        if (message !== '') {
            chatWithContact(contactId, message)

            messageInput.value = '';
        }
    });
}

// Function to start a chat with the specified contact
function chatWithContact(contactId, message) {
    console.log('Starting chat with contact with ID :', contactId);

    rainbowSDK.contacts.getContactById(contactId)
        .then(function (selectedContact) {
            console.log('the contact found:', selectedContact);
            if (selectedContact) {
                // Contact found, do something with it
                var associatedConversation = null;
                rainbowSDK.conversations.getConversationByContactId(selectedContact.dbId)
                    .then(function (conversation) {
                        associatedConversation = conversation;
                        var lastMessage = associatedConversation.lastMessageText;
                        console.log('Last message:', lastMessage);
                        // Send an answer
                        rainbowSDK.im.sendMessageToConversation(associatedConversation.dbId, message)
                        // Reload conversation after sending message
                        handleConversationClick(associatedConversation.dbId);
                    })
                    .catch(function (err) {
                        console.log('Error getting the associated conversation:', err);
                        reject(err); // Reject the promise if there's an error getting the conversation
                    });
            } else {
                console.log('Contact not found');
                reject(new Error('Contact not found')); // Reject the promise if the contact is not found
            }
        })
        .catch(function (err) {
            console.log('Error getting contact by ID:', err);
            reject(err); // Reject the promise if there's an error getting the contact by ID
        });
}

function displayMessage(message, isMe) {
    const chatBox = document.getElementById('chatBox');

    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = message;

    // Apply different styles based on sender (me or not me)
    if (isMe) {
        messageElement.classList.add('sent-message');
        messageElement.id = 'sentMessage'; // Add ID for sent message
    } else {
        messageElement.classList.add('received-message');
        messageElement.id = 'receivedMessage'; // Add ID for received message
    }

    // Append message element to message container
    messageContainer.appendChild(messageElement);

    // Append message container to chat box
    chatBox.appendChild(messageContainer);
}

// Function to handle new incoming messages
function onReceiveMessage(event) {
    const message = event.detail.message;
    const conversationId = message.conversationId;

    // If the message belongs to the currently selected conversation, display it
    const selectedConversationId = document.querySelector('.conversation-item.selected')?.dataset.conversationId;

    if (selectedConversationId && selectedConversationId === conversationId) {
        const messagesList = document.getElementById('messagesList');

        const messageItem = document.createElement('div');
        messageItem.classList.add('message-item');

        // Create the message sender element
        const sender = document.createElement('strong');
        sender.textContent = `${message.from.contact.displayName}: `;

        // Create the message content element
        const content = document.createElement('span');
        content.textContent = message.content;

        // Append sender and content to the message item
        messageItem.appendChild(sender);
        messageItem.appendChild(content);

        // Append the message item to the messages list
        messagesList.appendChild(messageItem);
    }
}

// Setup the message listener for real-time updates
function setupMessageListener() {
    document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGE, onReceiveMessage);
}







let onStarted = function onStarted() {
    console.log('[Hello World] :: On SDK Started!');
};

let onLoaded = function onLoaded() {
    console.log('[Hello World] :: On SDK Loaded');
    
    // Send an AJAX GET Request to get the AppID and AppSecretID from the LoginInfo.jsp    
    $.ajax({
        url: 'http://localhost:8080/jcms/plugins/RainbowPlugin/jsp/app/LoginInfo.jsp',
        type: 'GET',
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json',
        },
        success: function(data) {
            let appID = data.appID;
            let appSecretID = data.appSecretID;
            
            rainbowSDK
                .initialize(appID, appSecretID)
                .then(() => {
                    console.log('[Hello World] :: Rainbow SDK is initialized!');
                })
                .catch(err => {
                    console.log('[Hello World] :: Something went wrong with the SDK...', err);
                });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching login information:', textStatus, errorThrown);
        }
    });
};

document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady);
document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);
document.addEventListener(rainbowSDK.connection.RAINBOW_ONSTARTED, onStarted);

rainbowSDK.start();
rainbowSDK.load();
