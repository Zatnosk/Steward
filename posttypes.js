/* Common functions */
function common_getProject(strict){
	strict = strict || false
	var projects = this.getPointersOfType("http://tent.zatnosk.dk/types/project/v1")
	if(projects && projects.length >= 1){
		return projects[0]
	} else if (!strict){
		return this.local_project
	} else {
		return null
	}
}

function common_save(server){
	if(!this.getProject(true) && this.local_project){
		var project = this.local_project
		if(project.hasTentID()){
			// This might be an unreachable state, if everything works as expected
			this.addMention(project)
		} else {
			var post = this
			return project.save(server).then(function(){
				var result = post.addMention(project)
				console.log('add mention!', result, post, project)
				return post.commit(server)
			})
		}
	}
	return this.commit(server)
}


/*******************************************************************************
Note
*******************************************************************************/
function Note(data){
	this.update(data)
}

Note.prototype = new Post
Post.known_types['http://tent.zatnosk.dk/types/note/v1'] = Note

Note.create = function(project){
	var data = {
		'content': {
			'text': ""
		},
		'type': "http://tent.zatnosk.dk/types/note/v1#",
		'permissions': {
			'public': false
		},
		'mentions': []
	}
	if(project){
		var mention = project.toMention()
		if(mention){
			data.mentions.push(mention)
		}
	}
	return new Note(data)
}

Note.prototype.getProject = common_getProject
Note.prototype.save = common_save

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

Project.prototype.claimPost = function(post){
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

Task.create = function(project){
	var data = {
		'content': {
			'status': 'todo',
			'title': '',
		},
		'type': 'http://tent.zatnosk.dk/types/task/v1#todo',
		'permissions': {
			'public': false
		},
		'mentions': []
	}
	if(project){
		var mention = project.toMention()
		if(mention){
			data.mentions.push(mention)
		}
	}
	return new Task(data)
}

Task.prototype.save = common_save

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

Task.prototype.moveToProject = function(){
	// TODO
}

Task.prototype.getProject = common_getProject
