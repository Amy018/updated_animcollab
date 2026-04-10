function like(btn){

let count = btn.querySelector("span")

count.innerText = parseInt(count.innerText) + 1

}


function filter(category,button){

let cards = document.querySelectorAll(".card")

cards.forEach(card=>{

if(category==="all" || card.dataset.category===category){
card.style.display="block"
}else{
card.style.display="none"
}

})

document.querySelectorAll(".filters button").forEach(btn=>{
btn.classList.remove("active")
})

button.classList.add("active")

}


function playVideo(name){

let player = document.getElementById("player")

let videos={
walk:"https://www.w3schools.com/html/mov_bbb.mp4",
jump:"https://www.w3schools.com/html/movie.mp4",
story:"https://www.w3schools.com/html/mov_bbb.mp4",
abstract:"https://www.w3schools.com/html/movie.mp4",
rocket:"https://www.w3schools.com/html/mov_bbb.mp4"
}

player.src = videos[name]

document.getElementById("modal").style.display="flex"

player.play()

}


function closeVideo(){

let modal=document.getElementById("modal")
let player=document.getElementById("player")

modal.style.display="none"

player.pause()

}