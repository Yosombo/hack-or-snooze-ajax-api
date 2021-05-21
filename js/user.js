'use strict';

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug('login', evt);
  evt.preventDefault();

  // grab the username and password
  const username = $('#login-username').val();
  const password = $('#login-password').val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);
  console.log(currentUser);
  $loginForm.trigger('reset');

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on('submit', login);

async function updateUserInfo() {
  console.debug('updateUserInfo');
  e.preventDefault();
  // let updatedUsername = $('#update-user-username').val() =currentUser.username;
  $('#update-user-username').val();
  const username = currentUser.username;
  const name = currentUser.name;
  const token = currentUser.loginToken;
  const response = await axios({
    url: `${BASE_URL}/users/username`,
    method: 'PATCH',
    data: { token, user: { username, name, password } },
  });

  console.log(response);
}

$navUserProfile.on('click', () => {
  const username = currentUser.username;
  const name = currentUser.name;
  const createdAt = currentUser.createdAt;
  $allStoriesList.empty();
  let $userInfo = $(`
  <div id="user-info">
  <h3>User Profile  <i class="fas fa-user-edit"></i></h3>
  <p>Username: ${username}</p>
  <p>Name: ${name}</p>
  <p>Created at: ${createdAt}</p>
</div>`);
  $allStoriesList.append($userInfo);
});

$allStoriesList.on('click', 'i', (e) => {
  const $icon = $(e.target);
  const username = currentUser.username;
  const name = currentUser.name;
  if ($icon.hasClass('fa-user-edit')) {
    showUpdateform(name);
  }
});
const showUpdateform = (name) => {
  const $userUpdateForm = $(`
  <div id='update-form'>
<div class="update-input">
  <label for="update-name">New name</label>
  <input id="update-name" autocomplete="current-name" value=${name}>
</div>
<div class="update-input">
  <label for="update-password">New password</label>
  <input id="update-password" autocomplete="current-password">
</div>
<button type="update" id="update-user">Submit</button>
<hr>
</div>`);
  $allStoriesList.append($userUpdateForm);
};
async function sumbitNewuserInfo() {
  const token = currentUser.loginToken;
  const username = $('#update-username').val();
  const name = $('#update-name').val();
  const password = $('#update-password').val();
  const response = await axios({
    url: `${BASE_URL}/users/${username}`,
    method: 'PATCH',
    data: { token, user: { name } },
  });
}
$allStoriesList.on('click', '#update-user', sumbitNewuserInfo);
/** Handle signup form submission. */

async function signup(evt) {
  try {
    console.debug('signup', evt);
    evt.preventDefault();

    const name = $('#signup-name').val();
    const username = $('#signup-username').val();
    const password = $('#signup-password').val();

    // User.signup retrieves user info from API and returns User instance
    // which we'll make the globally-available, logged-in user.
    currentUser = await User.signup(username, password, name);

    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();

    $signupForm.trigger('reset');
  } catch (e) {
    if (e.response.status === 409) {
      $signupForm.trigger('reset');
      alert('Username has already been taken');
    }
  }
}

$signupForm.on('submit', signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug('logout', evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on('click', logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug('checkForRememberedUser');
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug('saveUserCredentialsInLocalStorage');
  if (currentUser) {
    localStorage.setItem('token', currentUser.loginToken);
    localStorage.setItem('username', currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug('updateUIOnUserLogin');

  $allStoriesList.show();

  updateNavOnLogin();
}
