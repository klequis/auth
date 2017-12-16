import api from './api'

// api.members.read()
//   .then((data) => {
//     console.log('members.read', data)
//   })

const user = {
  firstName: 'joe',
  lastName: 'black',
  email: 'joe01@joe.com',
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
