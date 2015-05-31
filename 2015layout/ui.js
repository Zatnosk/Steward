function Interface(){
	Interface.self = this
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

function shortTypeName(post){
	var type = post.getType()
	// TODO: integrate in posttypes.js or scaffold.js
	if(type == "http://tent.zatnosk.dk/types/project/v1"){
		return 'project'
	} else if(type == "http://tent.zatnosk.dk/types/task/v1"){
		return 'task'
	} else if(type == "http://tent.zatnosk.dk/types/note/v1"){
		return 'note'
	}
}








var UIcontext = {}
function getDefaultTab(){
	return UIcontext.mainTab || document.querySelector('.default')
}
function linkToTab(e){
	var target = this.getAttribute('data-target')
	var tab = document.getElementById(target)
	UIcontext.currentTab = tab
	changeTab(tab)
	e.preventDefault()
}

function changeTab(tab){
	var activetabs = document.getElementsByClassName('active')
	for(var i = 0; i < activetabs.length; i++){
		activetabs[i].classList.remove('active')
	}
	( tab || getDefaultTab() ).classList.add('active')
}

function loginUI(func, url, name, imgsrc){
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
