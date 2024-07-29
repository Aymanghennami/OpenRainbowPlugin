import rainbowSDK from '../rainbow-web-sdk/src/rainbow-sdk.min.js';
import {handleConversationClick} from "./conversation.js";
import {getRecentConversations} from "./conversation.js";
import { updateNotificationCounter } from './conversation.js';
import { displayBubbleConversation } from './conversation.js';
import { displayOneToOneConversation } from './conversation.js';


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

        if (query.length > 1) { // Start searching after 3 characters
            handlesearch(query, selectedOption);
        }
        console.log("Search By :" + query);
    });

    function handlesearch(query, option) {
        switch (option) {
            case 'people':
                
                searchByName(query);
                break;
            case 'bubbles':
                searchFromBubbles(query);
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
                searchChannelsByName(query);
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

document.getElementById('expandCollapseButton').addEventListener('click', function() {
    const contactsContainer = document.getElementById('contactsInOtherCompaniesList');
    if (contactsContainer.style.display === 'none') {
        contactsContainer.style.display = 'block';
        this.classList.remove('fa-chevron-down');
        this.classList.add('fa-chevron-up'); // Change icon to fa-chevron-up for expanded state
    } else {
        contactsContainer.style.display = 'none';
        this.classList.remove('fa-chevron-up');
        this.classList.add('fa-chevron-down'); // Change icon back to fa-chevron-down for collapsed state
    }
});


});

