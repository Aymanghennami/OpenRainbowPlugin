

function getConversations() {
    rainbowSDK.conversations.getAllConversations()
        .then(function (conversations) {
            conversations.forEach(conversation => {
                rainbowSDK.contacts.getContactById(conversation.contact.dbId)
                    .then(contact => {
                        console.log('the conversation id', conversation);
                        var contactName = contact.firstname + ' ' + contact.lastname;
                        var contactAvatar = contact.avatar;
                        console.log('contact name ', contactName, 'contact avatar:', contactAvatar);
                    })
                    .catch(err => {
                        console.log('[Hello World] :: Something went wrong while getting the contactById..', err);
                    });
            });
        })
        .catch(function (error) {
            console.error('Error getting conversations:', error);
        });
}

export default getConversations();