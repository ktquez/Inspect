/*
*	Inspect - Form validations in Javascript Vanilla without dependencies and multilanguage
*	Copyright (c) 2016 Ktquez
*	Project repository: https://github.com/ktquez/Inspect
* 	Dual licensed under the MIT and GPL licenses.
*/

(function(window){

	'use strict';

	var Inspect = function(obj){

		this.config = {};

		// Checks that the user entered a string with the name of the form
		if(typeof obj === 'string'){
			this.config.form = obj;
			this.config = this.createConfig(this.config);
			this.setForm(obj);
			return;
		}

		// If sent an object with more settings, merges with the default settings			
		if (!!obj) this.config = this.createConfig(obj);

		// Initializes the tracking form
		this.setForm(this.config.form);			
	};

	// Add to the window object
	window.Inspect = Inspect;	

	Inspect.prototype = {

		/**
		 * Prototype to create the instance inspect settings
		 * @type {Object}
		 */
		defaults : {
			animateScroll : 8,
			touched : false,
			tooltip : false		
		},

		/**
		 * instanceOfInpect.make().then(function(data){
		 * 		// código aqui
		 * });
		 * 
		 * make: (AJAX) Validates the form and return the data in a callback
		 * @return {callback}
		 */
		make : function(callback){
			var self = this,
				objForm = self[self.config.form];

			objForm.dom.addEventListener('submit', function(e){
				objForm.submitted = true;
				self.utils.blockForm(e);

				var data = {},
					errors = [],
					arrFields;

				arrFields = [].slice.call(objForm.dom);
				arrFields.map(function(field, key){
					errors.push(self.validate(objForm[field.name]));
					if (field.type === 'submit') return;
					data[field.name] = field.value;
				});		

				if (!!errors) self.filter(errors);

				if (!self.fails()) {
					callback(data);
					objForm.submitted = false;
					return;	
				}

			}, false);
		},

		/**
		 * instanceOfInpect.toSubmit();
		 *
		 * toSubmit: Submit the form if no error occurs		  
		 */
		toSubmit : function(){			
			var self = this,
				objForm = self[self.config.form];

			objForm.dom.addEventListener('submit', function(e){
				objForm.submitted = true;
				
				// for each to Validate form fields
				self.utils.convertObjToArray(objForm.dom).map(function(field){
					var error = self.validate(objForm[field.name]);
					if (!!error) self.filter(error);
				});				

				// If fails, block form and show errors
				if (self.fails()) {
					self.utils.blockForm(e);
					objForm.submitted = false;
				}

			}, false);
		},

		/**
		 * File configuration specifies of the instance of Inspect, for multiple forms in single page
		 * @param  {object} options = Information passed by the user
		 * @return {object}
		 */
		createConfig : function(options){
			var self = this;

			var config = JSON.parse(JSON.stringify(self.defaults));
			for(var option in options){
				if(options.hasOwnProperty(option)){
					config[option] = options[option];
				}
			}
			return config;

		},

		/**
		 * setForm: Configure and monitor the set form object
		 * @param {string} nameForm = name the form
		 */
		setForm : function(nameForm){
			var self = this;

			self[nameForm] = {
				'submitted' : false,
				'error' : false
			};

			self.prepare(nameForm);
			return;
		},

		/**
		 * Prepare form to validations
		 * @param  {string} nameForm = name the form
		 */
		prepare : function(nameForm){
			var self = this,
				form = document.querySelector('form[name='+nameForm+']');

			// cache dom
			self[nameForm].dom = form;

			// Slice the form in objects with information the fields
			self.utils.convertObjToArray(form).map(function(value){
				// Create object specific field the form
				self[nameForm][value.name] = {
					'name' : value.name,
					'touched' : false,
					'errors' : [],
					'rules' : self.prepareRules(value.getAttribute('data-rules')),
					'custom' : value.getAttribute('data-msgCustom'),
					'field' : value
				};

				if(self.config.touched) self.touched(self[nameForm][value.name]);
			});
		},

		/**
		 * Slice rules to validation
		 * @param  {string} rules = Rules informed the attribute [data-rules]
		 * @return {Array} = Specifics rules of the object
		 */
		prepareRules : function(rules){
			if (!rules) return false;
			return rules.split('|');
		},

		/**
		 * Register event listeners, if touched enable
		 * @param  {obj} obj = Object manager with information on field specific of the form
		 */
		touched : function(obj){
			var self = this;
			obj.field.addEventListener('focus', function(){
				obj.touched = true;				
			}, false);
			obj.field.addEventListener('blur', function(e){
				if(!obj.rules.length) return;

				self.untouched(obj);
			}, false);
		},
		
		/**
		 * Validation on blur field
		 * @param  {object} obj Object manager with information on field specific of the form
		 */
		untouched : function(obj){
			var self = this;

			obj.touched = false;
	
			var errors = self.validate(obj);
			self.filter(errors);
		},

		/**
		 * Reset form
		 */
		pristine : function(){
			var self = this;
			self[self.config.form].dom.reset();
		},

		/**
		 * Validate rules
		 * @param  {object} obj = Object manager with information on field specific of the form
		 */
		validate : function(obj){
			var self = this,
				rule,
				verify;

			// If not exists rules to validation
			if (!obj.rules) return false;

			var validation = obj.rules.map(function(value, key){
				if (value.indexOf(':') !== -1) {
					rule = value.split(':');

					// Verify custom rules with others parameters
					verify = self.verify[rule[0]](obj.field.value, rule[1]);					
				}else{
					rule = value;
					var val = obj.field.value;

					// Setting for checkbox inputs
					if (/(checkbox|radio)/.test(obj.field.type)) {

						if (obj.field.type !== 'radio') {
							val = !obj.field.checked ? '' : val;
						}else{

							// Several radios with the same names
							var radios = self[self.config.form].dom.querySelectorAll('input[name="'+obj.field.name+'"]');
							var verifyMultipleRadios = self.utils.convertObjToArray(radios).filter(function(value){
								return !!value.checked;
							});							
							val = !verifyMultipleRadios.length ? '' : val;
						}	
					}

					// Verify normal rules
					verify = self.verify[value](val);				
				}

				// remove error to object
				if (obj.errors.indexOf(value) !== -1){
					obj.errors.splice(obj.errors.indexOf(value), 1);
				}

				// if error, add error to object
				if (verify) obj.errors.push(value);

				// Se não passar na validação, exibe a mensagem de erro
				if (verify) self.prepareAlertError(obj, rule);

				return verify;
			});

			// Array with results of the verify rules
			return validation;

		},

		filter : function(errors){
			var self = this;

			// return string with results of validation
			var strError = errors.filter(function(value){
				return !!value;
			}).toString();

			// if there are errors (true), sets that there is error in form
			if (strError.indexOf('true') !== -1) {
				self[self.config.form].error = true;

				// Se existir error, move o scroll para o alert de cima para baixo
				if (self[self.config.form].error) {
					self.utils.animateScroll(this.config.animateScroll);
				}

				return;
			}
			
			// If no errors returns false
			self[self.config.form].error = false;			

		},

		/**
		 * Notify if there is any failure in the form
		 * @return {boolean}
		 */
		fails : function(){
			var self = this;
			return self[self.config.form].error;
		},

		/**
		 * Handle to create the message element
		 * @param  {Object} obj  = Object manager with information on field specific of the form
		 * @param  {string} rule = Rule that the error occurred
		 */
		prepareAlertError : function(obj, rule){
			var self = this,
			    block = obj.field.parentElement,
			    alert = self.managerAlertError(obj, block);

			// If alert exists
			if (!alert) return;

			// Feeds the alert with the error message
			self.utils.setMessageError(obj, alert.querySelector('.inspect-message-text'), rule);

			// Feeds the block
			block.style.position = 'relative';
			block.appendChild(alert);
		},

		/**
		 * Manages the creation of error alerts
		 */
		managerAlertError : function(obj, block){
			var self = this;

			if (block.querySelector('.inspect-message')) return false;

			if (self.config.tooltip) {
				return self.utils.createTooltipAlert(obj);
			}
			return self.utils.createSimpleAlert(obj);
		},
	};

	Inspect.prototype.utils = {	

		animateScroll : function(interval){

			// Runs the scroll at intervals
			var animate = setInterval(function(){
				scroll(interval);
			}, 10);

			function scroll(interval){
				var scroll = window.scrollY,
					el = document.querySelector('.inspect-message'),
					offset = el.offsetParent.offsetTop;

				if (offset < scroll){
					window.scrollTo(0, scroll - interval);	
					return;					
				}

				resetScroll();
				return;
			}

			// Remove the iteration range
			function resetScroll(){
				clearInterval(animate);
				return;
			}			
		},

		/**
		 * Create a simple alert with the message text, for the user to customize
		 */
		createSimpleAlert : function(obj){

			var div = document.createElement('div'),
				main = document.createElement('span');

			div.setAttribute('style', 'position:relative;width:100%;float:left;');
			div.setAttribute('class','inspect-message');

			main.style.color = 'red';
			main.setAttribute('class','inspect-message-text');

			obj.field.addEventListener('focus', function(e){
				e.preventDefault();
				e.stopPropagation();

				if(!div.parentElement) return;
				div.parentElement.removeChild(div);
				
			});

			div.appendChild(main);
			return div;
		},

		/**
		 * Create alert tooltip
		 */
		createTooltipAlert : function(obj){

			var div = document.createElement('div'),
				main = document.createElement('span'),
				bottom = document.createElement('span'),
				arrow = document.createElement('span'),
				close = document.createElement('span'),
				field = obj.field;

			div.setAttribute('style', 'position:absolute;z-index:10;opacity:0;visibility:hidden;left:-100px;top:'+ Number((field.clientHeight + field.offsetTop) + 10) +'px;box-shadow:0 0 10px #aaa;transition:all 0.5s');
			div.setAttribute('class','inspect-message');

			arrow.setAttribute('style', 'border-style:solid;border-width:6px;border-color:transparent;border-bottom-color:rgba(231,76,60,0.6);position:absolute;left:50%;transform:translateX(-50%);top:-12px;');
			
			close.setAttribute('style', 'font-weight:bold;position:absolute;right:3px;bottom:-2px;color:#999;cursor:pointer;padding:0 3px 0');
			close.setAttribute('class','close-inspect-message');			
			close.innerHTML = "&times;";

			bottom.setAttribute('style', 'background:#f2f2f2;height:15px;width:100%;float:left;');

			main.setAttribute('style', 'background:rgba(231,76,60,0.8);font-family:inherit;line-height:1em;color:#fff;width:160px;padding:10px 6px;text-align:center;float:left;');
			main.setAttribute('class','inspect-message-text');

			div.appendChild(main);
			div.appendChild(bottom);
			bottom.appendChild(arrow);
			div.appendChild(close);

			/**
			 * Listeners
			 */
			close.addEventListener('click', function(e){
				e.preventDefault();
				e.stopPropagation();
				
				// Animating the div to hide
				div.style.left = '-100px';
				div.style.visibility = 'hidden';
				div.style.opacity = '0';
				setTimeout(function(){
					div.parentElement.removeChild(div);
				}, 500);

			}, false);

			obj.field.addEventListener('focus', function(e){
				e.preventDefault();
				e.stopPropagation();

				// Animating the div to hide
				div.style.left = '-100px';
				div.style.visibility = 'hidden';
				div.style.opacity = '0';
				setTimeout(function(){
					if(!div.parentElement) return;
					div.parentElement.removeChild(div);
				}, 500);

			});

			// Animating the div to display
			setTimeout(function(){
				if (/(checkbox|radio)/.test(field.type)) {
					div.style.left = field.offsetLeft + parseInt(field.offsetWidth / 2) - 86 + 'px';					
				}else{
					div.style.left = (field.offsetWidth - 174) + 'px';
				}
				div.style.visibility = 'visible';
				div.style.opacity = '1';
			}, 200);

			return div;
		},		

		/**
		 * Assigns a custom error message alert
		 * @param {Object} obj = Object manager with information on field specific of the form
		 * @param {Object} elemText = Element that the message text is displayed 
		 * @param {String} rule = Rule that the error occurred 
		 */
		setMessageError : function(obj, elemText, rule){
			var self = this,
				custom = !!obj.custom ? obj.custom : obj.name,
				messages = Inspect.prototype.messages,
				msgRule;
			
			if (Array.isArray(rule)) {
				msgRule = messages[rule[0]];
				msgRule = msgRule.replace(':other', rule[1]);				
			}else{
				msgRule = messages[rule];				
			}

			msgRule = msgRule.replace(/(:custom)/g, custom);
			elemText.innerHTML = msgRule;
			return;			
		},

		convertObjToArray : function(obj){
			return [].slice.call(obj);
		},

		blockForm : function(event){
			event.preventDefault();
		}
	};

	Inspect.prototype.messages = {
		"required" : "The field :custom is required",
		"email" : "Please, type a valid :custom",
		"max" : "The :custom field must contain a maximum of :other characters",
		"min" : "The :custom field must contain a minimum of :other characters",
		"card" : "Enter the :custom correctly",
		"cpf" : "The :custom typed is invalid",
		"cnpj" : "The :custom typed is invalid",
		"cpfCnpj" : "The :custom is invalid, please try again",
		"cep" : "The :custom typed is invalid",
		"number" : "The field :custom must be a number",
		"url" : "Please enter a valid :custom"
	};

	/**
	 * Returns true if it does not pass verification, returns false if pass the validation
	 * @return boolean
	 */
	Inspect.prototype.verify = {

		required : function(value){
			return !value ? true : false;
		},

		email : function(value) {
			return !/[0-9\-\.\_a-z]+@[0-9\-\.a-z]+\.[a-z]+/.test(value) ? true : false;
		},

		max : function(value, max) {
			return value.length > max ? true : false;
		},

		min : function(value, min) {
			return value.length < min ? true : false;
		},

		cpfCnpj : function(value) {
			if (this.cpf(value) && this.cnpj(value)) return true;			
			return false;
		},

		cnpj : function(value) {
			var cnpj = value.replace(/(\.|\-|\/)/g, ''),
				numbers = [].slice.call(cnpj),
				sizeFirstOp = 5,
				sizeSecondOp = 6,
				firstResult = 0,
				secondResult = 0,
				i;

			/**
			 * Se não conter a quantidade correta
			 */
			if (numbers.length != 14) return true;

			/**
			 * Prepara a verificação do primeiro dígito
			 */
			for (i=0;i<12;i++) {
				firstResult += (parseInt(numbers[i]) * parseInt(sizeFirstOp));
				if (sizeFirstOp === 2) {
					sizeFirstOp = 9;
					continue;
				}
				--sizeFirstOp;
			}

			firstResult = (firstResult * 10) % 11;

			// Caso o resto seja 10, o dígito será sempre 0
			firstResult = firstResult === 10 ? 0 : firstResult; 

			// Se o resultado não coincidir com o 1 dígito verificador
			if (firstResult !== Number(numbers[12])) return true;

			/**
			 * Prepara a verificação do segundo dígito
			 */
			for (i=0;i<13;i++) {
				secondResult += (parseInt(numbers[i]) * parseInt(sizeSecondOp));
				if (sizeSecondOp === 2) {
					sizeSecondOp = 9;
					continue;
				}
				--sizeSecondOp;
			}

			secondResult = (secondResult * 10) % 11;

			// Caso o resto seja 10, o dígito será sempre 0
			secondResult = secondResult === 10 ? 0 : secondResult; 

			// Se o resultado não coincidir com o 1 dígito verificador
			if (secondResult !== Number(numbers[13])) return true;


			// Tudo ok, sem erros
			return false;
		},

		cpf : function(value){
			var cpf = value.replace(/(\.|\-)/g, ''),
				numbers = [].slice.call(cpf),
				sizeFirstOp = 10,
				sizeSecondOp = 11,
				firstResult = 0,
				secondResult = 0,
				irregular,
				i;

			/**
			 * Se não conter a quantidade correta
			 */
			if (numbers.length != 11) return true;

			/**
			 * São irregulares todos os CPFs que os dígitos sejam iguais (por exemplo: 11111111111)
			 */
			irregular = numbers.every(function(value){
				return value === numbers[0]; 
			});

			if (irregular) return true;

			for (i=0;i<9;i++) {
				firstResult += (parseInt(numbers[i]) * parseInt(sizeFirstOp));
				--sizeFirstOp;
			}
			firstResult = (firstResult * 10) % 11;

			// Caso o resto seja 10, o dígito será sempre 0
			firstResult = firstResult === 10 ? 0 : firstResult; 
			
			// Se o resultado não coincidir com o 1 dígito verificador
			if (firstResult !== Number(numbers[9])) return true;

			/**
			 * Prepara a verificação do segundo dígito
			 */
			for (i=0;i<10;i++) {
				secondResult += (parseInt(numbers[i]) * parseInt(sizeSecondOp));
				--sizeSecondOp;
			}
			secondResult = (secondResult * 10) % 11;

			// Caso o resto seja 10, o dígito será sempre 0
			secondResult = secondResult === 10 ? 0 : secondResult; 

			// Se o resultado não coincidir com o 2 dígito verificador
			if (secondResult !== Number(numbers[10])) return true;

			// Tudo ok, sem erros
			return false;
		},

		cep : function(value) {
			return !/(^[0-9]{5}-[0-9]{3}$|^[0-9]{8}$)/.test(value) ? true : false;
		},

		card : function(value) {
			var card = value.replace(/(\s|\-|\.)/g, '');
			return !/(^[0-9]{16}$)/.test(card) ? true : false;
		},

		number : function(value) {
			return !Number(value);
		},

		url : function(value) {
			return !/(http|https)+(:\/\/)+(www.|)+[0-9a-z\-]+\.(.)+/.test(value);
		}
	}; 
	// End of Inspect

	/**
	 * Load the language for messages
	 * Compatibility Ajax
	 */
	function getXHR(){
		// Demais browsers
		if(window.XMLHttpRequest){
			return new XMLHttpRequest();
		}
		// Microsoft
		try {
	        return new ActiveXObject("Msxml2.XMLHTTP");
	    } 
	    catch (e) {
	    	try {
	          return new ActiveXObject("Microsoft.XMLHTTP");
	    	} 
	    	catch (e) {}
	    }
	}

	/**
	 * Pega a url base do script inspect
	 */
	function basepath() {
	    var scripts = document.getElementsByTagName('script'),
	        script = scripts[scripts.length - 1];

	    if (!!script.getAttribute.length) {
	    	var path = script.getAttribute('src').split('/');
	    	path.splice((path.length - 1), 1);
	    	path = path.toString().replace(/(,)/g, '/');

	    	return path;
	    }
	}

	/**
	 * Ajax
	 */
	(function go(){
		var languague = document.getElementsByTagName('html')[0].getAttribute('lang'),
			xhr = getXHR();		

		xhr.onreadystatechange = function(){				
			if(xhr.readyState === 4){
				if(xhr.status === 200){
					Inspect.prototype.messages = JSON.parse(xhr.responseText);
				}
			}
		};

		xhr.open('GET', basepath()+'/lang-inspect/'+languague+'.json', true);			
		xhr.send();		
	})();

})(window);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Inspect;
}