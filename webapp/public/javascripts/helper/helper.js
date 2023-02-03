function registerLogoutHandler() {
    const logoutButton = document.getElementById('Logout')

    logoutButton.addEventListener('click', async () => {
        await fetch('http://localhost:3000/auth/logout', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
        })

        window.location.href = '/auth/login'
    })
}
