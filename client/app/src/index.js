import api from './api'

const user = {
  firstName: 'joe',
  lastName: 'black',
  email: 'john02@joe.com',
  password: 'joepwd',
}
api.users.register(user)
  .then((data) => {
    if (data.result === 'user exists') {
      console.log('user exists')
    } else {
      console.log('users.registered', data)
    }
  })
