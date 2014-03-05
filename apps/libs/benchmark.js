var benchmark = function(){}
benchmark.prototype = {
	util : require('util'),
	benchmark : {memory : 0, time : 0},
	startBenchmark : function(){
		this.benchmark.memory = this.util.inspect(process.memoryUsage().heapUsed);
		time = process.hrtime();
		// console.log('start',time);
		this.benchmark.time = time;
		// console.log(process.memoryUsage(), this.util.inspect(process.memoryUsage()));
	},

	endBenchmark : function(){
		// console.log('end',this.benchmark);
		var tmp_time = process.hrtime(this.benchmark.time);
		this.benchmark.memory = (this.util.inspect(process.memoryUsage().heapUsed) - this.benchmark.memory)/ 1048576;
		this.benchmark.time = (tmp_time[0] * 1e9 + tmp_time[1])/  1e9;
	}
}
module.exports = new benchmark();