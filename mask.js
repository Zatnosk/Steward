var Mask = function(){
	function Interface(container){
		this.mask = new Mask()
	}

	Interface.prototype.activate = function(actions){
		this.mask.activate(actions)
	}

	Interface.prototype.show = function(post){
		var type = post.getType()
		if(type == "http://tent.zatnosk.dk/types/project/v1"){
			this.mask.show_project(post)
		} else if(type == "http://tent.zatnosk.dk/types/task/v1"){
			this.mask.show_task(post)
		} else if(type == "http://tent.zatnosk.dk/types/note/v1"){
			this.mask.show_note(post)
		}
	}

	Interface.prototype.hide = function(post){
		this.mask.hide_post(post)
	}

	Interface.prototype.update = function(post){
		var dom = this.mask.getDOM(post)
		if(dom){
			dom.update(post)
		}
	}

	Interface.prototype.request_login = function(callback){
		this.mask.request_login(callback)
	}

	Interface.prototype.error = function(msg){
		this.mask.error(msg)
	}

	function Mask(){
		this.elements = {}

		this.actions = {}

		var orphanage = new Project({
			'content': {
				'name': 'Orphanage',
				'description': "Any task or note that doesn't belong to a recognizable list is placed here."
			},
			'type': 'http://tent.zatnosk.dk/types/project/v1#'
		}, 'orphanage')
		Post.list['orphanage'] = orphanage
		this.show_project(orphanage)
		var mask = this
	}

	Mask.prototype.getDOM = function(post, type){
		var id = post.getID()
		var dom = this.elements[id]
		if(!dom && post.local_id){
			dom = this.elements[post.local_id]
			if(id){
				this.elements[id] = dom
			}
		}
		if(!dom){
			if(type == 'note'){
				dom = this.note_dom(post, this.actions)
				this.elements[id] = dom
			} else if(type == 'project'){
				dom = this.project_dom(post, this.actions)
				this.elements[id] = dom
			} else if(type == 'task'){
				dom = this.task_dom(post, this.actions)
				this.elements[id] = dom
			}
		}
		return dom
	}

	Mask.prototype.error = function(msg){
		console.error('ui.error', msg)
	}

	Mask.prototype.activate = function(actions){
		function getSelectedProject(){
			var selected = document.getElementById('menu')
								.getElementsByClassName('selected')[0]
			if(selected){
				return selected.getAttribute('data-target')
			} else {
				return 'orphanage'
			}
		}
		this.actions = actions
		var ui = this
		document.getElementById('new_list').onclick = function(){
			ui.show_project(actions.create('project'))
		}
		document.getElementById('new_task').onclick = function(){
			ui.show_task(actions.create('task', getSelectedProject()))
		}
		document.getElementById('new_note').onclick = function(){
			ui.show_note(actions.create('note', getSelectedProject()))
		}
		this.init_lightbox()
	}

	Mask.prototype.request_login = function(do_login){
		var ui = this

		var form = document.createElement('form')
		var label = document.createElement('label')
		label.textContent = "Tent Entity: "
		form.appendChild(label)
		var input = document.createElement('input')
		label.appendChild(input)
		var button = document.createElement('input')
		button.type = "submit"
		button.value = "Login"
		form.appendChild(button)
		form.onsubmit = function(e){
			do_login(input.value)
			ui.close_lightbox()
			e.preventDefault()
		}

		this.open_lightbox(form)
	}

	/*******************************************************************************
		Lightbox
	*******************************************************************************/

	Mask.prototype.open_lightbox = function(dom){
		var lb = document.getElementById('lightbox')
		lb.innerHTML = ''
		lb.appendChild(dom)
		document.getElementById('overlay').style.display = 'block'
	}

	Mask.prototype.close_lightbox = function(){
		document.getElementById('overlay').style.display = 'none'
	}

	Mask.prototype.init_lightbox = function(){
		document.getElementById('overlay').onclick = this.close_lightbox
		document.getElementById('lightbox').onclick = function(e){e.stopPropagation()}
	}

	/*******************************************************************************
		Buttons
	*******************************************************************************/

	Mask.prototype.delete_button = function(del, post){
		var ui = this
		var delete_confirm = document.createElement('div')
		delete_confirm.className = 'confirmation'
		delete_confirm = delete_confirm

		var delete_desc = document.createElement('p')
		delete_desc.innerHTML = 
			'You are about to delete this post.<br>\
			Please confirm that you want to delete this post.'
		delete_confirm.appendChild(delete_desc)

		var delete_yes = document.createElement('div')
		delete_yes.onclick = function(){
			var errormsg = del(post, function(){ui.hide_post(post)})
			if(errormsg){
				ui.error(errormsg)
			}
			/*if(steward.active_server){
				note.delete(steward.active_server)
			} else {
				ui.error('Can\'t find user')
			}*/
			ui.close_lightbox()
		}
		delete_yes.className = 'button delete'
		delete_yes.innerHTML = 'delete'
		delete_confirm.appendChild(delete_yes)

		var delete_no = document.createElement('div')
		delete_no.onclick = function(){
			ui.close_lightbox()
		}
		delete_no.className = 'button cancel'
		delete_no.innerHTML = 'cancel'
		delete_confirm.appendChild(delete_no)

		var deletebutton = document.createElement('div')
		deletebutton.onclick = function(){
			ui.open_lightbox(delete_confirm)
		}
		deletebutton.className = 'button delete'
		deletebutton.innerHTML = 'delete'

		return deletebutton
	}

	/*******************************************************************************
		Posttypes
	*******************************************************************************/

	Mask.prototype.hide_post = function(post){
		var dom = this.getDOM(post)
		if(dom && dom.root){
			dom.root.parentNode.removeChild(dom.root)
		}
	}

	Mask.prototype.show_note = function(note){
		var notedom = this.getDOM(note, 'note')
		var project = note.getProject()
		var projectdom = undefined
		if(project){
			projectdom = this.getDOM(project, 'project')
		}
		if(!projectdom){
			var projectdom = this.elements['orphanage']
		}
		projectdom.root.appendChild(notedom.root)
	}

	Mask.prototype.show_project = function(project){
		var projectdom = this.getDOM(project, 'project')
		document.getElementById('container').appendChild(projectdom.root)
		document.getElementById('menu').appendChild(projectdom.menuitem)
		var id = project.getID()
		for(var i in this.elements){
			var postdom = this.elements[i]
			if(postdom.optimalParent == project){
				if(postdom.type == 'note'){
					projectdom.root.appendChild(postdom.root)
				} else if(postdom.type == 'task'){
					projectdom.tasks.appendChild(postdom.root)
				}
			}
		}
	}

	Mask.prototype.show_task = function(task){
		var taskdom = this.getDOM(task, 'task')
		var project = task.getProject()
		var projectdom = undefined
		if(project){
			projectdom = this.getDOM(project, 'project')
		}
		if(!projectdom){
			projectdom = this.elements['orphanage']
		}
		projectdom.tasks.appendChild(taskdom.root)
	}

	Mask.prototype.note_dom = function(note, actions){
		var ui = this
		var id = note.getID()
		var dom = ui.elements[id] || ui.elements[note.local_id]
		if(!dom){
			var dom = {'type': 'note'}
			var root = document.createElement('div')
			dom.root = root
			root.className = 'note'
		} else {
			dom.root.innerHTML = ''
			var root = dom.root
		}
		dom.optimalParent = note.getProject()

		var buttonditch = document.createElement('div')
		buttonditch.className = 'buttonditch'
		root.appendChild(buttonditch)

		var text = document.createElement('p')
		dom.text = text
		root.appendChild(text)

		var editbutton = document.createElement('div')
		editbutton.onclick = function(){
			ui.open_lightbox(dom.edit)
		}
		editbutton.className = 'button edit'
		editbutton.innerHTML = 'edit'
		buttonditch.appendChild(editbutton)

		if(actions && typeof actions.save == 'function'){
			var savebutton = document.createElement('div')
			savebutton.onclick = function(){actions.save(note)}
			savebutton.className = 'button save'
			savebutton.innerHTML = 'save'
			buttonditch.appendChild(savebutton)
		}

		if(actions && typeof actions.del == 'function'){
			buttonditch.appendChild(this.delete_button(actions.del, note))
		}

		var edit = document.createElement('form')
		edit.onsubmit = function(dom, data){
			return function(e){
				data.content.text = dom.edit_text.value.replace(/\n/gm, '<br>')
				dom.update()
				ui.close_lightbox()
				e.preventDefault()
			}
		}(dom, note.data)
		dom.edit = edit

		var edit_header = document.createElement('h2')
		edit_header.innerHTML = 'Edit note'
		edit.appendChild(edit_header)

		var edit_text = document.createElement('label')
		edit.appendChild(edit_text)

		var edit_text_label = document.createElement('div')
		edit_text_label.innerHTML = 'Text:'
		edit_text.appendChild(edit_text_label)

		var edit_text_input = document.createElement('textarea')
		dom.edit_text = edit_text_input
		edit_text.appendChild(edit_text_input)

		var edit_submit = document.createElement('input')
		edit_submit.type = 'submit'
		edit_submit.value = 'Save'
		edit.appendChild(edit_submit)

		dom.update = function(data){
			return function(){
				this.text.innerHTML = data.content.text
				this.edit_text.innerHTML = data.content.text
			}
		}(note.data)
		dom.update()
		return dom
	}

	Mask.prototype.project_dom = function(project, actions){
		var ui = this
		var id = project.getID()
		var dom = ui.elements[id] || ui.elements[project.local_id]
		if(!dom){
			var dom = {'type': 'project'}
			var root = document.createElement('div')
			root.className = 'project'
			if(project.readonly){
				root.className += ' readonly'
			}
			dom.root = root
		} else {
			dom.root.innerHTML = ''
			var root = dom.root
		}

		var header = document.createElement('header')
		root.appendChild(header)
		
		var name = document.createElement('h1')
		header.appendChild(name)
		dom.name = name

		var desc = document.createElement('p')
		desc.className = 'info'
		header.appendChild(desc)
		dom.desc = desc

		var buttonditch = document.createElement('div')
		buttonditch.className = 'buttonditch'
		header.appendChild(buttonditch)

		var editbutton = document.createElement('div')
		editbutton.onclick = function(){
			ui.open_lightbox(dom.edit)
		}
		editbutton.className = 'button edit'
		editbutton.innerHTML = 'edit'
		buttonditch.appendChild(editbutton)

		if(actions && typeof actions.save == 'function'){
			var savebutton = document.createElement('div')
			savebutton.onclick = function(){actions.save(project)}
			savebutton.className = 'button save'
			savebutton.innerHTML = 'save'
			buttonditch.appendChild(savebutton)
		}

		if(actions && typeof actions.del == 'function'){
			buttonditch.appendChild(this.delete_button(actions.del, project))
		}

		var tasks = document.createElement('ul')
		dom.tasks = tasks
		root.appendChild(tasks)

		var menuitem = document.createElement('a')
		menuitem.innerHTML = project.data.content.name
		menuitem.onclick = function(){
			var selected = document.getElementsByClassName('selected')
			for(var i = selected.length-1; i >= 0; i--){
				selected[i].classList.remove('selected')
			}
			this.classList.add('selected')
			document.getElementById(project.getID()).classList.add('selected')
		}
		dom.menuitem = menuitem

		var edit = document.createElement('form')
		edit.onsubmit = function(e){
			project.data.content.name = dom.edit_name.value.replace(/\n/gm, '<br>')
			project.data.content.description = dom.edit_desc.value.replace(/\n/gm, '<br>') || undefined
			dom.update()
			ui.close_lightbox()
			e.preventDefault()
		}
		dom.edit = edit

		var edit_header = document.createElement('h2')
		edit_header.innerHTML = 'Edit list'
		edit.appendChild(edit_header)

		var edit_name = document.createElement('label')
		edit.appendChild(edit_name)

		var edit_name_label = document.createElement('div')
		edit_name_label.innerHTML = 'Name:'
		edit_name.appendChild(edit_name_label)

		var edit_name_input = document.createElement('input')
		dom.edit_name = edit_name_input
		edit_name_input.className = 'big'
		edit_name.appendChild(edit_name_input)

		var edit_desc = document.createElement('label')
		edit.appendChild(edit_desc)

		var edit_desc_label = document.createElement('div')
		edit_desc_label.innerHTML = 'Description:'
		edit_desc.appendChild(edit_desc_label)

		var edit_desc_input = document.createElement('textarea')
		dom.edit_desc = edit_desc_input
		edit_desc.appendChild(edit_desc_input)

		var edit_submit = document.createElement('input')
		edit_submit.type = 'submit'
		edit_submit.value = 'Save'
		edit.appendChild(edit_submit)

		dom.update = function(){
			this.root.id = project.getID()
			menuitem.setAttribute('data-target', project.getID())
			this.name.innerHTML = project.data.content.name
			this.menuitem.innerHTML = project.data.content.name
			this.edit_name.value = project.data.content.name
			this.desc.innerHTML = project.data.content.description || ''
			this.edit_desc.innerHTML = project.data.content.description || ''
		}
		dom.update(project)
		return dom
	}

	Mask.prototype.task_dom = function(task, actions){
		var ui = this
		var id = task.getID()
		var dom = ui.elements[id] || ui.elements[task.local_id]
		if(!dom){
			var dom = {'type': 'task'}
			var root = document.createElement('li')
			root.className = 'task'
			if(task.readonly){
				root.className += ' readonly'
			}
			dom.root = root
		} else {
			dom.root.innerHTML = ''
			var root = dom.root
		}
		dom.optimalParent = task.getProject()

		var buttonditch = document.createElement('div')
		buttonditch.className = 'buttonditch'
		root.appendChild(buttonditch)

		var status = document.createElement('div')
		status.className = 'status'
		buttonditch.appendChild(status)
		dom.status = status

		var editbutton = document.createElement('div')
		editbutton.onclick = function(){
			ui.open_lightbox(dom.edit)
		}
		editbutton.className = 'button edit'
		editbutton.innerHTML = 'edit'
		buttonditch.appendChild(editbutton)

		if(actions && typeof actions.save == 'function'){
			var savebutton = document.createElement('div')
			savebutton.onclick = function(){actions.save(task)}
			savebutton.className = 'button save'
			savebutton.innerHTML = 'save'
			buttonditch.appendChild(savebutton)
		}

		if(actions && typeof actions.del == 'function'){
			buttonditch.appendChild(this.delete_button(actions.del, task))
		}

		var title = document.createElement('h2')
		root.appendChild(title)
		dom.title = title

		var notes = document.createElement('p')
		root.appendChild(notes)
		dom.notes = notes

		var edit = document.createElement('form')
		edit.onsubmit = function(e){
			task.data.content.title = dom.edit_title.value
			task.data.content.status = dom.edit_status.value
			task.data.content.notes = dom.edit_notes.value.replace(/\n/gm, '<br>') || undefined
			task.moveToProject(dom.edit_project.value)
			dom.update()
			ui.close_lightbox()
			e.preventDefault()
		}
		dom.edit = edit

		var edit_header = document.createElement('h2')
		edit_header.innerHTML = 'Edit task'
		edit.appendChild(edit_header)

		var edit_title = document.createElement('label')
		edit.appendChild(edit_title)

		var edit_title_label = document.createElement('div')
		edit_title_label.innerHTML = 'Title:'
		edit_title.appendChild(edit_title_label)

		var edit_title_input = document.createElement('input')
		dom.edit_title = edit_title_input
		edit_title.appendChild(edit_title_input)

		var edit_status = document.createElement('label')
		edit.appendChild(edit_status)

		var edit_status_label = document.createElement('div')
		edit_status_label.innerHTML = 'Status:'
		edit_status.appendChild(edit_status_label)

		var edit_status_input = document.createElement('textarea')
		dom.edit_status = edit_status_input
		edit_status.appendChild(edit_status_input)

		var edit_notes = document.createElement('label')
		edit.appendChild(edit_notes)

		var edit_notes_label = document.createElement('div')
		edit_notes_label.innerHTML = 'Notes:'
		edit_notes.appendChild(edit_notes_label)

		var edit_notes_input = document.createElement('textarea')
		dom.edit_notes = edit_notes_input
		edit_notes.appendChild(edit_notes_input)

		var edit_project = document.createElement('label')
		edit.appendChild(edit_project)

		var edit_project_label = document.createElement('div')
		edit_project_label.innerHTML = 'Project:'
		edit_project.appendChild(edit_project_label)

		var edit_project_input = document.createElement('select')
		dom.edit_project = edit_project_input
		edit_project.appendChild(edit_project_input)

		var edit_submit = document.createElement('input')
		edit_submit.type = 'submit'
		edit_submit.value = 'Save'
		edit.appendChild(edit_submit)

		dom.update = function(){
			this.status.innerHTML = task.data.content.status
			this.status.setAttribute('data-status', task.data.content.status)
			this.edit_status.value = task.data.content.status
			this.title.textContent = task.data.content.title
			this.edit_title.value = task.data.content.title
			this.notes.innerHTML = task.data.content.notes || ''
			this.edit_notes.innerHTML = task.data.content.notes || ''
			this.edit_project.innerHTML = ''
			var projects = Post.getAllOfType("http://tent.zatnosk.dk/types/project/v1")
			for(var i in projects){
				var option = document.createElement('option')
				option.value = i
				if(projects[i] == task.getProject()){
					option.selected = true
				}
				option.textContent = projects[i].data.content.name
				this.edit_project.add(option)
			}
		}
		dom.update()
		return dom
	}
	return new Interface(document.body)
}