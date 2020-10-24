const login = require("./login");
module.exports = async function({ appState, __GLOBAL }, callback) {
	function getText(...args) {
		const langText = __GLOBAL.language.login;
		const getKey = args[0];
		if (!langText.hasOwnProperty(getKey)) throw `${__dirname} - Not found key language: ${getKey}`;
		let text = langText[getKey].replace(/\\n/gi, '\n');
		for (let i = 1; i < args.length; i++) text = text.replace(`%${i}`, args[i]);
		return text;
	}

	if (typeof callback !== "function") return console.error(getText('noFunc'));
	let api;
	try {
		api = await login({ appState, getText });
		callback(undefined, api);
	}
	catch (e) {
		callback(e);
	}
}