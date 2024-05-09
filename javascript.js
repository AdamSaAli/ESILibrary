const unit = document.querySelector('.units')

unit.addEventListener("click",()=>{
    const dropdownSelect = document.querySelector(".display-unit")
    //this grabs the div we want to display the text in from the html file
    const userSelection = document.createElement('span')
    //This creates a span to display users text
    userSelection.textContent="You have selected " +unit.nodeValue
    //We need to be able to get the users text
    dropdownSelect.appendChild(userSelection)
    //this adds the span with the text to the div we grabbed earlier


    alert("helloworld")
})

const fo = document.querySelector('#frm')

fo.addEventListener('submit',function(e){
    const va = document.querySelector('.display-pollutants')
    va.innerHTML="";
    let values = []

    e.preventDefault();
    const disp = document.createElement('span')
    let checke = document.getElementsByName('pollutant');
    for(let i=0;i<checke.length;i++){
        if(checke[i].checked==true){
            values.push(checke[i].value)
        }
        
    }
    
    disp.textContent = "The pollutants you have chosen are: " + values.toString()
    
    va.appendChild(disp)
   
})
// pollutants.addEventListener("change",()=>{
//     //I used change here because click doesnt work for checkboxes
    
//     const userCheckBox = document.createElement('span')
//     //This creates a span element to ddisplay the text
//     const userCheckboxDisplay = document.querySelector(".display-pollutants")
//     //this grabs the div we want to display the text in from the html file
//     userCheckBox.textContent="The pollutant(s) you chose are " + pollutants.nodeValue
//     //Need to make this actually display the users input
//     //Also need to make it so that if the user unchecks the box it takes it off the screen
//     userCheckboxDisplay.appendChild(userCheckBox)
// })


