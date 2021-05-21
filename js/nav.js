'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

async function navAllStories(evt) {
  console.debug('navAllStories', evt);
  hidePageComponents();
  storyList = await StoryList.getStories();
  putStoriesOnPage();
}

$body.on('click', '#nav-all', navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug('navLoginClick', evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on('click', navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug('updateNavOnLogin');
  $('.main-nav-links').show();
  $navLogin.hide();
  $navLogOut.show();
  $navLinks.css('display', 'flex');
  $navUserProfile.text(`${currentUser.username}`).show();
  $loginForm.hide();
  $signupForm.hide();
}

$navSubmit.on('click', () => {
  $submitForm.show();
});
