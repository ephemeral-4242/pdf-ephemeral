import fetchApi from './index';

export function getHello() {
  return fetchApi('/hello');
}
