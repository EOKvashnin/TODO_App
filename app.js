import { dailyQuote } from './quote.js'

const log = console.log
const dateField = document.getElementById('current-date')
const dowField = document.getElementById('day-of-week')
const timeField = document.getElementById('current-time')

//Создаем базовый класс для всех todo
class Item {
	constructor(id, text) {
		this.id = id
		this.text = text
	}
}

class TodoItem extends Item {
	constructor(id, text, completed = false) {
		super(id, text)
		this.completed = completed
	}
}
//создаем класс для отображения времени
class DateTimeHelper {
	static getCurrentDate() {
		const now = new Date()
		return now.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	}
	static getDayOfWeek() {
		const now = new Date()
		return now.toLocaleDateString('ru-RU', { weekday: 'long' })
	}

	static getCurrentTime() {
		const now = new Date()
		return now.toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		})
	}
	static updateDateTime() {
		dateField.textContent = this.getCurrentDate()
		dowField.textContent = this.getDayOfWeek()
		timeField.textContent = this.getCurrentTime()
	}
}

class DOM {
	query(selector) {
		return document.querySelector(selector)
	}

	create(type, textContent, ...className) {
		const Item = document.createElement(type)
		Item.textContent = textContent
		Item.classList.add(...className)
		return Item
	}
}

class LocalStorage {
	#keyName

	constructor(keyName) {
		this.#keyName = keyName
	}

	GetItem() {
		const items = localStorage.getItem(this.#keyName)
		return items ? JSON.parse(items) : []
	}

	setItem(itemsList) {
		localStorage.setItem(this.#keyName, JSON.stringify(itemsList))
	}
}

class TodoApp {
	constructor() {
		this.dom = new DOM()
		this.todosStorage = new LocalStorage('todos')

		this.todoList = this.todosStorage.GetItem()
		this.todoInput = this.dom.query('[data-add-todo-input]')
		this.todoContainer = this.dom.query('[data-todos-container]')

		this.bindEvents()
		this.render()
	}

	addTodo(text) {
		const newTodo = new TodoItem(Date.now(), text)
		this.todoList.unshift(newTodo)
		this.todosStorage.setItem(this.todoList)
		this.render()
	}

	removeTodo(id) {
		this.todoList = this.todoList.filter(todo => todo.id !== id)
		this.todosStorage.setItem(this.todoList)
		this.render()
	}

	toggleTodo(id) {
		const todo = this.todoList.find(todo => todo.id === id)
		if (todo) {
			this.removeTodo(todo.id)
			this.todoList.push(todo)

			todo.completed = !todo.completed

			this.todosStorage.setItem(this.todoList)
			this.render()
		}
	}

	bindEvents() {
		this.todoInput.addEventListener('keypress', e => {
			if (e.key === 'Enter' && this.todoInput.value.trim()) {
				this.addTodo(this.todoInput.value.trim())
				this.todoInput.value = ''
			}
		})

		this.todoContainer.addEventListener('click', e => {
			const el = e.target
			if (el.classList.contains('remove-btn')) {
				const id = Number(el.dataset.id)
				this.removeTodo(id)
			} else if (el.classList.contains('todo-item')) {
				const id = Number(el.dataset.id)
				this.toggleTodo(id)
			}
		})
	}

	render() {
		this.todoContainer.innerHTML = ''
		this.todoList.forEach(todo => {
			const todoItem = this.dom.create(
				'div',
				'',
				'todo-item',
				todo.completed ? 'completed' : undefined
			)
			todoItem.dataset.id = todo.id
			const todoItemText = this.dom.create('span', todo.text)

			const removeBtn = this.dom.create('button', '✕', 'remove-btn')
			removeBtn.dataset.id = todo.id
			removeBtn.disabled = !todo.completed

			todoItem.appendChild(todoItemText)
			todoItem.appendChild(removeBtn)
			this.todoContainer.appendChild(todoItem)
		})
	}
}

new TodoApp()
setInterval(() => DateTimeHelper.updateDateTime(), 1000)
dailyQuote()
