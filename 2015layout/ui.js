var UIcontext = {}
function linkToTab(e){
	var target = this.getAttribute('data-target')
	var tab = document.getElementById(target)
	UIcontext.currentTab = tab
	changeTab(tab)
	e.preventDefault()
}
function closeEditor(){
	changeTab(UIcontext.currentTab)
}

function edit(element, editor, dataSelectors){
	var fields = editor.querySelectorAll('input, textarea')
	for(var i = 0; i < dataSelectors.length && i < fields.length; i++){
		var dataElement = element.querySelector(dataSelectors[i])
		if(dataElement && dataElement.firstChild){
			fields[i].value = dataElement.firstChild.data
		} else {
			fields[i].value = ''
		}
	}
	changeTab(editor)
}
function editProject(){
	var editor = document.getElementById('projectEditor')
	edit(this, editor, ['header h1', 'header p'])
}
function editNote(){
	var editor = document.getElementById('noteEditor')
	edit(this, editor, ['h1', 'p'])
}
function editTask(){
	var editor = document.getElementById('taskEditor')
	edit(this, editor, ['h1', 'p'])
}
function changeTab(tab){
	var activetabs = document.getElementsByClassName('active')
	for(var i = 0; i < activetabs.length; i++){
		activetabs[i].classList.remove('active')
	}
	(tab || document.getElementsByClassName('default')[0]).classList.add('active')
}
function init(){
	document.getElementById('menu-link').onclick = linkToTab
	changeTab()
}

function NoteUI(title, text){
	this.root = document.createElement('article')
	this.root.classList.add('note')
	this.root.onclick = editNote

	this.textElement = document.createElement('p')
	this.root.appendChild(this.textElement)

	this.setTitle(title)
	this.setText(text)
}

NoteUI.prototype.setText = function(content){
	this.textElement.textContent = content
}

NoteUI.prototype.setTitle = function(content){
	if(!content){
		if(this.titleElement){
			this.root.removeChild(this.titleElement)
			delete this.titleElement
		}
	} else {
		if(!this.titleElement){
			this.titleElement = document.createElement('h1')
			this.titleElement.textContent = content
			this.root.insertBefore(this.titleElement, this.textElement)
		} else {
			this.titleElement.textContent = content
		}
	}
}

function TaskUI(title, text){
	this.root = document.createElement('article')
	this.root.classList.add('task')
	this.root.onclick = editTask

	this.checkbox = document.createElement('div')
	this.checkbox.classList.add('checkbox')
	this.root.appendChild(this.checkbox)

	var div = document.createElement('div')
	this.root.appendChild(div)

	this.titleElement = document.createElement('h1')
	div.appendChild(this.titleElement)

	this.textElement = document.createElement('p')
	div.appendChild(this.textElement)

	this.setText(text)
	this.setTitle(title)
}

TaskUI.prototype.setTitle = function(content) {
	this.titleElement.textContent = content
}

TaskUI.prototype.setText = function(content) {
	this.textElement.textContent = content
}

function ProjectUI(id, title, text){
	this.root = document.createElement('div')
	this.root.id = id
	this.root.classList.add('project')

	div = document.createElement('div')
	this.root.appendChild(div)

	var header = document.createElement('header')
	header.onclick = editProject
	div.appendChild(header)

	this.titleElement = document.createElement('h1')
	header.appendChild(this.titleElement)

	this.textElement = document.createElement('p')

	header.appendChild(this.textElement)

	var sorting = document.createElement('div')
	sorting.classList.add('tool')
	sorting.innerHTML = 
		'<label>Sort:</label><div class="group"><a href="#">Creation</a> | <a'+
		' href="#" class="selected">Latest edit</a></div><div class="group"><'+
		'a href="#">Notes first</a> | <a href="#">Tasks first</a> | <a href="'+
		'#" class="selected">Interspersed</a></div>'
	div.appendChild(sorting)

	this.children = document.createElement('div')
	div.appendChild(this.children)

	this.menuItem = document.createElement('a')
	this.menuItem.onclick = linkToTab
	this.menuItem.href = '#'+id
	this.menuItem.setAttribute('data-target', id)

	this.menuTitleElement = document.createElement('h1')
	this.menuItem.appendChild(this.menuTitleElement)

	this.menuTextElement = document.createElement('p')
	this.menuItem.appendChild(this.menuTextElement)

	this.setTitle(title)
	this.setText(text)
}

ProjectUI.prototype.setTitle = function(content){
	this.titleElement.textContent = content
	this.menuTitleElement.textContent = content
}

ProjectUI.prototype.setText = function(content){
	this.textElement.textContent = content
	this.menuTextElement.textContent = content
}

ProjectUI.prototype.addPost = function(post){
	this.children.appendChild(post.root)
}

ProjectUI.prototype.removePost = function(post){
	if(this.children.contains(post.root)){
		this.children.removeChild(post.root)
	}
}