function init() {
	document.querySelector('form').addEventListener('submit', handleSubmit)
}

async function handleSubmit(e) {
	e.preventDefault()

	const body = createJSONBody(e.target)
	const options = {
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
		body: body,
	}

	const res = await fetch('http://localhost:3000/api', options)

	if (`${res.status}`.startsWith('4')) {
		alert('Error')
		return
	}

	location.href = '/'
}

function createJSONBody(form) {
	const data = new FormData(form)
	const body = {}
	for (let [key, value] of data) {
		body[key] = value
	}
	return JSON.stringify(body)
}

init()
