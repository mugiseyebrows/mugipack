
function SmallPack() {

  var alp = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/";

  this.encode = function(data) {
      var ints;
      var t;
      if (typeof data == "string") {
        t = "s";
        ints = data.split('').map( e => e.charCodeAt(0) );
      } else if (typeof data == "object"){
        t = "o";
        ints = JSON.stringify(data).split('').map( e => e.charCodeAt(0) );
      } else {
        throw "unexpected data type: must be either string or object";
      }
      var len = ints.length;
      if (ints.length % 2 == 1) {
        ints.push(0);
      }
      var stat = this._createStat(ints);
      var a = Math.ceil(stat.length / 64 - 1);
      while (64 - a + a * 64 < stat.length) {
        a = a + 1;
      }
      var alphabet = this._alphabet(a);
      var dict = this._mkdict(stat.map( e=>e[0] ), alphabet);
      var encoded = this._encode(ints, dict);
      var packedDict = this._packDict(stat);

      //console.log( [alp,dict,encoded,pd] );

      return [t,this._nTo62(len),this._nTo62(a),packedDict,encoded].join('/');
  }

  this.decode = function( data ) {
    var ps = this._splitn(data,'/',5);
    var t = ps[0];
    var len = this._nFrom62(ps[1]);
    var a = this._nFrom62(ps[2]);
    var packedDict = ps[3];
    var encoded = ps[4];

    var alphabet = this._alphabet(a);
    var dict = this._unpackDict(alphabet, packedDict);
    return this._decode(dict, encoded, len, t);
  }

  this._mkdict = function(ks,vs) {
    var res = new Object(null);
    var n = Math.min(ks.length,vs.length);
    for (var i=0;i<n;i++) {
      res[ks[i]] = vs[i];
    }
    return res;
  }

  this._alphabet = function(a) {
    var res = [];
    for (var i = 0;i<64-a;i++) {
      res.push(alp[i]);
    }
    for (var i=64-a;i<64;i++) {
      for (var j=0;j<64;j++) {
        res.push(alp[i] + alp[j]);
      }
    }
    return res;
  }

  this._createStat = function( ints ) {
    var st = new Object(null);
    for (var i=0;i<ints.length;i=i+2) {
      var k = ints[i] + ',' + ints[i+1];
      if (st[k]) {
        st[k] = st[k] + 1;
      } else {
        st[k] = 1;
      }
    }
    var st_ = [];
    var m = 0;
    for (var k in st) {
      m = m + 1;
      st_.push([k,st[k]]);
    }
    st_.sort( (a,b) => { if (a[1] < b[1]) return 1; return -1; } );
    return st_;
  }

  this._packDict = function( st ) {
    var res = [];
    st.map( e => e[0].split(',').forEach( g => res.push(this._nTo62(parseInt(g,10))) ) );
    return res.join('+');
  }

  this._unpackDict = function( alp, s ) {
    var dict = new Object(null);
    var s_ = s.split('+');
    for (var i=0;i<s_.length;i = i+2) {
      dict[alp[i/2]] = this._nFrom62(s_[i]) + ',' + this._nFrom62(s_[i+1]);
    }
    return dict;
  }

  this._encode = function( ints, dict ) {
    var res = '';
    for (var i=0;i<ints.length;i=i+2) {
      var k = ints[i] + ',' + ints[i+1];
      if (dict[k]) {
        res = res + dict[k];
      } else {
        throw "unexpected pair of ints (not in dict)" + k;
      }
    }
    return res;
  }

  this._splitn = function( s, c, n ) {
    var ps = [];
    var p = s.indexOf(c);
    for (var i=0;i<n-1;i++) {
      if (p > -1) {
        ps.push(p);
        p = s.indexOf(c,p+1);
      }
    }
    if (ps.length == 0) {
      return [];
    }
    var res = [s.substr(0,ps[0])];
    for (var i=0;i<ps.length;i++) {
      if (i<ps.length-1) {
        res.push(s.substr(ps[i]+c.length,ps[i+1] - ps[i] - 1));
      } else {
        res.push(s.substr(ps[i]+c.length));
      }
    }
    return res;
  }

  this._nTo62 = function(n) {
    var res = [];
    if (n == 0) {
      return "0";
    }
    while (n > 0) {
      var d = n % 62;
      res.push(alp[d]);
      n = Math.floor(n / 62);
    }
    return res.reverse().join('');
  }

  this._nFrom62 = function(n) {
    var res = 0;
    for(var i=0;i<n.length;i++) {
      res = res + Math.pow(62,n.length - i - 1) * alp.indexOf(n[i]);
    }
    return res;
  }

  this._decode = function(dict, data, l, t) {
    var i = 0;
    var res = [];
    while (i < data.length) {
      var s = null;
      if (dict[data[i]]) {
        var s = dict[data[i]];
        i = i + 1;
      } else {
        var s = dict[data[i] + data[i+1]];
        i = i + 2;
      }
      var bs = s.split(',').map( e => parseInt(e,10) );
      res.push(bs[0]);
      res.push(bs[1]);
    }
    if (res.length > l) {
      res.pop();
    }
    var s = res.map( e => String.fromCharCode(e) ).join('');
    if (t == "s") {
      return s;
    } else if (t == "o") {
      return JSON.parse(s);
    }
  }
}
