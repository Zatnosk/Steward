var lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt congue enim, ut porta lorem lacinia consectetur. Donec ut libero sed arcu vehicula ultricies a non tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut gravida lorem. Ut turpis felis, pulvinar a semper sed, adipiscing id dolor. Pellentesque auctor nisi id magna consequat sagittis. Curabitur dapibus enim sit amet elit pharetra tincidunt feugiat nisl imperdiet. Ut convallis libero in urna ultrices accumsan. Donec sed odio eros. Donec viverra mi quis quam pulvinar at malesuada arcu rhoncus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In rutrum accumsan ultricies. Mauris vitae nisi at sem facilisis semper ac in est.'

var mockdata = [{
	'getID': function(){return 'projectA'},
	'getType': function(){return "http://tent.zatnosk.dk/types/project/v1"},
	'type': 'project',
	'data': {'content': {
		'name': 'Project A: Mixed data',
		'description': 'Description bla bla, lorem ipsum..'
	}}
},{
	'getID': function(){return 'projectB'},
	'getType': function(){return "http://tent.zatnosk.dk/types/project/v1"},
	'type': 'project',
	'data': {'content': {
		'name': 'Project B: Textiness',
		'description': 'Description of something else..'
	}}
},{
	'getID': function(){return 'projectC'},
	'getType': function(){return "http://tent.zatnosk.dk/types/project/v1"},
	'type': 'project',
	'data': {'content': {
		'name': 'Project C: Taskyness',
		'description': 'Description blubba wubba, hubba bubba.'
	}}
},{
	'getID': function(){return 'task1'},
	'getType': function(){return "http://tent.zatnosk.dk/types/task/v1"},
	'type': 'task',
	'getProjectID': function(){return 'projectA'},
	'data': {'content': {
		'title': 'Improve edit-task interface',
		'text': 'checkbox something?'
	}}
},{
	'getID': function(){return 'task2'},
	'getType': function(){return "http://tent.zatnosk.dk/types/task/v1"},
	'type': 'task',
	'getProjectID': function(){return 'projectA'},
	'data': {'content': {
		'title': 'More decoupling between display and editing',
		'text': 'editing can work directly with the data model, and then just call .update on the display.'
	}}
},{
	'getID': function(){return 'task3'},
	'getType': function(){return "http://tent.zatnosk.dk/types/task/v1"},
	'type': 'task',
	'getProjectID': function(){return 'projectA'},
	'data': {'content': {
		'title': 'Do away with inline js in the html.',
		'text': "It's bad."
	}}
},{
	'getID': function(){return 'note1'},
	'getType': function(){return "http://tent.zatnosk.dk/types/note/v1"},
	'type': 'note',
	'getProjectID': function(){return 'projectA'},
	'data': {'content': {
		'text': '1 '+lorem
	}}
},{
	'getID': function(){return 'note2'},
	'getType': function(){return "http://tent.zatnosk.dk/types/note/v1"},
	'type': 'note',
	'getProjectID': function(){return 'projectA'},
	'data': {'content': {
		'title': 'Note title',
		'text': '2 '+lorem
	}}
},{
	'getID': function(){return 'note3'},
	'getType': function(){return "http://tent.zatnosk.dk/types/note/v1"},
	'type': 'note',
	'getProjectID': function(){return 'projectA'},
	'data': {'content': {
		'text': '3 '+lorem
	}}
},{
	'getID': function(){return 'note4'},
	'getType': function(){return "http://tent.zatnosk.dk/types/note/v1"},
	'type': 'note',
	'getProjectID': function(){return 'projectB'},
	'data': {'content': {
		'title': 'Note title',
		'text': '4 '+lorem
	}}
},{
	'getID': function(){return 'note5'},
	'getType': function(){return "http://tent.zatnosk.dk/types/note/v1"},
	'type': 'note',
	'getProjectID': function(){return 'projectB'},
	'data': {'content': {
		'title': 'Note title',
		'text': '5 '+lorem
	}}
},{
	'getID': function(){return 'note6'},
	'getType': function(){return "http://tent.zatnosk.dk/types/note/v1"},
	'type': 'note',
	'getProjectID': function(){return 'projectB'},
	'data': {'content': {
		'title': 'Note title',
		'text': '6 '+lorem
	}}
},{
	'getID': function(){return 'task4'},
	'getType': function(){return "http://tent.zatnosk.dk/types/task/v1"},
	'type': 'task',
	'getProjectID': function(){return 'projectC'},
	'data': {'content': {
		'title': '# Todo: Tasky taskiness',
		'text': '1 description'
	}}
},{
	'getID': function(){return 'task5'},
	'getType': function(){return "http://tent.zatnosk.dk/types/task/v1"},
	'type': 'task',
	'getProjectID': function(){return 'projectC'},
	'data': {'content': {
		'title': '# Todo: Tasky taskiness',
		'text': '2 description'
	}}
},{
	'getID': function(){return 'task6'},
	'getType': function(){return "http://tent.zatnosk.dk/types/task/v1"},
	'type': 'task',
	'getProjectID': function(){return 'projectC'},
	'data': {'content': {
		'title': '# Todo: Tasky taskiness',
		'text': '3 description'
	}}
}]