# gulp-web-images-html

> This is a modified version of the plugin [gulp-webp-html-local](https://www.npmjs.com/package/gulp-webp-html-nosvg). Here was fixed thebug that added two dots before webp & avif to the final html file. No SVG format. The mode is possible only for relative links.


## Install

```bash
npm i --save-dev gulp-web-images-html
```


## Usage

```javascript
let webpAvifHtml = require("gulp-web-images-html");

gulp.task("html", function () {
   gulp.src("./assets/**/*.html").pipe(webpAvifHtml()).pipe(gulp.dest("./public/"));
});
```

or

```javascript
let webpAvifHtml = require("gulp-web-images-html");

gulp.task("html", function () {
   gulp.src("./assets/**/*.html").pipe(webpAvifHtml({mode: "all"})).pipe(gulp.dest("./public/"));
});
```


## Options
Type: `object`

### extensions
Type: `array`<br>
Default: `['.jpg', '.png', '.jpeg', '.gif']`

Expansion subject to processing.

### localMode
Type: `boolean`<br>
Default: `true`

Make only local paths.

### mode
Type: `string`<br>
Default: `all`<br>
Possible values:
   - «avif» — Add only support «AVIF»
   - «webp» — Add only support «Webp»
   - «all» — Add support «AVIF» and «Webp»

### unregister
Type: `boolean`<br>
Default: `true`

Do not distinguish between lowercase and uppercase letters in extensions


## Example

```html
// Input
<img src="/images/catalogImage.jpg" />

// Output
<picture>
   <source srcset="/images/catalogImage.avif" type="image/avif" />
   <source srcset="/images/catalogImage.webp" type="image/webp" />
   <img src="/images/catalogImage.jpg" />
</picture>

// Input
<img src="/images/catalogImage.jpg" srcset="/images/catalogImage2x.jpg 2x" />

// Output
<picture>
   <source srcset="/images/catalogImage.avif, /images/catalogImage2x.avif 2x" type="image/avif" />
   <source srcset="/images/catalogImage.webp, /images/catalogImage2x.webp 2x" type="image/webp" />
   <img src="/images/catalogImage.jpg" srcset="/images/catalogImage2x.jpg 2x" />
</picture>

// Input
<img src="/images/catalogImage.jpg" />
<img src="https://site.net/images/catalogImage.jpg" />

// Output
<picture>
   <source srcset="/images/catalogImage.avif" type="image/avif" />
   <source srcset="/images/catalogImage.webp" type="image/webp" />
   <img src="/images/catalogImage.jpg" />
</picture>
<img src="https://site.net/images/catalogImage.jpg" />

// Input
<img src="/images/catalogImage.svg" />

// Output
<img src="/images/catalogImage.svg" />
```
