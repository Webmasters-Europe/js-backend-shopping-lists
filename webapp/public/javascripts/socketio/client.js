const socket = io()

socket.on('connect_error', (err) => {
    console.log(`connect_error due to ${err.message}`)
})

socket.on('connect', () => {
    const username = document.getElementById('username').innerText
    socket.emit('username', username)
})

socket.on('receiveList', (list) => {
    const templateList = document.getElementById('socketTemplate')
    const templateLi = templateList.querySelector('li')
    const newList = templateList.cloneNode(true)
    const ul = newList.querySelector('ul')
    newList.style.display = 'flex'
    newList.id = list.id
    newList.querySelector('#listName').innerText = list.listName
    for (const entry of list.entries) {
        const newLi = templateLi.cloneNode(true)
        newLi.querySelector('#foodName').innerText = entry.food
        newLi.addEventListener('click', deleteEntry)
        ul.appendChild(newLi)
    }
    ul.querySelector('li').remove()
    const container = templateList.parentElement
    container.appendChild(newList)

    const deleteButton = newList.querySelector('#Delete')
    deleteButton.addEventListener('click', deleteList)
    deleteButton.addEventListener('click', removeList)
})

socket.on('shoppingList:deleteList', (listId) => removeList(null, listId))

socket.on('shoppingList:deleteListEntry', ({ listId, entryName }) => deleteListEntry(listId, entryName))

function removeList(e, listId) {
    if (e) e.preventDefault()
    const deletedList = document.getElementById(listId)

    if (!deletedList) return

    deletedList.remove()
}

function deleteListEntry(listId, entryName) {
    const targetList = document.getElementById(listId)
    if (!targetList) return
    const lis = Array.from(targetList.querySelectorAll('li'))
    if (!lis) return
    for (const li of lis) {
        if (li.querySelector('#foodName').innerText.trim() === entryName) {
            li.remove()
            break
        }
    }
}
