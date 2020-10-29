const baseURL = "http://localhost:8000";

let all_posts = "";
let following = "";
let profile = "";
let user_id = 0;

document.addEventListener('DOMContentLoaded', () => {
    all_posts = document.querySelector('#all-posts');
    following = document.querySelector('#following');
    profile = document.querySelector('#profile-page');

    if (user_id !== 0) {
        document.querySelector('#user-profile').addEventListener('click', () => load_pages('profile'));
        document.querySelector('#following-page').addEventListener('click', () => load_pages('following'));
        const postForm = document.querySelector('#post-form');
        const postData = document.querySelector('#post-message');
        postForm.onsubmit = function () {
            if (postData.value !== "") {
                const post = createPostObject(postData.value);
                add_post(post);
                postData.value = "";
            }
            return false;
        }        
    }
    
    document.querySelector('#posts-page').addEventListener('click', () => load_pages('posts'));
    if (window.location.href !== 'http://localhost:8000/login' && window.location.href !== 'http://localhost:8000/register'){
        load_pages('posts');
    }
});

function load_pages(page){
    const pages = {
        posts() {
            load_all_posts(); 
        },
        profile() {
            load_profile_page();
        },
        following() {
            load_following_page();
        }
    }

    const page_to_load = pages[page];
    if (page_to_load) {
        page_to_load();
    }
}

function load_profile_page() {
    showProfile();
}

function load_all_posts() {
    showPostDiv();
    fetch_all_posts();
}

function load_following_page() {
    showFollowingPage();
    fetch_following_posts();
}

function showProfile() {
    if (user_id !== 0) {
        following.style.display = 'none';
    }
    all_posts.style.display = 'none';
    profile.style.display = 'block';
}

function showPostDiv() {
    if (user_id !== 0 ){
        following.style.display = 'none';
        profile.style.display = 'none';

    }
    all_posts.style.display = 'block';
}

function showFollowingPage() {
    profile.style.display = 'none';
    all_posts.style.display = 'none';
    following.style.display = 'block';
}

function fetch_all_posts() {
    const getAllPostsURL = `${baseURL}/all_posts`;
    fetch(getAllPostsURL)
    .then(response => response.json())
    .then(posts => { 
        createPostsDiv(posts, 'posts');
    });
}

function fetch_posts_page(page_number) {
    const getAllPostsURL = `${baseURL}/get_post_page`;
    fetch(getAllPostsURL, {
        method: "POST",
        body: JSON.stringify({
            "page_num": page_number
        })
    })
    .then(response => response.json())
    .then(posts => { 
        createPostsDiv(posts, 'posts');
    });    
}

function fetch_following_posts_page(page_number) {
    const getAllPostsURL = `${baseURL}/get_following_post_page`;
    fetch(getAllPostsURL, {
        method: "POST",
        body: JSON.stringify({
            "page_num": page_number
        })
    })
    .then(response => response.json())
    .then(posts => { 
        createPostsDiv(posts, 'following-posts');
    });    
}

function fetch_users_posts_page(page_number, user_id) {
    const getUsersPostsURL = `${baseURL}/get_user_post_page`;
    fetch(getUsersPostsURL, {
        method: "POST",
        body: JSON.stringify({
            "page_num" : page_number,
            "user_id": user_id
        })
    })
    .then(response => response.json())
    .then(posts => {
        createPostsDiv(posts, 'user-posts')
    });
}

function fetch_users_posts(user_id) {
    const getUserPostsURL = `${baseURL}/user_posts/${user_id}`;
    fetch(getUserPostsURL)
    .then(response => response.json())
    .then(posts => {
        createPostsDiv(posts, 'user-posts');
    });
}

function createPostObject(postMessage) {
    const post = {
        message: postMessage
    }
    return post;
}

