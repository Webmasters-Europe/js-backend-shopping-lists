function init() {
    const deleteButtons = Array.from(document.querySelectorAll('#Delete'))
    const xButtons = Array.from(document.querySelectorAll('#X'))
    if (deleteButtons.length > 0) {
        deleteButtons.forEach((deleteButton) => deleteButton.addEventListener('click', deleteList))
    }
    if (xButtons.length > 0) {
        xButtons.forEach((button) => button.addEventListener('click', deleteEntry))
    }
    registerLogoutHandler()
}

async function deleteList(e) {
    e.preventDefault()

    const listId = getListId(e.target)

    await fetch(`http://localhost:3000/${listId}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE',
    })

    window.location.reload()
}

async function deleteEntry(e) {
    e.preventDefault()

    const listId = getListId(e.target)
    const entryName = getEntryName(e.target)

    await fetch(`http://localhost:3000/${listId}/${entryName}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE',
    })

    window.location.reload()
}

function getEntryName(target) {
    return target.parentElement.parentElement.innerText.trim().split('\n')[0]
}

function getListId(target) {
    if (target.id && target.id.length === 6 && !Number.isNaN(Number(target.id))) {
        return target.id
    }
    return getListId(target.parentElement)
}

init()
