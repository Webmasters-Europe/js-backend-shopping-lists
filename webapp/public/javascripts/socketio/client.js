const socket = io()

socket.on('connect_error', (err) => {
    console.log(`connect_error due to ${err.message}`)
})

socket.on('connect', () => {
    const username = document.getElementById('username').innerText
    socket.emit('username', username)
})

socket.on('recieveList', (list) => {
    const templateList = document.getElementById('socketTemplate')
    const templateLi = templateList.querySelector('li')
    const newList = templateList.cloneNode(true)
    const ul = newList.querySelector('ul')
    newList.style.display = 'flex'
    newList.id = list.id
    for (const entry of list.entries) {
        const newLi = templateLi.cloneNode(true)
        newLi.childNodes[0].textContent = entry.food
        newLi.addEventListener('click', deleteEntry)
        ul.appendChild(newLi)
    }
    ul.querySelector('li').remove()
    const container = templateList.parentElement
    container.appendChild(newList)

    const deleteButton = newList.querySelector('#Delete')
    deleteButton.addEventListener('click', deleteList)
})

socket.on('shoppingList:deleteList', deleteList)

socket.on('shoppingList:deleteListEntry', ({ listId, entryName }) => {
    console.log('should delete entry')

    const targetList = document.getElementById(listId)
    if (!targetList) return
    const lis = Array.from(targetList.querySelectorAll('li'))
    if (!lis) return
    lis.forEach((li) => {
        if (li.childNodes[0].textContent.trim() === entryName) {
            li.remove()
        }
    })
})

function deleteList(listId) {
    const deletedList = document.getElementById(listId)

    if (!deletedList) return

    deletedList.remove()
}