function createPostsDiv(posts, element) {
    const postsDiv = document.querySelector(`#${element}`);
    postsDiv.innerHTML = "";
    posts.posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('postDiv', 'rounded', 'col-9');
        const owner = document.createElement('div');
        const ownerLink = document.createElement('a');
        const link = document.createTextNode(capitalize(post.post_owner.username));
        const text = document.createElement('div');
        const date = document.createElement('div');
        const likesDiv = document.createElement('div');
        const likes = document.createElement('div');
        const heart = document.createElement('a');
        
        postDiv.setAttribute("id", `post-${post.id}`);
        ownerLink.append(link);
        ownerLink.href = "";
        ownerLink.onclick = function() {
            getUserProfile(post.post_owner.id);
            return false;
        }
        owner.append(ownerLink); 
        ownerLink.classList.add('post-owner');
        text.innerText = post.text;
        text.setAttribute("id", `post-text-${post.id}`)
        date.innerText = post.creation_date;
        date.classList.add('date');

        postDiv.append(owner);
        postDiv.append(document.createElement('br'));
        if (post.post_owner.id === user_id) {
            const edit = document.createElement('div');
            const editLink = document.createElement('a');
            const link = document.createTextNode('Edit');
            editLink.append(link);
            editLink.href = "";
            editLink.onclick = function() {
                editPost(post.id);
                return false;
            }
            edit.append(editLink);
            postDiv.append(edit);
        }
        postDiv.append(text);
        postDiv.append(date);

        if (user_id !== 0) {
            const liked = post.likes.some( user => user.id === user_id);

            if (liked) {
                heart.classList.add('fa', 'fa-heart', 'heart-liked');
            }
            else {
                heart.classList.add('fa', 'fa-heart', 'heart-unliked');
            }
            heart.onclick = function() {
                likeAPost(post.id);
                return false;
            }
            heart.href = "";
        } else {
            heart.classList.add('fa', 'fa-heart', 'heart-unliked');
        }
        
        likesDiv.classList.add('likes-div');
        likesDiv.append(heart);
        likes.classList.add('like');
        likes.innerHTML = post.likes.length;
        likesDiv.append(likes);
        postDiv.append(likesDiv);
        postsDiv.append(postDiv);
        postsDiv.append(document.createElement('br'));
    });
    
    //page navigation ui
    const paginationNav = document.createElement('nav');
    const paginationUl = document.createElement('ul');
    paginationUl.classList.add('pagination');

    let paginationLi = document.createElement('li');
    let paginationLink = document.createElement('a');
    paginationLi.classList.add('page-item');
    paginationLink.classList.add('page-link');
    paginationLink.href="#";
    paginationLink.innerText = "Previous";
    if (posts.requested_page === 1) {
        paginationLi.classList.add('disabled');
    } else {
        paginationLink.onclick = function() {
            if (element === 'posts') {
                fetch_posts_page(posts.requested_page - 1);
            }
            else if (element === 'following-posts' ){
                fetch_following_posts_page(posts.requested_page - 1);
            }
            else if (element === 'user-posts') {
                fetch_users_posts_page(posts.requested_page - 1, posts.posts[0].post_owner.id);
            }
            return false;
        }
    }
    paginationLi.append(paginationLink);
    paginationUl.append(paginationLi);
    
    //pages build
    for(let i=1; i <= posts.total_pages; i++){
        paginationLi = document.createElement('li');
        paginationLink = document.createElement('a');
        paginationLi.classList.add('page-item');
        paginationLink.classList.add('page-link')
        paginationLink.href="#";
        paginationLink.innerText = i;

        if (posts.requested_page === i) {
            paginationLi.classList.add('active');
        }
        //fetch specific page
        paginationLink.onclick = function() {
            if (element === 'posts') {
                fetch_posts_page(i);
            }
            else if (element === 'following-posts'){
                fetch_following_posts_page(i);
            }
            else if (element === 'user-posts') {
                fetch_users_posts_page(i, posts.posts[0].post_owner.id);
            }                        
            return false;
        }

        paginationLi.append(paginationLink);
        paginationUl.append(paginationLi);
    }

    paginationLi = document.createElement('li');
    paginationLink = document.createElement('a');
    paginationLi.classList.add('page-item');
    paginationLink.classList.add('page-link');
    paginationLink.href="#";
    paginationLink.innerText = "Next";
    
    if (posts.requested_page === posts.total_pages) {
        paginationLi.classList.add('disabled')
    } else {
        paginationLink.onclick = function() {
            if (element === 'posts') {
                fetch_posts_page(posts.requested_page + 1);
            }
            else if (element === 'following-posts' ){
                fetch_following_posts_page(posts.requested_page + 1);
            }      
            else if (element === 'user-posts') {
                fetch_users_posts_page(posts.requested_page + 1, posts.posts[0].post_owner.id);
            }                  
            return false;
        }
    }
    paginationLi.append(paginationLink);
    paginationUl.append(paginationLi);

    paginationNav.append(paginationUl);
    postsDiv.append(paginationNav);
}


