exports.id = 'monitordisk';
exports.title = 'Disk';
exports.version = '1.0.0';
exports.author = 'Peter Širka';
exports.group = 'Monitoring';
exports.color = '#F6BB42';
exports.output = 1;
exports.icon = 'hdd-o';
exports.click = true;
exports.options = { interval: 8000, path: '/', enabled: true };
exports.readme = `# Disk monitoring

This component monitors disk \`bytes\` consumption in Linux systems. It uses \`df\` command.

__Data Example__:

\`\`\`javascript
{
	total: 474549649408,
	used: 39125245952,
	free: 411294994432
}
\`\`\``;

exports.html = `<div class="padding">
	<div class="row">
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="interval" data-placeholder="@(10000)" data-increment="true" data-jc-type="number" data-required="true" data-maxlength="10">@(Interval in milliseconds)</div>
		</div>
		<div class="col-md-3 m">
			<div data-jc="textbox" data-jc-path="path" data-placeholder="/" data-required="true">@(Path)</div>
		</div>
	</div>
</div>`;

exports.install = function(instance) {

	var fields = ['1B-blocks', 'Used', 'Available'];
	var current = { total: 0, used: 0, free: 0 };
	var tproc = null;

	instance.custom.run = function() {

		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}

		if (!instance.options.enabled)
			return;

		require('child_process').exec('df -hTB1 ' + instance.options.path, function(err, response) {

			tproc = setTimeout(instance.custom.run, instance.options.interval);

			if (err) {
				instance.error(err);
				return;
			}

			response.parseTerminal(fields, function(line) {
				current.total = line[0].parseInt();
				current.free = line[2].parseInt();
				current.used = line[1].parseInt();
				instance.custom.status();
				instance.send(current);
			});
		});
	};

	instance.custom.status = function() {
		if (instance.options.enabled)
			instance.status(current.free.filesize() + ' / ' + current.total.filesize());
		else
			instance.status('Disabled', 'red');
	};

	instance.on('click', function() {
		instance.options.enabled = !instance.options.enabled;
		instance.custom.status();
		if (instance.options.enabled)
			instance.custom.run();
	});

	instance.on('close', function() {
		if (tproc) {
			clearTimeout(tproc);
			tproc = null;
		}
	});

	setTimeout(instance.custom.run, 1000);
};