function createPostElement(postId, title, text, author, authorId, authorPic) {
    var uid = firebase.auth().currentUser.uid;

    // use jQuery to create a post element with the given values
    // TODO
    var postElement = $('<div id="' + postId + '"><div class="title">' + title + '</div><div class="text">' + text + '</div></div>');

    return postElement;
}


// Saves a new post to the Firebase DB.
function writeNewPost(uid, username, picture, title, body) {
  // A post entry.
  var postData = {
    author: username,
    uid: uid,
    body: body,
    title: title,
    authorPic: picture
  };

  // Get a key for a new Post.
  var newPostKey = firebase.database().ref().child('posts').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/posts/' + newPostKey] = postData;

  return firebase.database().ref().update(updates);
}

// Creates a new post for the current user.
function newPostForCurrentUser(title, text) {
  var userId = firebase.auth().currentUser.uid;
  return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
    var username = snapshot.val().username;
    return writeNewPost(firebase.auth().currentUser.uid, username,
        firebase.auth().currentUser.photoURL,
        title, text);
  });
}

function fetchDataFromFirebase() {
    var recentPosts = firebase.database().ref('posts').limitToLast(100);

    recentPosts.on('child_added', function(data) {
        var author = data.val().author || 'Anonymous';
        var post = createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().authorPic);
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
        profile_picture : imageUrl
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
    } else {
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
        if (text && title) {
            newPostForCurrentUser(title, text)
            $('#new-post-message').val('');
            $('#new-post-title').val('');
        }
    });
});