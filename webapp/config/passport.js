const JwtStrategy = require('passport-jwt').Strategy

const options = {
    jwtFromRequest: (req) => req?.cookies.bearer,
    secretOrKey: process.env.JWT_SECRET,
}

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(options, async (jwt_payload, done) => {
            const body = JSON.stringify({ username: jwt_payload.username })
            const options = {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body,
            }
            let user
            try {
                user = (await (await fetch('http://localhost:3001/auth/username', options)).json()).user
            } catch (err) {
                console.error('Error when configuring passportjs')
                console.error(err)
                return
            }

            if (user) {
                return done(null, user)
            }

            return done(null, false)
        }),
    )
}
