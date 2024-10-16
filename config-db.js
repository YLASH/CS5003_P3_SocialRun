// Connects to our database
(function() {
	const db_info = {
            url:'localhost',
            username: 'webuser',
            password: '<YOUR PASSWORD>',
            port: '<YOUR PORT>',
			database: 'socialrunner',
            collection: {user:"userCollection",runs:"runsCollection"}
        };

	const moduleExports = db_info;

    if (typeof __dirname != 'undefined')
        module.exports = moduleExports;
}()); 