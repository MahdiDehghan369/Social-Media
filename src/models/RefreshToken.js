const { type } = require('express/lib/response');
const mongoose = require('mongoose');
const {v4:uuidv4} = require('uuid');

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expire: {
        type: Date,
        required: true
    }
})


schema.statics.createToken = async (user) => {
    const expireInDay = +process.env.REFRESH_TOKEN_EXPIRE;
    const refreshToken = uuidv4()

    const refreshTokenDocument = new model({
        user: user._id,
        token: refreshToken,
        expire: new Date(Date.now() + expireInDay * 24 * 60 *60 * 1000)
    })

    await refreshTokenDocument.save()

    return refreshTokenDocument
}


schema.statics.verifyToken = async (token) => {
    const refreshTokenDocument = await model.findOne({token})

    if(refreshTokenDocument && refreshTokenDocument.expire >= Date.now()){
        return refreshTokenDocument.user
    }else{
        return null
    }
}


const model = mongoose.model('RefreshToken' , schema)

module.exports = model