const JwtStrategy = require('passport-jwt').Strategy
const User = require('../models/user')

const options = {
    jwtFromRequest: (req) => req?.cookies.bearer,
    secretOrKey: process.env.JWT_SECRET,
}

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(options, async (jwtPayload, done) => {
            const user = await User.findOne({ username: jwtPayload.username })
            if (user) {
                return done(null, user)
            }

            return done(null, false)
        }),
    )
}
