const Vinyl = require('vinyl'),
	PluginError = Vinyl.PluginError,
	through = require('through2'),
	pluginName = 'gulp-web-images-html';

module.exports = function (options = {}) {
	const customOpt = options || {},
		opt = {
			extensions: ['.jpg', '.png', '.jpeg', '.gif'],
			localMode: true,
			mode: "all",
			unregister: true,
		},
		uppExt = function (arr) {
			return new Set(arr.concat(arr.map(function (it) {
				return it.toUpperCase();
			})));
		};
		Object.assign(opt, customOpt, {flags: [1, 1]});
		if (opt.unregister) opt.extensions = uppExt(opt.extensions);
		if (opt.mode == "avif") {
			opt.flags[0] = 0;
		} else if (opt.mode == "webp") {
			opt.flags[1] = 0;
		}
	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}
		if (file.isStream()) {
			cb(new PluginError(pluginName, 'Streaming not supported'));
			return;
		}
		try {
			let inPicture = false;
			const data = file.contents
				.toString()
				.split('\n')
				.map(function (line) {
					// Вне <picture/>?
					if (~line.indexOf('<picture')) inPicture = true;
					if (~line.indexOf('</picture')) inPicture = false;
					// Проверяем есть ли <img/>
					if (~line.indexOf('<img') && !inPicture) {
						// Новый урл с .webp
						const Re = /<img([^>]*)src=\"(\S+)\"([^>]*)>/gi,
							regexArr = [],
							imgTagArr = [],
							newUrlArr = [],
							newHTMLArr = [];
						let regexpItem;
						while (regexpItem = Re.exec(line)) {
							regexArr.push(regexpItem);
						}
						regexArr.forEach(item => {
							if (item[0].includes('srcset=')) {
								newUrlArr.push(`${item[2]}, ${getSrcUrl(item[0], 'srcset')}`);
							} else {
								newUrlArr.push(item[2]);
							}
							imgTagArr.push(item[0]);
						})
						// Если в урле есть .gif или .svg, или же активирован режим только для относительных урл, то пропускаем
						for (let i = 0; i < newUrlArr.length; i++) {
							if (newUrlArr[i].includes('.svg') || newUrlArr[i].includes('.gif')) {
								newHTMLArr.push(imgTagArr[i]);
								continue;
							} else if (opt.localMode && ~newUrlArr[i].search(/^http(s)?\:\/\//i)) {
								newHTMLArr.push(imgTagArr[i]);
								continue;
							} else {
								for (k of opt.extensions) {
									const ext = opt.flags[0] ? '.webp' : '.avif';
									k = new RegExp(k, 'g');
									newUrlArr[i] = newUrlArr[i].replace(k, ext);
								}
								newHTMLArr.push(pictureRender(newUrlArr[i], imgTagArr[i]));
							}
							line = line.replace(imgTagArr[i], newHTMLArr[i]);
						}
						return line;
					}
					return line;
				})
				.join('\n');
				file.contents = new Buffer.from(data);
				this.push(file);
				function pictureRender(url, imgTag) {
					const fragment = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
					let result = '<picture>';
					if (opt.flags[1]) {
						const avifUrl = opt.flags[0] ? webpToAvif(url) : url;
						if (imgTag.indexOf('data-src') > 0) {
							imgTag = imgTag.replace('<img', '<img src=' + fragment + ' ');
							result += '<source data-srcset="' + avifUrl + '" srcset=' + fragment + ' type="image/avif">';
						} else {
							result += '<source srcset="' + avifUrl + '" type="image/avif">';
						}
					}
					if (opt.flags[0]) {
						if (imgTag.indexOf('data-src') > 0) {
							imgTag = imgTag.replace('<img', '<img src=' + fragment + ' ');
							result += '<source data-srcset="' + url + '" srcset=' + fragment + ' type="image/webp">';
						} else {
							result += '<source srcset="' + url + '" type="image/webp">';
						}
					}
					result += imgTag + '</picture>';
					return result;
				}
			function getSrcUrl(markup, attr) {
				const rexp = new RegExp(`${attr}=\"(.*?)\"`, 'i'),
					srcArr = [];
				markup.split(' ').forEach((item, index, arr) => {
					if (attr && item.includes(attr)) {
						srcArr.push(item);
						srcArr.push(arr[index + 1]);
					}
				})
				return srcArr.join(' ').match(rexp)[1];
			}
			function webpToAvif(link) {
				return link.replace(/\.webp/gi, ".avif");
			}
		} catch (err) {
			console.log('[ERROR] Убедитесь, что в названии файла картинки нет проблелов и/или кириллицы');
			this.emit('error', new PluginError(pluginName, err));
		}
		cb();
	})
}