function getUserProfile(userId) {
    const getUserURL = `${baseURL}/user/${userId}`;
    fetch(getUserURL)
    .then(response => response.json())
    .then(user => {
        showProfile();
        createProfileDiv(user);
    });
}

function createProfileDiv(user) {
    const user_page = document.querySelector('#user-page');

    user_page.innerHTML = "";
    user_page.classList.add('user-page', 'rounded');
    
    const username = document.createElement('div');
    const following = document.createElement('div');
    const followers = document.createElement('div');
    const usernameSpan = document.createElement('span');
    const userFollowers = document.createElement('span');
    const userFollowing = document.createElement('span');

    const followButton = document.createElement('button');
    

    usernameSpan.classList.add('user-page-username');
    userFollowers.classList.add('user-page-followers');
    userFollowing.classList.add('user-page-following');

    usernameSpan.innerText = "Username: ";
    username.append(usernameSpan);;
    username.append(capitalize(user.username));

    userFollowing.innerText = "Following: ";
    following.append(userFollowing);
    following.append(user.following.length);

    userFollowers.innerText = "Followers: ";
    followers.append(userFollowers);
    followers.append(user.followers.length);
    user_page.append(document.createElement('br'));
    user_page.append(username);
    user_page.append(following);
    user_page.append(followers);

  
    const follows = user.followers.some( follower => follower.id === user_id);
    if (follows) {
        followButton.classList.add('btn', 'btn-warning')
        followButton.innerText = "Unfollow";
    }
    else{
        followButton.classList.add('btn', 'btn-primary')
        followButton.innerText = "Follow";
    }
    followButton.onclick = function () {
        follow(user.id);
        return false;
    }    

    if (user_id !== 0) {
        if (user_id !== user.id) {
            user_page.append(followButton);
        }
    }
    user_page.append(document.createElement('br'));
    fetch_users_posts(user.id);
}

function add_post(post) {
    const addPostURL = `${baseURL}/add_post`;
    fetch(addPostURL, {
        method: 'POST',
        body: JSON.stringify(post)
    })
    .then(response => response.json())
    .then(result => {
        if (!result.error) {
            fetch_all_posts();
        }
    });
}

function follow(userId) {
    const followURL = `${baseURL}/follow`;
    fetch(followURL, {
        method: 'POST',
        body: JSON.stringify({
            "followed_id": userId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (!result.error) {
            getUserProfile(userId);
        }        
    });
}


function likeAPost(postId) {
    const likePostURL = `${baseURL}/like_post`;
    fetch(likePostURL, {
        method: 'POST',
        body: JSON.stringify({
            "post_id": postId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (!result.error) {
            load_pages('posts');
        }
    });

}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getUserId(userId) {
    user_id = userId;
}

function fetch_following_posts() {
    const followinPostURL = `${baseURL}/following_post`;
    fetch(followinPostURL)
    .then(response => response.json())
    .then(posts => {
        createPostsDiv(posts, 'following-posts');
    });
}

function editPost(post_id) {
    const postDiv = document.getElementById(`post-${post_id}`);
    const postTextDiv = document.getElementById(`post-text-${post_id}`);
    let postText = postTextDiv.innerText;
    postDiv.innerHTML = "";

    const h2Text = document.createElement('h2');
    h2Text.innerText = "Edit your post";
    const editForm = document.createElement('form');
    const textEdited = document.createElement('textarea');
    const editButtonSumit = document.createElement('button');

    editForm.classList.add('form-group');
    textEdited.classList.add('form-control')
    textEdited.setAttribute("rows", 3);
    textEdited.innerText = postText;
    editButtonSumit.classList.add('btn', 'btn-primary');
    editButtonSumit.setAttribute("type", "submit");
    editButtonSumit.innerText = "Save";
    
    editForm.onsubmit = function() {
        if (textEdited.value !== "") {
            let editedPost = createPostObject(textEdited.value);
            editedPost.post_id = post_id;
            fetchEditPost(editedPost);
            textEdited.value = "";
        }
        return false;
    }
    editForm.append(textEdited);
    editForm.append(document.createElement('br'));
    editForm.append(editButtonSumit);
    postDiv.append(h2Text);
    postDiv.append(editForm);
}

function fetchEditPost(editedPost) {
    const editPostURL = `${baseURL}/edit_post`;
    fetch(editPostURL, {
        method: 'POST',
        body: JSON.stringify(editedPost)
    })
    .then(response => response.json())
    .then(result => {
        if (!result.error) {
            fetch_all_posts();
        }
    });
}




