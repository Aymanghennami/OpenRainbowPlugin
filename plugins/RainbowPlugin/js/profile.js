import rainbowSDK from '../rainbow-web-sdk/src/rainbow-sdk.min.js';


export function displayProfileAvatar() {

    const currentUser = rainbowSDK.contacts.getConnectedUser();
    
    const header =document.getElementById('header');

    // Get existing header icon element
    const headerIcon = document.getElementById('sidebarheader');

    // Set background image based on avatar URL
    if (currentUser.avatar) {
        headerIcon.style.backgroundImage = `url(${currentUser.avatar.src})`;
    } else {
        // Set default avatar background using ui-avatars.com API
        var initials = currentUser.name.split(' ').map(part => part.charAt(0)).join('');
        headerIcon.style.backgroundImage = `url(https://ui-avatars.com/api/?name=${initials})`;
    }

    // Adjust background size and position (optional)
    headerIcon.style.backgroundSize = 'cover'; // Resize image to cover the icon
    headerIcon.style.backgroundPosition = 'center'; // Center image within the icon



    // Create the status icon element
    var statusIcon = document.createElement('i');
    statusIcon.classList.add('status-icon');


    // Check the contact status and add the appropriate icon
    switch (currentUser.status) {
        case 'online':
            statusIcon.classList.add('fas', 'fa-check-circle', 'online');
            statusIcon.style.color = 'green'; // Add green color for online
            break;
        case 'away':
            statusIcon.classList.add('fas', 'fa-moon', 'away');
            statusIcon.style.color = 'rgb(255, 204, 0)'; // Orange color
            statusIcon.style.transform = 'rotate(15deg) scaleX(-1)';
            break;
        case 'dnd':
            statusIcon.classList.add('fas', 'fa-minus-circle', 'dnd');
            statusIcon.style.color = 'red'; // Add red color for do not disturb
            break;
        case 'unknown':
        case 'offline':
        default:
            statusIcon.classList.add('fas', 'fa-circle', 'offline');
            statusIcon.style.color = 'gray'; // Add gray color for offline/unknown
            break;
    }
    
    const avatarSize = headerIcon.clientWidth; // Get width or height of the avatar
  const statusIconOffset = avatarSize / 2 - statusIcon.clientWidth / 2; // Calculate offset for centering

  // Set status icon position with calculated offset
  statusIcon.style.right = `${statusIconOffset}px`;


header.append(headerIcon);
header.append(statusIcon);


}


let onNewPresenceChnageReceived = function(event) {

    const currentUserId = rainbowSDK.contacts.getConnectedUser().dbId;
    var contactId = event.detail.id;
    var status = event.detail.status;
    if (currentUserId === contactId) {
        const sideBarHeader = document.getElementById('sidebarheader');
        const statusIcon = sideBarHeader.querySelector('.avatar-container .status-icon');
        if (statusIcon) {
            // Check the contact status and add the appropriate icon
            switch (status) {
                case 'online':
                    statusIcon.classList.add('fas', 'fa-check-circle', 'online');
                    statusIcon.style.color = 'green'; // Add green color for online
                    break;
                case 'away':
                    statusIcon.classList.add('fas', 'fa-moon', 'away');
                    statusIcon.style.color = 'rgb(255, 204, 0)'; // Orange color
                    statusIcon.style.transform = 'rotate(15deg) scaleX(-1)';
                    break;
                case 'dnd':
                    statusIcon.classList.add('fas', 'fa-minus-circle', 'dnd');
                    statusIcon.style.color = 'red'; // Add red color for do not disturb
                    break;
                case 'unknown':
                case 'offline':
                default:
                    statusIcon.classList.add('fas', 'fa-circle', 'offline');
                    statusIcon.style.color = 'gray'; // Add gray color for offline/unknown
                    break;
            }

        }

    }
}

document.addEventListener(rainbowSDK.presence.RAINBOW_ONCONTACTRICHPRESENCECHANGED, onNewPresenceChnageReceived)
