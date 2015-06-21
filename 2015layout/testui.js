var lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt congue enim, ut porta lorem lacinia consectetur. Donec ut libero sed arcu vehicula ultricies a non tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut gravida lorem. Ut turpis felis, pulvinar a semper sed, adipiscing id dolor. Pellentesque auctor nisi id magna consequat sagittis. Curabitur dapibus enim sit amet elit pharetra tincidunt feugiat nisl imperdiet. Ut convallis libero in urna ultrices accumsan. Donec sed odio eros. Donec viverra mi quis quam pulvinar at malesuada arcu rhoncus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In rutrum accumsan ultricies. Mauris vitae nisi at sem facilisis semper ac in est.'

var I = new Interface()

for(var i in mockdata){
	I.show(mockdata[i])
}

I.activate({
	'save': function(post){
		console.log('save', post)
	},
	'create': function(type, projectID){
		console.log('create', type, projectID)
		if(type == 'task' || type == 'note'){
			return {
				'getID': function(){return type},
				'getType': function(){return "http://tent.zatnosk.dk/types/"+type+"/v1"},
				'type': type,
				'getProjectID': function(){return projectID},
				'data': {'content': {
					'title': '',
					'text': ''
				}}
			}
		}
	},
	'delete': function(post){
		console.log('delete', post)
		I.hide(post)
	}
})
I.request_login(function(e){console.log('login', e)}, ['https://zatnosk.cupcake.is'])