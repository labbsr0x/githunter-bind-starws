const JM = require('json-mapper');
const Utils = require('../utils');

const h = JM.helpers;

const pulls = JM.makeConverter({
  dateTime: 'dateTime',
  number: ['attributes.number', h.toNumber],
  state: 'attributes.state',
  createdAt: input => Utils.dateFormat4Githunter(input.attributes.createdAt),
  closedAt: input => Utils.dateFormat4Githunter(input.attributes.closedAt),
  merged: ['attributes.merged', h.toString],
  mergedAt: input => Utils.dateFormat4Githunter(input.attributes.mergedAt),
  author: 'attributes.author',
  labels: 'attributes.labels',
  participantsTotalCount: ['attributes.participants.totalCount', h.toNumber],
  participants: 'attributes.participants',
  commentsTotalCount: ['attributes.comments.totalCount', h.toNumber],
  commentsUpdatedAt: input =>
    Utils.dateFormat4Githunter(input.attributes.comments.updatedAt),
  comments: 'attributes.comments',
  rawData: 'attributes.rawData',
  owner: input => Utils.prepareString4Githunter(input.attributes.dono),
  name: input => Utils.prepareString4Githunter(input.attributes.name),
  provider: 'attributes.provider',
  type: 'attributes.type',
});

const issues = JM.makeConverter({
  dateTime: 'dateTime',
  number: ['attributes.number', h.toNumber],
  state: 'attributes.state',
  createdAt: input => Utils.dateFormat4Githunter(input.attributes.createdAt),
  closedAt: input => Utils.dateFormat4Githunter(input.attributes.closedAt),
  updatedAt: input => Utils.dateFormat4Githunter(input.attributes.updatedAt),
  author: 'attributes.author',
  labels: 'attributes.labels',
  participantsTotalCount: ['attributes.participants.totalCount', h.toNumber],
  participants: 'attributes.participants',
  commentsTotalCount: 'attributes.comments.totalCount',
  commentsUpdatedAt: input =>
    Utils.dateFormat4Githunter(input.attributes.comments.updatedAt),
  comments: 'attributes.comments',
  rawData: 'attributes.rawData',
  owner: input => Utils.prepareString4Githunter(input.attributes.dono),
  name: input => Utils.prepareString4Githunter(input.attributes.name),
  provider: 'attributes.provider',
  type: 'attributes.type',
});

const commits = JM.makeConverter({
  dateTime: 'dateTime',
  message: 'attributes.message',
  committedDate: data =>
    Utils.dateFormat4Githunter(data.attributes.committedDate),
  author: 'attributes.author',
  rawData: 'attributes.rawData',
  owner: input => Utils.prepareString4Githunter(input.attributes.dono),
  name: input => Utils.prepareString4Githunter(input.attributes.name),
  provider: 'attributes.provider',
  type: 'attributes.type',
});

const userStats = JM.makeConverter({
  dateTime: 'dateTime',
  name: ['attributes.name', h.toString],
  login: ['attributes.login', h.toString],
  avatarUrl: 'avatarUrl',
  contributedRepositories: [
    'attributes.amount.contributedRepositories',
    h.toNumber,
  ],
  commits: ['attributes.amount.commits', h.toNumber],
  pullRequests: ['attributes.amount.pullRequests', h.toNumber],
  issuesOpened: ['attributes.amount.issuesOpened', h.toNumber],
  starsReceived: ['attributes.amount.starsReceived', h.toNumber],
  followers: ['attributes.amount.followers', h.toNumber],
  rawData: 'attributes.rawData',
  provider: 'attributes.provider',
  type: 'attributes.type',
});

module.exports = {
  pulls,
  issues,
  commits,
  userStats,
};
