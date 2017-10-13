# Smallpack
A small library to encode unicode strings or objects to base64
# How to use
```javascript
var encoded = (new SmallPack()).encode({foo:'👍',bar:'❤'});
var decoded = (new SmallPack()).decode(encoded);
```
