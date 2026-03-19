export const API_BASE_URL = 'https://neko.ozip.qzz.io';

export const API_ENDPOINTS = {
  animeList: (page = 1, status = '', query = '') => {
    let url = `${API_BASE_URL}/api/animekompi/data?page=${page}&status=${status}`;
    if (query) url += `&query=${encodeURIComponent(query)}`;
    return url;
  },
  animeDetail: (slug) => `${API_BASE_URL}/api/animekompi/details?slug=${slug}`,
  watchEpisode: (slug) => `${API_BASE_URL}/api/animekompi/watch?slug=${slug}`,
};
