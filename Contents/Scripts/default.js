include('account.js');
include('issue.js');
include('repository.js');

const SET_TOKEN_FORMAT    = /^!set-token (.*)$/;
const ISSUE_OR_PR_FORMAT  = /^([^\/]+)\/([^\/#]+)(?:\/pull\/|\/issues\/|#)(\d+)$/;
const REPOSITORY_FORMAT   = /^([^\/]+)\/([^\/#]+)$/;
const ACCOUNT_FORMAT      = /^(\w+)$/;

function run(argument) {
  runWithString(argument);
}

function runWithString(string) {
  let match;

  // Matching:
  // set-token <token>
  if (match = string.match(SET_TOKEN_FORMAT)) {
    return setToken(match[1])
  }

  // Matching:
  // rails/rails#123
  // rails/rails/issues/123
  // rails/rails/pull/123
  else if (match = string.match(ISSUE_OR_PR_FORMAT)) {
    let owner       = new Account(match[1])
    let repository  = new Repository(owner, match[2]);
    let issue       = new Issue(repository, match[3])
    return openIssue(issue);
  }

  // Matching:
  // rails/rails
  else if (match = string.match(REPOSITORY_FORMAT)) {
    let owner       = new Account(match[1])
    let repository  = new Repository(owner, match[2]);
    return openRepository(repository);
  }

  // Matching:
  // rails
  else if (match = string.match(ACCOUNT_FORMAT)) {
    let account = new Account(match[1])
    return openAccount(account);
  }

  // Matching everything else:
  // rails/rails/tree/master/Gemfile
  else {
    LaunchBar.openURL('https://github.com/' + string);
  }
}

function setToken(token) {
  Action.preferences.token = token;
  LaunchBar.displayNotification({
    title: 'GitHub access token set successfully'
  });
}

function openIssue(issue) {
  LaunchBar.openURL(issue.url);
}

function openRepository(repository) {
  if (LaunchBar.options.commandKey == 1) {
    LaunchBar.openURL(repository.url)
  } else {
    return [
      {
        title: 'View Repository',
        subtitle: repository.slug,
        alwaysShowsSubtitle: true,
        icon: 'repo.png',
        url: repository.url,
      },
      {
        title: 'View Issues',
        icon: 'issue.png',
        url: repository.issuesURL,
      },
      {
        title: 'View Pull Requests',
        icon: 'pull-request.png',
        url: repository.pullRequestsURL,
      }
    ]
  }
}

function openAccount(account) {
  if (LaunchBar.options.commandKey == 1) {
    LaunchBar.openURL(account.profileURL)
  } else {
    return [
      {
        title: 'View Profile',
        subtitle: account.handle,
        alwaysShowsSubtitle: true,
        icon: 'person.png',
        url: account.profileURL,
      },
      {
        title: 'View Repositories',
        icon: 'repo.png',
        action: 'openAccountRepositories',
        actionArgument: account.login,
        actionReturnsItems: true,
      },
      {
        title: 'View Issues',
        icon: 'issue.png',
        url: account.issuesURL,
      },
      {
        title: 'View Pull Requests',
        icon: 'pull-request.png',
        url: account.pullRequestsURL,
      },
      {
        title: 'View Gists',
        icon: 'gist.png',
        url: account.gistsURL,
      }
    ]
  }
}

function openAccountRepositories(login) {
  let account = new Account(login)

  if (LaunchBar.options.commandKey == 1) {
    LaunchBar.openURL(account.repositoriesURL)
  } else {
    return [
      {
        title: 'View All Repositories',
        icon: 'repos.png',
        url: account.repositoriesURL
      }
    ].concat(account.repositories().map(function(repository) {
      return repository.toMenuItem()
    }));
  }
}
