// import * as ku from '../lib/ke-utils'

export const rejectErrors = (res) => {
  // console.log('rejectErrors')
  const { status } = res;
  if (status >= 200 && status < 300) {
    return res;
  }
  return Promise.reject({ message: res.statusText });
};

export const fetchJson = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
  .then(rejectErrors)
  .then((res) => res.json())
}

export default {
  users: {
    register(user) {
      // console.log('api.users.register: user', user)
      return fetchJson(
        '/users/register',
        {
          method: 'POST',
          body: JSON.stringify({ user })
        }
      )
    }
  },
}
