# Mugipack
A small library to encode unicode strings or objects to base64
# How to use

## In browser

Add library
```html
<script type="text/javascript" src="mugipack.min.js"></script>
```
Instantiate and use
```javascript
var mugipack = new MugiPack();
var encoded = mugipack.encode({foo:'👍',bar:'❤'});
var decoded = mugipack.decode(encoded);
```
## In node

run `npm install mugipack --save`

```javascript
var mugipack = require('mugipack')
var encoded = mugipack.encode({foo:'👍',bar:'❤'})
var decoded = mugipack.decode(encoded)
```

# Rationale
`btoa()` is limited to ascii strings only, of course there are [ways to overcome this](https://developer.mozilla.org/ru/docs/Web/API/WindowBase64/Base64_encoding_and_decoding), which depend on escaping or other libraries. I wish there was an easy way...

# Algorithm
Object json-stringified, string converted to charcodes, every pair of charcodes encoded with one or two base64 symbols, resulted string prepended with dictionary (rules to convert it back) and some metadata. Numbers in dictionary and metadata converted to base62 to save more space (one symbol reserved as chunk separator '/' and one as array element separator '+', so it's 62 not 64)
