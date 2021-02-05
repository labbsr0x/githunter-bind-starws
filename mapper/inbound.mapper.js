const JM = require('json-mapper');
const Utils = require('../utils');

const h = JM.helpers;

const pulls = JM.makeConverter({
  dateTime: input => Utils.dateFormat4StarWS(input.updatedAt),
  fields: {
    createdAt: input => Utils.dateFormat4StarWS(input.createdAt),
    updatedAt: input => Utils.dateFormat4StarWS(input.updatedAt),
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
    type: JM.helpers.def('pull'),
  },
  tags: {
    category: JM.helpers.def('CXF'),
    number: ['number', h.toString],
    author: input => Utils.prepareString4StarWS(`a:${input.author}`),
    state: 'state',
    dono: input => {
      return `o:${input.owner}`;
    },
    name: input => {
      return `n:${input.name}`;
    },
    provider: 'provider',
  },
});

const issues = JM.makeConverter({
  dateTime: input => Utils.dateFormat4StarWS(input.updatedAt),
  fields: {
    createdAt: input => Utils.dateFormat4StarWS(input.createdAt),
    closedAt: input => Utils.dateFormat4StarWS(input.closedAt),
    updatedAt: input => Utils.dateFormat4StarWS(input.updatedAt),
    labels: input => Utils.concatArray4StarWS(`l:${input.author}`),
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
    type: JM.helpers.def('issues'),
  },
  tags: {
    category: JM.helpers.def('CXF'),
    number: ['number', h.toString],
    state: 'state',
    author: input => Utils.prepareString4StarWS(`a:${input.author}`),
    dono: input => {
      return `o:${input.owner}`;
    },
    name: input => {
      return `n:${input.name}`;
    },
    provider: 'provider',
  },
});

const commits = JM.makeConverter({
  dateTime: input => Utils.dateFormat4StarWS(input.committedDate),
  fields: {
    message: input => {
      return Utils.prepareString4StarWS(`m:${input.message}`);
    },
    committedDate: data => Utils.dateFormat4StarWS(data.committedDate),
    rawData: input => {
      if (input.rawData) {
        return input.rawData;
      }
      return `https://datajson/empty`;
    },
    type: JM.helpers.def('commits'),
  },
  tags: {
    category: JM.helpers.def('CXF'),
    author: input => Utils.prepareString4StarWS(`a:${input.author}`),
    dono: input => {
      return `o:${input.owner}`;
    },
    name: input => {
      return `n:${input.name}`;
    },
    provider: 'provider',
  },
});

const userStats = JM.makeConverter({
  dateTime: input => Utils.dateFormat4StarWS(input.dateTime),
  fields: {
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
    type: JM.helpers.def('userStats'),
  },
  tags: {
    category: JM.helpers.def('CXF'),
    name: ['name', h.toString],
    login: ['login', h.toString],
    provider: 'provider',
  },
});

const repositoryStats = JM.makeConverter({
  dateTime: input => Utils.dateFormat4StarWS(input.dateTime),
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
    type: JM.helpers.def('repositoryStats'),
  },
  tags: {
    category: JM.helpers.def('CXF'),
    dono: input => {
      return `o:${input.owner}`;
    },
    name: input => {
      return `n:${input.name}`;
    },
    provider: 'provider',
  },
});

const comments = JM.makeConverter({
  dateTime: input => Utils.dateFormat4StarWS(input.createdAt),
  fields: {
    url: 'url',
    createdAt: data => Utils.dateFormat4StarWS(data.createdAt),
    number: ['number', h.toString],
    url: 'url',
    id: 'id',
    rawData: input => {
      if (input.rawData) {
        return input.rawData;
      }
      return `https://datajson/empty`;
    },
    type: JM.helpers.def('comments'),
  },
  tags: {
    category: JM.helpers.def('CXF'),
    dono: input => {
      return `o:${input.owner}`;
    },
    name: input => {
      return `n:${input.name}`;
    },
    provider: 'provider',
    author: input => Utils.prepareString4StarWS(`a:${input.author}`),
  },
});

module.exports = {
  pulls,
  issues,
  commits,
  userStats,
  repositoryStats,
  comments,
};
