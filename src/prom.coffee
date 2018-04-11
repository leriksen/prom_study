request = require 'request-promise'
merge = require 'merge'

userDetails = undefined
# Setting URL and headers for request
options =
  headers:
    'User-Agent': 'node/request'
    resolveWithFullResponse: true
    simple: false

users = [
  'leriksen',
  'narenaryan',
  '500'
]

checkUsers = (users) =>
  Promise.all users.map (user) =>
    checkUser user

checkUser = (user) =>
  console.log "checking user #{user}"
  request merge options,
    url: "https://api.github.com/users/#{user}"
  .then (response) =>
    JSON.parse response
  .catch (err) =>
    console.log "caught error for user #{user}", err.message
    # restore chain with empty data
    {}

checkFollowers = (followerURLS) =>
  Promise.all followerURLS.map (followerUrl) =>
    checkFollower followerUrl

checkFollower = (hasFollowerURL) =>
  url = hasFollowerURL.followers_url
  request merge options,
    url: url
  .then (response) =>
    {
      user: url
      followers: JSON.parse response
    }
  .catch (err) =>
    console.log "caught error for url #{url}", err.message
    {}

checkUsers users
.then (results) =>
#  get just the ones with follower URLs
  results.filter (result) =>
    result.hasOwnProperty("followers_url")
.then (hasFollowersURLs) =>
  checkFollowers hasFollowersURLs
.then (followedBy) =>
  # show us
  followedBy.map (follows) =>
    console.log "#{follows.user} has #{follows.followers.length} users"
.then () =>
  console.log "Done"