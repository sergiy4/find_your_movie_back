const authUserId = '655ce762dfbab2e024ab46f3';
const randomUserId = '655ce762dfbab2e024ab46f4';

export const userIds = {
  authUserId,
  randomUserId,
};

export const authUserCollections = [
  {
    _id: '655ce8512e5dd1f7a0a105c8',
    userID: authUserId,
    name: 'collection_123',
    isPrivate: false,
    movies: [
      {
        _id: '656cd861b80f08968e136809',
        name: 'Pulp fiction',
        isMovie: true,
        tmdb_id: 23124,
        backdrop_path: 'some/backdrop/3',
      },
      {
        _id: '656cd861b80f08968e136808',
        name: 'Ozark',
        isMovie: false,
        tmdb_id: 34535,
        backdrop_path: 'some/backdrop/21',
      },
      {
        _id: '656cd861b80f08968e136807',
        name: 'True detective',
        isMovie: false,
        tmdb_id: 12123,
        backdrop_path: 'some/backdrop/1',
      },
    ],
  },
  {
    _id: '655ce8512e5dd1f7a0a105c9',
    userID: authUserId,
    name: 'collection_1d23',
    isPrivate: true,
    movies: [
      {
        name: 'Spider man',
        isMovie: true,
        tmdb_id: 19547,
        backdrop_path: 'some/backdrop/34',
      },
      {
        name: 'Termaintor',
        isMovie: true,
        tmdb_id: 28032,
        backdrop_path: 'some/backdrop/5',
      },
    ],
  },
  {
    _id: '655ce8512e5dd1f7a0a105c7',
    userID: authUserId,
    name: 'collection_13',
    isPrivate: true,
    movies: [],
  },
];

export const randomCollection = [
  {
    _id: '645ce8512e5dd1f7a0a105c8',
    userID: randomUserId,
    name: 'random_collections',
    isPrivate: false,
    movies: [],
  },
  {
    _id: '646ce8512e5dd1f7a0a105c8',
    userID: randomUserId,
    name: 'random_collections',
    isPrivate: true,
    movies: [],
  },
  {
    _id: '647ce8512e5dd1f7a0a105c8',
    userID: randomUserId,
    name: 'random_collections',
    isPrivate: false,
    movies: [],
  },
];

export const invalidCollectionsIds = [
  '555ce8512e5dd1f7a0a105c7',
  '755ce8512e5dd1f7a0a105c7',
];

export const validAuthUserCollectionsIds = [
  '655ce8512e5dd1f7a0a105c8',
  '655ce8512e5dd1f7a0a105c9',
  '655ce8512e5dd1f7a0a105c7',
];

export const validRandomCollectionsIds = [
  '645ce8512e5dd1f7a0a105c8',
  '646ce8512e5dd1f7a0a105c8',
  '647ce8512e5dd1f7a0a105c8',
];

export const validAuthUserMoviesIds = [
  '656cd861b80f08968e136809',
  '656cd861b80f08968e136808',
];

export const invalidMoviesIds = [
  '656cd861b80f08968e136855',
  '656cd861b80f08968e133008',
];
