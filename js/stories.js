'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, deleteEdit = '') {
  // console.debug('generateStoryMarkup', story);
  let favStar = 'far';
  if (currentUser) {
    currentUser.favorites.forEach((e) => {
      if (e.storyId === story.storyId) {
        favStar = 'fas';
      }
    });
  }
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${deleteEdit}<i class="${favStar} fa-star"></i><a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

async function putStoriesOnPage() {
  console.debug('putStoriesOnPage');
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
async function putFavStoriesOnPage() {
  console.debug('putFavStoriesOnPage');
  $allStoriesList.empty();
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
$navFavorites.on('click', putFavStoriesOnPage);

function putOwnStoriesOnPage() {
  console.debug('putFavStoriesOnPage');
  $allStoriesList.empty();
  const deleteEdit = `<i class="far fa-trash-alt"></i> <i class="far fa-edit"></i>`;
  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story, deleteEdit);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
$navMyStory.on('click', putOwnStoriesOnPage);

async function submitNewStory(e) {
  console.debug('submitNewStory');
  e.preventDefault();
  const title = $('#submit-title').val();
  const author = $('#submit-author').val();
  let url = $('#submit-url').val();
  if (!url.startsWith('https://')) {
    url = `https://${url}`;
  }
  const username = currentUser.username;
  const storyData = { title, author, url, username };
  const story = await storyList.addStory(currentUser, storyData);
  currentUser.ownStories.unshift(story);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.hide();
  $submitForm.trigger('reset');
}

$submitForm.on('submit', submitNewStory);

$allStoriesList.on('click', 'i', async (e) => {
  const $icon = $(e.target);
  const storyId = $icon.parent().attr('id');
  const story = storyList.stories.find((s) => s.storyId === storyId);
  if ($icon.hasClass('fa-star')) {
    $icon.hasClass('far')
      ? currentUser.toggleFavStory(story, 'post')
      : currentUser.toggleFavStory(story, 'delete');
    $icon.toggleClass('fas far');
  }
  if ($icon.hasClass('fa-trash-alt')) {
    await storyList.deleteStory(currentUser, storyId);
    currentUser.ownStories = currentUser.ownStories.filter(
      (s) => s.storyId !== storyId
    );
    $icon.parent().remove();
  }
  if ($icon.hasClass('fa-edit')) {
    const $li = $icon.parent();
    $li.html(`<div id='edit-form'>
    <div class="edit-input">
      <label for="edit-title">Title</label>
      <input id="edit-title" autocomplete="current-title" value=${story.title}>
    </div>
    <div class="edit-input">
      <label for="edit-author">Author</label>
      <input id="edit-author" autocomplete="current-author" value=${story.author}>
    </div>
    <div class="edit-input">
      <label for="edit-url">Url</label>
      <input id="edit-url" autocomplete="current-url" value=${story.url}>
    </div>
    <button type="edit" id="submit-edit-btn">Submit</button>
    <hr>
    </div>`);
  }
});
async function editStory(e) {
  console.debug('editStory');
  e.preventDefault();
  const $storyForm = $(e.target.parentElement.parentElement);
  const storyId = $storyForm.attr('id');
  const title = $('#edit-title').val();
  const author = $('#edit-author').val();
  let url = $('#edit-url').val();
  if (!url.startsWith('https://')) {
    url = `https://${url}`;
  }
  const username = currentUser.username;
  const storyData = { title, author, url, username };
  const story = await storyList.editStory(currentUser, storyId, storyData);
  const foundItemFromOwnStories = currentUser.ownStories.findIndex(
    (s) => s.storyId === storyId
  );
  currentUser.ownStories[foundItemFromOwnStories] = story;

  const foundItemFromFavStories = currentUser.favorites.findIndex(
    (s) => s.storyId === storyId
  );
  currentUser.favorites[foundItemFromFavStories] = story;
  putOwnStoriesOnPage();
}
$allStoriesList.on('click', '#submit-edit-btn', editStory);
