function registerLogoutHandler() {
    const logoutButton = document.getElementById('Logout')

    logoutButton.addEventListener('click', async () => {
        const options = {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
        }

        await fetch('http://localhost:3000/auth/logout', options)
    })
}
