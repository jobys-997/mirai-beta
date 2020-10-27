require("dotenv").config();
const login = require("./app/login");
const { Sequelize, sequelize, Op } = require("./database");
const logger = require("./app/modules/log.js");
const { appStateFile } = require("./config");
const fs = require("fs-extra");
const express = require("express");
const app = express();
const cmd = require('node-cmd');
const __GLOBAL = new Object({
	threadBlocked: new Array(),
	userBlocked: new Array(),
	messages: new Array(),
	resendBlocked: new Array(),
	NSFWBlocked: new Array(),
	afkUser: new Array(),
	confirm: new Array(),
	reply: new Array(),
	simOn: new Array(),
	blockLevelUp: new Array(),
	language: new Object({
		index: new Object(),
		listen: new Object(),
		event: new Object(),
		message: new Object(),
		reply: new Object(),
		unsend: new Object(),
		reaction: new Object(),
		login: new Object(),
		update: new Object(),
		fishing: new Object(),
		thread: new Object(),
		user: new Object(),
	})
});

//Pick the language
var langFile = (fs.readFileSync(`./app/handle/src/langs/${process.env.LANGUAGE}.lang`, { encoding: 'utf-8' })).split('\n');
var langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');
for (let item of langData) {
	let itemData = item.split('=');
	let array = ['index.', 'listen.', 'event.', 'message.', 'reply.', 'unsend.', 'reaction.', 'login.', 'update.', 'fishing.', 'thread.', 'user.'];
	let head = item.slice(0, item.indexOf('.') + 1);
	if (array.includes(head)) {
		let key = itemData[0].replace(head, '');
		let value = itemData[1];
		__GLOBAL.language[head.slice(0, -1)][key] = value;
	}
}

function getText(...args) {
	const langText = __GLOBAL.language.index;
	const getKey = args[0];
	if (!langText.hasOwnProperty(getKey)) throw `${__dirname} - Not found key language: ${getKey}`;
	let text = langText[getKey].replace(/\\n/gi, '\n');
	for (let i = 1; i < args.length; i++) text = text.replace(`%${i}`, args[i]);
	return text;
}

app.get("/", (request, response) => response.sendFile(__dirname + "/config/dbviewer/index.html"));
app.use(express.static(__dirname + '/config'));
app.use(express.static(__dirname + '/config/dbviewer'));
const listener = app.listen(process.env.PORT, () => logger("Đã mở tại port: " + listener.address().port), 0);

if (process.env.REFRESHING == 'on') setTimeout(() => {
	console.log(getText('refresh'));
	cmd.run("pm2 restart 0");
}, 600000);

function facebook({ Op, models }) {
	require('npmlog').info = () => {};
	login({ appState: require(appStateFile), __GLOBAL }, (error, api) => {
		if (error) return logger(error, 2);
		fs.writeFileSync(appStateFile, JSON.stringify(api.getAppState(), null, "\t"));
		api.listenMqtt(require("./app/listen")({ api, Op, models, __GLOBAL }));
	});
}

sequelize.authenticate().then(
	() => logger(getText('connectSuccess'), 0),
	() => logger(getText('connectFailed'), 2)
).then(() => {
	let models = require("./database/model")({ Sequelize, sequelize });
	facebook({ Op, models });
}).catch(e => logger(`${e.stack}`, 2));
// Made by CatalizCS and SpermLord