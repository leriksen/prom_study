(function() {
  var anyRemotePerms, baseURL, checkFollower, checkFollowers, checkPing, checkRepo, checkRepos, commandLineArgs, groupEndoint, groupVariants, merge, optionDefinitions, options, permEndpoint, permisionsMap, permissionVariants, pingEndpoint, repoEndpoint, repoVariants, request, requiredGroups, requiredPerms, requiredRepos;

  request = require('request-promise');

  merge = require('merge');

  commandLineArgs = require('command-line-args');

  optionDefinitions = [
    {
      name: 'repo',
      alias: 'r',
      type: String
    },
    {
      name: 'layout',
      alias: 'l',
      type: String
    },
    {
      name: 'package',
      alias: 'p',
      type: String
    }
  ];

  options = commandLineArgs(optionDefinitions);

  repoVariants = ['build', 'verify', 'release'];

  groupVariants = ['build-users', 'build-svc', 'read', 'release-users', 'release-svc'];

  // copy
  permissionVariants = repoVariants.slice();

  permisionsMap = {
    build: {
      'build-users': ['r', 'w', 'n'],
      'build-svc': ['r', 'w', 'n'],
      'read': ['r'],
      'release-users': ['r', 'w'],
      'release-svc': ['r', 'w']
    },
    verify: {},
    release: {
      'build-users': ['r', 'w', 'n'],
      'build-svc': ['r', 'w'],
      'read': ['r'],
      'release-users': ['r', 'w', 'n'],
      'release-svc': ['r', 'w']
    }
  };

  anyRemotePerms = {
    build: {
      'build-users': ['r', 'w'],
      'build-svc': ['r', 'w']
    }
  };

  // Setting URL and headers for request
  options = {
    headers: {
      'User-Agent': 'node/request',
      resolveWithFullResponse: true,
      simple: false,
      headers: {
        'X-JFrog-Art-Api': "os.env.ARTIFACTORY_API_KEY"
      }
    }
  };

  // add support for dev and test envs at some point
  baseURL = "https://github.aus.thenational.com/api/";

  pingEndpoint = baseURL + "system/ping";

  repoEndpoint = baseURL + "repositories/";

  groupEndoint = baseURL + "security/groups/";

  permEndpoint = baseURL + "security/permissions/";

  requiredRepos = [];

  requiredGroups = [];

  requiredPerms = [];

  checkPing = () => {
    return request(merge(options, {
      url: pingEndpoint
    })).then((response) => {
      if (response.statusCode === !200) {
        throw new Error(response.message);
      }
    });
  };

  checkRepos = (repo) => {
    return Promise.all(repoVariants.map((variant) => {
      return checkRepo(`${repo}-${variant}`);
    }));
  };

  checkRepo = (repo) => {
    console.log(`checking repo ${repo}`);
    return request(merge(options, {
      url: repoEndpoint + repo
    })).then((response) => {
      console.log(`${repo} exists, no creation required`);
      return void 0;
    }).catch((err) => {
      console.log(`caught error for user ${user}`, err.message);
      console.log(`add ${repo} to list of repos requiring creation`);
      return repo;
    });
  };

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

  checkPing().then((result) => {
    return checkRepos(options.repo);
  }).then((results) => {
    //  get just the ones with non-200 responses
    return requiredRepos = results.filter((result) => {
      return result === !void 0;
    });
  }).then((requiredRepos) => {
    console.log("the following repos will be built");
    return buildRepos(requiredRepos);
  }).then(() => {
    return checkGroups(options.repo);
  }).then((results) => {
    return requiredGroups = results.filter((result) => {
      return result === !void 0;
    });
  }).then(() => {
    return checkPermisssions(options.repo);
  }).then((results) => {
    var requiredPermissions;
    return requiredPermissions = results.filter((result) => {
      return result === !void 0;
    });
  }).catch((err) => {
    return console.error("an error occurred - ", err.message);
  });

}).call(this);

//# sourceMappingURL=artif.js.map
