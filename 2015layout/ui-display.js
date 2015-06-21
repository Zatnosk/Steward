function textToDOM(text){
	var root = document.createDocumentFragment()
	var paragraphs = text.split('\n')
	for(var i = 0; i < paragraphs.length; i++){
		if(paragraphs[i]){
			var node = document.createTextNode(paragraphs[i])
			root.appendChild(node)
		}
		root.appendChild(document.createElement('br'))
	}
	return root
}

function NoteUI(post, parentID){
	this.buildDOM()
	this.update(post)
	this.insert(parentID)
}

NoteUI.instances = {}

NoteUI.prototype.buildDOM = function() {
	this.root = document.createElement('article')
	this.root.classList.add('note')

	this.textElement = document.createElement('p')
	this.root.appendChild(this.textElement)
}

NoteUI.prototype.hide = function(){
	var rootparent = this.root.parentElement
	if(rootparent){
		rootparent.removeChild(this.root)
	}
}

NoteUI.prototype.update = function(post) {
	NoteUI.instances[post.getID()] = this
	this.post = post
	this.projectID = post.getProjectID()
	this.root.onclick = editor.editNoteAction(post)
	this.textElement.innerHTML = ''
	this.textElement.appendChild(textToDOM(post.data.content.text)) // raw access coupling
	if(!post.data.content.title){ // raw access coupling
		if(this.titleElement){
			this.root.removeChild(this.titleElement)
			delete this.titleElement
		}
	} else {
		if(!this.titleElement){
			this.titleElement = document.createElement('h1')
			this.titleElement.textContent = post.data.content.title // raw access coupling
			this.root.insertBefore(this.titleElement, this.textElement)
		} else {
			this.titleElement.textContent = post.data.content.title // raw access coupling
		}
	}
}

NoteUI.prototype.insert = function() {
	var project = ProjectUI.instances[this.projectID]
	if(project && this.root.parentElement != project.children){
		project.children.appendChild(this.root)
	}
}





function TaskUI(post, parentID){
	this.buildDOM()
	this.update(post)
	this.insert(parentID)
}

TaskUI.instances = {}

TaskUI.prototype.buildDOM = function() {
	this.root = document.createElement('article')
	this.root.classList.add('task')

	this.checkbox = document.createElement('div')
	this.checkbox.classList.add('checkbox')
	this.root.appendChild(this.checkbox)

	var div = document.createElement('div')
	this.root.appendChild(div)

	this.titleElement = document.createElement('h1')
	div.appendChild(this.titleElement)

	this.textElement = document.createElement('p')
	div.appendChild(this.textElement)
}

TaskUI.prototype.hide = function(){
	var rootparent = this.root.parentElement
	if(rootparent){
		rootparent.removeChild(this.root)
	}
}

TaskUI.prototype.update = function(post){
	TaskUI.instances[post.getID()] = this
	this.post = post
	this.projectID = post.getProjectID()
	this.root.onclick = editor.editTaskAction(post)
	this.textElement.textContent = post.data.content.text // raw access coupling
	this.titleElement.textContent = post.data.content.title // raw access coupling
}

TaskUI.prototype.insert = function(){
	var project = ProjectUI.instances[this.projectID]
	if(project && this.root.parentElement != project.children){
		project.children.appendChild(this.root)
	}
}





function ProjectUI(post){
	this.buildDOM()
	this.buildMenuDOM()
	this.update(post)
	this.insert()
}

ProjectUI.instances = {}

ProjectUI.prototype.buildDOM = function() {
	this.root = document.createElement('div')
	this.root.classList.add('project')

	div = document.createElement('div')
	this.root.appendChild(div)

	var header = document.createElement('header')
	div.appendChild(header)

	this.headdiv = document.createElement('div')
	header.appendChild(this.headdiv)

	this.titleElement = document.createElement('h1')
	this.headdiv.appendChild(this.titleElement)

	this.textElement = document.createElement('p')
	this.headdiv.appendChild(this.textElement)

	var tools = document.createElement('div')
	tools.classList.add('tool')
	tools.innerHTML =
		'<div class="label">Create:</div>'+
		'<div class="group">[<a href="#">New Note</a>|<a href="#">New Task</a> ]</div>'+
		'<div class="label">Sort by:</div>'+
		'<div class="group">['+
			'<a href="#">Creation</a>|'+
			'<a href="#" class="selected">Latest edit</a>|'+
			'<a href="#">Alphabetic</a></div>'+
		'<div class="group">'+
			'<a href="#">Notes first</a>|'+
			'<a href="#">Tasks first</a>|'+
			'<a href="#" class="selected">Interspersed</a>]</div>'
	header.appendChild(tools)

	this.children = document.createElement('div')
	div.appendChild(this.children)
}

ProjectUI.prototype.buildMenuDOM = function() {
	this.menuItem = document.createElement('a')
	this.menuItem.onclick = linkToTab

	this.menuTitleElement = document.createElement('h1')
	this.menuItem.appendChild(this.menuTitleElement)

	this.menuTextElement = document.createElement('p')
	this.menuItem.appendChild(this.menuTextElement)
}

ProjectUI.prototype.hide = function(){
	var menuparent = this.menuItem.parentElement
	if(menuparent){
		menuparent.removeChild(this.menuItem)
	}
	var rootparent = this.root.parentElement
	if(rootparent){
		rootparent.removeChild(this.root)
	}
	if(this.root.classList.contains('active')){
		this.root.classList.remove('active')
		changeTab()
	}
}

ProjectUI.prototype.update = function(post){
	var id = post.getID()
	ProjectUI.instances[id] = this
	this.post = post
	this.headdiv.onclick = editor.editProjectAction(post)
	this.root.id = id
	this.menuItem.href = '#'+id
	this.menuItem.setAttribute('data-target', id)
	this.titleElement.textContent = post.data.content.name // raw access coupling
	this.menuTitleElement.textContent = post.data.content.name // raw access coupling
	this.textElement.textContent = post.data.content.description // raw access coupling
	this.menuTextElement.textContent = post.data.content.description // raw access coupling
}

ProjectUI.prototype.insert = function(){
	var menu = document.getElementById('menu')
	if(this.menuItem.parentElement != menu){
		menu.appendChild(this.menuItem)
	}
	var main = document.querySelector('main')
	if(this.root.parentElement != main){
		main.appendChild(this.root)
	}
}
