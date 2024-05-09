const unit = document.querySelector('.units')

unit.addEventListener("click",()=>{
    const dropdownSelect = document.querySelector(".mid")
    const userSelection = document.createElement('span')
    userSelection.textContent="You have selected" +unit
    //We need to be able to get the users text
    dropdownSelect.appendChild(userSelection)


    alert("helloworld")
})

const pollutants = document.querySelector(".pollutants")

pollutants.addEventListener("change",()=>{
    //I used change here because click doesnt work for checkboxes
    const userCheckBox = document.createElement('span')
})

