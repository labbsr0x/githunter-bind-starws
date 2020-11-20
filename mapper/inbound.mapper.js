const JM = require('json-mapper');
const Utils = require('../utils');

const h = JM.helpers;

const pulls = JM.makeConverter({
  dateTime: input => Utils.dateFormat4StarWS(input.updatedAt),
  fields: {
    number: ['number', h.toString],
    createdAt: input => Utils.dateFormat4StarWS(input.createdAt),
    author: input => Utils.prepareString4StarWS(`a:${input.author}`),
    updatedAt: input => Utils.dateFormat4StarWS(input.updatedAt),
    state: 'state',
    closedAt: input => Utils.dateFormat4StarWS(input.closedAt),
    merged: ['merged', h.toString],
    mergedAt: input => Utils.dateFormat4StarWS(input.mergedAt),
    labels: input => Utils.concatArray4StarWS(input.labels),
    totalParticipants: ['participants.totalCount', h.toString],
    participants: input => {
      const participants =
        input.participants && input.participants.users
          ? Utils.concatArray4StarWS(input.participants.users)
          : '';
      return `p:${participants}`;
    },
    commentsTotal: ['comments.totalCount', h.toString],
    commentsUpdatedAt: input =>
      Utils.dateFormat4StarWS(input.comments.updatedAt),
    comments: input => {
      const authors =
        input.comments && input.comments.data
          ? input.comments.data.map(item => item.author).join(',')
          : '';
      return Utils.prepareString4StarWS(`a:${authors}`);
    },
    rawData: input => {
      if (input.rawData) {
        return input.rawData;
      }
      return `https://datajson/empty`;
    },
    dono: input => {
      return `o:${input.owner}`;
    },
    name: input => {
      return `n:${input.name}`;
    },
    provider: 'provider',
    type: JM.helpers.def('pull'),
  },
  tags: {
    category: JM.helpers.def('CXF'),
  },
});

const issues = JM.makeConverter({
  dateTime: Utils.dateFormat4StarWS(input.updatedAt),
  fields: {
    number: ['number', h.toString],
    state: 'state',
    createdAt: input => Utils.dateFormat4StarWS(input.createdAt),
    closedAt: input => Utils.dateFormat4StarWS(input.closedAt),
    updatedAt: input => Utils.dateFormat4StarWS(input.updatedAt),
    author: input => Utils.prepareString4StarWS(`a:${input.author}`),
    labels: input => Utils.concatArray4StarWS(input.labels),
    participantsTotalCount: ['participants.totalCount', h.toString],
    participants: input => {
      const participants =
        input.participants && input.participants.users
          ? Utils.concatArray4StarWS(input.participants.users)
          : '';
      return `p:${participants}`;
    },
    commentsTotalCount: ['comments.totalCount', h.toString],
    commentsUpdatedAt: input =>
      Utils.dateFormat4StarWS(input.comments.updatedAt),
    comments: input => {
      const authors =
        input.comments && input.comments.data
          ? input.comments.data.map(item => item.author).join(',')
          : '';
      return Utils.prepareString4StarWS(`a:${authors}`);
    },
    rawData: input => {
      if (input.rawData) {
        return input.rawData;
      }
      return `https://datajson/empty`;
    },
    dono: input => {
      return `o:${input.owner}`;
    },
    name: input => {
      return `n:${input.name}`;
    },
    provider: 'provider',
    type: JM.helpers.def('issues'),
  },
  tags: {
    category: JM.helpers.def('CXF'),
  },
});

const commits = JM.makeConverter({
  dateTime: Utils.dateFormat4StarWS(input.committedDate),
  fields: {
    message: input => {
      return Utils.prepareString4StarWS(`m:${input.message}`);
    },
    committedDate: data => Utils.dateFormat4StarWS(data.committedDate),
    author: input => Utils.prepareString4StarWS(`a:${input.author}`),
    rawData: input => {
      if (input.rawData) {
        return input.rawData;
      }
      return `https://datajson/empty`;
    },
    dono: input => {
      return `o:${input.owner}`;
    },
    name: input => {
      return `n:${input.name}`;
    },
    provider: 'provider',
    type: JM.helpers.def('commits'),
  },
  tags: {
    category: JM.helpers.def('CXF'),
  },
});

const userStats = JM.makeConverter({
  dateTime: input => {
    if (input.dateTime) {
      return input.dateTime;
    }
    return Utils.nanoSeconds();
  },
  fields: {
    name: ['name', h.toString],
    login: ['login', h.toString],
    avatarUrl: 'avatarUrl',
    contributedRepositories: ['amount.contributedRepositories', h.toString],
    commits: ['amount.commits', h.toString],
    pullRequests: ['amount.pullRequests', h.toString],
    issuesOpened: ['amount.issuesOpened', h.toString],
    starsReceived: ['amount.starsReceived', h.toString],
    rawData: input => {
      if (input.rawData) {
        return input.rawData;
      }
      return `https://datajson/empty`;
    },
    followers: ['amount.followers', h.toString],
    provider: 'provider',
    type: JM.helpers.def('userStats'),
  },
  tags: {
    category: JM.helpers.def('CXF'),
  },
});

const repositoryStats = JM.makeConverter({
  dateTime: input => {
    if (input.dateTime) {
      return input.dateTime;
    }
    return Utils.nanoSeconds();
  },
  fields: {
    frequency: ['frequency', h.toString],
    definitionOSS: ['definitionOSS', h.toString],
    popularity: ['popularity', h.toString],
    friendly: ['friendly', h.toString],
    quality: ['quality', h.toString],
    rawData: input => {
      if (input.rawData) {
        return input.rawData;
      }
      return `https://datajson/empty`;
    },
    dono: input => {
      return `o:${input.owner}`;
    },
    name: input => {
      return `n:${input.name}`;
    },
    provider: 'provider',
    type: JM.helpers.def('repositoryStats'),
  },
  tags: {
    category: JM.helpers.def('CXF'),
  },
});

module.exports = {
  pulls,
  issues,
  commits,
  userStats,
  repositoryStats,
};
