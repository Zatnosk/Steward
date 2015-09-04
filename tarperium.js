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
			&& mention.entity = target.entity
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
			&& mention.entity = target.entity
			&& mention.type == target.type){
			delete tent_post.mentions[i]
			return true
		}
	}
	return false
}

function get_mention_of_type(tent_post, type){
	for(var i in tent_post.mentions){
		var mention_type = tent_post.mentions[i].type
		if(typeof mention_type != "string"
			|| typeof type != "string"){
			continue
		}
		mention_type = mention_type.split('#', 1)
		type = type.split('#', 1)
		if(mention_type == type){
			return tent_post.mentions[i]
		}
	}
	return undefined
}

function get_tent_id(tent_post){
	// coincidentally works for mentions too.
	return tent_post.entity + '/' + tent_post.id
}

function create_box(tent_post, parent){
	var box = {
		'tent_post': tent_post,
		'local_id': create_local_id(),
		'get_local_id': function(){
			return this.local_id
		},
		'get_tent_id': function(){
			return get_tent_id(this.tent_post)
		},
	}
	if(parent){
		set_parent(box, parent)
	}
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
	'load_post': function(tent_post){
		//TODO: check if box exists already, and do update if not
		var parent_mention = get_mention_of_type(tent_post, PROJECT_TYPE)
		if(parent_mention){
			var parent_id = get_tent_id(parent_mention)
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
		var box = this.store_box(create_box(tent_post, parent_box))
	},
	'store_box': function(box){
		// box is only stored 
		// if neither id is used OR
		// if the currently stored box is a placeholder
		var local_id = box.get_local_id()
		var tent_id = box.get_tent_id()
		var old_box = tent_id_index[tent_id] || local_id_index[local_id]
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