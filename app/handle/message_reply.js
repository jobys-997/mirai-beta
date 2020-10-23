const fs = require("fs-extra");
function writeENV(tag, input) {
	return fs.readFile('./.env', { encoding: 'utf-8' }, function(err, data) {
		if (err) throw err;
		data = data.split('\n');
		let lastIndex = -1;
		for (let i = 0; i < data.length; i++) {
			if (data[i].includes(`${tag}=`)) {
				lastIndex = i;
				break;
			}
		}
		data[lastIndex] = `${tag}=${input}`;
		const dataJoin = data.join('\n');
		fs.writeFileSync('./.env', dataJoin);
	});
}

module.exports = function({ api, config, __GLOBAL, User, Thread, Fishing }) {	
	function getText(...args) {
		const langText = {...__GLOBAL.language.reply, ...__GLOBAL.language.fishing};
		const getKey = args[0];
		if (!langText.hasOwnProperty(getKey)) throw 'Ngu như bò.';
		let text = langText[getKey].replace(/\\n/gi, '\n');
		for (let i = 1; i < args.length; i++) text = text.replace(`%${i}`, args[i]);
		return text;
	}

	return async function({ event }) {
		const cmd = require("node-cmd");
		const axios = require('axios');
		const { reply } = __GLOBAL;
		const restart = (process.env.API_SERVER_EXTERNAL == 'https://api.glitch.com') ? "refresh" : "pm2 restart 0";
		if (__GLOBAL.threadBlocked.indexOf(event.threadID) != -1) return;
		const { senderID, threadID, body, messageID } = event;
		if (reply.length != 0) {
			if (!event.messageReply) return;
			const indexOfReply = reply.findIndex(e => e.messageID == event.messageReply.messageID && e.author == senderID);
			if (indexOfReply < 0) return;
			const replyMessage = reply[indexOfReply];
			switch (replyMessage.type) {
				case "admin_settings": {
					if (body == '1') {
						api.sendMessage(getText('askToChangePrefix', config.prefix), threadID, (err, info) => {
							if (err) throw err;
							__GLOBAL.reply.push({
								type: "admin_prefix",
								messageID: info.messageID,
								target: parseInt(threadID),
								author: senderID
							});
						});
					}
					else if (body == '2') {
						api.sendMessage(getText('askToChangeName', config.name), threadID, (err, info) => {
							if (err) throw err;
							__GLOBAL.reply.push({
								type: "admin_setName",
								messageID: info.messageID,
								target: parseInt(threadID),
								author: senderID
							});
						});
					}
					else if (body == '3') {
						let admins = '';
						for (let i of config.admins) await User.createUser(i);
						let users = await User.getUsers(['name', 'uid']);
						for (let j of users) if (config.admins.includes(j.uid)) admins += `\n- ${j.name}`;
						api.sendMessage(getText('askToChangeAdmins', config.admins), threadID, (err, info) => {
							if (err) throw err;
							__GLOBAL.reply.push({
								type: "admin_setAdmins",
								messageID: info.messageID,
								target: parseInt(threadID),
								author: senderID
							});
						});
					}
					else if (body == '4') {
						api.sendMessage(getText('askToChangeLang', config.language), threadID, (err, info) => {
							if (err) throw err;
							__GLOBAL.reply.push({
								type: "admin_setLang",
								messageID: info.messageID,
								target: parseInt(threadID),
								author: senderID
							});
						});
					}
					else if (body == '5') {
						api.sendMessage(getText('askToChangeAutoRestart', config.autorestart), threadID, (err, info) => {
							if (err) throw err;
							__GLOBAL.reply.push({
								type: "admin_setRefresh",
								messageID: info.messageID,
								target: parseInt(threadID),
								author: senderID
							});
						});
					}
					else if (body == '6') {
						const semver = require('semver');
						axios.get('https://raw.githubusercontent.com/roxtigger2003/mirai/master/package.json').then((res) => {
							var local = JSON.parse(fs.readFileSync('./package.json')).version;
							if (semver.lt(local, res.data.version)) {
								api.sendMessage(getText('newUpdate'), threadID);
								fs.writeFileSync('./.updateAvailable', '');
							}
							else api.sendMessage(getText('noNewUpdate'), threadID);
						}).catch(err => api.sendMessage(getText('cantCheckUpdate'), threadID));
					}
					else if (body == '7') {
						var data = await User.getUsers(['name', 'uid'], {block: true});
						var userBlockMsg = "";
						data.forEach(user => userBlockMsg += `\n${user.name} - ${user.uid}`);
						api.sendMessage('🛠 | ' + ((userBlockMsg) ? getText('bannedUsers', userBlockMsg) : getText('noBannedUser')), threadID, messageID);
					}
					else if (body == '8') {
						var data = await Thread.getThreads(['name', 'threadID'], {block: true});
						var threadBlockMsg = "";
						data.forEach(thread => threadBlockMsg += `\n${thread.name} - ${thread.threadID}`);
						api.sendMessage('🛠 | ' + ((threadBlockMsg) ? getText('bannedThreads', threadBlockMsg) : getText('noBannedThread')), threadID, messageID);
					}
					else if (body == '9') {
						api.sendMessage('🛠 | ' + getText('sendNoti'), threadID, (err, info) => {
							if (err) throw err;
							__GLOBAL.reply.push({
								type: "admin_noti",
								messageID: info.messageID,
								target: parseInt(threadID),
								author: senderID
							});
						});
					}
					else if (body == '10') {
						api.sendMessage('🛠 | ' + getText('searchUser'), threadID, (err, info) => {
							if (err) throw err;
							__GLOBAL.reply.push({
								type: "admin_searchUser",
								messageID: info.messageID,
								target: parseInt(threadID),
								author: senderID
							});
						});
					}
					else if (body == '11') {
						api.sendMessage('🛠 | ' + getText('searchThread'), threadID, (err, info) => {
							if (err) throw err;
							__GLOBAL.reply.push({
								type: "admin_searchThread",
								messageID: info.messageID,
								target: parseInt(threadID),
								author: senderID
							});
						});
					}
					else if (body == '12') api.sendMessage('🛠 | ' + getText('restart'), threadID, () => cmd.run(restart));
 					else api.sendMessage(getText('soHigh'), threadID);
					break;
				}
				case "admin_prefix": {
					writeENV("PREFIX", body);
					api.sendMessage('🛠 | ' + getText('changedPrefix', body), threadID);
					__GLOBAL.reply.splice(indexOfReply, 1);
					break;
				}
				case "admin_setName": {
					writeENV("BOT_NAME", body);
					api.sendMessage('🛠 | ' + getText('changedName', body), threadID);
					__GLOBAL.reply.splice(indexOfReply, 1);
					break;
				}
				case "admin_setLang": {
					writeENV("LANGUAGE", body);
					api.sendMessage('🛠 | ' + getText('changedLang', body), threadID);
					__GLOBAL.reply.splice(indexOfReply, 1);
					break;
				}
				case "admin_setAdmins": {
					writeENV("ADMINS", body);
					api.sendMessage('🛠 | ' + getText('changedAdmins', body), threadID);
					__GLOBAL.reply.splice(indexOfReply, 1);
					break;
				}
				case "admin_setRefresh": {
					if (body != 'on' && body != 'off') return api.sendMessage('🛠 | ' + getText('onlyOnOff'), threadID);
					if (body == config.autorestart) return api.sendMessage('🛠 | ' + getText('same', body), threadID);
					writeENV("REFRESHING", body);
					api.sendMessage('🛠 | ' + getText('changedAutoRestart', body), threadID);
					__GLOBAL.reply.splice(indexOfReply, 1);
					break;
				}
				case "admin_noti": {
					return api.getThreadList(100, null, ["INBOX"], (err, list) => {
						if (err) throw err;
						list.forEach(item => (item.isGroup == true && item.threadID != threadID) ? api.sendMessage(body, item.threadID) : '');
						api.sendMessage('🛠 | ' + getText('sentNoti', body), threadID);
					});
				}
				case "admin_searchUser": {
					let getUsers = await User.getUsers(['uid', 'name']);
					let matchUsers = [], a = '', b = 0;
					getUsers.forEach(i => {
						if (i.name.toLowerCase().includes(body.toLowerCase())) {
							matchUsers.push({
								name: i.name,
								id: i.uid
							});
						}
					});
					matchUsers.forEach(i => a += `\n${b += 1}. ${i.name} - ${i.id}`);
					(matchUsers.length > 0) ? api.sendMessage('🛠 | ' + getText('foundUsers', b, a), threadID) : api.sendMessage('🛠 | ' + getText('notFoundUser', body), threadID);
					break;
				}
				case "admin_searchThread": {
					let getThreads = (await Thread.getThreads(['threadID', 'name'])).filter(item => !!item.name);
					let matchThreads = [], a = '', b = 0;
					getThreads.forEach(i => {
						if (i.name.toLowerCase().includes(body.toLowerCase())) {
							matchThreads.push({
								name: i.name,
								id: i.threadID
							});
						}
					});
					matchThreads.forEach(i => a += `\n${b += 1}. ${i.name} - ${i.id}`);
					(matchThreads.length > 0) ? api.sendMessage('🛠 | ' + getText('foundThreads', b, a), threadID) : api.sendMessage('🛠 | ' + getText('notFoundThread', body), threadID);
					break;
				}
				case "domath": {
					const timeout = event.messageReply.timestamp + 15000;
					if (event.timestamp - timeout >= 0) return api.sendMessage(getText('outOfTime'), threadID);
					(body == replyMessage.answer) ? api.sendMessage(getText('correctAns', (event.timestamp - event.messageReply.timestamp) / 1000), threadID) : api.sendMessage(`ahh, có vẻ bạn đã trả lời sai, câu trả lời đúng là: ${replyMessage.answer}`, threadID);
					__GLOBAL.reply.splice(indexOfReply, 1);
					break;
				}
				case "fishing_shop": {
					let inventory = await Fishing.getInventory(senderID);
					let durability = ['50','70','100','130','200','400'];
					let moneyToUpgrade = ['1000','4000','6000','8000','10000'];
					let expToLevelup = ['1000','2000','4000','6000','8000'];
					let moneyToFix = Math.floor(Math.random() * (300 - 100)) + 100;
					if (body == 1) return api.sendMessage(getText('upgradeRod', expToLevelup[inventory.rod], moneyToUpgrade[inventory.rod], inventory.rod + 1), threadID, (err, info) => __GLOBAL.confirm.push({ type: "fishing_upgradeRod", messageID: info.messageID, author: senderID, exp: expToLevelup[inventory.rod], money: moneyToUpgrade[inventory.rod], durability: durability[inventory.rod] }));
					if (body == 2) return api.sendMessage(getText('fixRod', moneyToFix), threadID, (err, info) => __GLOBAL.confirm.push({ type: "fishing_fixRod", messageID: info.messageID, author: senderID, moneyToFix, durability: durability[inventory.rod - 1] }));
					if (body == 3) return api.sendMessage(getText('buyRod'), threadID, (err, info) => __GLOBAL.confirm.push({ type: "fishing_buyRod", messageID: info.messageID, author: senderID }));
					if (body == 4) return api.sendMessage(getText('comingSoon'), threadID);
					if (body == 5) return api.sendMessage(getText('comingSoon'), threadID);
					break;
				}
				case "fishing_domath": {
					let typeSteal;
					let inventory = await Fishing.getInventory(senderID);
					let stats = await Fishing.getStats(senderID);
					let valueSteal = Math.floor(Math.random() * 5) + 1;
					const timeout = event.messageReply.timestamp + 15000;
					const roll = Math.floor(Math.random() * 1008);
					inventory.exp += Math.floor(Math.random() * 500);
					stats.exp += Math.floor(Math.random() * 500);
					stats.casts += 1;
					if (event.timestamp - timeout >= 0 || parseInt(body) !==  parseInt(replyMessage.answer)) {
						if (roll <= 400) {
							if (inventory.trash - valueSteal <= 0) valueSteal = inventory.trash;
							inventory.trash -= valueSteal;
							typeSteal = getText('trash');
						}
						else if (roll > 400 && roll <= 700) {
							if (inventory.fish1 - valueSteal <= 0) valueSteal = inventory.fish1;
							inventory.fish1 -= valueSteal;
							typeSteal = getText('fish1');
						}
						else if (roll > 700 && roll <= 900) {
							if (inventory.fish2 - valueSteal <= 0) valueSteal = inventory.fish2;
							inventory.fish2 -= valueSteal;
							typeSteal = getText('fish2');
						}
						else if (roll > 900 && roll <= 960) {
							if (inventory.crabs - valueSteal < 0) valueSteal = inventory.crabs;
							inventory.crabs -= valueSteal;
							typeSteal = getText('crabs');
						}
						else if (roll > 960 && roll <= 1001) {
							if (inventory.blowfish - valueSteal < 0) valueSteal = inventory.blowfish;
							inventory.blowfish -= valueSteal;
							typeSteal = getText('blowfish');
						}
						else if (roll == 1002) {
							if (inventory.crocodiles - valueSteal < 0) valueSteal = inventory.crocodiles;
							inventory.crocodiles -= valueSteal;
							typeSteal = getText('crocodiles');
						}
						else if (roll == 1003) {
							if (inventory.whales - valueSteal < 0) valueSteal = inventory.whales;
							inventory.whales -= valueSteal;
							typeSteal = getText('whales');
						}
						else if (roll == 1004) {
							if (inventory.dolphins - valueSteal < 0) valueSteal = inventory.dolphins;
							inventory.dolphins -= valueSteal;
							typeSteal = getText('dolphins');
						}
						else if (roll == 1006) {
							if (inventory.squid - valueSteal < 0) valueSteal = inventory.squid;
							inventory.squid -= valueSteal;
							typeSteal = getText('squid');
						}
						else if (roll == 1007) {
							if (inventory.sharks - valueSteal < 0) valueSteal = inventory.sharks;
							inventory.sharks -= valueSteal;
							typeSteal = getText('sharks');
						}
						api.sendMessage((event.timestamp - timeout >= 0) ? getText('outOfTime2', valueSteal, typeSteal) :  getText('wrongAnswer', valueSteal, typeSteal), threadID);
					}
					if (parseInt(body) == parseInt(replyMessage.answer)) {
						if (roll <= 400) {
							inventory.trash += valueSteal;
							typeSteal = getText('trash');
						}
						else if (roll > 400 && roll <= 700) {
							inventory.fish1 += valueSteal;
							typeSteal = getText('fish1');
						}
						else if (roll > 700 && roll <= 900) {
							inventory.fish2 += valueSteal;
							typeSteal = getText('fish2');
						}
						else if (roll > 900 && roll <= 960) {
							inventory.crabs += valueSteal;
							typeSteal = getText('crabs');
						}
						else if (roll > 960 && roll <= 1001) {
							inventory.blowfish += valueSteal;
							typeSteal = getText('blowfish');
						}
						else if (roll == 1002) {
							inventory.crocodiles += valueSteal;
							typeSteal = getText('crocodiles');
						}
						else if (roll == 1003) {
							inventory.whales += valueSteal;
							typeSteal = getText('whales');
						}
						else if (roll == 1004) {
							inventory.dolphins += valueSteal;
							typeSteal = getText('dolphins');
						}
						else if (roll == 1006) {
							inventory.squid += valueSteal;
							typeSteal = getText('squid');
						}
						else if (roll == 1007) {
							inventory.sharks += valueSteal;
							typeSteal = getText('sharks');
						}
						api.sendMessage(getText('defeatMonster', valueSteal, typeSteal, stats.exp, (event.timestamp - event.messageReply.timestamp) / 1000), threadID);
					}
					await Fishing.updateInventory(senderID, inventory);
					await Fishing.updateStats(senderID, stats);
					__GLOBAL.reply.splice(indexOfReply, 1);
					break;
				}
				case "media_video": {
					if (isNaN(body) || parseInt(body) <= 0 || parseInt(body) > 5) return api.sendMessage("chọn từ 1 đến 5", threadID);
					const ytdl = require("ytdl-core");
					var link = `https://www.youtube.com/watch?v=${replyMessage.url[body -1]}`
					ytdl.getInfo(link, (err, info) => { 
						if (info.length_seconds > 360) return api.sendMessage(getText('exceededLength', 'Video'), threadID, messageID);
					});
					api.sendMessage(getText('processAV', 'video'), threadID);
					return ytdl(link).pipe(fs.createWriteStream(__dirname + "/src/video.mp4")).on("close", () => api.sendMessage({attachment: fs.createReadStream(__dirname + "/src/video.mp4")}, threadID, () => fs.unlinkSync(__dirname + "/src/video.mp4"), messageID));
				}
				case "media_audio": {
					if (isNaN(body) || parseInt(body) <= 0 || parseInt(body) > 5) return api.sendMessage("chọn từ 1 đến 5", threadID);
					var ytdl = require("ytdl-core");
					var ffmpeg = require("fluent-ffmpeg");
					var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
					ffmpeg.setFfmpegPath(ffmpegPath);
					var link = `https://www.youtube.com/watch?v=${replyMessage.url[body -1]}`
					ytdl.getInfo(link, (err, info) => { 
						if (info.length_seconds > 360) return api.sendMessage(getText('exceededLength', 'Audio'), threadID, messageID);
					});
					api.sendMessage(getText('processAV', 'audio'), threadID);
					return ffmpeg().input(ytdl(link)).toFormat("mp3").pipe(fs.createWriteStream(__dirname + "/src/music.mp3")).on("close", () => api.sendMessage({attachment: fs.createReadStream(__dirname + "/src/music.mp3")}, threadID, () => fs.unlinkSync(__dirname + "/src/music.mp3"), messageID));				}
			}
			return;
		}
	}
}