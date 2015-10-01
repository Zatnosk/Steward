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
	if(tent_post.entity && tent_post.id) return tent_post.entity + ' ' + tent_post.id
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

function Box(tent_post){
	this.tent_post = tent_post
	this.data = tent_post
	this.local_id = create_local_id()
}
Box.prototype = {
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

function create_box(tent_post, parent){
	var box = new Box(tent_post)
	if(parent){
		set_parent(box, parent)
	}
	return box
}

function create_local_id(){
	return Math.random().toString(36).substr(2)
}

function set_parent(box, parent){
	if(box.parent == parent) return
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
	'load_post': function(tent_post, local_id){
		var parent_mention = get_mention_of_type(tent_post, PROJECT_TYPE)
		if(parent_mention){
			var entity = parent_mention.entity || tent_post.entity
			var parent_box = this.load_post({
				'id': parent_mention.post,
				'entity': entity,
				'placeholder': true
			})
		}
		var box = this.tent_id_index[get_tent_id(tent_post)]
		if(local_id && !box) box = this.local_id_index[local_id]
		if (box) return this.update_box(box, tent_post, parent_box)
		else     return this.store_box(create_box(tent_post, parent_box))
	},
	'store_box': function(box){
		this.tent_id_index[box.get_tent_id()] = box
		this.local_id_index[box.get_local_id()] = box
		console.log('stored', box)
		return box
	},
	'update_box': function(box, tent_post, parent){
		if (tent_post.placeholder) return box
		box.tent_post = tent_post
		box.data = tent_post //deprecated
		if(parent) box.parent = parent
		console.log('updated', box)
		return box
	}
}

var transport = {
	'load_feed': function(feed){
		var boxes = []
		for(var i in feed.posts){
			var box = warehouse.load_post(feed.posts[i])
			if(box.get_type() == PROJECT_TYPE){
				boxes.unshift(box)
			} else {
				boxes.push(box)
			}
		}
		return boxes
	},
	'get': function(params){
		return hooks.server.posts_feed(params).then(this.load_feed)
		// returns a promise
	},
	'delete': function(box){
		return hooks.server.delete_post(box.get_tent_post())
		// returns a promise
	},
	'commit': function(box){
		if(box.get_tent_id()){
			var tent_post = to_child_version(box.get_tent_post())
			var request = hooks.server.put_post(tent_post)
		} else {
			var tent_post = box.get_tent_post()
			var request = hooks.server.new_post(tent_post)
		}
		return request.then(function(response){
			return warehouse.load_post(JSON.parse(response.body).post, box.get_local_id())
		})
		// returns a promise
	}
}

var actions = {
	'del': function(box){
		return transport.delete(box)
		.then(function(){
			hooks.ui.hide(box)
		})
		// returns a promise
	},
	'save': function(box){
		return transport.commit(box)
		// returns a promise
	},
	'create': function(post_type, parent_id){
		if(post_type == 'task'){
			post_type = TASK_TYPE
		} else if(post_type == 'note'){
			post_type = NOTE_TYPE
		} else if(post_type == 'project'){
			post_type = PROJECT_TYPE
		}
		if(typeof hooks.default_post_content_generators[post_type] == 'function'){
			var content = hooks.default_post_content_generators[post_type]()
		} else {
			content = {}
		}
		var box = warehouse.load_post(create_post(content, post_type))
		var parent_box = warehouse.local_id_index[parent_id]
		if(parent_box){
			set_parent(box, parent_box)
		}
		return box
	}
}

var hooks = {
	'ui': undefined,
	'default_post_content_generators': app_specific_settings.default_post_content_generators,
	'server': undefined
}

function refresh(feed_params){
	return transport.get(feed_params).then(update_ui)
}

function refresh_overview(){
	return refresh({'types': PROJECT_TYPE})
}

function refresh_project(tent_id){
	return refresh({'mentions': tent_id})
}

function update_ui(posts){
	for(var i in posts){
		hooks.ui.show(posts[i])
	}
	return posts
}

function setAvatarSrc(){
		var avatar = document.getElementById("avatar")
		var uri = hooks.server.get_avatar_uri()
		avatar.src = uri
}

function connect(entity){
	tarp.get_server(entity)
	.then(function(server){
		hooks.server = server
		setAvatarSrc()
		hooks.ui.activate(actions)
		refresh({'limit': 50})
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
	return {
		'refresh': refresh,
		'debug': function(){
			console.log(warehouse)
		}
	}
}

})({
	'default_post_content_generators': {
		PROJECT_TYPE: function(){return {'name': "Unnamed Project"}},
		NOTE_TYPE: function(){return {'text': ""}},
		TASK_TYPE: function(){return {'status': "todo", 'title': ""}}
	}
})