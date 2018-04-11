request = require 'request-promise'
merge = require 'merge'
commandLineArgs = require 'command-line-args'

optionDefinitions = [
  name: 'repo'
  alias: 'r'
  type: String
,
  name: 'layout'
  alias: 'l'
  type: String

,
  name: 'package'
  alias: 'p'
  type: String
]

options = commandLineArgs(optionDefinitions)

repoVariants = [
  'build',
  'verify',
  'release'
]

groupVariants = [
  'build-users'
  'build-svc'
  'read'
  'release-users'
  'release-svc'
]

# copy
permissionVariants = repoVariants.slice()

permisionsMap =
  build:
    'build-users':   ['r', 'w', 'n']
    'build-svc':     ['r', 'w', 'n']
    'read':          ['r']
    'release-users': ['r', 'w']
    'release-svc':   ['r', 'w']
  verify: {}
  release:
    'build-users':   ['r', 'w', 'n']
    'build-svc':     ['r','w']
    'read':          ['r']
    'release-users': ['r', 'w', 'n']
    'release-svc':   ['r', 'w']

anyRemotePerms =
  build:
    'build-users':   ['r', 'w']
    'build-svc':     ['r', 'w']

# Setting URL and headers for request
options =
  headers:
    'User-Agent': 'node/request'
    resolveWithFullResponse: true
    simple: false
    headers:
      'X-JFrog-Art-Api': "os.env.ARTIFACTORY_API_KEY"

# add support for dev and test envs at some point

baseURL = "https://github.aus.thenational.com/api/"

pingEndpoint = baseURL + "system/ping"
repoEndpoint = baseURL + "repositories/"
groupEndoint = baseURL + "security/groups/"
permEndpoint = baseURL + "security/permissions/"

requiredRepos = []
requiredGroups = []
requiredPerms = []

checkPing = () =>
  request merge options,
    url: pingEndpoint
  .then (response) =>
    if response.statusCode is not 200
      throw new Error response.message

checkRepos = (repo) =>
  Promise.all repoVariants.map (variant) =>
    checkRepo "#{repo}-#{variant}"

checkRepo = (repo) =>
  console.log "checking repo #{repo}"
  request merge options,
    url: repoEndpoint + repo
  .then (response) =>
    console.log "#{repo} exists, no creation required"
    undefined
  .catch (err) =>
    console.log "caught error for user #{user}", err.message
    console.log "add #{repo} to list of repos requiring creation"
    repo

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

checkPing()
.then (result) =>
  checkRepos options.repo
.then (results) =>
#  get just the ones with non-200 responses
  requiredRepos = results.filter (result) =>
    result is not undefined
.then (requiredRepos) =>
  console.log "the following repos will be built"
  buildRepos requiredRepos

.then () =>
  checkGroups options.repo
.then (results) =>
  requiredGroups = results.filter (result) =>
    result is not undefined

.then () =>
  checkPermisssions options.repo
.then (results) =>
  requiredPermissions = results.filter (result) =>
    result is not undefined

.catch (err) =>
  console.error "an error occurred - ", err.message