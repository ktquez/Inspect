# Inspect
Form validation in Javascript Vanilla, without dependencies and multiple languages. ~8kb

![alt tag](https://cloud.githubusercontent.com/assets/8084606/13711641/6b5a910e-e79e-11e5-927f-b38ee3f9a0e7.gif)

## How to use
### npm
```shell
npm install inspect-form --save
```

### bower
```shell
bower install inspect-form --save
```

Include the script of the Inspect on your page
```html
<script src="./path/to/inspect.min.js"></script>
...
</body>
```

## Create your form
```html
<form action="#" method="POST" name="formTest" novalidate>
<div class="form-group">
  <label for="name">NAME:</label>
	<input type="text" id="name" name="name" data-rules="required" data-msgCustom="Fullname">
</div>
<div class="form-group">
	<label for="email">EMAIL:</label>
		<input type="email" id="email" name="email" data-rules="required|email" data-msgCustom="Email">
</div>
<button type="submit">
		ENVIAR
</button>
</form>
```

### Attributes
`` data-rules `` : The rules that will apply to the field<br>
**Info:** You can use more than one rule, for it must use the pipe, for examplo: `` required|number|cpf ``

`` data-msgCustom `` ***Opcional*** : Text, if you want to customize the output of the error message<br>
**Info:** If it was not informed msn Custom, the field name will be used

### Rules
* **required** -- Required field, not empty <br>
* **email** -- Check a valid email address
* **max** -- Limit the maximum value, for examplo: `` required|max:10 ``. 
* **min** -- Limit the minimum value, for examplo: `` min:2 ``.
* **cpfCnpf** -- Checks if the value is a valid CPF or CNPJ
* **cpf** -- Checks if the value is a valid CPF, 11 digits
* **cnpj** -- Checks if the value is a valid CNPJ, 14 digits
* **cep** -- Checks if the CEP is entered correctly, format pt-BR (XXXXX-XXX)
* **card** -- Checks if the credit card is entered correctly, 16 digits
* **number** -- Checks if the value is a number
* **url** --  Checks if the URL is entered correctly

## Defining the form on Inspect
Instantiates the form only through the name the form
```js
var myForm = new Inspect('formTest');
```

Instance the form through the settings
```js
var myForm = new Inspect({
		'form' : 'formTest',
		'touched' : true,
		'tooltip' : true
	});
```

### Settings
Currently you can customize some inspect actions, customize how the form will be validated or even choose the type of alert.

* **form:** -- Name the form
* **touched:** -- If you want the Inspect check, when the user take the focus off the field, default : false
* **tooltip:** -- If you want to use the alert more friendly, default : false
<br>**Info:** By default the alerts are simple, you can customize through its style css, simple alert structure created:
```html
<div class="inspect-message" style="position:relative;width:100%;float:left;">
  <span class="inspect-message-text" style="color: red;">O Campo Nome é obrigatório</span>
</div>
```
Just customize the classes available, ``inspect-message`` and ``inspect-message-text``

## Performing validation with the created instances
For validations and data prepared for AJAX requests, use the following syntax:
```js
var myForm = new Inspect('formTest');
myForm.make(function(data){
	// your code here (for example: AJAX requests)
});
```

For normal implementation of the form
```js
var myForm = new Inspect('formTest');
myForm.toSubmit();
```

### Reset form
If you need to empty the form, simply use the function `` myForm.pristine(); ``
For example:
```js
var myForm = new Inspect('formTest');
myForm.make(function(data){
	myForm.pristine();	// Reset 
	// your code here (for example: AJAX requests)
});
```

### Short Syntax
```js
new Inspect('formTest').toSubmit();
```
Or
```js
new Inspect({
  'form' : 'formTest',
  'tooltip' : true
}).make(function(data){
  // your code here (for example: AJAX requests)
});
```

## For more than one form per page
```js
var myForm = new Inspect('formTest')
myForm.toSubmit();

var myForm2 = new Inspect({
  'form' : 'formTest2',
  'tooltip' : true
});
myForm2.make(function(){
  // your code here (for example: AJAX requests)
});

var myForm3 = new Inspect({
  'form' : 'formTest3',
  'tooltip' : true
})
myForm3.toSubmit();
```

## Languages
At the time the error messages are only available in:
* **pt-br** -- Portuguese BR
* **pt** -- Portuguese
* **en** -- English
* **es** -- Spanish

### How to use custom messages by language
To make it work the messages in the correct language, simply declare the attribute lang in HTML tag
```html
<html lang="en">
```

## Current version stable
**V1.0.3**

## ChangeLog

## Contributing
- Check the open issues or open a new issue to start a discussion around your feature idea or the bug you found.
- Fork repository, make changes, add your name and link in the authors session readme.md
- Send a pull request

If you want a faster communication, find me on [@ktquez](https://twitter.com/ktquez)

**thank you**
