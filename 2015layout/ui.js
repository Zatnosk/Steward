function Interface(){
	document.getElementById('home-link').onclick = function(e){
		changeTab()
		e.preventDefault()
	}
	changeTab()
}

Interface.prototype.activate = function(actions) {
	UIcontext.actions = actions
}

Interface.prototype.show = function(post, id) {
	id = id || post.getID()
	var cl = typeToClass(post.getType())
	if(cl){
		if(cl.instances[id]){
			cl.instances[id].update(post)
			cl.instances[id].insert()
		} else {
			new cl(post)
		}
	}
}

Interface.prototype.hide = function(post) {
	var id = post.getID()
	var cl = typeToClass(post.getType())
	if(cl && cl.instances[id]){
		cl.instances[id].hide()
	}
}

Interface.prototype.update = function(post, id) {
	console.log('UI Interface .update() is deprecated. Use .show() instead.')
	this.show(post, id)
}

Interface.prototype.request_login = function(func, known_entities) {
	var do_login = function(value){
		delete UIcontext.mainTab
		changeTab()
		func(value)
	}
	var loginpage = document.getElementById('login')
	var form = loginpage.querySelector('form.entity')
	form.onsubmit = function(e){
		do_login(document.getElementById('loginInput').value)
		e.preventDefault()
	}
	for(var i in known_entities){
		var div = loginUI(do_login, known_entities[i])
		loginpage.insertBefore(div, form)
	}
	UIcontext.mainTab = loginpage
	changeTab(loginpage)
}

Interface.prototype.error = function(msg) {
	console.error(msg)
}

function typeToClass(type){
	if(type == "http://tent.zatnosk.dk/types/project/v1"){
		return ProjectUI
	} else if(type == "http://tent.zatnosk.dk/types/task/v1"){
		return TaskUI
	} else if(type == "http://tent.zatnosk.dk/types/note/v1"){
		return NoteUI
	}
}








var UIcontext = {}
function linkToTab(e){
	var target = this.getAttribute('data-target')
	var tab = document.getElementById(target)
	UIcontext.currentTab = tab
	changeTab(tab)
	e.preventDefault()
}
function closeEditor(){
	delete UIcontext.post
	changeTab(UIcontext.currentTab)
}

function edit(element, editor, dataSelectors){
	UIcontext.post = element.UIObj
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
function saveProject(){
	var title = document.querySelector('#projectEditor input:nth-child(2)').value
	var text = document.querySelector('#projectEditor textarea:nth-child(3)').value
	UIcontext.post.save(title, text)
}
function saveNote(){
	var title = document.querySelector('#noteEditor input:nth-child(2)').value
	var text = document.querySelector('#noteEditor textarea:nth-child(3)').value
	UIcontext.post.save(title, text)
}
function saveTask(){
	var title = document.querySelector('#taskEditor input:nth-child(2)').value
	var text = document.querySelector('#taskEditor input:nth-child(3)').value
	UIcontext.post.save(title, text)
}
function changeTab(tab){
	var activetabs = document.getElementsByClassName('active')
	for(var i = 0; i < activetabs.length; i++){
		activetabs[i].classList.remove('active')
	}
	(tab || UIcontext.mainTab || document.getElementsByClassName('default')[0]).classList.add('active')
}

function loginUI(func, url, name, imgsrc){
	console.log(func, url, name, imgsrc)
	var root = document.createElement('div')
	root.onclick = function(){
		func(url)
	}
	root.classList.add('entity')
	var img = document.createElement('img')
	img.src = imgsrc || ""
	root.appendChild(img)
	var div = document.createElement('div')
	root.appendChild(div)
	var namediv = document.createElement('div')
	namediv.textContent = name || "[unknown]"
	div.appendChild(namediv)
	var urldiv = document.createElement('div')
	urldiv.textContent = url
	div.appendChild(urldiv)
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
	this.root.onclick = editNote
	this.root.UIObj = this

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
	this.textElement.textContent = post.data.content.text // raw access coupling
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
	if(ProjectUI.instances[this.projectID]){
		ProjectUI.instances[this.projectID].children.appendChild(this.root)
	}
}

NoteUI.prototype.save = function(title, text){
	var dirty = false
	if(this.post.data.content.title != title){ // raw access coupling
		this.post.data.content.title = title // raw access coupling
		dirty = true
	}
	if(this.post.data.content.text != text){ // raw access coupling
		this.post.data.content.text = text // raw access coupling
		dirty = true
	}
	if(dirty){
		this.update(this.post)
	}
	if(UIcontext.actions && typeof UIcontext.actions.save == 'function'){
		UIcontext.actions.save(this.post)
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
	this.root.onclick = editTask
	this.root.UIObj = this

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
	this.textElement.textContent = post.data.content.text // raw access coupling
	this.titleElement.textContent = post.data.content.title // raw access coupling
}

TaskUI.prototype.insert = function(){
	if(ProjectUI.instances[this.projectID]){
		ProjectUI.instances[this.projectID].children.appendChild(this.root)
	}
}

TaskUI.prototype.save = function(title, text){
	var dirty = false
	if(this.post.data.content.title != title){ // raw access coupling
		this.post.data.content.title = title // raw access coupling
		dirty = true
	}
	if(this.post.data.content.text != text){ // raw access coupling
		this.post.data.content.text = text // raw access coupling
		dirty = true
	}
	if(dirty){
		this.update(this.post)
	}
	if(UIcontext.actions && typeof UIcontext.actions.save == 'function'){
		UIcontext.actions.save(this.post)
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

	var headdiv = document.createElement('div')
	headdiv.onclick = editProject
	headdiv.UIObj = this
	header.appendChild(headdiv)

	this.titleElement = document.createElement('h1')
	headdiv.appendChild(this.titleElement)

	this.textElement = document.createElement('p')
	headdiv.appendChild(this.textElement)

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
	this.root.id = id
	this.menuItem.href = '#'+id
	this.menuItem.setAttribute('data-target', id)
	this.titleElement.textContent = post.data.content.name // raw access coupling
	this.menuTitleElement.textContent = post.data.content.name // raw access coupling
	this.textElement.textContent = post.data.content.description // raw access coupling
	this.menuTextElement.textContent = post.data.content.description // raw access coupling
}

ProjectUI.prototype.insert = function(){
	document.getElementById('menu').appendChild(this.menuItem)
	document.querySelector('main').appendChild(this.root)
}

ProjectUI.prototype.save = function(name, description){
	var dirty = false
	if(this.post.data.content.name != name){ // raw access coupling
		this.post.data.content.name = name // raw access coupling
		dirty = true
	}
	if(this.post.data.content.description != description){ // raw access coupling
		this.post.data.content.description = description // raw access coupling
		dirty = true
	}
	console.log(dirty)
	if(dirty){
		this.update(this.post)
		if(UIcontext.actions && typeof UIcontext.actions.save == 'function'){
			UIcontext.actions.save(this.post)
		}
	}
}
