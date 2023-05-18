let allTransactions = []

//faz a requisição no backend GET
async function getData(){
 return await fetch('http://localhost:3000/transactions').then(res => res.json())
}

//renderiza na tela
function renderContentOnScreen(data){
  const divContent = document.createElement('div')
  divContent.id = 'div-content-' + data.id
  divContent.classList.add('divs')

  let transactionName = document.createElement('span')
  transactionName.innerText = data.name
  transactionName.id = 'transactionName-' + data.id
  transactionName.classList = 'transaction-name'

  let transactionValue = document.createElement('span')
  transactionValue.innerText = getCurrency(data.value)
  transactionValue.id = 'transactionValue-' + data.id
  transactionValue.classList = 'transaction-value'


  let confirmCreditOrDebit = data.value.toString() 

  if(confirmCreditOrDebit[0] === '-'){
    transactionValue.classList.add('debit')
  }else{
    transactionValue.classList.add('credit')
  }


  const editBtn = editData(data)
 

  const deletebtn = document.createElement('button')
  deletebtn.innerText = 'Deletar'
  deletebtn.classList = 'delete-btn'
  deletebtn.id = data.id
  deletebtn.addEventListener('click', async () => {
    deletebtn.parentNode.remove()
    let contentIndex = allTransactions.findIndex(transaction => transaction.id == deletebtn.id)
    allTransactions.splice(contentIndex, 1)
    await fetch('http://localhost:3000/transactions/' + data.id, {method: 'DELETE'})
    updateBalance()
  })


  let sectionContent = document.getElementById('sectionContent')
  divContent.append(transactionName, transactionValue, editBtn, deletebtn)

  sectionContent.appendChild(divContent)
}

//atualiza o saldo
function updateBalance(){
  let balanceValue = allTransactions.reduce((acum, transaction) => acum + transaction.value, 0)

  let formatedCurrency = getCurrency(balanceValue)

  let balance = document.getElementById('balance')
  balance.innerText = `Saldo: ${formatedCurrency}`
}


//inicia o site
async function initialize(){
  let transactions = await getData()
  allTransactions.push(...transactions)
  setContentToRender()
  updateBalance()
}

//Para renderizar novamente após uma requisição PUT
function setContentToRender(){
  allTransactions.forEach(renderContentOnScreen)
}


//formatar para moeda
function getCurrency(coin){
  let currencyFormat = Intl.NumberFormat('pt-BR', {
    compactDisplay: 'long',
    style: 'currency',
    currency: 'BRL'
  })
  return currencyFormat.format(coin)
}



//Requisição PUT/POST
document.querySelector('form').addEventListener('submit', async (ev) => {
  ev.preventDefault()

  let id = Number(document.querySelector('#id').value)
  
  let dataToSave = {
    name: document.getElementById('input-name').value,
    value: Number(document.getElementById('input-value').value)
  }

  if(dataToSave.name === '' || dataToSave.value === ''){
    return
  }

  if(id){
    const response = await fetch(`http://localhost:3000/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSave)
    })
    let newTransaction = await response.json()
    let transactionIndexToRemove = allTransactions.findIndex((t) => t.id === id)
    allTransactions.splice(transactionIndexToRemove, 1, newTransaction)
    document.querySelectorAll('.divs').forEach(div => {
      div.remove()
    })
    document.querySelector('#id').value = ''
    setContentToRender()
  }else{
    const response = await fetch('http://localhost:3000/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSave)
    })
    let newTransaction = await response.json()
    allTransactions.push(newTransaction)
    renderContentOnScreen(newTransaction)
  }
  updateBalance()
  ev.target.reset()
})


//edit button
function editData(data){
  let editBtn = document.createElement('button')
  editBtn.innerText = 'Editar'
  editBtn.classList = 'edit-btn'
  editBtn.addEventListener('click', () =>{
    document.querySelector('#id').value = data.id
    document.querySelector('#input-name').value = data.name
    document.querySelector('#input-value').value = data.value
  })
  return editBtn
}


document.addEventListener('DOMContentLoaded', initialize)

