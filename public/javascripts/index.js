function init() {
    deleteButton = document.querySelector('.actions .button')
    xButtons = Array.from(document.querySelectorAll('li .button'))
    if (deleteButton) deleteButton.addEventListener('click', deleteList)
    if (xButtons.length > 0) {
        xButtons.forEach((button) => button.addEventListener('click', deleteEntry))
    }
}

async function deleteList(e) {
    e.preventDefault()
    const options = {
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE',
    }

    await fetch('http://localhost:3000/api/909090', options)

    window.location.reload()
}

async function deleteEntry(e) {
    e.preventDefault()

    const entryName = getEntryName(e.target)
    const options = {
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE',
    }

    await fetch(`http://localhost:3000/api/909090/${entryName}`, options)

    window.location.reload()
}

function getEntryName(target) {
    return target.parentElement.parentElement.innerText.trim().split('\n')[0]
}

init()
