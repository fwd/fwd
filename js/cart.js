window.Cart = {
	setUpJS(config) {
		window.Cart = new Vue({
		    el: '#fwd-cart',
		    data: {
		    	view: false,
		    	config: config || {},
		    	account: {},
		    	error: "",
		    	loading: false,
		    	shake: false,
		    	showCart: false,
		    	ready: false,
		    	initiated: false,
		    	cart: [],
		    },
		    watch: {
		    	view() {
		    		this.showCart = true
		    	},
		    	cart: {
		    		handler() {
						localStorage.setItem('fwd-cart', JSON.stringify(this.cart));
		    		},
		    		deep: true,
		    	}
		    },
			mounted() {

				var self = this

				setTimeout(function() {
					self.ready = true
					self.init()
				}, 100)

			},
		    methods: {

		    	checkout() {

		    		var self = this

		    		if (self.loading) {
		    			return
		    		}

		    		self.loading = true

		    		axios.post(self.config.success, {
		    			accountId: self.config.accountId,
		    			line_items: this.cart,
		    			success_url: self.config.successUrl || window.location.origin + window.location.pathname,
		    			cancel_url: window.location.origin + window.location.pathname,
		    		}).then(function(res) {
		    			self.loading = false
		    			window.location.href = res.data.response.redirect_uri
		    		})

		    	},

		    	orderDelivery(item) {
		    		
		    		this.showCart = true

		    	},

		    	getStatus() {

		    		var self = this

					axios.get('<%- host %>/checkout/status?accountId=' + this.config.accountId).then(function(res) {
						
						var status = res.data.response

						if (typeof status === "string") {

							if (status === 'pending_verification') {

								self.view = 'no_active'
								
								setTimeout(function() {
									// self.getStatus()
								}, 5000)

							} else {
								
								self.view = status

							}

						} else {
							self.account = res.data.response
						}

						self.load()

						self.$forceUpdate()

					})

		    	},

		    	load() {

		    		var self = this

		    		var cache = localStorage.getItem('fwd-cart')
				
					if (cache) {

						this.cart = JSON.parse(cache)

						this.shake = true

		    			setTimeout(function() {
		    				self.shake = false
		    				self.$forceUpdate()
		    			}, 1000)

					}

					if (this.view) {
						this.showCart = true
					}

					this.$forceUpdate()

		    	},
		    	
		    	setUpBilling() {

		    		var endpoint = '<%- host %>/checkout/setup?accountId=' + this.config.accountId + '&redirect_uri=' + window.location.origin + window.location.pathname

		    		axios.get(endpoint).then(function(res) {
		    			window.location.href = res.data.response.redirect
		    		})

		    	},

		    	init() {

		    		var self = this
		    		
		    		this.initiated = true
		    		
		    		if (!this.config) {
		    			this.view = 'no_config'
		    			self.load()
		    			return
		    		}

		    		if (!this.config.accountId) {
		    			this.view = 'no_account'
		    			self.load()
		    			return
		    		}

		    		// self.getStatus()

		    	},

		    	remove(item) {

		    		var self = this

		    		if (!this.initiated) {
		    			return
		    		}

		    		this.cart = this.cart.filter(function(a) {
		    			return a !== item
		    		})

		    	},

		    	add(item) {

		    		var self = this

		    		if (!this.initiated) {
		    			return
		    		}

		    		var product = {
		    			id: item.id || item.variant_id,
		    			name: item.name || item.title,
		    			price: item.price || item.amount || item.cost,
		    			quantity: item.quantity || item.qty || item.units,
		    			image: item.image || item.picture || item.photo,
		    			description: item.description,
		    		}

		    		var error = false

		    		var required = [
		    			'name',
		    			'price',
		    			'quantity',
		    		]

		    		required.map(function(key) {
			    		if (!product[key]) {
			    			self.view = 'error'
			    			self.error = "Item was not added to cart because " + key + " was not provided."
			    		}
		    		})

		    		if (!self.view) {

		    			this.cart.push(product)

		    			this.$forceUpdate()

		    			this.shake = true

		    			setTimeout(function() {
		    				self.shake = false
		    			}, 1000)

		    		}

		    	}

		    },
		    computed: {
		    	subtotal() {
		    		var subtotal = 0
		    		this.cart.map(function(item) {
		    			subtotal += (parseFloat(item.price) * parseInt(item.quantity))
		    		})
		    		return subtotal
		    	}
		    },
		   
		})
	},
	setUpHTML() {
		document.body.innerHTML += `
<div v-if="initiated" id="fwd-cart" style="display: none" :style="{ 'display': initiated ? 'block' : 'none'  }">
	
	<div :class="{ 'fwd-cart js-fwd-cart': true, 'fwd-cart--open': showCart }">
		
		<div class="fwd-cart-underlay" @click="showCart = false"></div>

		<a @click="showCart = !showCart" :class="{ 'fwd-cart__trigger text-replace': true, 'shake': shake }" :style="config.position">
			Cart
			<ul v-if="view" class="fwd-cart__count warn">
				<li>!</li>
			</ul> 
			<ul v-if="!view && cart.length" class="fwd-cart__count" :style="{ 'background-color': config.color || '#2ecc71' }">
				<li>{{ cart.length }}</li>
				<li>{{ cart.length + 1 }}</li>
			</ul> 
		</a>

		<div class="fwd-cart__content" :style="config.position">
			<div class="fwd-cart__layout">

				<header class="fwd-cart__header" :style="{ 'zoom' : config.zoom || '1' }">
					<h2>Cart <span v-if="!view && cart.length">({{ cart.length }})</span></h2>
					<div class="fwd-cart-account">{{ account.name ? account.name.toUpperCase() : '' }}</div>
				</header>

				<div class="fwd-cart__body" :style="{ 'zoom' : config.zoom || '1' }">

					<div v-if="view">

						<div v-if="view == 'no_config'" class="fwd-cart-error-notice">
							<div class="fwd-cart-error-icon"></div>
							<div class="fwd-cart-error-text">Cart was initiated with incorrect configuration.</div>
						</div>

						<div v-if="view == 'not_setup'" class="fwd-cart-error-notice">
							<div class="fwd-cart-error-icon billing verify"></div>
							<div class="fwd-cart-error-text">You're good to go! The last step is automated. Account setup may take up to 24 hours, while Stripe confirms your information. <br> Please <a :href="'mailto:hello@forward.miami?subject=Confirm Billing Setup&Body=Account Id: ' + config.accountId" style="color: inherit">contact us</a> if not.</div>
						</div>

						<div v-if="view == 'no_billing' || view === 'no_account'" class="fwd-cart-error-notice">
							<div class="fwd-cart-error-icon billing"></div>
							<div class="fwd-cart-error-text">Before you can accept payments online, we have to configure billing, so you can get paid securely.</div>
							<div class="fwd-stripe-icon"></div>
						</div>

						<div v-if="view == 'no_active'" class="fwd-cart-error-notice">
							<div class="fwd-cart-error-icon billing verify"></div>
							<div class="fwd-cart-error-text">We're still processing your billing request. If we need further verification, we will contact you.</div>
						</div>

						<div v-if="view === 'no_platform'" class="fwd-cart-error-notice">
							<div class="fwd-cart-error-icon platform"></div>
							<div class="fwd-cart-error-text">Final step is to configure your online store on the Shopify platform.</div>
						</div>

						<div v-if="view === 'error'" class="fwd-cart-error-notice">
							<div class="fwd-cart-error-icon"></div>
							<div class="fwd-cart-error-text">{{ error }}</div>
						</div>

					</div>

					<div v-if="!view && !cart.length" class="fwd-cart-error-notice">
						<div class="fwd-cart-error-icon cart"></div>
						<div class="fwd-cart-error-text">Your cart is currently empty.</div>
					</div>

					<ul v-if="!view && cart.length">
						<li v-for="item in cart" :class="{ 'fwd-cart__product': true, 'cd-cart__product--deleted': item.removed }">
						    <div class="fwd-cart__image">
						        <a href="#0">
						            <img alt="placeholder" :src="item.image"/>
						        </a>
						    </div>
						    <div class="fwd-cart__details">
						        <h3 class="truncate">
						            <a href="#0">{{ item.name }}</a>
						            <p>{{ item.description }}</p>
						        </h3>
						        <span class="fwd-cart__price">{{ cart.currency || '$' }}{{ item.price }}</span>
						        <div class="fwd-cart__actions">
						            <a class="fwd-cart__delete-item" href="#0" @click="remove(item)">Remove</a>
						            <div class="fwd-cart__quantity">
						                <label for="cd-product-1">Qty</label>
						                <span class="fwd-cart__select">
						                    <select class="reset" id="cd-product-1" name="quantity" v-model="item.quantity">
						                        <option :value="i" v-for="i in 10">{{ i }}</option>
						                    </select>
						                    <svg class="icon" viewbox="0 0 12 12">
						                        <polyline fill="none" points="2,4 6,8 10,4 " stroke="currentColor">
						                        </polyline>
						                    </svg>
						                </span>
						            </div>
						        </div>
						    </div>
						</li>
					</ul>
				</div>

				<footer class="fwd-cart__footer" :style="{ 'font-size' : config.zoom ? config.zoom * 12 + 'px' : '14px' }">
					<a v-if="!view && cart.length" @click="checkout()" class="fwd-cart__checkout" :style="{ 'background-color': config.color || '#2ecc71' }">
			          	<em>
			          		<span v-if="!loading">Checkout - $<span>{{ subtotal }}</span></span>
			          		<span v-if="loading">Please wait...</span>
			            <svg class="icon icon--sm" viewBox="0 0 24 24"><g fill="none" stroke="#FFF"><line stroke-width="2" stroke-linecap="round" stroke-linejoin="round" x1="3" y1="12" x2="21" y2="12"/><polyline stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="15,6 21,12 15,18 "/></g></svg>
			          	</em>
			        </a>
			        <a v-if="view === 'no_billing' || view === 'no_account'" @click="setUpBilling()" class="fwd-cart__checkout" :style="{ 'background-color': config.color || '#2ecc71' }">
			          	<em>Set Up Billing</span>
			            <svg class="icon icon--sm" viewBox="0 0 24 24"><g fill="none" stroke="#FFF"><line stroke-width="2" stroke-linecap="round" stroke-linejoin="round" x1="3" y1="12" x2="21" y2="12"/><polyline stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="15,6 21,12 15,18 "/></g></svg>
			          </em>
			        </a>
			        <a v-if="view === 'no_platform'" href="mailto:hello@forward.miami" class="fwd-cart__checkout" :style="{ 'background-color': config.color || '#2ecc71' }">
			          	<em>Contact Us</span>
			            <svg class="icon icon--sm" viewBox="0 0 24 24"><g fill="none" stroke="#FFF"><line stroke-width="2" stroke-linecap="round" stroke-linejoin="round" x1="3" y1="12" x2="21" y2="12"/><polyline stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="15,6 21,12 15,18 "/></g></svg>
			          </em>
			        </a>
			        <a v-if="!view && !cart.length" class="fwd-cart__checkout" :style="{ 'background-color': config.color || '#2ecc71' }" @click="showCart = false">
			          	<em>Continue shopping</span>
			            <svg class="icon icon--sm" viewBox="0 0 24 24"><g fill="none" stroke="#FFF"><line stroke-width="2" stroke-linecap="round" stroke-linejoin="round" x1="3" y1="12" x2="21" y2="12"/><polyline stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="15,6 21,12 15,18 "/></g></svg>
			          </em>
			        </a>
			        <a v-if="view && view !== 'no_billing' && view !== 'no_platform' && view !== 'no_account' " class="fwd-cart__checkout" :style="{ 'background-color': config.color || '#2ecc71' }" @click="showCart = false">
			          	<em>Close</span>
			            <svg class="icon icon--sm" viewBox="0 0 24 24"><g fill="none" stroke="#FFF"><line stroke-width="2" stroke-linecap="round" stroke-linejoin="round" x1="3" y1="12" x2="21" y2="12"/><polyline stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="15,6 21,12 15,18 "/></g></svg>
			          </em>
			        </a>
				</footer>
			</div>
		</div>
	</div> 
</div>
`
	},
	setUpCSS() {
		var head = document.getElementsByTagName('head')[0];
		var style = document.createElement('link');
			style.href = 'https://fwd.dev/css/cart.css';
			style.type = 'text/css';
			style.rel = 'stylesheet';
			head.append(style);
	},
	setUpRequiredScripts() {
		return new Promise(function(resolve) {
			if (typeof axios === 'undefined') {
				var head = document.getElementsByTagName('head')[0];
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = 'https://fwd.dev/js/axios.js';
				head.appendChild(script);
			}
			if (typeof Vue === 'undefined') {
				var head = document.getElementsByTagName('head')[0];
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = 'https://fwd.dev/js/vue.js';
				head.appendChild(script);
			}
			setTimeout(function() {
				resolve()
    		}, 500)
		})
	},
    init(config) {
    	var self = this
    	this.setUpRequiredScripts().then(function() {
	    	self.setUpCSS()
	    	self.setUpHTML()
			self.setUpJS(config)
    	})
    },
}
