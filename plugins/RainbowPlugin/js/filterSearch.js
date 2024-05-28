
import rainbowSDK from '../rainbow-web-sdk/src/rainbow-sdk.min.js';
import {handleConversationClick} from "./conversation.js";
import {getRecentConversations} from "./conversation.js";
import { updateNotificationCounter } from './conversation.js';

document.addEventListener('DOMContentLoaded', function() {


    const searchInput = document.getElementById('searchInput');
    const closeButton = document.getElementById('closeButton');
    const searchButton =document.getElementById('searchIcon');
    const searchOptions = document.querySelectorAll('.search-option');
    const searchForm = document.querySelector('.search-form');


    let selectedOption = 'people';

    // Add click event listener to search input
    searchInput.addEventListener('click', function() {
        this.classList.add('active'); // Add active class to input
        document.querySelector('.search-options').style.display = 'flex'; // Show search options
        searchForm.classList.add('active'); // Add active class to search form

    });
    
    // Add click event listener to close button
closeButton.addEventListener('click', function() {
    searchInput.classList.remove('active'); // Remove active class from input
    document.querySelector('.search-options').style.display = 'none'; // Hide search options
    searchForm.classList.remove('active'); // Remove active class from search form
    searchInput.value = ''; // Clear input value
    closeButton.style.display = 'none'; // Hide the close button
    getRecentConversations();
    searchButton.style.display='block'
});

    // Add click event listener to search options
    searchOptions.forEach(option => {

        option.addEventListener('click', function() {

            searchOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedOption = this.dataset.option;

            searchInput.value = '';
            searchInput.focus();
        });
    });


    // Add event listener to handle search input
    searchInput.addEventListener('input', function() {
        
        closeButton.style.display = 'block';
        searchButton.style.display='none'
        let query = this.value;

        if (query.length > 2) { // Start searching after 3 characters
            handlesearch(query, selectedOption);
        }
        console.log("Search By :" + query);
    });

    function handlesearch(query, option) {
        switch (option) {
            case 'people':
                rainbowSDK.contacts.searchByName(query, 20).then(results => {

                    // Get the container to display search results
                    let searchResultsContainer = document.getElementById('recentConversationsList');
                    searchResultsContainer.innerHTML = '';

                    if (results.length > 0) {
                        // At least one user has been found
                        results.forEach(function(user) {
                            // Create a conversation item similar to recent conversations
                            var contactName = user.firstname + ' ' + user.lastname;
                            var contactAvatar = user.avatar;

                            console.log("user:" + user)

// Create the conversation item container
                            var conversationItem = document.createElement('div');
                            conversationItem.classList.add('conversation-item');

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
                            
                            // Append the avatar and status indicator to the avatar container
                            avatarContainer.appendChild(avatarImg);
                            
                            // Create the text container
                            var textContainer = document.createElement('div');
                            textContainer.classList.add('text-container');

                            // Create the name element
                            var nameSpan = document.createElement('span');
                            nameSpan.classList.add('contact-name');
                            nameSpan.textContent = contactName;
                            
                            // Append name, last message, and missed count to the text container
                            textContainer.appendChild(nameSpan);
                            
                            // Append avatar container and text container to the conversation item
                            conversationItem.appendChild(avatarContainer);
                            conversationItem.appendChild(textContainer);

                            // Make the conversation item clickable
                            conversationItem.addEventListener('click', function() {

                                console.log('the id of selected contact', user.dbId)

                                rainbowSDK.conversations.getConversationByContactId(user.dbId).then(function(conversation) {
                                    console.log('the conversation for the selected contact', conversation);
                                    handleConversationClick(conversation.dbId);

                                    // Add active class to the selected item and remove from others
                                    document.querySelectorAll('.conversation-item').forEach(item => {
                                        item.classList.remove('active');
                                    });
                                    conversationItem.classList.add('active');

                                }).catch(function(err) {
                                    console.log('something went Wrong while getting the conversation for each search result', err)
                                });

                                //handleDisplayContact(user.dbId);
                            });

                            // Append the conversation item to the search results container
                            searchResultsContainer.appendChild(conversationItem);
                        });
                    }
                    else {
                        // No contact returned
                        searchResultsContainer.textContent = 'No contacts found.';
                    }


                    // Display results
                }).catch(err => {
                    console.log('Error searching people:',err);
                });
                break;
            case 'bubbles':
                rainbowSDK.bubbles.searchBubbles(query).then(results => {
                    console.log('Bubbles results:', results);
                    // Display results
                }).catch(err => {
                    console.log('Error searching bubbles:', err);
                });
                break;
            case 'text':
                rainbowSDK.messages.searchMessages(query).then(results => {
                    console.log('Text results:', results);
                    // Display results
                }).catch(err => {
                    console.log('Error searching text:', err);
                });
                break;
            case 'channels':
                rainbowSDK.channels.fetchChannelsByName(query).then(results => {
                    console.log('Channels results:', results);
                    // Display results
                }).catch(err => {
                    console.log('Error searching channels:', err);
                });
                break;
            case 'companies':
                rainbowSDK.companies.searchCompanies(query).then(results => {
                    console.log('Companies results:', results);
                    // Display results
                }).catch(err => {
                    console.log('Error searching companies:', err);
                });
                break;
            default:
                console.log('Invalid search option');
                break;
        }
    }
    


    
let isExpanded = false; // Variable to track the state of the toggle

document.getElementById('recentConversationsHeader').addEventListener('click', function() {
    isExpanded = !isExpanded; // Toggle the state
    const recentConversations = document.querySelector('.recent-conversations');
    
    // Toggle the 'expanded' class on the recent-conversations container
    if (isExpanded) {
        recentConversations.classList.add('expanded');
    } else {
        recentConversations.classList.remove('expanded');
    }
});


});


