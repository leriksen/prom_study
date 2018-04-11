(function() {
  var checkFollower, checkFollowers, checkUser, checkUsers, merge, options, request, userDetails, users;

  request = require('request-promise');

  merge = require('merge');

  userDetails = void 0;

  // Setting URL and headers for request
  options = {
    headers: {
      'User-Agent': 'node/request',
      resolveWithFullResponse: true,
      simple: false
    }
  };

  users = ['leriksen', 'narenaryan', '500'];

  checkUsers = (users) => {
    return Promise.all(users.map((user) => {
      return checkUser(user);
    }));
  };

  checkUser = (user) => {
    console.log(`checking user ${user}`);
    return request(merge(options, {
      url: `https://api.github.com/users/${user}`
    })).then((response) => {
      return JSON.parse(response);
    }).catch((err) => {
      console.log(`caught error for user ${user}`, err.message);
      return {};
    });
  };

  // restore chain with empty data
  checkFollowers = (followerURLS) => {
    return Promise.all(followerURLS.map((followerUrl) => {
      return checkFollower(followerUrl);
    }));
  };

  checkFollower = (hasFollowerURL) => {
    var url;
    url = hasFollowerURL.followers_url;
    return request(merge(options, {
      url: url
    })).then((response) => {
      return {
        user: url,
        followers: JSON.parse(response)
      };
    }).catch((err) => {
      console.log(`caught error for url ${url}`, err.message);
      return {};
    });
  };

  checkUsers(users).then((results) => {
    //  get just the ones with follower URLs
    return results.filter((result) => {
      return result.hasOwnProperty("followers_url");
    });
  }).then((hasFollowersURLs) => {
    return checkFollowers(hasFollowersURLs);
  }).then((followedBy) => {
    // show us
    return followedBy.map((follows) => {
      return console.log(`${follows.user} has ${follows.followers.length} users`);
    });
  }).then(() => {
    return console.log("Done");
  });

}).call(this);

//# sourceMappingURL=prom.js.map
