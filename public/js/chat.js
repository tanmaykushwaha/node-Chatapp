const socket = io()

//elements
const $messageform = document.querySelector('#message-form')
const $messageformInput = $messageform.querySelector('input')
const $messageformButton = $messageform.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//const $locations = document.querySelector('#location')

//Templates
const messagetemplate = document.querySelector('#message-template').innerHTML
const locationmessagetemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplates = document.querySelector('#sidebar-template').innerHTML

//options
const {username , room} = Qs.parse(location.search, { ignoreQueryPrefix : true})


const autoScroll = () => {
    //new message element
        const $newMessage = $messages.lastElementChild

        //height 
        const newMessageStyles = getComputedStyle($newMessage)
        const newMessageMargin = parseInt(newMessageStyles.marginBottom)
        const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

     //visible height

     const visibleheight = $messages.offsetHeight

     //height of messges container
     const containerheight =$messages.scrollHeight

     //how far i have scorlled

     const scrolloffset = $messages.scrollTop + visibleheight

     if(containerheight - newMessageHeight <= scrolloffset ){
            $messages.scrollTop = $messages.scrollHeight
     }
        }

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messagetemplate , {
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(message) =>{
    console.log(message)
    const html = Mustache.render(locationmessagetemplate , {
        username: message.username,
        url: message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room,users}) =>{
    const html = Mustache.render(sidebarTemplates, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
} )

$messageform.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageformButton.setAttribute('disabled','disabled')
//disabel once it done
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message,(error) => {
        $messageformButton.removeAttribute('disabled')
        $messageformInput.value=''
        $messageformInput.focus()

        if(error) {
            return console.log(error)
        }
        console.log('message delivered')
    })
})

$sendLocationButton.addEventListener('click' , () => {
if(!navigator.geolocation){
    return alert('geolation is not supported by browser')
}

$sendLocationButton.setAttribute('disabled', 'disabled')

navigator.geolocation.getCurrentPosition((postion) => {
console.log(postion)

socket.emit('sendlocation',{
    latitude:postion.coords.latitude,
    longitude: postion.coords.longitude
},() => {
    $sendLocationButton.removeAttribute('disabled')
    console.log('location shared')

})
})

})
// document.querySelector('#message-form').addEventListener('submit', (e) => {
//     e.preventDefault()
//     const message = document.querySelector('input').value
//     socket.emit('sendMessage',message)
// })


// socket.on('countUpdated', (count) =>{
// console.log('The count has been updated',count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })

socket.emit('join' , { username , room} ,(error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})