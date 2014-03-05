var kue = require('kue'),
	jobs = kue.createQueue();

	jobs.create('email', {
	    title: 'welcome email for tj'
	  , to: 'tj@learnboost.com'
	  , template: 'welcome-email'
	}).save();



	job.log('$%d sent to %s', amount, user.name);


	job.on('complete', function(){
		console.log("Job complete");
	}).on('failed', function(){
		console.log("Job failed");
	}).on('progress', function(progress){
		process.stdout.write('\r  job #' + job.id + ' ' + progress + '% complete');
	});