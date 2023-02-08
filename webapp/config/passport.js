const JwtStrategy = require('passport-jwt').Strategy

const options = {
    jwtFromRequest: (req) => req?.cookies.bearer,
    secretOrKey: process.env.JWT_SECRET,
}

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(options, async (jwtPayload, done) => {
            let user
            try {
                const response = await fetch('http://localhost:3001/auth/username', {
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                    body: JSON.stringify({ username: jwtPayload.username }),
                })
                user = (await response.json())?.user
            } catch (err) {
                console.error('Error when configuring passportjs')
                console.error(err)
                return
            }

            done(null, user || false)
        }),
    )
}
