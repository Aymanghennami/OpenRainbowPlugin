import rainbowSDK from '../rainbow-web-sdk/src/rainbow-sdk.min.js';

import { getRecentConversations } from './conversation.js';

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
                        getRecentConversations(); // Fetch conversations after successful sign-in

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




// Add event listener to the search input



document.getElementById("recentConversationsHeader").addEventListener("click", function() {
    this.parentElement.classList.toggle("expanded");
});






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
