![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">Web Development Tools</h1>
<h3 align="center">Hosted on Github</h3>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## Browser Libraries

VueJS
```python
<script src="//fwd.dev/js/vue.js"></script>
```

Axios 
```python
<script src="//fwd.dev/js/axios.js"></script>
```

QrCode 
```python
<script src="//fwd.dev/js/qrcode.js"></script>
```

HTML + Vue
```
<!DOCTYPE html>
<html>
    <head>
		<title>Hello World</title>
		<meta name="apple-mobile-web-app-title" content="My App">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black">
		<link rel="apple-touch-icon" href="/icon.png">
        <script src="https://fwd.dev/js/vue.js"></script>
        <script src="https://fwd.dev/js/axios.js"></script>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
        </style>
    </head>
    <body>
        <div id="app">
            {{ message }}
        </div>
        <script>
	        var app = new Vue({
				el: '#app',
				data: { 
					message: 'Hello World' 
				},
				mounted() {
					this.load()
				},
				watch: {},
				computed: {},
				methods: {
					load() {
						console.log("Ready!")
					}
				},
			})
        </script>
    </body>
</html>
```

Questions about consulting? Email: hello[@]fwd.dev

Copyright © [nano2dev](https://twitter.com/nano2dev).
