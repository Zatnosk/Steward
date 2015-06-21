var editor = (function(){
	var projectMeta = {
		'init': function(){
			this.editor =       document.getElementById('projectEditor')
			this.fields =       document.querySelectorAll('#projectEditor input, #projectEditor textarea')
			this.saveButton =   document.querySelector('#projectEditor ._save')
			this.closeButton =  document.querySelector('#projectEditor ._close')
			this.deleteButton = document.querySelector('#projectEditor ._delete')
		},
		'open': function(post){
			this.fields[0].value = post.data.content.name || ""
			this.fields[1].value = post.data.content.description || ""
		},
		'save': function(post){
			post.data.content.name =        this.fields[0].value
			post.data.content.description = this.fields[1].value
		}
	}
	var noteMeta = {
		'init': function(){
			this.editor =       document.getElementById('noteEditor')
			this.fields =       document.querySelectorAll('#noteEditor input, #noteEditor textarea')
			this.saveButton =   document.querySelector('#noteEditor ._save')
			this.closeButton =  document.querySelector('#noteEditor ._close')
			this.deleteButton = document.querySelector('#noteEditor ._delete')
		},
		'open': function(post){
			this.fields[0].value = post.data.content.title || ""
			this.fields[1].value = post.data.content.text || ""
		},
		'save': function(post){
			post.data.content.title = this.fields[0].value
			post.data.content.text =  this.fields[1].value
		}
	}
	var taskMeta = {
		'init': function(){
			this.editor =       document.getElementById('taskEditor')
			this.fields =       document.querySelectorAll('#taskEditor input, #taskEditor textarea')
			this.saveButton =   document.querySelector('#taskEditor ._save')
			this.closeButton =  document.querySelector('#taskEditor ._close')
			this.deleteButton = document.querySelector('#taskEditor ._delete')
		},
		'open': function(post){
			this.fields[0].value = post.data.content.title || ""
			this.fields[1].value = post.data.content.text || ""
		},
		'save': function(post){
			post.data.content.title = this.fields[0].value
			post.data.content.text =  this.fields[1].value
		}
	}
	function createProjectAction(){
		return createAction(projectMeta, 'project')
	}
	function createNoteAction(projectID){
		return createAction(noteMeta, 'note', projectID)
	}
	function createTaskAction(projectID){
		return createAction(taskMeta, 'task', projectID)
	}
	function createAction(meta, type, projectID){
		return function(e){
			meta.saveButton.onclick = spawnAction(meta, type, projectID)
			meta.closeButton.onclick = closeAction()
			meta.deleteButton.onclick = closeAction()
			meta.open({'data':{'content':{}}})
			changeTab(meta.editor)
			if(e && typeof e.preventDefault == 'function'){e.preventDefault()}
		}
	}
	function editProjectAction(post){
		return editAction(projectMeta, post)
	}
	function editNoteAction(post){
		return editAction(noteMeta, post)
	}
	function editTaskAction(post){
		return editAction(taskMeta, post)
	}
	function editAction(meta, post){
		return function(e){
			meta.saveButton.onclick = saveAction(meta, post)
			meta.closeButton.onclick = closeAction()
			meta.deleteButton.onclick = deleteAction(post)
			meta.open(post)
			changeTab(meta.editor)
			if(e && typeof e.preventDefault == 'function'){e.preventDefault()}
		}
	}
	function spawnAction(meta, type, projectID){
		return function(e){
			var post = UIcontext.actions.create(type, projectID)
			meta.save(post)
			Interface.self.show(post)
			changeTab(UIcontext.currentTab)
			if(e && typeof e.preventDefault == 'function'){e.preventDefault()}
		}
	}
	function saveAction(meta, post){
		return function(e){
			meta.save(post)
			UIcontext.actions.save(post)
			Interface.self.show(post)
			changeTab(UIcontext.currentTab)
			if(e && typeof e.preventDefault == 'function'){e.preventDefault()}
		}
	}
	function closeAction(){
		// TODO: Add exit confirmation / potential dataloss warning
		return function(e){
			changeTab(UIcontext.currentTab)
			if(e && typeof e.preventDefault == 'function'){e.preventDefault()}
		}
	}
	function deleteAction(post){
		// TODO: Add deletion confirmation
		return function(e){
			UIcontext.actions.delete(post)
			changeTab(UIcontext.currentTab)
			if(e && typeof e.preventDefault == 'function'){e.preventDefault()}
		}
	}
	
	return {
		'init': function(){
			projectMeta.init()
			noteMeta.init()
			taskMeta.init()
		},
		'createProjectAction': createProjectAction,
		'createNoteAction': createNoteAction,
		'createTaskAction': createTaskAction,
		'editProjectAction': editProjectAction,
		'editNoteAction': editNoteAction,
		'editTaskAction': editTaskAction
	}
})()