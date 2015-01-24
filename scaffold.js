function Post(data){
	this.data = data
}

Post.prototype.commit = function(server){
	console.log("COMMIT", this)
	var post = this
	return new Promise(function(resolve, reject){
		if(!server){
			reject("Can't find server.")
		} else if(post.data.id){
			console.log('put', post.data, post.data.version.id)
			post.data.version = {'parents': [{'version': post.data.version.id}]}
			var action = server.put_post(post.data).then(function(response){
				console.log('putted post!', JSON.parse(response.body))
				post.update(JSON.parse(response.body).post)
			})
			resolve(action)
		} else {
			console.log('new', post.data)
			var action = server.new_post(post.data).then(function(response){
				console.log('posted post!', JSON.parse(response.body))
				post.update(JSON.parse(response.body).post)
			})
			resolve(action)
		}
	})
}

Post.prototype.save = function(server){
	return this.commit(server)
}

Post.prototype.delete = function(server){
	var post = this
	return new Promise(function(resolve, reject){
		if(!server){
			reject("Can't find server.")
		} else if(post.data.id){
			resolve(server.delete_post(post.data))
		} else {
			resolve()
		}
	})
}

Post.prototype.update = function(data){
	this.newdata(data)
	this.updatePointers()
	if(typeof this.onupdate == 'function'){
		this.onupdate()
	}
}

Post.prototype.newdata = function(data){
	this.data = data
}

Post.prototype.toMention = function(){
	if(this.data.id && this.data.entity && this.data.type){
		return {
			'post': this.data.id,
			'entity': this.data.entity,
			'type': this.data.type
		}
	}
}

Post.prototype.addMention = function(post){
	var mention = post.toMention()
	if(mention){
		this.data.mentions.push(mention)
		this.updatePointers()
		return true
	}
	return false
}

Post.prototype.updatePointers = function(){
	this.pointers = []
	for(var i in this.data.mentions){
		var entity = this.data.entity
		if(this.data.mentions[i].entity){
			entity = this.data.mentions[i].entity
		}
		var id = entity + '/' + this.data.mentions[i].post
		if(Post.list[id]){
			this.pointers.push(Post.list[id])
		}
	}
}

Post.prototype.getPointersOfType = function(type){
	this.updatePointers()
	var test = function(foreignPost){
		var foreignType = foreignPost.data.type
		var strippedType = foreignType.split('#', 1)
		return foreignType == type || strippedType == type
	}
	return this.pointers.filter(test)
}

Post.prototype.hasTentID = function(){
	return this.data && this.data.id && this.data.entity
}

Post.prototype.getID_force = function(){
	var post = this
	return new Promise(function(resolve, reject){
		if(!post.hasTentID()){
			resolve(post.commit())
		} else {
			console.log("Promise is not explicitly resolved. (getID_force)")
		}
	}).then(function(){
		return post.data.entity+'/'+post.data.id
	})
}

Post.prototype.getID = function(){
	if(this.hasTentID()){
		return this.data.entity+'/'+this.data.id
	} else if(!this.local_id){
		this.local_id = Math.random().toString(36).substr(2)
	}
	return this.local_id
}

Post.prototype.getType = function(){
	if(typeof this.data.type == "string"){
		return this.data.type.split("#", 1)
	} else {
		console.error('Post-type is not a string', this)
		return undefined
	}
}

Post.known_types = {}
Post.list = []

Post.getAllOfType = function(type){
	return Post.list.filter(function(p){p.getType() == type})
}

function App(app_data, ui){
	var tarp = Tarp(app_data)
	this.ui = ui
	var app = this
	var actions = {
		'del': function(post, hidepost){
			if(app.active_server){
				post.delete(app.active_server).then(function(){
					ui.hide(post)
				}, function(e){
					ui.error(e)
				})
			} else {
				ui.error("ERROR: Not currently connected to a Tent server.")
			}
		},
		'save': function(post){
			if(app.active_server){
				post.save(app.active_server).catch(function(e){
					ui.error(e)
				})
			} else {
				ui.error("ERROR: Not currently connected to a Tent server.")
			}
		},
		'create': function(posttype, parent_id){
			parent = Post.list[parent_id]
			
			if(posttype == 'project'){
				var id = Math.random().toString(36).substr(2)
				var post = Project.create('Unnamed', id)
				Post.list[id] = post
			} else if(posttype == 'task'){
				var post = Task.create(parent)
			} else if(posttype == 'note'){
				var post = Note.create(parent)
			}
			console.log('create', posttype, parent_id, parent, post)
			if(parent && typeof parent.claimPost == 'function'){
				parent.claimPost(post)
			}
			return post
		}
	}
	
	tarp.get_active_entity().then(function(entity){
		if(entity){ connect(entity) }
		else { ui.request_login(connect, tarp.get_known_entities()) }
	})

	function setAvatarSrc(server){
		var avatar = document.getElementById("avatar")
		var uri = server.get_avatar_uri()
		console.log("avatar", uri)
		avatar.src = uri
	}

	function connect(entity){
		tarp.get_server(entity).then(function(server){
			setAvatarSrc(server)
			app.active_server = server
			ui.activate(actions)
			Post.prototype.onupdate = function(){ui.update(this)}
			app.refresh()
		})
	}
}

App.prototype.refresh = function(){
	var app = this
	console.log('refresh!')
	this.active_server.posts_feed({'limit': 50}).then(function(feed){
		var freshposts = []
		for(var i in feed.posts){
			var key = feed.posts[i].entity+'/'+feed.posts[i].id
			var post = app.newPost(feed.posts[i])
			if(!Post.list[key]){
				freshposts[key] = post
			}
			Post.list[key] = post
		}
		return freshposts
	}, function(e){app.ui.error(e)}).then(function(freshposts){
		for(var id in freshposts){
			app.ui.show(freshposts[id])
		}
	})
}

App.prototype.newPost = function(data){
	var type = data.type.split('#', 1)
	for(var i in Post.known_types){
		if(i == type){
			var p = new Post.known_types[i](data)
			return p
		}
	}
	return new Post(data)
}

