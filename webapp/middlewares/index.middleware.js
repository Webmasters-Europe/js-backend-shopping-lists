function validUsername(req, res, next) {
    const { username } = req.body
    const regex = new RegExp(/^([\w]+){3,}$/)
    if (!(typeof username === 'string' && regex.test(username.trim()))) {
        res.json({ error: 'Invalid username' })
        return
    }
    req.body.username = username.trim()
    next()
}

function checkShareWith(req, res, next) {
    let { shareWith } = req.body

    shareWith = shareWith.split(',')
        .map((elem) => String(elem).trim())
        .filter((elem) => elem !== '')

    req.body.shareWith = shareWith
    next()
}

function validPassword(req, res, next) {
    const { password } = req.body
    const regex = new RegExp(/^(?=.*?[\w]+)(?=.*?[!$_?]+).{8,}$/)
    if (!(typeof password === 'string' && regex.test(password.trim()))) {
        res.json({ error: 'Invalid password' })
        return
    }
    req.body.password = password.trim()
    next()
}

function validList(req, res, next) {
    let list = req.body?.list || req.params?.list
    list = list
        .split(',')
        .map((elem) => String(elem).trim())
        .filter((elem) => elem !== '')
    if (list.length <= 0) {
        res.status(422).json({ error: 'List does not contain valid items' })
        return
    }
    req.body.list ? (req.body.list = list) : (req.params.list = list)
    next()
}

function validEntryName(req, res, next) {
    const entryName = req.body?.entryName || req.params?.entryName

    const regex = new RegExp(/^[\w ]+$/)
    if (!(typeof entryName === 'string' && regex.test(entryName.trim()))) {
        res.json({ error: 'Invalid entry' })
        return
    }
    req.body.entryName ? (req.body.entryName = entryName.trim()) : (req.params.entryName = entryName.trim())

    next()
}

module.exports = {
    validUsername,
    checkShareWith,
    validPassword,
    validList,
    validEntryName,
}
