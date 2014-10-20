/*******************************************************************************
Note
*******************************************************************************/
function Note(data){
	this.update(data)
}

Note.prototype = new Post
Post.known_types['http://tent.zatnosk.dk/types/note/v1'] = Note

Note.create = function(text, project){
	var data = {
		'content': {
			'text': text
		},
		'type': "http://tent.zatnosk.dk/types/note/v1#",
		'permissions': {
			'public': false
		},
		'mentions': []
	}
	var mention = project.toMention()
	if(mention){
		data.mentions.push(mention)
	}
	return new Note(data)
}

Note.prototype.getProject = function(){
	var projects = this.getPointersOfType("http://tent.zatnosk.dk/types/project/v1")
	if(projects && projects.length >= 1){
		return projects[0]
	} else {
		return this.local_project
	}
}

/*******************************************************************************
Project
*******************************************************************************/
function Project(data, local_id){
	if(local_id){
		this.local_id = local_id
	}
	this.update(data)
}

Project.prototype = new Post
Post.known_types['http://cacauu.de/tasky/list/v0.1'] = Project
Post.known_types['http://tent.zatnosk.dk/types/project/v1'] = Project

Project.create = function(name, local_id){
	var data = {
		'content': {
			'name': name
		},
		'type': 'http://tent.zatnosk.dk/types/project/v1#',
		'permissions': {
			'public': false
		}
	}
	return new Project(data, local_id)
}

Project.prototype.newdata = function(data){
	if(data.entity && data.id){
		var newID = data.entity+'/'+data.id
		var oldID = this.local_id
		if(oldID && newID != oldID){
			this.local_id = oldID
			Post.list[newID] = this
		}
	}
	if(data.type == 'http://cacauu.de/tasky/list/v0.1#'){
		data.type = 'http://tent.zatnosk.dk/types/project/v1#'
		this.readonly = true
	}
	this.data = data
}

Project.prototype.claimPost = function(post, entity, id){
	if(entity || id){
		console.error('deprecated', entity, id)
	}
	var success = post.addMention(this)
	if(!success){
		post.local_project = this
	}
}

/*******************************************************************************
Task
*******************************************************************************/
function Task(data){
	this.update(data)
}

Task.prototype = new Post
Post.known_types['http://cacauu.de/tasky/task/v0.1'] = Task
Post.known_types['http://tent.zatnosk.dk/types/task/v1'] = Task

Task.create = function(title, project){
	var data = {
		'content': {
			'status': 'todo',
			'title': title,
		},
		'type': 'http://tent.zatnosk.dk/types/task/v1#todo',
		'permissions': {
			'public': false
		},
		'mentions': []
	}
	var mention = project.toMention()
	if(mention){
		data.mentions.push(mention)
	}
	return new Task(data)
}

Task.prototype.newdata = function(data){
	if(data.type == 'http://cacauu.de/tasky/task/v0.1#'){
		data.type = 'http://tent.zatnosk.dk/types/task/v1#'
		this.readonly = true
	}
	if(data.type == 'http://cacauu.de/tasky/task/v0.1#todo'){
		data.type = 'http://tent.zatnosk.dk/types/task/v1#todo'
		this.readonly = true
	}
	if(data.type == 'http://cacauu.de/tasky/task/v0.1#done'){
		data.type = 'http://tent.zatnosk.dk/types/task/v1#done'
		this.readonly = true
	}
	this.data = data
}

Task.prototype.getProject = function(){
	var projects = this.getPointersOfType("http://tent.zatnosk.dk/types/project/v1")
	if(projects && projects.length >= 1){
		return projects[0]
	} else {
		return this.local_project
	}
}

Task.prototype.moveToProject = function(project_id){
	console.error('deprecated')
	var project = Post.list[project_id]
	if(project){
		project.claimPost(this)
	}
}
