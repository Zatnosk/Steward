var editor = {
	'activePost': undefined,
	'save': function(){return false},
	'close': function(){
		console.log('new close', editor)
		this.activePost = undefined
		this.save = function(){return false}
		changeTab(UIcontext.currentTab)
	}
}
function editProjectOnClick(post){
	var fields = document.querySelectorAll('#projectEditor input, #projectEditor textarea')
	
	return function(e){
		console.log(fields, '\n', editor, '\n', post)
		editor.save = function(){
			post.data.content.name = fields[0].value
			post.data.content.description = fields[1].value
			UIcontext.actions.save(post)
			Interface.self.show(post)
			return true
		}
		editor.activePost = post
		fields[0].value = post.data.content.name
		fields[1].value = post.data.content.description
		changeTab(document.getElementById('projectEditor'))
		if(e && typeof e.preventDefault == 'function'){e.preventDefault()}
	}
}

function editNoteOnClick(post){
	var fields = document.querySelectorAll('#noteEditor input, #noteEditor textarea')
	
	return function(e){
		editor.save = function(){
			post.data.content.title = fields[0].value
			post.data.content.text = fields[1].value
			UIcontext.actions.save(post)
			Interface.self.show(post)
			return true
		}
		fields[0].value = post.data.content.title
		fields[1].value = post.data.content.text
		changeTab(document.getElementById('noteEditor'))
		if(e && typeof e.preventDefault == 'function'){e.preventDefault()}
	}
}

function editTaskOnClick(post){
	var fields = document.querySelectorAll('#taskEditor input, #taskEditor textarea')
	
	return function(e){
		editor.save = function(){
			post.data.content.title = fields[0].value
			post.data.content.text = fields[1].value
			UIcontext.actions.save(post)
			Interface.self.show(post)
			return true
		}
		fields[0].value = post.data.content.title
		fields[1].value = post.data.content.text
		changeTab(document.getElementById('taskEditor'))
		if(e && typeof e.preventDefault == 'function'){e.preventDefault()}
	}
}