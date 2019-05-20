const todoList = document.querySelector('.todo-list');
const todoInput = document.querySelector('.todo-input');
todoInput.addEventListener('keydown', handleAddTodo);

async function handleAddTodo(e) {
  const { value } = e.target;
  if (e.keyCode !== 13 || value === '') return;
  const blocklist = await getBlocklist();
  if (blocklist.includes(value)) return;
  blocklist.push(value);
  chrome.storage.sync.set({ blocklist }, function () {
    e.target.value = '';
  });
}

function getBlocklist() {
  return new Promise((reslove) => {
    chrome.storage.sync.get('blocklist', function (data) {
      const { blocklist } = data
      reslove(blocklist || [])
    })
  })
}

function removeItemFromBlocklist(item) {
  return new Promise((reslove) => {
    chrome.storage.sync.get('blocklist', function (data) {
      const { blocklist } = data;
      blocklist.splice(blocklist.indexOf(item), 1)
      chrome.storage.sync.set({ blocklist }, function () {
        reslove();
      })
    })
  });
}

async function handleRemoveTodo(e) {
  const { textContent } = e.target.previousElementSibling;
  await removeItemFromBlocklist(textContent);
}

async function renderTodo() {
  while (todoList.hasChildNodes()) {
    todoList.removeChild(todoList.firstChild);
  }
  const blocklist = await getBlocklist();
  blocklist.map((sensitiveWord) => {
    const li = document.createElement('li');
    li.classList.add('todo-list-item');
    const label = document.createElement('label');
    label.textContent = sensitiveWord;
    const button = document.createElement('button');
    button.classList.add('destroy');
    button.addEventListener('click', handleRemoveTodo);
    li.appendChild(label);
    li.appendChild(button);
    todoList.appendChild(li);
  });
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
  Object.keys(changes).forEach(function (key) {
    if (key === 'blocklist') {
      renderTodo()
    }
  })
})

renderTodo();