// Function to toggle the notification list
function toggleNotificationList() {
    var notificationList = document.getElementById("notificationList");
    if (notificationList.style.display === "block") {
        notificationList.style.display = "none";
    } else {
        notificationList.style.display = "block";
        displayNotifications();
    }
}

// Function to display notifications
function displayNotifications() {
    const invitations = rainbowSDK.contacts.getInvitationsReceived();
    console.log('here are your invitations', invitations);
    displayInvitations(invitations);
}

// Function to display invitations
function displayInvitations(invitations) {
    const invitationList = document.getElementById('invitationList');

    // Clear existing invitations
    invitationList.innerHTML = '';

    // Iterate through the list of invitations
    invitations.forEach((invitation) => {
        // Create a list item for each invitation
        const listItem = document.createElement('li');
        listItem.classList.add('invitation-item');

        var invitingUserId = invitation.invitingUserId;
        console.log('Id of inviting user', invitingUserId)
        // Display sender's name and message
        rainbowSDK.contacts.getContactById(invitingUserId)
            .then((sender) => {

                console.log('the inviting user', sender);

                // Create a list item for each invitation
                const listItem = document.createElement('li');
                listItem.classList.add('invitation-item');

                var senderName = sender ? (sender.firstname + ' ' + sender.lastname) : 'Unknown User';
                var senderAvatar = sender ? sender.avatar : null;
                const message = ` would like to add you to their network  `;

                // Create the avatar element
                var avatarImg = document.createElement('img');
                avatarImg.classList.add('invitation-avatar');
                avatarImg.alt = senderName;

                if (senderAvatar) {

                    avatarImg.src = senderAvatar.src;
                } else {
                    var initials = senderName.split(' ').map(part => part.charAt(0)).join('');
                    avatarImg.src = `https://ui-avatars.com/api/?name=${initials}`;
                }

                // Append avatar to the list item
                listItem.appendChild(avatarImg);

                // Add sender's name and message to the list item
                listItem.innerHTML += `<span style='font-weight: bold'>${senderName}</span>${message}`;

                // Add icons for accepting and declining the invitation
                const acceptIcon = document.createElement('i');
                acceptIcon.classList.add('fas', 'fa-check', 'accept-icon');
                const declineIcon = document.createElement('i');
                declineIcon.classList.add('fas', 'fa-times', 'decline-icon');

                // Add event listeners for accepting and declining the invitation
                acceptIcon.addEventListener('click', () => acceptInvitation(invitation.id));
                declineIcon.addEventListener('click', () => declineInvitation(invitation.id));

                // Append icons to the list item
                listItem.appendChild(acceptIcon);
                listItem.appendChild(declineIcon);

                // Append the list item to the invitation list
                invitationList.appendChild(listItem);

            })
            .catch((error) => {
                console.error('Error fetching sender information:', error);
            });

        // Append the list item to the invitation list
        invitationList.appendChild(listItem);
    });
}
// Function to handle accepting an invitation
function acceptInvitation(invitationId) {
    console.log('accept invitation', invitation);
    rainbowSDK.contacts
        .acceptInvitation(invitationId)
        .then(function () {
            updateNotificationCounter()
        })
        .catch(function (err) {
            console.log('something went wrong while accepting the invitation', err)
        });
}

// Function to handle declining an invitation
function declineInvitation(invitationId) {
    console.log('decline invitation', invitationId);
    rainbowSDK.contacts
        .declineInvitation(invitationId)
        .then(function () {
            updateNotificationCounter()
        })
        .catch(function (err) {
            console.log('something went wrong while declining the invitation', err)
        });
}


// Event for notification button
document.getElementById("notificationBtn").addEventListener("click", toggleNotificationList);

// Define the function to handle new invitation received
function onNewInvitationReceived(event) {
    var invitation = event.detail;
    console.log('The invitation received:', invitation);
    // Update the notification counter
    updateNotificationCounter();
    displayNotifications();
}
// Listen for the RAINBOW_ONCONTACTINVITATIONRECEIVED event
document.addEventListener(RAINBOW_ONCONTACTINVITATIONRECEIVED, onNewInvitationReceived);


