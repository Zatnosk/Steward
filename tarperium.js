var Tarperium = (function(app_specific_settings){

var NOTE_TYPE    = "http://tent.zatnosk.dk/types/note/v1"
var PROJECT_TYPE = "http://tent.zatnosk.dk/types/project/v1"
var TASK_TYPE    = "http://tent.zatnosk.dk/types/task/v1"


function create_post(content, type, subtype){
	var tent_post = {
		'content': content || {},
		'type': type + "#" + (subtype || ""),
		'permissions': {
			'public': false
		},
		'mentions': []
	}
	return tent_post
}

function add_mention(tent_post, target){
	if(target.id && target.entity && target.type){
		var mention = {
			'entity': target.entity,
			'post': target.id,
			'type': target.type
		}
		tent_post.mentions.push(mention)
		return true
	}
	return false
}

function has_mention(tent_post, target){
	for(var i in tent_post.mentions){
		var mention = tent_post.mentions[i]
		if(    mention.post == target.id
			&& mention.entity == target.entity
			&& mention.type == target.type){
			return true
		}
	}
	return false
}

function remove_mention(tent_post, target){
	for(var i in tent_post.mentions){
		var mention = tent_post.mentions[i]
		if(    mention.post == target.id
			&& mention.entity == target.entity
			&& mention.type == target.type){
			delete tent_post.mentions[i]
			return true
		}
	}
	return false
}

function get_mention_of_type(tent_post, type){
	for(var i in tent_post.mentions){
		var mention_type = get_type(tent_post.mentions[i])
		if(typeof mention_type == "string"
			&& typeof type == "string"
			&& mention_type == type){
			return tent_post.mentions[i]
		}
	}
	return undefined
}

function get_tent_id_from_mention(mention, entity){
	entity = mention.entity || entity
	return entity + ' ' + mention.post
}

function get_tent_id(tent_post){
	return tent_post.entity + ' ' + tent_post.id
}

function get_type(tent_post, with_fragment){
	var type = tent_post.type
	if(!with_fragment && typeof type == 'string'){
		type = type.split('#', 1)[0]
	}
	return type
}

function to_child_version(tent_post){
	if(tent_post.version){
		tent_post.version = {'parents': [{'version': tent_post.version.id}]}
	}
	return tent_post
}

function create_box(tent_post, parent){
	var box = {
		'tent_post': tent_post,
		'local_id': create_local_id(),
		'data': tent_post, // deprecated
		'get_local_id': function(){
			return this.local_id
		},
		'get_tent_id': function(){
			return get_tent_id(this.tent_post)
		},
		'get_type': function(with_fragment){
			return get_type(this.tent_post, with_fragment)
		},
		'get_tent_post': function(){
			return this.tent_post
		},
		'set_tent_post': function(value){
			this.tent_post = value
		},
		'getLocalID': function(){
			//console.log("deprecated")
			return this.get_local_id()
		},
		'getTentID': function(){
			//console.log("deprecated")
			return this.get_tent_id()
		},
		'getType': function(with_fragment){
			//console.log("deprecated")
			return this.get_type(with_fragment)
		},
		'getProjectLocalID': function(){
			//console.log("deprecated")
			if(this.parent) {
				return this.parent.get_local_id()
			}
		}
	}
	if(parent){
		set_parent(box, parent)
	}
	return box
}

function create_local_id(){
	return Math.random().toString(36).substr(2)
}

function set_parent(box, parent){
	if(box.parent){
		remove_mention(box.tent_post, box.parent.tent_post)
	}
	if(!has_mention(box.tent_post, parent.tent_post)){
		add_mention(box.tent_post, parent.tent_post)
	}
	box.parent = parent
}

var warehouse = {
	'tent_id_index': [],
	'local_id_index': [],
	'type_index': [],
	'load_post': function(tent_post){
		//TODO: check if box exists already, and do update if not
		var parent_mention = get_mention_of_type(tent_post, PROJECT_TYPE)
		if(parent_mention){
			var parent_id = get_tent_id_from_mention(parent_mention, tent_post.entity)
			console.log('parent id', parent_id)
			var parent_box = this.tent_id_index[parent_id]
			if(!parent_box){
				parent_box = create_box({
					'id': parent_mention.id,
					'entity': parent_mention.entity,
					'placeholder': true
				})
				this.store_box(parent_box)
			}
		}
		return this.store_box(create_box(tent_post, parent_box))
	},
	'store_box': function(box){
		// box is only stored 
		// if (neither id is used) OR
		// if (the currently stored box is a placeholder)
		var local_id = box.get_local_id()
		var tent_id = box.get_tent_id()
		var old_box = this.tent_id_index[tent_id] || this.local_id_index[local_id]
		if(old_box){
			if(old_box.placeholder){
				old_box.local_id = local_id
				old_box.tent_post = box.tent_post
				old_box.parent = box.parent
				this.tent_id_index[tent_id] = old_box
				this.local_id_index[local_id] = old_box
			}
			return old_box
		} else {
			this.tent_id_index[tent_id] = box
			this.local_id_index[local_id] = box
		}
		return box
	}
}

var transport = {
	'load_feed': function(feed){
		var boxes = []
		for(var i in feed.posts){
			var box = warehouse.load_post(feed.posts[i])
			boxes.push(box)
		}
		return boxes
	},
	'get_all_of_type': function(type){
		return hooks.server.posts_feed({'types': type})
		.then(this.load_feed)
		// returns a promise
	},
	'get_all_mentioning': function(tent_id){
		return hooks.server.posts_feed({'mentions': tent_id})
		.then(this.load_feed)
		// returns a promise
	},
	'delete': function(box){
		return hooks.server.delete_post(box.get_tent_post())
		// returns a promise
	},
	'commit': function(box){
		var tent_post = to_child_version(box.get_tent_post())
		return hooks.server.put_post(tent_post)
		.then(function(response){
			var box = warehouse.load_post(JSON.parse(response.body).post)
			return box
		})
		// returns a promise
	}
}

var actions = {
	'delete': function(box){
		return transport.delete(box)
		// returns a promise
	},
	'save': function(box){
		return transport.commit(box)
		// returns a promise
	},
	'create': function(post_type, parent_box){
		if(typeof hooks.default_post_content_generators[post_type] == 'function'){
			var content = hooks.default_post_content_generators[post_type]()
		} else {
			content = {}
		}
		var box = load_post(create_post(content, post_type))
		if(parent_box){
			set_parent(box, parent_box)
		}
		return box
	}
}

var hooks = {
	'ui': undefined,
	'default_post_content_generators': undefined,
	'server': undefined
}

function refresh_all(){
	return transport.get_all_of_type(PROJECT_TYPE)
	.then(update_ui)
	.then(function(){
		return transport.get_all_of_type(NOTE_TYPE+','+TASK_TYPE)
	})
	.then(update_ui)
}

function refresh_overview(){
	return transport.get_all_of_type(PROJECT_TYPE)
	.then(update_ui)
	// returns a promise
}

function refresh_project(tent_id){
	return transport.get_all_mentioning(tent_id)
	.then(update_ui)
	// returns a promise
}

function update_ui(posts){
	console.log('update ui', posts)
	for(var i in posts){
		hooks.ui.show(posts[i])
	}
	console.log('update done')
}

function setAvatarSrc(){

}

function connect(entity){
	tarp.get_server(entity)
	.then(function(server){
		setAvatarSrc(server)
		hooks.server = server
		hooks.ui.activate(actions)
		refresh_all()
	})
}

var tarp = undefined

return function(app_data, ui){
	hooks.ui = ui
	tarp = Tarp(app_data)
	tarp.get_active_entity()
	.then(function(entity){
		if(entity){ connect(entity) }
		else{ ui.request_login(connect, tarp.get_known_entities()) }
	})
}
})({
	'default_post_content_generators': {
		PROJECT_TYPE: function(){return {'name': "Unnamed Project"}},
		NOTE_TYPE: function(){return {'text': ""}},
		TASK_TYPE: function(){return {'status': "todo", 'title': ""}}
	}
})