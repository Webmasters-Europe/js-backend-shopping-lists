function registerLogoutHandler() {
	const logoutButton = Array.from(document.querySelectorAll('.navbar .button')).filter(elem =>
		elem.innerText.includes('ogout'),
	)[0]

	logoutButton.addEventListener('click', async () => {
		const options = {
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
		}

		await fetch(`http://localhost:3000/auth/logout`, options)
	})
}
