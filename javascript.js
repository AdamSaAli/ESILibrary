
const optnform = document.querySelector('#frm')

optnform.addEventListener('submit',function(e){
    const pollutantDiv = document.querySelector('.display-pollutants')
    pollutantDiv.innerHTML="";
    let values = []
    e.preventDefault();
    const dispayPollutants = document.createElement('span')
    let checke = document.getElementsByName('pollutant');
    for(let i=0;i<checke.length;i++){
        if(checke[i].checked==true){
            values.push(checke[i].value)
        }
        
    }
    dispayPollutants.textContent = "The pollutants you have chosen are: " + values.toString()
    pollutantDiv.appendChild(dispayPollutants)  
})

const pollutantsform = document.querySelector('#optionform')
pollutantsform.addEventListener('submit',function(e){
    const o = document.querySelector(".display-unit")
    o.innerHTML='';
    e.preventDefault()
    const userSelect = document.getElementById('units')
    
    const unitText= document.createElement('span')
    unitText.textContent=userSelect.value
    o.appendChild(unitText)

    
})
const lstform = document.querySelector('#lastform')
lstform.addEventListener('submit',function(e){
    e.preventDefault()
    let date=document.getElementById('dateinp')
    let w = document.querySelector('.display-date')
    const ne =docmuent.createElement('span')
    ne.textContent=date.value
    w.appendChild(ne)

})
const displaydate = document.querySelector('.display-date')
    displaydate.innerHTML=''
    const uuuu = document.getElementsByClassName('dateinp')
    const dateText = document.createElement('span')
    dateText.textContent= uuuu.value()
    displaydate.appendChild(dateText)
