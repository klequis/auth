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
      console.log('user already exists')
    } else {
      console.log('user registered', data)
    }
  })
