function createPostElement(postId, title, text, author, authorId, authorPic, time) {
    var uid = firebase.auth().currentUser.uid;
    //var getTime = new Date();
    //console.log(getTime);
    // use jQuery to create a post element with the given values
    
   //clones post and updates it each time
    var clone = $("#post-template").clone();
    clone.find(".title").html(title);
    clone.find(".text").html(text);
    clone.find(".authorPic").attr('src', authorPic );
    clone.find(".author").html(author);
    clone.find(".time").html(time);
    clone.attr("id", "post" + postId);
    clone.show();
    return clone;


}

// Saves a new post to the Firebase DB.
function writeNewPost(uid, username, picture, title, body, time) {
    // A post entry.
    var postData = {
        author: username,
        uid: uid,
        body: body,
        title: title,
        authorPic: picture,
        time: time
    };

    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('posts').push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/posts/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
}

// Creates a new post for the current user.
function newPostForCurrentUser(title, text, time) {
    var userId = firebase.auth().currentUser.uid;
    return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
        var username = snapshot.val().username;
        return writeNewPost(firebase.auth().currentUser.uid, username,
            firebase.auth().currentUser.photoURL,
            title, text, time);
    });
}

function fetchDataFromFirebase() {
    var recentPosts = firebase.database().ref('posts').limitToLast(100);

    recentPosts.on('child_added', function(data) {
        var author = data.val().author || 'Anonymous';
        var post = createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authorPic, data.val().time);
        $('#recent-posts-list').append(post);
    });
    recentPosts.on('child_changed', function(data) {
        // Do nothing for now, but this lets us update the UI if a post is changed
        console.log('child changed', data);
    });
    recentPosts.on('child_removed', function(data) {
        // Do nothing for now, but this lets us update the UI if a post is removed
        console.log('child removed', data);
    });
}

function storeUserDataInFirebase(userId, name, email, imageUrl) {
    firebase.database().ref('users/' + userId).set({
        username: name,
        email: email,
        profile_picture: imageUrl
    });
}

var currentUID;

function userSignedInOrOut(user) {
    // the current user didn't actually change
    if (user && currentUID === user.uid) {
        return;
    }

    if (user) {
        currentUID = user.uid;
        $('#signed-out-view').hide();
        $('#signed-in-view').show();

        storeUserDataInFirebase(user.uid, user.displayName, user.email, user.photoURL);
        fetchDataFromFirebase();
    }
    else {
        currentUID = null;
        $('#signed-out-view').show();
        $('#signed-in-view').hide();
    }
}


$(document).ready(function() {

    // use firebase to let the user log in with google
    $('#sign-in-button').on('click', function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider);
    });

    // use firebase to sign the user out of google
    $('#sign-out-button').on('click', function() {
        firebase.auth().signOut();
    });

    // tell your app what function to call when the user signs in or out
    firebase.auth().onAuthStateChanged(userSignedInOrOut);


    // Handle the user submitting a new post
    $('#message-form').on('submit', function(e) {
        e.preventDefault();
        var text = $('#new-post-message').val();
        var title = $('#new-post-title').val();;
        var time = new Date()+"";
        if (text && title) {
            newPostForCurrentUser(title, text, time);
            $('#new-post-message').val('');
            $('#new-post-title').val('');
           
        }
    });
});