function searchByName(query) {
    // Fetch all conversations
    rainbowSDK.conversations.getAllConversations().then(conversations => {
        // Filter conversations based on the query
        let filteredConversations = conversations.filter(conversation => conversation.filterName.includes(query));

        // Extract dbIds of the filtered conversations
        let filteredConversationsDbIds = filteredConversations.map(conversation => conversation.dbId);

        // Search for contacts in other companies
        rainbowSDK.contacts.searchByName(query, 20).then(results => {
            // Filter contacts to exclude those with the same dbId as the current user's conversations
            let contactsInOtherCompanies = results.filter(contact =>!filteredConversationsDbIds.includes(contact.dbId));

            // Determine if there are contacts to display
            const hasContactsToShow = contactsInOtherCompanies.length > 0;

            // Toggle visibility of the contacts container based on whether there are contacts to show
            const contactsContainer = document.getElementById('contactsInOtherCompaniesList');
            if (hasContactsToShow) {
                contactsContainer.style.display = 'block'; // Show the container
                document.getElementById('expandCollapseButton').classList.remove('fa-chevron-down'); // Initial state is expanded
            } else {
                contactsContainer.style.display = 'none'; // Hide the container
                document.getElementById('expandCollapseButton').classList.add('fa-chevron-down'); // Initial state is collapsed
            }

            // Display filtered conversations
            if (filteredConversations.length > 0) {
                document.getElementById('contactfromserver').style.display = 'block'; // Show the container
                filteredConversations.forEach(conversation => {
                    const flipperFlesh = document.getElementById('recentConversationsList');
                    flipperFlesh.innerHTML = '';
                    
                    displayOneToOneConversation(conversation, flipperFlesh); // Ensure this function correctly updates the UI
                });
            } else {
                document.getElementById('contactfromserver').style.display = 'none'; // Hide the container
            }

            // Display contacts in other companies
            if (contactsInOtherCompanies.length > 0) {
                let searchResultsContainer = document.getElementById('contactsInOtherCompaniesList');
                searchResultsContainer.innerHTML = ''; // Clear previous results

                contactsInOtherCompanies.forEach(user => {
                                        // Get the container to display search results
            let searchResultsContainer = document.getElementById('contactsInOtherCompaniesList');
            searchResultsContainer.innerHTML = '';
                
                    // Create a conversation item similar to recent conversations
                    var contactName = user.firstname + ' ' + user.lastname;
                    var contactAvatar = user.avatar;


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
                            handleConversationClick(conversation);

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
            } else {
                document.getElementById('contactsInOtherCompaniesList').style.display = 'none'; // Hide the container if no contacts found
            }
        }).catch(err => {
            console.log('Error searching people:', err);
        });
    }).catch(err => {
        console.log('Error fetching conversations:', err);
    });
}



function searchFromBubbles(query) {
    if (query.length > 0) {
        try {
            let allBubbles = rainbowSDK.bubbles.getAllBubbles();
            let filteredBubbles = allBubbles.filter(bubble => bubble.name.includes(query));

            const flipperFlesh = document.getElementById('recentConversationsList');
            flipperFlesh.innerHTML = '';


            if (filteredBubbles.length > 0) {
                for (let bubble of filteredBubbles) {
                    // Fetch the detailed conversation object for each bubble

                    rainbowSDK.conversations.getConversationByBubbleId(bubble.dbId)
                        .then(conversation => {

                            console.log("here is the conversation room", conversation);

                            // Call displayBubbleConversation for each bubble
                            displayBubbleConversation(conversation, flipperFlesh);

                        })
                        .catch(error => {
                            console.error('Error getting conversation by bubble ID:', error);
                        });
                }
            } else {
                // No bubble returned
                flipperFlesh.textContent = 'No bubbles found with that query.';
            }
        } catch (err) {
            console.error("Error during search from bubbles: ", err);
        }
    }
}

function searchChannelsByName(query) {

    if (query.length > 0) {
        try {
            let filteredChannels = rainbowSDK.channels.fetchChannelsByName(query);

            let searchResultsContainer = document.getElementById('recentConversationsList'); // Assuming this is where you want to display the results
            searchResultsContainer.innerHTML = ''; // Clear existing results

            if (filteredChannels.length > 0) {
                // Iterate over each channel
                filteredChannels.forEach(channel => {
                    // Create a conversation item similar to recent conversations
                    var conversationItem = document.createElement('div');
                    conversationItem.classList.add('conversation-item');

                    // Channel name
                    var channelName = document.createElement('span');
                    channelName.classList.add('contact-name');
                    channelName.textContent = channel.name;

                    // Channel ID
                    var channelId = document.createElement('span');
                    channelId.textContent = `ID: ${channel.id}`;

                    // Append name and ID to the conversation item
                    conversationItem.appendChild(channelName);
                    conversationItem.appendChild(document.createElement('br')); // Line break for spacing
                    conversationItem.appendChild(channelId);

                    // Make the conversation item clickable
                    conversationItem.addEventListener('click', function() {
                        console.log('Selected channel ID:', channel.id); // You might want to replace this with actual functionality
                        // Here you can add what happens when a channel is clicked
                    });

                    // Append the conversation item to the search results container
                    searchResultsContainer.appendChild(conversationItem);
                });
            } else {
                // No channel returned
                searchResultsContainer.textContent = 'No channels found.';
            }

            // Display results
        } catch (err) {
            console.error("Error during search by channel name: ", err);
        }
    }
}


// Function to toggle the notification list
function toggleNotificationList() {
    var notificationList = document.getElementById("notificationList");
    if (notificationList.style.display === "block") {
        notificationList.style.display = "none"; // Hide the list
    } else {
        notificationList.style.display = "block"; // Show the list
        displayNotifications();
    }
}

// Function to display notifications
function displayNotifications() {
    const invitations = rainbowSDK.contacts.getInvitationsReceived();
    const invitationsToJoinBubbles = rainbowSDK.bubbles.getAllPendingBubbles();

    // Wait for both promises to resolve before displaying invitations
    Promise.all([invitations, invitationsToJoinBubbles])
        .then(results => {
            const [networkInvitations, pendingBubbles] = results;
            displayInvitations(networkInvitations, pendingBubbles);
        })
        .catch(error => {
            console.error('Error fetching invitations:', error);
        });
}

// Function to format date in a readable format
function formatDate(date) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return 'Invalid Date';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return parsedDate.toLocaleDateString(undefined, options);
}

// Function to display invitations
function displayInvitations(invitations, pendingBubbles) {
    console.log('Here are your invitations:', invitations);
    console.log('Here are the pending bubbles:', pendingBubbles);

    const invitationContainer = document.getElementById('invitationContainer');
    invitationContainer.innerHTML = ''; // Clear existing invitations

    // Combine both invitation types into a single list
    const combinedInvitations = [...invitations];
    
    // Assuming invitations have a date property
invitations.forEach(invitation => {
    const invitationDateObj = new Date(invitation.invitingDate);
    if (isNaN(invitationDateObj.getTime())) {
        console.error('Failed to parse invitation date:', invitation.invitingDate);
        return; // Skip this invitation if date is invalid
    }
    
    // Format the invitation date to YYYY-MM-DD
    const formattedInvitationDate = `${invitationDateObj.getFullYear()}-${String(invitationDateObj.getMonth() + 1).padStart(2, '0')}-${String(invitationDateObj.getDate()).padStart(2, '0')}`;
    
    // Update the invitation date
    invitation.date = formattedInvitationDate;
});


    // Process pending bubbles to extract relevant invitation information
pendingBubbles.forEach(bubble => {
    bubble.members.forEach(member => {
        if (member.invitingUserId && member.status === 'invited' && member.date) {
            const memberDateObj = new Date(member.date);
            if (isNaN(memberDateObj.getTime())) {
                console.error('Failed to parse date:', member.date);
                return; // Skip this iteration if date is invalid
            }
            
            // Format the date to YYYY-MM-DD
            const formattedDate = `${memberDateObj.getFullYear()}-${String(memberDateObj.getMonth() + 1).padStart(2, '0')}-${String(memberDateObj.getDate()).padStart(2, '0')}`;
            
            combinedInvitations.push({
                id: bubble.dbId,
                type: 'bubble',
                date: formattedDate, // Use the formatted date
                invitingUserId: member.invitingUserId,
                bubbleName: bubble.name,
                bubbleAvatar: bubble.avatar
            });
        } else {
            console.warn('Skipping member due to missing or invalid data:', member);
        }
    });
});




    // Sort invitations by date
    combinedInvitations.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Group invitations that have the same date
// Group invitations that have the same date
const groupedInvitations = combinedInvitations.reduce((acc, invitation) => {
    // Use the already formatted date for grouping
    const formattedDate = invitation.date; // This should be in YYYY-MM-DD format

    if (!acc[formattedDate]) {
        acc[formattedDate] = [];
    }
    acc[formattedDate].push(invitation);
    return acc;
}, {});


    console.log("here are the invites for this day", groupedInvitations);

    // Set to track added dates
    const addedDates = new Set();

    Object.keys(groupedInvitations).forEach(date => {
        // Create a date header if it hasn't been added yet
        if (!addedDates.has(date)) {
            const dateHeader = document.createElement('div');
            dateHeader.classList.add('date-header');
            dateHeader.textContent = formatDate(date).toUpperCase(); // Format date for display
            invitationContainer.appendChild(dateHeader);
            addedDates.add(date);
        }

        groupedInvitations[date].forEach(invitation => {
            // Create an invitation item div
            const invitationItem = document.createElement('div');
            invitationItem.classList.add('invitation-item');

            let invitingUserId, message, bubbleName, bubbleAvatar;

            if (invitation.type === 'bubble') {
                invitingUserId = invitation.invitingUserId;
                message = ' invites you to join the bubble ';
                bubbleName = invitation.bubbleName;
                bubbleAvatar = invitation.bubbleAvatar;
                console.log("Here is the invitation object we're iterating in case of bubble", invitation);
            } else {
                invitingUserId = invitation.invitingUserId;
                message = ' would like to add you to their network';
            }

            // Fetch sender information
            rainbowSDK.contacts.getContactById(invitingUserId)
               .then((sender) => {
                    console.log('The inviting user:', sender);

                    const senderName = sender? `${sender.firstname} ${sender.lastname}` : 'Unknown User';
                    const senderAvatar = sender? sender.avatar : null;
                    const companyName = sender?.company?.name; // Optional chaining to access company name

                    // Create the avatar container
                    const avatarContainer = document.createElement('div');
                    avatarContainer.classList.add('invitation-avatar-container');

                    // Create the avatar element
                    const avatarImg = document.createElement('img');
                    avatarImg.classList.add('invitation-avatar');
                    avatarImg.alt = senderName;

                    if (senderAvatar) {
                        avatarImg.src = senderAvatar.src;
                    } else if (bubbleAvatar) {
                        avatarImg.src = bubbleAvatar;
                    } else {
                        const initials = senderName.split(' ').map(part => part.charAt(0)).join('');
                        avatarImg.src = `https://ui-avatars.com/api/?name=${initials}`;
                    }

                    // Append avatar to the avatar container
                    avatarContainer.appendChild(avatarImg);

                    // Create a container for sender name and company
                    const senderInfoContainer = document.createElement('div');
                    senderInfoContainer.classList.add('sender-info-container');
                    senderInfoContainer.style.display = 'flex'; // Use flexbox for row layout

                    // Add sender's name (bold) and company name to the container
                    const senderNameSpan = document.createElement('span');
                    senderNameSpan.style.fontWeight = 'bold';
                    senderNameSpan.textContent = senderName;

                    const companySpan = document.createElement('span');
                    companySpan.classList.add('company-name'); // Add class for styling
                    companySpan.textContent = companyName? ` (${companyName})` : '';

                    senderInfoContainer.appendChild(senderNameSpan);
                    senderInfoContainer.appendChild(companySpan);

                    // Create the text container
                    const textContainer = document.createElement('div');
                    textContainer.classList.add('text-container');

                    // Add the message span
                    const messageSpan = document.createElement('span');
                    messageSpan.textContent = message;

                    // Add bubble name if applicable
                    if (bubbleName) {
                        const bubbleNameSpan = document.createElement('span');
                        bubbleNameSpan.style.fontWeight = 'bold';
                        bubbleNameSpan.textContent = bubbleName;
                        messageSpan.appendChild(bubbleNameSpan); // Corrected this line to append bubble name span to message span
                    }

                    // Append the sender info container and message container to text container
                    textContainer.appendChild(senderInfoContainer);
                    textContainer.appendChild(messageSpan);

                    // Create the icons container
                    const iconsContainer = document.createElement('div');
                    iconsContainer.classList.add('invitation-icons-container');

                    // Create accept icon
                    const acceptIcon = document.createElement('i');
                    acceptIcon.classList.add('fas', 'fa-check', 'accept-icon');

                    // Create decline icon
                    const declineIcon = document.createElement('i');
                    declineIcon.classList.add('fas', 'fa-times', 'decline-icon');

                    // Add event listeners for accepting and declining the invitation
                    if (invitation.type === 'bubble') {
                        acceptIcon.addEventListener('click', () => acceptBubbleInvitation(invitation.id));
                        declineIcon.addEventListener('click', () => declineBubbleInvitation(invitation.id));
                    } else {
                        acceptIcon.addEventListener('click', () => acceptInvitation(invitation.id));
                        declineIcon.addEventListener('click', () => declineInvitation(invitation.id));
                    }

                    // Append icons to the icons container
                    iconsContainer.appendChild(acceptIcon);
                    iconsContainer.appendChild(declineIcon);

                    // Append all elements to the invitation item
                    invitationItem.appendChild(avatarContainer);
                    invitationItem.appendChild(textContainer);
                    invitationItem.appendChild(iconsContainer);

                    // Append the invitation item to the container
                    invitationContainer.appendChild(invitationItem);
                })
               .catch((error) => {
                    console.error('Error fetching sender information:', error);
                });
        });
    });
}


// Function to accept a bubble invitation
function acceptBubbleInvitation(bubbleId) {
    // Get the bubble by ID
    const bubble = rainbowSDK.bubbles.getBubbleById(bubbleId);

    // Check if the bubble exists
    if (bubble) {
        console.log('Attempting to accept bubble invitation with ID:', bubbleId);
        rainbowSDK.bubbles.acceptInvitationToJoinBubble(bubble)
           .then(function () {
                console.log('Successfully accepted bubble invitation');
                updateNotificationCounter(); // Assuming this updates the UI to reflect the change
            })
           .catch(function (err) {
                console.error('Failed to accept bubble invitation', err);
            });
    } else {
        console.error('Bubble not found with ID:', bubbleId);
    }
}

// Function to decline a bubble invitation
function declineBubbleInvitation(bubbleId) {
    // Get the bubble by ID
    const bubble = rainbowSDK.bubbles.getBubbleById(bubbleId);

    // Check if the bubble exists
    if (bubble) {
        console.log('Attempting to decline bubble invitation with ID:', bubbleId);
        rainbowSDK.bubbles.declineInvitationToJoinBubble(bubble)
           .then(function () {
                console.log('Successfully declined bubble invitation');
                updateNotificationCounter(); // Assuming this updates the UI to reflect the change
            })
           .catch(function (err) {
                console.error('Failed to decline bubble invitation', err);
            });
    } else {
        console.error('Bubble not found with ID:', bubbleId);
    }
}

// Function to handle accepting an invitation
function acceptInvitation(invitationId) {
    
    console.log('accept invitation', invitationId);
    rainbowSDK.contacts
        .acceptInvitation(invitationId)
        .then(function () {
            updateNotificationCounter();
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
