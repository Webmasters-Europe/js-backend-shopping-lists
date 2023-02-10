function init() {
    document.querySelector('form').addEventListener('submit', handleSubmit)
    registerLogoutHandler()
}

async function handleSubmit(e) {
    e.preventDefault()

    let response
    try {
        response = await fetch('http://localhost:3000/addList', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: createJSONBody(e.target),
        })
    } catch (error) {
        console.error(error)
        return
    }

    if (`${response.status}`.startsWith('4')) {
        alert('Error')
        return
    }

    window.location.href = '/'
}

function createJSONBody(form) {
    const data = new FormData(form)

    const body = Object.fromEntries(data)

    return JSON.stringify(body)
}

init()
