var editor = (function(){
	var projectMeta = {
		'init': function(){
			this.editor =      document.getElementById('projectEditor')
			this.fields =      document.querySelectorAll('#projectEditor input, #projectEditor textarea')
			this.saveButton =  document.querySelector('#projectEditor ._save')
			this.closeButton = document.querySelector('#projectEditor ._close')
		},
		'open': function(post){
			this.fields[0].value = post.data.content.name
			this.fields[1].value = post.data.content.description
		},
		'save': function(post){
			post.data.content.name =        this.fields[0].value
			post.data.content.description = this.fields[1].value
		}
	}
	var noteMeta = {
		'init': function(){
			this.editor =      document.getElementById('noteEditor')
			this.fields =      document.querySelectorAll('#noteEditor input, #noteEditor textarea')
			this.saveButton =  document.querySelector('#noteEditor ._save')
			this.closeButton = document.querySelector('#noteEditor ._close')
		},
		'open': function(post){
			this.fields[0].value = post.data.content.title
			this.fields[1].value = post.data.content.text
		},
		'save': function(post){
			post.data.content.title = this.fields[0].value
			post.data.content.text =  this.fields[1].value
		}
	}
	var taskMeta = {
		'init': function(){
			this.editor =      document.getElementById('taskEditor')
			this.fields =      document.querySelectorAll('#taskEditor input, #taskEditor textarea')
			this.saveButton =  document.querySelector('#taskEditor ._save')
			this.closeButton = document.querySelector('#taskEditor ._close')
		},
		'open': function(post){
			this.fields[0].value = post.data.content.title
			this.fields[1].value = post.data.content.text
		},
		'save': function(post){
			post.data.content.title = this.fields[0].value
			post.data.content.text =  this.fields[1].value
		}
	}
	function editProjectAction(post){
		return editAction(post, projectMeta)
	}
	function editNoteAction(post){
		return editAction(post, noteMeta)
	}
	function editTaskAction(post){
		return editAction(post, taskMeta)
	}
	function editAction(post, meta){
		return function(e){
			meta.saveButton.onclick = saveAction(post, meta)
			meta.closeButton.onclick = closeAction()
			meta.open(post)
			changeTab(meta.editor)
			if(e && typeof e.preventDefault == 'function'){e.preventDefault()}
		}
	}
	function saveAction(post, meta){
		return function(e){
			meta.save(post)
			UIcontext.actions.save(post)
			Interface.self.show(post)
			changeTab(UIcontext.currentTab)
			if(e && typeof e.preventDefault == 'function'){e.preventDefault()}
		}
	}
	function closeAction(){
		return function(e){
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
		'editProjectAction': editProjectAction,
		'editNoteAction': editNoteAction,
		'editTaskAction': editTaskAction
	}
})()