module.exports = function({ api, config, __GLOBAL, User, Thread, Economy, Fishing, Nsfw }) {
	return async function({ event }) {
		const { confirm } = __GLOBAL;
		if (__GLOBAL.threadBlocked.indexOf(event.threadID) != -1) return;
		const { senderID, userID, threadID, reaction, messageID } = event;
		if (confirm.length != 0) {
			const indexOfConfirm = confirm.findIndex(e => e.messageID == messageID && e.author == userID);
			if (indexOfConfirm < 0) return;
			const confirmMessage = confirm[indexOfConfirm];
			switch (confirmMessage.type) {
				case 'fishing_sellAll': {
					if (reaction == '👍') {
						let inventory = await Fishing.getInventory(confirmMessage.author);
						var money = parseInt(inventory.trash + inventory.fish1 * 30 + inventory.fish2 * 100 + inventory.crabs * 250 + inventory.blowfish * 300 + inventory.crocodiles * 500 + inventory.whales * 750 + inventory.dolphins * 750 + inventory.squid * 1000 + inventory.sharks * 1000);
						inventory.trash = 0;
						inventory.fish1 = 0;
						inventory.fish2 = 0;
						inventory.crabs = 0;
						inventory.crocodiles = 0;
						inventory.whales = 0;
						inventory.dolphins = 0;
						inventory.blowfish = 0;
						inventory.squid = 0;
						inventory.sharks = 0;
						await Fishing.updateInventory(confirmMessage.author, inventory);
						await Economy.addMoney(confirmMessage.author, money);
						api.sendMessage('🎣 | Bạn đã bán toàn bộ sản lượng trong túi và thu về được ' + money + ' đô', threadID, messageID);
					}
					else api.sendMessage('🎣 | Rất tiếc, bạn đã huỷ giao dịch này', threadID, messageID)
					break;
				}
				case "fishing_upgradeRod": {
					if (reaction !== '👍') return api.sendMessage(`🎣 | Rất tiếc, bạn đã huỷ buổi nâng cấp này`, threadID);
					let inventory = await Fishing.getInventory(confirmMessage.author);
					let moneydb = await Economy.getMoney(confirmMessage.author);
					var exp = confirmMessage.exp;
					var money = confirmMessage.money;
					var durability = confirmMessage.durability;
					let text;
					if (moneydb - money <= 0) return api.sendMessage(`bạn chưa đủ điều kiện, bạn còn thiếu ${money - moneydb} đô để nâng cấp`, threadID);
					if (inventory.exp - exp <= 0) return api.senMessage(`bạn chưa đủ điều kiện, bạn còn thiếu ${exp - inventory.exp} exp để nâng cấp`, threadID);
					if (inventory.rod <= 0) return api.sendMessage(`bạn chưa có cần câu để nâng cấp, hãy mua cần câu mới tại shop!`, threadID);
					if (inventory.rod == 5) return api.sendMessage(`cần câu của bạn đã được nâng cấp tối đa từ trước!`, threadID);
					inventory.rod += 1;
					inventory.exp -= exp;
					inventory.durability = durability;
					await Economy.subtractMoney(confirmMessage.author, money);
					await Fishing.updateInventory(confirmMessage.author, inventory);
					api.sendMessage(`đã nâng cấp cần câu của bạn thành công!!`, threadID);
					break;
				}
				case "fishing_fixRod": {
					if (reaction !== '👍') return api.sendMessage(`🎣 | Rất tiếc, bạn đã huỷ buổi sửa chữa này`, threadID);
					let inventory = await Fishing.getInventory(confirmMessage.author);
					let moneydb = await Economy.getMoney(confirmMessage.author);
					var moneyToFix = confirmMessage.moneyToFix;
					var duraFix = Math.floor(Math.random())
					if (moneydb - moneyToFix <= 0) return api.sendMessage(`bạn không đủ điều kiện để nâng cấp, bạn còn thiếu ${moneyToFix - moneydb} đô nữa`, threadID);
					inventory.durability = confirmMessage.durability;
					await Economy.subtractMoney(confirmMessage.author, money);
					await Fishing.updateInventory(confirmMessage.author, inventory);
					api.sendMessage(`đã sửa cần câu của bạn thành công!!`, threadID);
					break;
				}
				case "fishing_buyRod": {
					if (reaction !== '👍') return api.sendMessage(`🎣 | Rất tiếc, bạn đã huỷ cuộc mua bán này`, threadID);
					let inventory = await Fishing.getInventory(confirmMessage.author);
					let moneydb = await Economy.getMoney(confirmMessage.author);
					if (inventory.rod >= 1) return api.sendMessage(`bạn đã có cần câu từ trước!`, threadID);
					if (moneydb - 1000 <= 0) return api.sendMessage(`bạn không đủ điều kiện để mua, bạn còn thiếu ${1000 - moneydb} đô nữa`, threadID);
					inventory.durability = 50;
					inventory.rod = 1;
					await Economy.subtractMoney(confirmMessage.author, 1000);
					await Fishing.updateInventory(confirmMessage.author, inventory);
					api.sendMessage(`bạn đã mua thành công một cây cần câu mới, đây là bước khởi đầu trên con đường trở thành người câu cá giỏi nhất tại nơi đây!!\nGood Luck <3`, threadID);
				}
			}
			__GLOBAL.confirm.splice(indexOfConfirm, 1);
			return;
		}
	}
}