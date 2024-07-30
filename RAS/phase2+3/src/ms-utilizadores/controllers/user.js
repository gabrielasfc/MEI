// Controlador para o modelo User

var User = require('../models/user')

module.exports.list = (proj) => {
    return User.find(proj)
            .then(response => {
                return response
            }).catch((err) => {
                throw err
            });
}

module.exports.getUser = id => {
    return User.findOne({_id: id})
            .then(response => {
                return response
            })
            .catch(error => {
                return error
            })
}

module.exports.getUsers = (ids) => {
    return User.find({_id: {$in: ids}})
            .then(response => {
                return response
            })
            .catch(error => {
                return error
            });
}

module.exports.addUser = u => {
    return User.create(u)
            .then(response => {
                return response
            })
            .catch(error => {
                return error
            })
}

module.exports.updateUser = (id, info) => {
    return User.updateOne({_id: id}, info)
            .then(response => {
                return response
            })
            .catch(error => {
                return error
            })
}

module.exports.updateUserPassword = (id, pwd) => {
    return User.updateOne({_id: id}, pwd)
            .then(response => {
                return response
            })
            .catch(error => {
                return error
            })
}

module.exports.deleteUser = id => {
    return User.deleteOne({_id: id})
            .then(response => {
                return response
            })
            .catch(error => {
                return error
            })
}

module.exports.addUsers = users => {
    return User.insertMany(users)
        .then(response => {
            return response;
        })
        .catch(error => {
            return error;
        });
}

module.exports.checkUsers = userIds => {
    return User.find({ '_id': { $in: userIds } })
        .then(response => {
            const foundUsers = response.map(user => user._id)
            const usersExistence = userIds.map(id => ({
                id,
                exists: foundUsers.includes(id)
            }))

            return usersExistence
        })
        .catch(error => {
            return error
        })
}
