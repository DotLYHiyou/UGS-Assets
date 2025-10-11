var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.createTemplateTagFirstArg = function(u) {
  return u.raw = u
};
$jscomp.createTemplateTagFirstArgWithRaw = function(u, w) {
  u.raw = w;
  return u
};
$jscomp.arrayIteratorImpl = function(u) {
  var w = 0;
  return function() {
    return w < u.length ? {
      done: !1,
      value: u[w++]
    } : {
      done: !0
    }
  }
};
$jscomp.arrayIterator = function(u) {
  return {
    next: $jscomp.arrayIteratorImpl(u)
  }
};
$jscomp.makeIterator = function(u) {
  var w = "undefined" != typeof Symbol && Symbol.iterator && u[Symbol.iterator];
  if (w) return w.call(u);
  if ("number" == typeof u.length) return $jscomp.arrayIterator(u);
  throw Error(String(u) + " is not an iterable or ArrayLike");
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = !1;
$jscomp.getGlobal = function(u) {
  u = ["object" == typeof globalThis && globalThis, u, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
  for (var w = 0; w < u.length; ++w) {
    var z = u[w];
    if (z && z.Math == Math) return z
  }
  throw Error("Cannot find global object");
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(u, w, z) {
  if (u == Array.prototype || u == Object.prototype) return u;
  u[w] = z.value;
  return u
};
$jscomp.IS_SYMBOL_NATIVE = "function" === typeof Symbol && "symbol" === typeof Symbol("x");
$jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = "$jscp$";
$jscomp.polyfill = function(u, w, z, F) {
  w && ($jscomp.ISOLATE_POLYFILLS ? $jscomp.polyfillIsolated(u, w, z, F) : $jscomp.polyfillUnisolated(u, w, z, F))
};
$jscomp.polyfillUnisolated = function(u, w) {
  var z = $jscomp.global;
  u = u.split(".");
  for (var F = 0; F < u.length - 1; F++) {
    var K = u[F];
    if (!(K in z)) return;
    z = z[K]
  }
  u = u[u.length - 1];
  F = z[u];
  w = w(F);
  w != F && null != w && $jscomp.defineProperty(z, u, {
    configurable: !0,
    writable: !0,
    value: w
  })
};
$jscomp.polyfillIsolated = function(u, w, z) {
  var F = u.split("."),
    K = 1 === F.length;
  u = F[0];
  u = !K && u in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var H = 0; H < F.length - 1; H++) {
    var Y = F[H];
    if (!(Y in u)) return;
    u = u[Y]
  }
  F = F[F.length - 1];
  z = $jscomp.IS_SYMBOL_NATIVE && "es6" === z ? u[F] : null;
  w = w(z);
  null != w && (K ? $jscomp.defineProperty($jscomp.polyfills, F, {
    configurable: !0,
    writable: !0,
    value: w
  }) : w !== z && (void 0 === $jscomp.propertyToPolyfillSymbol[F] && (K = 1E9 * Math.random() >>> 0, $jscomp.propertyToPolyfillSymbol[F] = $jscomp.IS_SYMBOL_NATIVE ?
    $jscomp.global.Symbol(F) : $jscomp.POLYFILL_PREFIX + K + "$" + F), K = $jscomp.propertyToPolyfillSymbol[F], $jscomp.defineProperty(u, K, {
    configurable: !0,
    writable: !0,
    value: w
  })))
};
$jscomp.polyfill("Promise", function(u) {
  function w() {
    this.batch_ = null
  }

  function z(A) {
    return A instanceof H ? A : new H(function(G) {
      G(A)
    })
  }
  if (u && (!($jscomp.FORCE_POLYFILL_PROMISE || $jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION && "undefined" === typeof $jscomp.global.PromiseRejectionEvent) || !$jscomp.global.Promise || -1 === $jscomp.global.Promise.toString().indexOf("[native code]"))) return u;
  w.prototype.asyncExecute = function(A) {
    if (null == this.batch_) {
      this.batch_ = [];
      var G = this;
      this.asyncExecuteFunction(function() {
        G.executeBatch_()
      })
    }
    this.batch_.push(A)
  };
  var F = $jscomp.global.setTimeout;
  w.prototype.asyncExecuteFunction = function(A) {
    F(A, 0)
  };
  w.prototype.executeBatch_ = function() {
    for (; this.batch_ && this.batch_.length;) {
      var A = this.batch_;
      this.batch_ = [];
      for (var G = 0; G < A.length; ++G) {
        var Q = A[G];
        A[G] = null;
        try {
          Q()
        } catch (V) {
          this.asyncThrow_(V)
        }
      }
    }
    this.batch_ = null
  };
  w.prototype.asyncThrow_ = function(A) {
    this.asyncExecuteFunction(function() {
      throw A;
    })
  };
  var K = {
      PENDING: 0,
      FULFILLED: 1,
      REJECTED: 2
    },
    H = function(A) {
      this.state_ = K.PENDING;
      this.result_ = void 0;
      this.onSettledCallbacks_ = [];
      this.isRejectionHandled_ = !1;
      var G = this.createResolveAndReject_();
      try {
        A(G.resolve, G.reject)
      } catch (Q) {
        G.reject(Q)
      }
    };
  H.prototype.createResolveAndReject_ = function() {
    function A(V) {
      return function(Z) {
        Q || (Q = !0, V.call(G, Z))
      }
    }
    var G = this,
      Q = !1;
    return {
      resolve: A(this.resolveTo_),
      reject: A(this.reject_)
    }
  };
  H.prototype.resolveTo_ = function(A) {
    if (A === this) this.reject_(new TypeError("A Promise cannot resolve to itself"));
    else if (A instanceof H) this.settleSameAsPromise_(A);
    else {
      a: switch (typeof A) {
        case "object":
          var G =
            null != A;
          break a;
        case "function":
          G = !0;
          break a;
        default:
          G = !1
      }
      G ? this.resolveToNonPromiseObj_(A) : this.fulfill_(A)
    }
  };
  H.prototype.resolveToNonPromiseObj_ = function(A) {
    var G = void 0;
    try {
      G = A.then
    } catch (Q) {
      this.reject_(Q);
      return
    }
    "function" == typeof G ? this.settleSameAsThenable_(G, A) : this.fulfill_(A)
  };
  H.prototype.reject_ = function(A) {
    this.settle_(K.REJECTED, A)
  };
  H.prototype.fulfill_ = function(A) {
    this.settle_(K.FULFILLED, A)
  };
  H.prototype.settle_ = function(A, G) {
    if (this.state_ != K.PENDING) throw Error("Cannot settle(" + A +
      ", " + G + "): Promise already settled in state" + this.state_);
    this.state_ = A;
    this.result_ = G;
    this.state_ === K.REJECTED && this.scheduleUnhandledRejectionCheck_();
    this.executeOnSettledCallbacks_()
  };
  H.prototype.scheduleUnhandledRejectionCheck_ = function() {
    var A = this;
    F(function() {
      if (A.notifyUnhandledRejection_()) {
        var G = $jscomp.global.console;
        "undefined" !== typeof G && G.error(A.result_)
      }
    }, 1)
  };
  H.prototype.notifyUnhandledRejection_ = function() {
    if (this.isRejectionHandled_) return !1;
    var A = $jscomp.global.CustomEvent,
      G =
      $jscomp.global.Event,
      Q = $jscomp.global.dispatchEvent;
    if ("undefined" === typeof Q) return !0;
    "function" === typeof A ? A = new A("unhandledrejection", {
      cancelable: !0
    }) : "function" === typeof G ? A = new G("unhandledrejection", {
      cancelable: !0
    }) : (A = $jscomp.global.document.createEvent("CustomEvent"), A.initCustomEvent("unhandledrejection", !1, !0, A));
    A.promise = this;
    A.reason = this.result_;
    return Q(A)
  };
  H.prototype.executeOnSettledCallbacks_ = function() {
    if (null != this.onSettledCallbacks_) {
      for (var A = 0; A < this.onSettledCallbacks_.length; ++A) Y.asyncExecute(this.onSettledCallbacks_[A]);
      this.onSettledCallbacks_ = null
    }
  };
  var Y = new w;
  H.prototype.settleSameAsPromise_ = function(A) {
    var G = this.createResolveAndReject_();
    A.callWhenSettled_(G.resolve, G.reject)
  };
  H.prototype.settleSameAsThenable_ = function(A, G) {
    var Q = this.createResolveAndReject_();
    try {
      A.call(G, Q.resolve, Q.reject)
    } catch (V) {
      Q.reject(V)
    }
  };
  H.prototype.then = function(A, G) {
    function Q(aa, fa) {
      return "function" == typeof aa ? function(S) {
        try {
          V(aa(S))
        } catch (Fa) {
          Z(Fa)
        }
      } : fa
    }
    var V, Z, ta = new H(function(aa, fa) {
      V = aa;
      Z = fa
    });
    this.callWhenSettled_(Q(A,
      V), Q(G, Z));
    return ta
  };
  H.prototype.catch = function(A) {
    return this.then(void 0, A)
  };
  H.prototype.callWhenSettled_ = function(A, G) {
    function Q() {
      switch (V.state_) {
        case K.FULFILLED:
          A(V.result_);
          break;
        case K.REJECTED:
          G(V.result_);
          break;
        default:
          throw Error("Unexpected state: " + V.state_);
      }
    }
    var V = this;
    null == this.onSettledCallbacks_ ? Y.asyncExecute(Q) : this.onSettledCallbacks_.push(Q);
    this.isRejectionHandled_ = !0
  };
  H.resolve = z;
  H.reject = function(A) {
    return new H(function(G, Q) {
      Q(A)
    })
  };
  H.race = function(A) {
    return new H(function(G,
      Q) {
      for (var V = $jscomp.makeIterator(A), Z = V.next(); !Z.done; Z = V.next()) z(Z.value).callWhenSettled_(G, Q)
    })
  };
  H.all = function(A) {
    var G = $jscomp.makeIterator(A),
      Q = G.next();
    return Q.done ? z([]) : new H(function(V, Z) {
      function ta(S) {
        return function(Fa) {
          aa[S] = Fa;
          fa--;
          0 == fa && V(aa)
        }
      }
      var aa = [],
        fa = 0;
      do aa.push(void 0), fa++, z(Q.value).callWhenSettled_(ta(aa.length - 1), Z), Q = G.next(); while (!Q.done)
    })
  };
  return H
}, "es6", "es3");
$jscomp.owns = function(u, w) {
  return Object.prototype.hasOwnProperty.call(u, w)
};
$jscomp.assign = $jscomp.TRUST_ES6_POLYFILLS && "function" == typeof Object.assign ? Object.assign : function(u, w) {
  for (var z = 1; z < arguments.length; z++) {
    var F = arguments[z];
    if (F)
      for (var K in F) $jscomp.owns(F, K) && (u[K] = F[K])
  }
  return u
};
$jscomp.polyfill("Object.assign", function(u) {
  return u || $jscomp.assign
}, "es6", "es3");
$jscomp.checkStringArgs = function(u, w, z) {
  if (null == u) throw new TypeError("The 'this' value for String.prototype." + z + " must not be null or undefined");
  if (w instanceof RegExp) throw new TypeError("First argument to String.prototype." + z + " must not be a regular expression");
  return u + ""
};
$jscomp.polyfill("String.prototype.startsWith", function(u) {
  return u ? u : u = function(w, z) {
    var F = $jscomp.checkStringArgs(this, w, "startsWith");
    w += "";
    var K = F.length,
      H = w.length;
    z = Math.max(0, Math.min(z | 0, F.length));
    for (var Y = 0; Y < H && z < K;)
      if (F[z++] != w[Y++]) return !1;
    return Y >= H
  }
}, "es6", "es3");
$jscomp.initSymbol = function() {};
$jscomp.polyfill("Symbol", function(u) {
  if (u) return u;
  var w = function(H, Y) {
    this.$jscomp$symbol$id_ = H;
    $jscomp.defineProperty(this, "description", {
      configurable: !0,
      writable: !0,
      value: Y
    })
  };
  w.prototype.toString = function() {
    return this.$jscomp$symbol$id_
  };
  u = 1E9 * Math.random() >>> 0;
  var z = "jscomp_symbol_" + u + "_",
    F = 0,
    K = function(H) {
      if (this instanceof K) throw new TypeError("Symbol is not a constructor");
      return new w(z + (H || "") + "_" + F++, H)
    };
  return K
}, "es6", "es3");
$jscomp.polyfill("Symbol.iterator", function(u) {
    if (u) return u;
    u = Symbol("Symbol.iterator");
    for (var w = "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "), z = 0; z < w.length; z++) {
      var F = $jscomp.global[w[z]];
      "function" === typeof F && "function" != typeof F.prototype[u] && $jscomp.defineProperty(F.prototype, u, {
        configurable: !0,
        writable: !0,
        value: function() {
          return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this))
        }
      })
    }
    return u
  }, "es6",
  "es3");
$jscomp.iteratorPrototype = function(u) {
  u = {
    next: u
  };
  u[Symbol.iterator] = function() {
    return this
  };
  return u
};
$jscomp.iteratorFromArray = function(u, w) {
  u instanceof String && (u += "");
  var z = 0,
    F = !1,
    K = {
      next: function() {
        if (!F && z < u.length) {
          var H = z++;
          return {
            value: w(H, u[H]),
            done: !1
          }
        }
        F = !0;
        return {
          done: !0,
          value: void 0
        }
      }
    };
  K[Symbol.iterator] = function() {
    return K
  };
  return K
};
$jscomp.polyfill("Array.prototype.keys", function(u) {
  return u ? u : u = function() {
    return $jscomp.iteratorFromArray(this, function(w) {
      return w
    })
  }
}, "es6", "es3");
$jscomp.polyfill("Array.prototype.values", function(u) {
  return u ? u : u = function() {
    return $jscomp.iteratorFromArray(this, function(w, z) {
      return z
    })
  }
}, "es8", "es3");
$jscomp.polyfill("Object.is", function(u) {
  return u ? u : u = function(w, z) {
    return w === z ? 0 !== w || 1 / w === 1 / z : w !== w && z !== z
  }
}, "es6", "es3");
$jscomp.polyfill("Array.prototype.includes", function(u) {
  return u ? u : u = function(w, z) {
    var F = this;
    F instanceof String && (F = String(F));
    var K = F.length;
    z = z || 0;
    for (0 > z && (z = Math.max(z + K, 0)); z < K; z++) {
      var H = F[z];
      if (H === w || Object.is(H, w)) return !0
    }
    return !1
  }
}, "es7", "es3");
$jscomp.polyfill("String.prototype.includes", function(u) {
  return u ? u : u = function(w, z) {
    var F = $jscomp.checkStringArgs(this, w, "includes");
    return -1 !== F.indexOf(w, z || 0)
  }
}, "es6", "es3");
$jscomp.polyfill("Math.fround", function(u) {
  if (u) return u;
  if ($jscomp.SIMPLE_FROUND_POLYFILL || "function" !== typeof Float32Array) return function(z) {
    return z
  };
  var w = new Float32Array(1);
  return u = function(z) {
    w[0] = z;
    return w[0]
  }
}, "es6", "es3");
$jscomp.polyfill("Math.clz32", function(u) {
  return u ? u : u = function(w) {
    w = Number(w) >>> 0;
    if (0 === w) return 32;
    var z = 0;
    0 === (w & 4294901760) && (w <<= 16, z += 16);
    0 === (w & 4278190080) && (w <<= 8, z += 8);
    0 === (w & 4026531840) && (w <<= 4, z += 4);
    0 === (w & 3221225472) && (w <<= 2, z += 2);
    0 === (w & 2147483648) && z++;
    return z
  }
}, "es6", "es3");
var inkLoadWasmModule = function() {
  var u = "undefined" !== typeof document && document.currentScript ? document.currentScript.src : void 0;
  "undefined" !== typeof __filename && (u = u || __filename);
  return function(w) {
    function z(a) {
      return f.locateFile ? f.locateFile(a, ha) : ha + a
    }

    function F() {
      var a = Ya.buffer;
      f.HEAP8 = T = new Int8Array(a);
      f.HEAP16 = na = new Int16Array(a);
      f.HEAP32 = q = new Int32Array(a);
      f.HEAPU8 = I = new Uint8Array(a);
      f.HEAPU16 = Ga = new Uint16Array(a);
      f.HEAPU32 = P = new Uint32Array(a);
      f.HEAPF32 = D = new Float32Array(a);
      f.HEAPF64 =
        Za = new Float64Array(a)
    }

    function K(a) {
      if (f.onAbort) f.onAbort(a);
      a = "Aborted(" + a + ")";
      ia(a);
      ua = !0;
      Ha = 1;
      a += ". Build with -sASSERTIONS for more info.";
      a = new WebAssembly.RuntimeError(a);
      $a(a);
      throw a;
    }

    function H(a) {
      try {
        if (a == Ia && Ja) return new Uint8Array(Ja);
        if (vb) return vb(a);
        throw "both async and sync fetching of the wasm failed";
      } catch (b) {
        K(b)
      }
    }

    function Y(a) {
      if (!Ja && (Vb || va)) {
        if ("function" == typeof fetch && !a.startsWith("file://")) return fetch(a, {
          credentials: "same-origin"
        }).then(function(b) {
          if (!b.ok) throw "failed to load wasm binary file at '" +
            a + "'";
          return b.arrayBuffer()
        }).catch(function() {
          return H(a)
        });
        if (wb) return new Promise(function(b, c) {
          wb(a, function(d) {
            return b(new Uint8Array(d))
          }, c)
        })
      }
      return Promise.resolve().then(function() {
        return H(a)
      })
    }

    function A(a, b, c) {
      return Y(a).then(function(d) {
        return WebAssembly.instantiate(d, b)
      }).then(function(d) {
        return d
      }).then(c, function(d) {
        ia("failed to asynchronously prepare wasm: " + d);
        K(d)
      })
    }

    function G(a, b, c, d) {
      return a || "function" != typeof WebAssembly.instantiateStreaming || b.startsWith("data:application/octet-stream;base64,") ||
        b.startsWith("file://") || wa || "function" != typeof fetch ? A(b, c, d) : fetch(b, {
          credentials: "same-origin"
        }).then(function(e) {
          e = WebAssembly.instantiateStreaming(e, c);
          return e.then(d, function(g) {
            ia("wasm streaming compile failed: " + g);
            ia("falling back to ArrayBuffer instantiation");
            return A(b, c, d)
          })
        })
    }

    function Q() {
      function a(d) {
        d = d.exports;
        f.asm = d;
        Ya = f.asm.Ff;
        F();
        Wb.unshift(f.asm.Gf);
        ra--;
        f.monitorRunDependencies && f.monitorRunDependencies(ra);
        if (0 == ra && (null !== xb && (clearInterval(xb), xb = null), Ka)) {
          var e = Ka;
          Ka = null;
          e()
        }
        return d
      }

      function b(d) {
        a(d.instance)
      }
      var c = {
        a: Xc
      };
      ra++;
      f.monitorRunDependencies && f.monitorRunDependencies(ra);
      if (f.instantiateWasm) try {
        return f.instantiateWasm(c, a)
      } catch (d) {
        ia("Module.instantiateWasm callback failed with error: " + d), $a(d)
      }
      G(Ja, Ia, c, b).catch($a);
      return {}
    }

    function V(a, b, c) {
      if ("object" === typeof globalThis && "object" === typeof globalThis.Module && "function" === typeof globalThis.Module.log) globalThis.Module.log(a, S(b), S(c));
      else {
        var d = [console.log, console.warn, console.error];
        d[a].call(console, S(b) + " " + S(c) + "\n")
      }
    }

    function Z() {
      return "undefined" !== typeof wasmOffsetConverter
    }

    function ta(a) {
      this.name = "ExitStatus";
      this.message = "Program terminated with exit(" + a + ")";
      this.status = a
    }

    function aa(a) {
      for (; 0 < a.length;) a.shift()(f)
    }

    function fa(a, b, c) {
      c = b + c;
      for (var d = ""; !(b >= c);) {
        var e = a[b++];
        if (!e) break;
        if (e & 128) {
          var g = a[b++] & 63;
          if (192 == (e & 224)) d += String.fromCharCode((e & 31) << 6 | g);
          else {
            var h = a[b++] & 63;
            e = 224 == (e & 240) ? (e & 15) << 12 | g << 6 | h : (e & 7) << 18 | g << 12 | h << 6 | a[b++] & 63;
            65536 > e ? d += String.fromCharCode(e) :
              (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023))
          }
        } else d += String.fromCharCode(e)
      }
      return d
    }

    function S(a, b) {
      return a ? fa(I, a, b) : ""
    }

    function Fa() {}

    function La(a) {
      for (; a.length;) {
        var b = a.pop(),
          c = a.pop();
        c(b)
      }
    }

    function xa(a) {
      return this.fromWireType(q[a >> 2])
    }

    function Xb(a) {
      if (void 0 === a) return "_unknown";
      a = a.replace(/[^a-zA-Z0-9_]/g, "$");
      var b = a.charCodeAt(0);
      return 48 <= b && 57 >= b ? "_" + a : a
    }

    function yb(a, b) {
      a = Xb(a);
      var c = {};
      return (c[a] = function() {
        return b.apply(this, arguments)
      }, c)[a]
    }

    function zb(a,
      b) {
      var c = yb(b, function(d) {
        this.name = b;
        this.message = d;
        d = Error(d).stack;
        void 0 !== d && (this.stack = this.toString() + "\n" + d.replace(/^Error(:[^\n]*)?\n/, ""))
      });
      c.prototype = Object.create(a.prototype);
      c.prototype.constructor = c;
      c.prototype.toString = function() {
        return void 0 === this.message ? this.name : this.name + ": " + this.message
      };
      return c
    }

    function ab(a) {
      throw new Yb(a);
    }

    function ja(a, b, c) {
      function d(l) {
        l = c(l);
        l.length !== a.length && ab("Mismatched type converter count");
        for (var p = 0; p < a.length; ++p) ka(a[p], l[p])
      }
      a.forEach(function(l) {
        bb[l] =
          b
      });
      var e = Array(b.length),
        g = [],
        h = 0;
      b.forEach(function(l, p) {
        sa.hasOwnProperty(l) ? e[p] = sa[l] : (g.push(l), ya.hasOwnProperty(l) || (ya[l] = []), ya[l].push(function() {
          e[p] = sa[l];
          ++h;
          h === g.length && d(e)
        }))
      });
      0 === g.length && d(e)
    }

    function Yc(a) {
      var b = cb[a];
      delete cb[a];
      var c = b.elements,
        d = c.length,
        e = c.map(function(l) {
          return l.getterReturnType
        }).concat(c.map(function(l) {
          return l.setterArgumentType
        })),
        g = b.rawConstructor,
        h = b.rawDestructor;
      ja([a], e, function(l) {
        c.forEach(function(p, t) {
          var v = l[t],
            C = p.getter,
            L = p.getterContext,
            n = l[t + d],
            x = p.setter,
            B = p.setterContext;
          p.read = function(M) {
            return v.fromWireType(C(L, M))
          };
          p.write = function(M, y) {
            var R = [];
            x(B, M, n.toWireType(R, y));
            La(R)
          }
        });
        return [{
          name: b.name,
          fromWireType: function(p) {
            for (var t = Array(d), v = 0; v < d; ++v) t[v] = c[v].read(p);
            h(p);
            return t
          },
          toWireType: function(p, t) {
            if (d !== t.length) throw new TypeError("Incorrect number of tuple elements for " + b.name + ": expected=" + d + ", actual=" + t.length);
            for (var v = g(), C = 0; C < d; ++C) c[C].write(v, t[C]);
            null !== p && p.push(h, v);
            return v
          },
          argPackAdvance: 8,
          readValueFromPointer: xa,
          destructorFunction: h
        }]
      })
    }

    function Zc(a) {
      var b = db[a];
      delete db[a];
      var c = b.rawConstructor,
        d = b.rawDestructor,
        e = b.fields,
        g = e.map(function(h) {
          return h.getterReturnType
        }).concat(e.map(function(h) {
          return h.setterArgumentType
        }));
      ja([a], g, function(h) {
        var l = {};
        e.forEach(function(p, t) {
          var v = p.fieldName,
            C = h[t],
            L = p.getter,
            n = p.getterContext,
            x = h[t + e.length],
            B = p.setter,
            M = p.setterContext;
          l[v] = {
            read: function(y) {
              return C.fromWireType(L(n, y))
            },
            write: function(y, R) {
              var ca = [];
              B(M, y, x.toWireType(ca,
                R));
              La(ca)
            }
          }
        });
        return [{
          name: b.name,
          fromWireType: function(p) {
            var t = {},
              v;
            for (v in l) t[v] = l[v].read(p);
            d(p);
            return t
          },
          toWireType: function(p, t) {
            for (var v in l)
              if (!(v in t)) throw new TypeError('Missing field: "' + v + '"');
            var C = c();
            for (v in l) l[v].write(C, t[v]);
            null !== p && p.push(d, C);
            return C
          },
          argPackAdvance: 8,
          readValueFromPointer: xa,
          destructorFunction: d
        }]
      })
    }

    function $c() {}

    function eb(a) {
      switch (a) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError("Unknown type size: " +
            a);
      }
    }

    function ad() {
      for (var a = Array(256), b = 0; 256 > b; ++b) a[b] = String.fromCharCode(b);
      Zb = a
    }

    function W(a) {
      for (var b = ""; I[a];) b += Zb[I[a++]];
      return b
    }

    function O(a) {
      throw new za(a);
    }

    function ka(a, b, c) {
      c = void 0 === c ? {} : c;
      if (!("argPackAdvance" in b)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
      var d = b.name;
      a || O('type "' + d + '" must have a positive integer typeid pointer');
      if (sa.hasOwnProperty(a)) {
        if (c.ignoreDuplicateRegistrations) return;
        O("Cannot register type '" + d + "' twice")
      }
      sa[a] =
        b;
      delete bb[a];
      ya.hasOwnProperty(a) && (b = ya[a], delete ya[a], b.forEach(function(e) {
        return e()
      }))
    }

    function bd(a, b, c, d, e) {
      var g = eb(c);
      b = W(b);
      ka(a, {
        name: b,
        fromWireType: function(h) {
          return !!h
        },
        toWireType: function(h, l) {
          return l ? d : e
        },
        argPackAdvance: 8,
        readValueFromPointer: function(h) {
          if (1 === c) var l = T;
          else if (2 === c) l = na;
          else if (4 === c) l = q;
          else throw new TypeError("Unknown boolean type size: " + b);
          return this.fromWireType(l[h >> g])
        },
        destructorFunction: null
      })
    }

    function cd(a) {
      if (!(this instanceof oa && a instanceof oa)) return !1;
      var b = this.$$.ptrType.registeredClass,
        c = this.$$.ptr,
        d = a.$$.ptrType.registeredClass;
      for (a = a.$$.ptr; b.baseClass;) c = b.upcast(c), b = b.baseClass;
      for (; d.baseClass;) a = d.upcast(a), d = d.baseClass;
      return b === d && c === a
    }

    function Ab(a) {
      O(a.$$.ptrType.registeredClass.name + " instance already deleted")
    }

    function $b() {}

    function ac(a) {
      --a.count.value;
      var b = 0 === a.count.value;
      b && (a.smartPtr ? a.smartPtrType.rawDestructor(a.smartPtr) : a.ptrType.registeredClass.rawDestructor(a.ptr))
    }

    function bc(a, b, c) {
      if (b === c) return a;
      if (void 0 ===
        c.baseClass) return null;
      a = bc(a, b, c.baseClass);
      return null === a ? null : c.downcast(a)
    }

    function dd() {
      return Object.keys(Ma).length
    }

    function ed() {
      var a = [],
        b;
      for (b in Ma) Ma.hasOwnProperty(b) && a.push(Ma[b]);
      return a
    }

    function Bb() {
      for (; Na.length;) {
        var a = Na.pop();
        a.$$.deleteScheduled = !1;
        a["delete"]()
      }
    }

    function fd(a) {
      Oa = a;
      Na.length && Oa && Oa(Bb)
    }

    function gd(a, b) {
      for (void 0 === b && O("ptr should not be undefined"); a.baseClass;) b = a.upcast(b), a = a.baseClass;
      return Ma[b]
    }

    function fb(a, b) {
      b.ptrType && b.ptr || ab("makeClassHandle requires ptr and ptrType");
      var c = !!b.smartPtrType,
        d = !!b.smartPtr;
      c !== d && ab("Both smartPtrType and smartPtr must be specified");
      b.count = {
        value: 1
      };
      return Pa(Object.create(a, {
        $$: {
          value: b
        }
      }))
    }

    function hd(a) {
      function b() {
        return this.isSmartPointer ? fb(this.registeredClass.instancePrototype, {
          ptrType: this.pointeeType,
          ptr: c,
          smartPtrType: this,
          smartPtr: a
        }) : fb(this.registeredClass.instancePrototype, {
          ptrType: this,
          ptr: a
        })
      }
      var c = this.getPointee(a);
      if (!c) return this.destructor(a), null;
      var d = gd(this.registeredClass, c);
      if (void 0 !== d) {
        if (0 ===
          d.$$.count.value) return d.$$.ptr = c, d.$$.smartPtr = a, d.clone();
        d = d.clone();
        this.destructor(a);
        return d
      }
      d = this.registeredClass.getActualType(c);
      d = cc[d];
      if (!d) return b.call(this);
      d = this.isConst ? d.constPointerType : d.pointerType;
      var e = bc(c, this.registeredClass, d.registeredClass);
      return null === e ? b.call(this) : this.isSmartPointer ? fb(d.registeredClass.instancePrototype, {
        ptrType: d,
        ptr: e,
        smartPtrType: this,
        smartPtr: a
      }) : fb(d.registeredClass.instancePrototype, {
        ptrType: d,
        ptr: e
      })
    }

    function Pa(a) {
      if ("undefined" === typeof FinalizationRegistry) return Pa =
        function(b) {
          return b
        }, a;
      Cb = new FinalizationRegistry(function(b) {
        ac(b.$$)
      });
      Pa = function(b) {
        var c = b.$$,
          d = !!c.smartPtr;
        d && (c = {
          $$: c
        }, Cb.register(b, c, b));
        return b
      };
      $b = function(b) {
        return Cb.unregister(b)
      };
      return Pa(a)
    }

    function id() {
      this.$$.ptr || Ab(this);
      if (this.$$.preservePointerOnDelete) return this.$$.count.value += 1, this;
      var a = Pa,
        b = Object,
        c = b.create,
        d = Object.getPrototypeOf(this);
      var e = this.$$;
      e = {
        count: e.count,
        deleteScheduled: e.deleteScheduled,
        preservePointerOnDelete: e.preservePointerOnDelete,
        ptr: e.ptr,
        ptrType: e.ptrType,
        smartPtr: e.smartPtr,
        smartPtrType: e.smartPtrType
      };
      a = a(c.call(b, d, {
        $$: {
          value: e
        }
      }));
      a.$$.count.value += 1;
      a.$$.deleteScheduled = !1;
      return a
    }

    function jd() {
      this.$$.ptr || Ab(this);
      this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && O("Object already scheduled for deletion");
      $b(this);
      ac(this.$$);
      this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0)
    }

    function kd() {
      return !this.$$.ptr
    }

    function ld() {
      this.$$.ptr || Ab(this);
      this.$$.deleteScheduled && !this.$$.preservePointerOnDelete &&
        O("Object already scheduled for deletion");
      Na.push(this);
      1 === Na.length && Oa && Oa(Bb);
      this.$$.deleteScheduled = !0;
      return this
    }

    function oa() {}

    function dc(a, b, c) {
      if (void 0 === a[b].overloadTable) {
        var d = a[b];
        a[b] = function() {
          a[b].overloadTable.hasOwnProperty(arguments.length) || O("Function '" + c + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + a[b].overloadTable + ")!");
          return a[b].overloadTable[arguments.length].apply(this, arguments)
        };
        a[b].overloadTable = [];
        a[b].overloadTable[d.argCount] =
          d
      }
    }

    function Db(a, b, c) {
      f.hasOwnProperty(a) ? ((void 0 === c || void 0 !== f[a].overloadTable && void 0 !== f[a].overloadTable[c]) && O("Cannot register public name '" + a + "' twice"), dc(f, a, a), f.hasOwnProperty(c) && O("Cannot register multiple overloads of a function with the same number of arguments (" + c + ")!"), f[a].overloadTable[c] = b) : (f[a] = b, void 0 !== c && (f[a].numArguments = c))
    }

    function md(a, b, c, d, e, g, h, l) {
      this.name = a;
      this.constructor = b;
      this.instancePrototype = c;
      this.rawDestructor = d;
      this.baseClass = e;
      this.getActualType =
        g;
      this.upcast = h;
      this.downcast = l;
      this.pureVirtualFunctions = []
    }

    function gb(a, b, c) {
      for (; b !== c;) b.upcast || O("Expected null or instance of " + c.name + ", got an instance of " + b.name), a = b.upcast(a), b = b.baseClass;
      return a
    }

    function nd(a, b) {
      if (null === b) return this.isReference && O("null is not a valid " + this.name), 0;
      b.$$ || O('Cannot pass "' + Eb(b) + '" as a ' + this.name);
      b.$$.ptr || O("Cannot pass deleted object as a pointer of type " + this.name);
      a = b.$$.ptrType.registeredClass;
      return b = gb(b.$$.ptr, a, this.registeredClass)
    }

    function od(a, b) {
      if (null === b) {
        this.isReference && O("null is not a valid " + this.name);
        if (this.isSmartPointer) {
          var c = this.rawConstructor();
          null !== a && a.push(this.rawDestructor, c);
          return c
        }
        return 0
      }
      b.$$ || O('Cannot pass "' + Eb(b) + '" as a ' + this.name);
      b.$$.ptr || O("Cannot pass deleted object as a pointer of type " + this.name);
      !this.isConst && b.$$.ptrType.isConst && O("Cannot convert argument of type " + (b.$$.smartPtrType ? b.$$.smartPtrType.name : b.$$.ptrType.name) + " to parameter type " + this.name);
      c = b.$$.ptrType.registeredClass;
      c = gb(b.$$.ptr, c, this.registeredClass);
      if (this.isSmartPointer) switch (void 0 === b.$$.smartPtr && O("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
        case 0:
          b.$$.smartPtrType === this ? c = b.$$.smartPtr : O("Cannot convert argument of type " + (b.$$.smartPtrType ? b.$$.smartPtrType.name : b.$$.ptrType.name) + " to parameter type " + this.name);
          break;
        case 1:
          c = b.$$.smartPtr;
          break;
        case 2:
          if (b.$$.smartPtrType === this) c = b.$$.smartPtr;
          else {
            var d = b.clone();
            c = this.rawShare(c, U.toHandle(function() {
              d["delete"]()
            }));
            null !== a && a.push(this.rawDestructor, c)
          }
          break;
        default:
          O("Unsupporting sharing policy")
      }
      return c
    }

    function pd(a, b) {
      if (null === b) return this.isReference && O("null is not a valid " + this.name), 0;
      b.$$ || O('Cannot pass "' + Eb(b) + '" as a ' + this.name);
      b.$$.ptr || O("Cannot pass deleted object as a pointer of type " + this.name);
      b.$$.ptrType.isConst && O("Cannot convert argument of type " + b.$$.ptrType.name + " to parameter type " + this.name);
      a = b.$$.ptrType.registeredClass;
      return b = gb(b.$$.ptr, a, this.registeredClass)
    }

    function qd(a) {
      this.rawGetPointee &&
        (a = this.rawGetPointee(a));
      return a
    }

    function rd(a) {
      this.rawDestructor && this.rawDestructor(a)
    }

    function sd(a) {
      if (null !== a) a["delete"]()
    }

    function la(a, b, c, d, e, g, h, l, p, t, v) {
      this.name = a;
      this.registeredClass = b;
      this.isReference = c;
      this.isConst = d;
      this.isSmartPointer = e;
      this.pointeeType = g;
      this.sharingPolicy = h;
      this.rawGetPointee = l;
      this.rawConstructor = p;
      this.rawShare = t;
      this.rawDestructor = v;
      e || void 0 !== b.baseClass ? this.toWireType = od : (this.toWireType = d ? nd : pd, this.destructorFunction = null)
    }

    function ec(a, b, c) {
      f.hasOwnProperty(a) ||
        ab("Replacing nonexistant public symbol");
      void 0 !== f[a].overloadTable && void 0 !== c ? f[a].overloadTable[c] = b : (f[a] = b, f[a].argCount = c)
    }

    function td(a, b) {
      var c = [];
      return function() {
        c.length = 0;
        Object.assign(c, arguments);
        var d = b;
        var e = f["dynCall_" + a];
        return d = c && c.length ? e.apply(null, [d].concat(c)) : e.call(null, d)
      }
    }

    function X(a, b) {
      a = W(a);
      var c = td(a, b);
      "function" != typeof c && O("unknown function pointer with signature " + a + ": " + b);
      return c
    }

    function fc(a) {
      a = gc(a);
      var b = W(a);
      ma(a);
      return b
    }

    function Aa(a, b) {
      function c(g) {
        e[g] ||
          sa[g] || (bb[g] ? bb[g].forEach(c) : (d.push(g), e[g] = !0))
      }
      var d = [],
        e = {};
      b.forEach(c);
      throw new hc(a + ": " + d.map(fc).join([", "]));
    }

    function ud(a, b, c, d, e, g, h, l, p, t, v, C, L) {
      v = W(v);
      g = X(e, g);
      l && (l = X(h, l));
      t && (t = X(p, t));
      L = X(C, L);
      var n = Xb(v);
      Db(n, function() {
        Aa("Cannot construct " + v + " due to unbound types", [d])
      });
      ja([a, b, c], d ? [d] : [], function(x) {
        x = x[0];
        if (d) {
          var B = x.registeredClass;
          var M = B.instancePrototype
        } else M = oa.prototype;
        x = yb(n, function() {
          if (Object.getPrototypeOf(this) !== y) throw new za("Use 'new' to construct " +
            v);
          if (void 0 === R.constructor_body) throw new za(v + " has no accessible constructor");
          var ic = R.constructor_body[arguments.length];
          if (void 0 === ic) throw new za("Tried to invoke ctor of " + v + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(R.constructor_body).toString() + ") parameters instead!");
          return ic.apply(this, arguments)
        });
        var y = Object.create(M, {
          constructor: {
            value: x
          }
        });
        x.prototype = y;
        var R = new md(v, x, y, L, B, g, l, t);
        R.baseClass && (void 0 === R.baseClass.__derivedClasses &&
          (R.baseClass.__derivedClasses = []), R.baseClass.__derivedClasses.push(R));
        B = new la(v, R, !0, !1, !1);
        M = new la(v + "*", R, !1, !1, !1);
        var ca = new la(v + " const*", R, !1, !0, !1);
        cc[a] = {
          pointerType: M,
          constPointerType: ca
        };
        ec(n, x);
        return [B, M, ca]
      })
    }

    function Fb(a, b) {
      for (var c = [], d = 0; d < a; d++) c.push(P[b + 4 * d >> 2]);
      return c
    }

    function Gb(a, b, c, d, e) {
      var g = b.length;
      2 > g && O("argTypes array size mismatch! Must at least get return value and 'this' types!");
      var h = null !== b[1] && null !== c,
        l = !1;
      for (c = 1; c < b.length; ++c)
        if (null !== b[c] && void 0 ===
          b[c].destructorFunction) {
          l = !0;
          break
        } var p = "void" !== b[0].name,
        t = g - 2,
        v = Array(t),
        C = [],
        L = [];
      return function() {
        arguments.length !== t && O("function " + a + " called with " + arguments.length + " arguments, expected " + t + " args!");
        L.length = 0;
        C.length = h ? 2 : 1;
        C[0] = e;
        if (h) {
          var n = b[1].toWireType(L, this);
          C[1] = n
        }
        for (var x = 0; x < t; ++x) v[x] = b[x + 2].toWireType(L, arguments[x]), C.push(v[x]);
        x = d.apply(null, C);
        if (l) La(L);
        else
          for (var B = h ? 1 : 2; B < b.length; B++) {
            var M = 1 === B ? n : v[B - 2];
            null !== b[B].destructorFunction && b[B].destructorFunction(M)
          }
        n =
          p ? b[0].fromWireType(x) : void 0;
        return n
      }
    }

    function vd(a, b, c, d, e, g) {
      var h = Fb(b, c);
      e = X(d, e);
      ja([], [a], function(l) {
        l = l[0];
        var p = "constructor " + l.name;
        void 0 === l.registeredClass.constructor_body && (l.registeredClass.constructor_body = []);
        if (void 0 !== l.registeredClass.constructor_body[b - 1]) throw new za("Cannot register multiple constructors with identical number of parameters (" + (b - 1) + ") for class '" + l.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
        l.registeredClass.constructor_body[b - 1] = function() {
          Aa("Cannot construct " + l.name + " due to unbound types", h)
        };
        ja([], h, function(t) {
          t.splice(1, 0, null);
          l.registeredClass.constructor_body[b - 1] = Gb(p, t, null, e, g);
          return []
        });
        return []
      })
    }

    function wd(a, b, c, d, e, g, h, l, p) {
      var t = Fb(c, d);
      b = W(b);
      g = X(e, g);
      ja([], [a], function(v) {
        function C() {
          Aa("Cannot call " + L + " due to unbound types", t)
        }
        v = v[0];
        var L = v.name + "." + b;
        b.startsWith("@@") && (b = Symbol[b.substring(2)]);
        l && v.registeredClass.pureVirtualFunctions.push(b);
        var n = v.registeredClass.instancePrototype,
          x = n[b];
        void 0 === x || void 0 === x.overloadTable && x.className !== v.name && x.argCount === c - 2 ? (C.argCount = c - 2, C.className = v.name, n[b] = C) : (dc(n, b, L), n[b].overloadTable[c - 2] = C);
        ja([], t, function(B) {
          B = Gb(L, B, v, g, h, p);
          void 0 === n[b].overloadTable ? (B.argCount = c - 2, n[b] = B) : n[b].overloadTable[c - 2] = B;
          return []
        });
        return []
      })
    }

    function jc(a, b, c) {
      a instanceof Object || O(c + ' with invalid "this": ' + a);
      a instanceof b.registeredClass.constructor || O(c + ' incompatible with "this" of type ' + a.constructor.name);
      a.$$.ptr || O("cannot call emscripten binding method " +
        c + " on deleted object");
      return gb(a.$$.ptr, a.$$.ptrType.registeredClass, b.registeredClass)
    }

    function xd(a, b, c, d, e, g, h, l, p, t) {
      b = W(b);
      e = X(d, e);
      ja([], [a], function(v) {
        v = v[0];
        var C = v.name + "." + b,
          L = {
            get: function() {
              Aa("Cannot access " + C + " due to unbound types", [c, h])
            },
            enumerable: !0,
            configurable: !0
          };
        L.set = p ? function() {
          Aa("Cannot access " + C + " due to unbound types", [c, h])
        } : function() {
          O(C + " is a read-only property")
        };
        Object.defineProperty(v.registeredClass.instancePrototype, b, L);
        ja([], p ? [c, h] : [c], function(n) {
          var x =
            n[0],
            B = {
              get: function() {
                var y = jc(this, v, C + " getter");
                return x.fromWireType(e(g, y))
              },
              enumerable: !0
            };
          if (p) {
            p = X(l, p);
            var M = n[1];
            B.set = function(y) {
              var R = jc(this, v, C + " setter"),
                ca = [];
              p(t, R, M.toWireType(ca, y));
              La(ca)
            }
          }
          Object.defineProperty(v.registeredClass.instancePrototype, b, B);
          return []
        });
        return []
      })
    }

    function yd() {
      this.allocated = [void 0];
      this.freelist = [];
      this.get = function(a) {
        return this.allocated[a]
      };
      this.has = function(a) {
        return void 0 !== this.allocated[a]
      };
      this.allocate = function(a) {
        var b = this.freelist.pop() ||
          this.allocated.length;
        this.allocated[b] = a;
        return b
      };
      this.free = function(a) {
        this.allocated[a] = void 0;
        this.freelist.push(a)
      }
    }

    function Hb(a) {
      a >= da.reserved && 0 === --da.get(a).refcount && da.free(a)
    }

    function zd() {
      for (var a = 0, b = da.reserved; b < da.allocated.length; ++b) void 0 !== da.allocated[b] && ++a;
      return a
    }

    function Ad(a, b) {
      b = W(b);
      ka(a, {
        name: b,
        fromWireType: function(c) {
          var d = U.toValue(c);
          Hb(c);
          return d
        },
        toWireType: function(c, d) {
          return U.toHandle(d)
        },
        argPackAdvance: 8,
        readValueFromPointer: xa,
        destructorFunction: null
      })
    }

    function Bd(a, b, c) {
      switch (b) {
        case 0:
          return function(d) {
            var e = c ? T : I;
            return this.fromWireType(e[d])
          };
        case 1:
          return function(d) {
            var e = c ? na : Ga;
            return this.fromWireType(e[d >> 1])
          };
        case 2:
          return function(d) {
            var e = c ? q : P;
            return this.fromWireType(e[d >> 2])
          };
        default:
          throw new TypeError("Unknown integer type: " + a);
      }
    }

    function Cd(a, b, c, d) {
      function e() {}
      c = eb(c);
      b = W(b);
      e.values = {};
      ka(a, {
        name: b,
        constructor: e,
        fromWireType: function(g) {
          return this.constructor.values[g]
        },
        toWireType: function(g, h) {
          return h.value
        },
        argPackAdvance: 8,
        readValueFromPointer: Bd(b, c, d),
        destructorFunction: null
      });
      Db(b, e)
    }

    function Qa(a, b) {
      var c = sa[a];
      void 0 === c && O(b + " has unknown type " + fc(a));
      return c
    }

    function Dd(a, b, c) {
      var d = Qa(a, "enum");
      b = W(b);
      a = d.constructor;
      d = Object.create(d.constructor.prototype, {
        value: {
          value: c
        },
        constructor: {
          value: yb(d.name + "_" + b, function() {})
        }
      });
      a.values[c] = d;
      a[b] = d
    }

    function Eb(a) {
      if (null === a) return "null";
      var b = typeof a;
      return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a
    }

    function Ed(a, b) {
      switch (b) {
        case 2:
          return function(c) {
            return this.fromWireType(D[c >>
              2])
          };
        case 3:
          return function(c) {
            return this.fromWireType(Za[c >> 3])
          };
        default:
          throw new TypeError("Unknown float type: " + a);
      }
    }

    function Fd(a, b, c) {
      c = eb(c);
      b = W(b);
      ka(a, {
        name: b,
        fromWireType: function(d) {
          return d
        },
        toWireType: function(d, e) {
          return e
        },
        argPackAdvance: 8,
        readValueFromPointer: Ed(b, c),
        destructorFunction: null
      })
    }

    function Gd(a, b, c, d, e, g, h) {
      var l = Fb(b, c);
      a = W(a);
      e = X(d, e);
      Db(a, function() {
        Aa("Cannot call " + a + " due to unbound types", l)
      }, b - 1);
      ja([], l, function(p) {
        p = [p[0], null].concat(p.slice(1));
        ec(a, Gb(a,
          p, null, e, g, h), b - 1);
        return []
      })
    }

    function Hd(a, b, c) {
      switch (b) {
        case 0:
          return c ? function(d) {
            return T[d]
          } : function(d) {
            return I[d]
          };
        case 1:
          return c ? function(d) {
            return na[d >> 1]
          } : function(d) {
            return Ga[d >> 1]
          };
        case 2:
          return c ? function(d) {
            return q[d >> 2]
          } : function(d) {
            return P[d >> 2]
          };
        default:
          throw new TypeError("Unknown integer type: " + a);
      }
    }

    function Id(a, b, c, d, e) {
      b = W(b); - 1 === e && (e = 4294967295);
      e = eb(c);
      var g = function(l) {
        return l
      };
      if (0 === d) {
        var h = 32 - 8 * c;
        g = function(l) {
          return l << h >>> h
        }
      }
      c = (c = b.includes("unsigned")) ?
        function(l, p) {
          return p >>> 0
        } : function(l, p) {
          return p
        };
      ka(a, {
        name: b,
        fromWireType: g,
        toWireType: c,
        argPackAdvance: 8,
        readValueFromPointer: Hd(b, e, 0 !== d),
        destructorFunction: null
      })
    }

    function Jd(a, b, c) {
      function d(h) {
        h >>= 2;
        var l = P,
          p = l[h];
        h = l[h + 1];
        return new g(l.buffer, h, p)
      }
      var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array],
        g = e[b];
      c = W(c);
      ka(a, {
        name: c,
        fromWireType: d,
        argPackAdvance: 8,
        readValueFromPointer: d
      }, {
        ignoreDuplicateRegistrations: !0
      })
    }

    function ea(a, b, c, d) {
      if (!(0 <
          d)) return 0;
      var e = c;
      d = c + d - 1;
      for (var g = 0; g < a.length; ++g) {
        var h = a.charCodeAt(g);
        if (55296 <= h && 57343 >= h) {
          var l = a.charCodeAt(++g);
          h = 65536 + ((h & 1023) << 10) | l & 1023
        }
        if (127 >= h) {
          if (c >= d) break;
          b[c++] = h
        } else {
          if (2047 >= h) {
            if (c + 1 >= d) break;
            b[c++] = 192 | h >> 6
          } else {
            if (65535 >= h) {
              if (c + 2 >= d) break;
              b[c++] = 224 | h >> 12
            } else {
              if (c + 3 >= d) break;
              b[c++] = 240 | h >> 18;
              b[c++] = 128 | h >> 12 & 63
            }
            b[c++] = 128 | h >> 6 & 63
          }
          b[c++] = 128 | h & 63
        }
      }
      b[c] = 0;
      return c - e
    }

    function hb(a) {
      for (var b = 0, c = 0; c < a.length; ++c) {
        var d = a.charCodeAt(c);
        127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <=
          d && 57343 >= d ? (b += 4, ++c) : b += 3
      }
      return b
    }

    function Kd(a, b) {
      b = W(b);
      var c = "std::string" === b;
      ka(a, {
        name: b,
        fromWireType: function(d) {
          var e = P[d >> 2],
            g = d + 4;
          if (c)
            for (var h = g, l = 0; l <= e; ++l) {
              var p = g + l;
              if (l == e || 0 == I[p]) {
                var t = p - h;
                h = S(h, t);
                if (void 0 === v) var v = h;
                else v += String.fromCharCode(0), v += h;
                h = p + 1
              }
            } else {
              v = Array(e);
              for (l = 0; l < e; ++l) v[l] = String.fromCharCode(I[g + l]);
              v = v.join("")
            }
          ma(d);
          return v
        },
        toWireType: function(d, e) {
          e instanceof ArrayBuffer && (e = new Uint8Array(e));
          var g = "string" == typeof e;
          g || e instanceof Uint8Array ||
            e instanceof Uint8ClampedArray || e instanceof Int8Array || O("Cannot pass non-string to std::string");
          var h = c && g ? hb(e) : e.length;
          var l = Ra(4 + h + 1),
            p = l + 4;
          P[l >> 2] = h;
          if (c && g) ea(e, I, p, h + 1);
          else if (g)
            for (g = 0; g < h; ++g) {
              var t = e.charCodeAt(g);
              255 < t && (ma(p), O("String has UTF-16 code units that do not fit in 8 bits"));
              I[p + g] = t
            } else
              for (g = 0; g < h; ++g) I[p + g] = e[g];
          null !== d && d.push(ma, l);
          return l
        },
        argPackAdvance: 8,
        readValueFromPointer: xa,
        destructorFunction: function(d) {
          ma(d)
        }
      })
    }

    function Ld(a, b) {
      for (var c = "", d = 0; !(d >= b / 2); ++d) {
        var e =
          na[a + 2 * d >> 1];
        if (0 == e) break;
        c += String.fromCharCode(e)
      }
      return c
    }

    function Md(a, b, c) {
      void 0 === c && (c = 2147483647);
      if (2 > c) return 0;
      c -= 2;
      var d = b;
      c = c < 2 * a.length ? c / 2 : a.length;
      for (var e = 0; e < c; ++e) {
        var g = a.charCodeAt(e);
        na[b >> 1] = g;
        b += 2
      }
      na[b >> 1] = 0;
      return b - d
    }

    function Nd(a) {
      return 2 * a.length
    }

    function Od(a, b) {
      for (var c = 0, d = ""; !(c >= b / 4);) {
        var e = q[a + 4 * c >> 2];
        if (0 == e) break;
        ++c;
        65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e)
      }
      return d
    }

    function Pd(a, b, c) {
      void 0 === c && (c = 2147483647);
      if (4 > c) return 0;
      var d = b;
      c = d + c - 4;
      for (var e = 0; e < a.length; ++e) {
        var g = a.charCodeAt(e);
        if (55296 <= g && 57343 >= g) {
          var h = a.charCodeAt(++e);
          g = 65536 + ((g & 1023) << 10) | h & 1023
        }
        q[b >> 2] = g;
        b += 4;
        if (b + 4 > c) break
      }
      q[b >> 2] = 0;
      return b - d
    }

    function Qd(a) {
      for (var b = 0, c = 0; c < a.length; ++c) {
        var d = a.charCodeAt(c);
        55296 <= d && 57343 >= d && ++c;
        b += 4
      }
      return b
    }

    function Rd(a, b, c) {
      c = W(c);
      if (2 === b) {
        var d = Ld;
        var e = Md;
        var g = Nd;
        var h = function() {
          return Ga
        };
        var l = 1
      } else 4 === b && (d = Od, e = Pd, g = Qd, h = function() {
        return P
      }, l = 2);
      ka(a, {
        name: c,
        fromWireType: function(p) {
          for (var t =
              P[p >> 2], v = h(), C, L = p + 4, n = 0; n <= t; ++n) {
            var x = p + 4 + n * b;
            if (n == t || 0 == v[x >> l]) {
              var B = x - L;
              L = d(L, B);
              void 0 === C ? C = L : (C += String.fromCharCode(0), C += L);
              L = x + b
            }
          }
          ma(p);
          return C
        },
        toWireType: function(p, t) {
          "string" != typeof t && O("Cannot pass non-string to C++ string type " + c);
          var v = g(t),
            C = Ra(4 + v + b);
          P[C >> 2] = v >> l;
          e(t, C + 4, v + b);
          null !== p && p.push(ma, C);
          return C
        },
        argPackAdvance: 8,
        readValueFromPointer: xa,
        destructorFunction: function(p) {
          ma(p)
        }
      })
    }

    function Sd(a, b, c, d, e, g) {
      cb[a] = {
        name: W(b),
        rawConstructor: X(c, d),
        rawDestructor: X(e,
          g),
        elements: []
      }
    }

    function Td(a, b, c, d, e, g, h, l, p) {
      cb[a].elements.push({
        getterReturnType: b,
        getter: X(c, d),
        getterContext: e,
        setterArgumentType: g,
        setter: X(h, l),
        setterContext: p
      })
    }

    function Ud(a, b, c, d, e, g) {
      db[a] = {
        name: W(b),
        rawConstructor: X(c, d),
        rawDestructor: X(e, g),
        fields: []
      }
    }

    function Vd(a, b, c, d, e, g, h, l, p, t) {
      db[a].fields.push({
        fieldName: W(b),
        getterReturnType: c,
        getter: X(d, e),
        getterContext: g,
        setterArgumentType: h,
        setter: X(l, p),
        setterContext: t
      })
    }

    function Wd(a, b) {
      b = W(b);
      ka(a, {
        isVoid: !0,
        name: b,
        argPackAdvance: 0,
        fromWireType: function() {},
        toWireType: function() {}
      })
    }

    function Xd() {
      return !0
    }

    function Yd() {
      throw Infinity;
    }

    function Zd(a, b, c) {
      a = U.toValue(a);
      b = Qa(b, "emval::as");
      var d = [],
        e = U.toHandle(d);
      P[c >> 2] = e;
      return b.toWireType(d, a)
    }

    function kc(a, b) {
      for (var c = Array(a), d = 0; d < a; ++d) c[d] = Qa(P[b + 4 * d >> 2], "parameter " + d);
      return c
    }

    function $d(a, b, c, d) {
      a = U.toValue(a);
      c = kc(b, c);
      for (var e = Array(b), g = 0; g < b; ++g) {
        var h = c[g];
        e[g] = h.readValueFromPointer(d);
        d += h.argPackAdvance
      }
      a = a.apply(void 0, e);
      return U.toHandle(a)
    }

    function ib(a) {
      var b = ae[a];
      return void 0 ===
        b ? W(a) : b
    }

    function be(a, b, c, d, e) {
      a = jb[a];
      b = U.toValue(b);
      c = ib(c);
      var g = [];
      P[d >> 2] = U.toHandle(g);
      d = g;
      return a(b, c, d, e)
    }

    function ce(a, b, c, d) {
      a = jb[a];
      b = U.toValue(b);
      c = ib(c);
      a(b, c, null, d)
    }

    function lc() {
      function a(b) {
        b.$$$embind_global$$$ = b;
        var c = "object" == typeof $$$embind_global$$$ && b.$$$embind_global$$$ == b;
        c || delete b.$$$embind_global$$$;
        return c
      }
      if ("object" == typeof globalThis) return globalThis;
      if ("object" == typeof $$$embind_global$$$) return $$$embind_global$$$;
      "object" == typeof global && a(global) ? $$$embind_global$$$ =
        global : "object" == typeof self && a(self) && ($$$embind_global$$$ = self);
      if ("object" == typeof $$$embind_global$$$) return $$$embind_global$$$;
      throw Error("unable to get global object.");
    }

    function de(a) {
      if (0 === a) return U.toHandle(lc());
      a = ib(a);
      return U.toHandle(lc()[a])
    }

    function ee(a) {
      var b = jb.length;
      jb.push(a);
      return b
    }

    function fe(a, b) {
      var c = kc(a, b),
        d = c[0];
      b = d.name + "_$" + c.slice(1).map(function(h) {
        return h.name
      }).join("_") + "$";
      var e = mc[b];
      if (void 0 !== e) return e;
      var g = Array(a - 1);
      e = function(h, l, p, t) {
        for (var v =
            0, C = 0; C < a - 1; ++C) g[C] = c[C + 1].readValueFromPointer(t + v), v += c[C + 1].argPackAdvance;
        h = h[l].apply(h, g);
        for (C = 0; C < a - 1; ++C) c[C + 1].deleteObject && c[C + 1].deleteObject(g[C]);
        if (!d.isVoid) return d.toWireType(p, h)
      };
      e = ee(e);
      return mc[b] = e
    }

    function ge(a, b) {
      a = U.toValue(a);
      b = U.toValue(b);
      return U.toHandle(a[b])
    }

    function he(a) {
      4 < a && (da.get(a).refcount += 1)
    }

    function ie(a, b) {
      a = U.toValue(a);
      b = U.toValue(b);
      return a instanceof b
    }

    function je(a) {
      var b = Array(a + 1);
      return function(c, d, e) {
        b[0] = c;
        for (var g = 0; g < a; ++g) {
          var h = Qa(P[d +
            4 * g >> 2], "parameter " + g);
          b[g + 1] = h.readValueFromPointer(e);
          e += h.argPackAdvance
        }
        c = new(c.bind.apply(c, b));
        return U.toHandle(c)
      }
    }

    function ke(a, b, c, d) {
      a = U.toValue(a);
      var e = nc[b];
      e || (e = je(b), nc[b] = e);
      return e(a, c, d)
    }

    function le(a) {
      return U.toHandle(ib(a))
    }

    function me(a) {
      var b = U.toValue(a);
      La(b);
      Hb(a)
    }

    function ne(a, b) {
      a = Qa(a, "_emval_take_value");
      a = a.readValueFromPointer(b);
      return U.toHandle(a)
    }

    function oe() {}

    function pe() {
      K("")
    }

    function Ib(a, b) {
      r.mainLoop.timingMode = a;
      r.mainLoop.timingValue = b;
      if (!r.mainLoop.func) return 1;
      r.mainLoop.running || (r.mainLoop.running = !0);
      if (0 == a) r.mainLoop.scheduler = function() {
        var d = Math.max(0, r.mainLoop.tickStartTime + b - Jb()) | 0;
        setTimeout(r.mainLoop.runner, d)
      }, r.mainLoop.method = "timeout";
      else if (1 == a) r.mainLoop.scheduler = function() {
        r.requestAnimationFrame(r.mainLoop.runner)
      }, r.mainLoop.method = "rAF";
      else if (2 == a) {
        if ("undefined" == typeof setImmediate) {
          var c = [];
          a = function(d) {
            if ("setimmediate" === d.data || "setimmediate" === d.data.target) d.stopPropagation(), c.shift()()
          };
          addEventListener("message",
            a, !0);
          setImmediate = function(d) {
            c.push(d);
            va ? (void 0 === f.setImmediates && (f.setImmediates = []), f.setImmediates.push(d), postMessage({
              target: "setimmediate"
            })) : postMessage("setimmediate", "*")
          }
        }
        r.mainLoop.scheduler = function() {
          setImmediate(r.mainLoop.runner)
        };
        r.mainLoop.method = "immediate"
      }
      return 0
    }

    function qe(a, b, c, d, e) {
      r.mainLoop.func && K("emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
      r.mainLoop.func = a;
      r.mainLoop.arg = d;
      var g = r.mainLoop.currentlyRunningMainloop;
      r.mainLoop.running = !1;
      r.mainLoop.runner = function() {
        if (!ua)
          if (0 < r.mainLoop.queue.length) {
            var h = Date.now(),
              l = r.mainLoop.queue.shift();
            l.func(l.arg);
            if (r.mainLoop.remainingBlockers) {
              var p = r.mainLoop.remainingBlockers,
                t = 0 == p % 1 ? p - 1 : Math.floor(p);
              l.counted ? r.mainLoop.remainingBlockers = t : (t += .5, r.mainLoop.remainingBlockers = (8 * p + t) / 9)
            }
            Kb('main loop blocker "' + l.name + '" took ' + (Date.now() - h) + " ms");
            r.mainLoop.updateStatus();
            g < r.mainLoop.currentlyRunningMainloop ||
              setTimeout(r.mainLoop.runner, 0)
          } else g < r.mainLoop.currentlyRunningMainloop || (r.mainLoop.currentFrameNumber = r.mainLoop.currentFrameNumber + 1 | 0, 1 == r.mainLoop.timingMode && 1 < r.mainLoop.timingValue && 0 != r.mainLoop.currentFrameNumber % r.mainLoop.timingValue ? r.mainLoop.scheduler() : (0 == r.mainLoop.timingMode && (r.mainLoop.tickStartTime = Jb()), r.mainLoop.runIter(a), g < r.mainLoop.currentlyRunningMainloop || ("object" == typeof SDL && SDL.audio && SDL.audio.queueNewAudioData && SDL.audio.queueNewAudioData(), r.mainLoop.scheduler())))
      };
      e || (b && 0 < b ? Ib(0, 1E3 / b) : Ib(1, 1), r.mainLoop.scheduler());
      if (c) throw "unwind";
    }

    function oc(a) {
      if (a instanceof ta || "unwind" == a) return Ha;
      kb(1, a)
    }

    function pc(a) {
      Ha = a;
      if (!qc) {
        if (f.onExit) f.onExit(a);
        ua = !0
      }
      kb(a, new ta(a))
    }

    function re(a) {
      Ha = a;
      pc(a)
    }

    function Lb(a) {
      if (!ua) try {
        if (a(), !qc) try {
          se(Ha)
        } catch (b) {
          oc(b)
        }
      } catch (b) {
        oc(b)
      }
    }

    function rc(a, b) {
      return setTimeout(function() {
        Lb(a)
      }, b)
    }

    function Ba(a) {
      Ba.shown || (Ba.shown = {});
      Ba.shown[a] || (Ba.shown[a] = 1, wa && (a = "warning: " + a), ia(a))
    }

    function te(a, b, c, d, e) {
      return E.chooseConfig(a,
        b, c, d, e)
    }

    function ue(a) {
      var b = a.getExtension("ANGLE_instanced_arrays");
      if (b) return a.vertexAttribDivisor = function(c, d) {
        b.vertexAttribDivisorANGLE(c, d)
      }, a.drawArraysInstanced = function(c, d, e, g) {
        b.drawArraysInstancedANGLE(c, d, e, g)
      }, a.drawElementsInstanced = function(c, d, e, g, h) {
        b.drawElementsInstancedANGLE(c, d, e, g, h)
      }, 1
    }

    function ve(a) {
      var b = a.getExtension("OES_vertex_array_object");
      if (b) return a.createVertexArray = function() {
          return b.createVertexArrayOES()
        }, a.deleteVertexArray = function(c) {
          b.deleteVertexArrayOES(c)
        },
        a.bindVertexArray = function(c) {
          b.bindVertexArrayOES(c)
        }, a.isVertexArray = function(c) {
          return b.isVertexArrayOES(c)
        }, 1
    }

    function we(a) {
      var b = a.getExtension("WEBGL_draw_buffers");
      if (b) return a.drawBuffers = function(c, d) {
        b.drawBuffersWEBGL(c, d)
      }, 1
    }

    function xe(a, b, c, d) {
      if (62E3 != a) return E.setErrorCode(12296), 0;
      for (a = 1;;) {
        b = q[d >> 2];
        if (12440 == b) a = q[d + 4 >> 2];
        else if (12344 == b) break;
        else return E.setErrorCode(12292), 0;
        d += 8
      }
      if (2 > a || 3 < a) return E.setErrorCode(12293), 0;
      E.contextAttributes.majorVersion = a - 1;
      E.contextAttributes.minorVersion =
        0;
      E.context = m.createContext(f.canvas, E.contextAttributes);
      if (0 != E.context) return E.setErrorCode(12288), m.makeContextCurrent(E.context), f.useWebGL = !0, r.moduleContextCreatedCallbacks.forEach(function(e) {
        e()
      }), m.makeContextCurrent(null), 62004;
      E.setErrorCode(12297);
      return 0
    }

    function ye(a, b) {
      if (62E3 != a) return E.setErrorCode(12296), 0;
      if (62002 != b) return E.setErrorCode(12293), 0;
      E.setErrorCode(12288);
      return 62006
    }

    function ze(a, b) {
      if (62E3 != a) return E.setErrorCode(12296), 0;
      if (62004 != b) return E.setErrorCode(12294),
        0;
      m.deleteContext(E.context);
      E.setErrorCode(12288);
      E.currentContext == b && (E.currentContext = 0);
      return 1
    }

    function Ae(a, b) {
      if (62E3 != a) return E.setErrorCode(12296), 0;
      if (62006 != b) return E.setErrorCode(12301), 1;
      E.currentReadSurface == b && (E.currentReadSurface = 0);
      E.currentDrawSurface == b && (E.currentDrawSurface = 0);
      E.setErrorCode(12288);
      return 1
    }

    function Be() {
      return E.currentContext
    }

    function Ce() {
      return E.currentContext ? 62E3 : 0
    }

    function De(a) {
      if (12378 == a) return E.currentReadSurface;
      if (12377 == a) return E.currentDrawSurface;
      E.setErrorCode(12300);
      return 0
    }

    function Ee() {
      E.setErrorCode(12288);
      return 62E3
    }

    function Fe(a, b, c) {
      if (62E3 != a) return E.setErrorCode(12296), 0;
      b && (q[b >> 2] = 1);
      c && (q[c >> 2] = 4);
      E.defaultDisplayInitialized = !0;
      E.setErrorCode(12288);
      return 1
    }

    function Ge(a, b, c, d) {
      if (62E3 != a) return E.setErrorCode(12296), 0;
      if (0 != d && 62004 != d) return E.setErrorCode(12294), 0;
      if (0 != c && 62006 != c || 0 != b && 62006 != b) return E.setErrorCode(12301), 0;
      m.makeContextCurrent(d ? E.context : null);
      E.currentContext = d;
      E.currentDrawSurface = b;
      E.currentReadSurface =
        c;
      E.setErrorCode(12288);
      return 1
    }

    function He() {
      E.currentContext = 0;
      E.currentReadSurface = 0;
      E.currentDrawSurface = 0;
      E.setErrorCode(12288);
      return 1
    }

    function Ie() {
      if (E.defaultDisplayInitialized)
        if (f.ctx)
          if (f.ctx.isContextLost()) E.setErrorCode(12302);
          else return E.setErrorCode(12288), 1;
      else E.setErrorCode(12290);
      else E.setErrorCode(12289);
      return 0
    }

    function sc(a, b) {
      Mb.length = 0;
      var c;
      for (b >>= 2; c = I[a++];) b += 105 != c & b, Mb.push(105 == c ? q[b] : Za[b++ >> 1]), ++b;
      return Mb
    }

    function Je(a, b, c) {
      b = sc(b, c);
      return b = tc[a].apply(null,
        b)
    }

    function Ke(a, b, c) {
      b = sc(b, c);
      return b = tc[a].apply(null, b)
    }

    function Le(a, b, c) {
      function d() {
        uc.apply(null, [a, b])
      }
      0 <= c || wa ? rc(d, c) : r.safeRequestAnimationFrame(d)
    }

    function Me() {
      return Date.now()
    }

    function Ne(a) {
      ia(S(a))
    }

    function Oe() {
      return 2147483648
    }

    function Pe(a) {
      k.activeTexture(a)
    }

    function Qe(a, b) {
      k.attachShader(m.programs[a], m.shaders[b])
    }

    function Re(a, b) {
      k.beginQuery(a, m.queries[b])
    }

    function Se(a, b) {
      k.disjointTimerQueryExt.beginQueryEXT(a, m.queries[b])
    }

    function Te(a) {
      k.beginTransformFeedback(a)
    }

    function Ue(a, b, c) {
      k.bindAttribLocation(m.programs[a], b, S(c))
    }

    function Ve(a, b) {
      35051 == a ? k.currentPixelPackBufferBinding = b : 35052 == a && (k.currentPixelUnpackBufferBinding = b);
      k.bindBuffer(a, m.buffers[b])
    }

    function We(a, b, c) {
      k.bindBufferBase(a, b, m.buffers[c])
    }

    function Xe(a, b, c, d, e) {
      k.bindBufferRange(a, b, m.buffers[c], d, e)
    }

    function Ye(a, b) {
      k.bindFramebuffer(a, m.framebuffers[b])
    }

    function Ze(a, b) {
      k.bindRenderbuffer(a, m.renderbuffers[b])
    }

    function $e(a, b) {
      k.bindSampler(a, m.samplers[b])
    }

    function af(a, b) {
      k.bindTexture(a,
        m.textures[b])
    }

    function bf(a, b) {
      k.bindTransformFeedback(a, m.transformFeedbacks[b])
    }

    function vc(a) {
      k.bindVertexArray(m.vaos[a])
    }

    function cf(a, b, c, d) {
      k.blendColor(a, b, c, d)
    }

    function df(a) {
      k.blendEquation(a)
    }

    function ef(a, b) {
      k.blendEquationSeparate(a, b)
    }

    function ff(a, b) {
      k.blendFunc(a, b)
    }

    function gf(a, b, c, d) {
      k.blendFuncSeparate(a, b, c, d)
    }

    function hf(a, b, c, d, e, g, h, l, p, t) {
      k.blitFramebuffer(a, b, c, d, e, g, h, l, p, t)
    }

    function jf(a, b, c, d) {
      2 <= m.currentContext.version ? c && b ? k.bufferData(a, I, d, c, b) : k.bufferData(a, b,
        d) : k.bufferData(a, c ? I.subarray(c, c + b) : b, d)
    }

    function kf(a, b, c, d) {
      2 <= m.currentContext.version ? c && k.bufferSubData(a, b, I, d, c) : k.bufferSubData(a, b, I.subarray(d, d + c))
    }

    function lf(a) {
      return k.checkFramebufferStatus(a)
    }

    function mf(a) {
      k.clear(a)
    }

    function nf(a, b, c, d) {
      k.clearBufferfi(a, b, c, d)
    }

    function of(a, b, c) {
      k.clearBufferfv(a, b, D, c >> 2)
    }

    function pf(a, b, c) {
      k.clearBufferiv(a, b, q, c >> 2)
    }

    function qf(a, b, c) {
      k.clearBufferuiv(a, b, P, c >> 2)
    }

    function rf(a, b, c, d) {
      k.clearColor(a, b, c, d)
    }

    function sf(a) {
      k.clearDepth(a)
    }

    function tf(a) {
      k.clearStencil(a)
    }

    function uf(a, b, c, d) {
      c = (c >>> 0) + 4294967296 * d;
      return k.clientWaitSync(m.syncs[a], b, c)
    }

    function vf(a, b, c, d) {
      k.colorMask(!!a, !!b, !!c, !!d)
    }

    function wf(a) {
      k.compileShader(m.shaders[a])
    }

    function xf(a, b, c, d, e, g, h, l) {
      2 <= m.currentContext.version ? k.currentPixelUnpackBufferBinding || !h ? k.compressedTexImage2D(a, b, c, d, e, g, h, l) : k.compressedTexImage2D(a, b, c, d, e, g, I, l, h) : k.compressedTexImage2D(a, b, c, d, e, g, l ? I.subarray(l, l + h) : null)
    }

    function yf(a, b, c, d, e, g, h, l, p) {
      k.currentPixelUnpackBufferBinding ? k.compressedTexImage3D(a,
        b, c, d, e, g, h, l, p) : k.compressedTexImage3D(a, b, c, d, e, g, h, I, p, l)
    }

    function zf(a, b, c, d, e, g, h, l, p) {
      2 <= m.currentContext.version ? k.currentPixelUnpackBufferBinding || !l ? k.compressedTexSubImage2D(a, b, c, d, e, g, h, l, p) : k.compressedTexSubImage2D(a, b, c, d, e, g, h, I, p, l) : k.compressedTexSubImage2D(a, b, c, d, e, g, h, p ? I.subarray(p, p + l) : null)
    }

    function Af(a, b, c, d, e, g, h, l, p, t, v) {
      k.currentPixelUnpackBufferBinding ? k.compressedTexSubImage3D(a, b, c, d, e, g, h, l, p, t, v) : k.compressedTexSubImage3D(a, b, c, d, e, g, h, l, p, I, v, t)
    }

    function Bf(a, b,
      c, d, e) {
      k.copyBufferSubData(a, b, c, d, e)
    }

    function Cf(a, b, c, d, e, g, h, l) {
      k.copyTexImage2D(a, b, c, d, e, g, h, l)
    }

    function Df(a, b, c, d, e, g, h, l) {
      k.copyTexSubImage2D(a, b, c, d, e, g, h, l)
    }

    function Ef(a, b, c, d, e, g, h, l, p) {
      k.copyTexSubImage3D(a, b, c, d, e, g, h, l, p)
    }

    function Ff() {
      var a = m.getNewId(m.programs),
        b = k.createProgram();
      b.name = a;
      b.maxUniformLength = b.maxAttributeLength = b.maxUniformBlockNameLength = 0;
      b.uniformIdCounter = 1;
      m.programs[a] = b;
      return a
    }

    function Gf(a) {
      var b = m.getNewId(m.shaders);
      m.shaders[b] = k.createShader(a);
      return b
    }

    function Hf(a) {
      k.cullFace(a)
    }

    function If(a, b) {
      for (var c = 0; c < a; c++) {
        var d = q[b + 4 * c >> 2],
          e = m.buffers[d];
        e && (k.deleteBuffer(e), e.name = 0, m.buffers[d] = null, d == k.currentPixelPackBufferBinding && (k.currentPixelPackBufferBinding = 0), d == k.currentPixelUnpackBufferBinding && (k.currentPixelUnpackBufferBinding = 0))
      }
    }

    function Jf(a, b) {
      for (var c = 0; c < a; ++c) {
        var d = q[b + 4 * c >> 2],
          e = m.framebuffers[d];
        e && (k.deleteFramebuffer(e), e.name = 0, m.framebuffers[d] = null)
      }
    }

    function Kf(a) {
      if (a) {
        var b = m.programs[a];
        b ? (k.deleteProgram(b), b.name =
          0, m.programs[a] = null) : m.recordError(1281)
      }
    }

    function Lf(a, b) {
      for (var c = 0; c < a; c++) {
        var d = q[b + 4 * c >> 2],
          e = m.queries[d];
        e && (k.deleteQuery(e), m.queries[d] = null)
      }
    }

    function Mf(a, b) {
      for (var c = 0; c < a; c++) {
        var d = q[b + 4 * c >> 2],
          e = m.queries[d];
        e && (k.disjointTimerQueryExt.deleteQueryEXT(e), m.queries[d] = null)
      }
    }

    function Nf(a, b) {
      for (var c = 0; c < a; c++) {
        var d = q[b + 4 * c >> 2],
          e = m.renderbuffers[d];
        e && (k.deleteRenderbuffer(e), e.name = 0, m.renderbuffers[d] = null)
      }
    }

    function Of(a, b) {
      for (var c = 0; c < a; c++) {
        var d = q[b + 4 * c >> 2],
          e = m.samplers[d];
        e && (k.deleteSampler(e), e.name = 0, m.samplers[d] = null)
      }
    }

    function Pf(a) {
      if (a) {
        var b = m.shaders[a];
        b ? (k.deleteShader(b), m.shaders[a] = null) : m.recordError(1281)
      }
    }

    function Qf(a) {
      if (a) {
        var b = m.syncs[a];
        b ? (k.deleteSync(b), b.name = 0, m.syncs[a] = null) : m.recordError(1281)
      }
    }

    function Rf(a, b) {
      for (var c = 0; c < a; c++) {
        var d = q[b + 4 * c >> 2],
          e = m.textures[d];
        e && (k.deleteTexture(e), e.name = 0, m.textures[d] = null)
      }
    }

    function Sf(a, b) {
      for (var c = 0; c < a; c++) {
        var d = q[b + 4 * c >> 2],
          e = m.transformFeedbacks[d];
        e && (k.deleteTransformFeedback(e), e.name =
          0, m.transformFeedbacks[d] = null)
      }
    }

    function wc(a, b) {
      for (var c = 0; c < a; c++) {
        var d = q[b + 4 * c >> 2];
        k.deleteVertexArray(m.vaos[d]);
        m.vaos[d] = null
      }
    }

    function Tf(a) {
      k.depthFunc(a)
    }

    function Uf(a) {
      k.depthMask(!!a)
    }

    function Vf(a, b) {
      k.depthRange(a, b)
    }

    function Wf(a, b) {
      k.detachShader(m.programs[a], m.shaders[b])
    }

    function Xf(a) {
      k.disable(a)
    }

    function Yf(a) {
      k.disableVertexAttribArray(a)
    }

    function Zf(a, b, c) {
      k.drawArrays(a, b, c)
    }

    function Sa(a, b, c, d) {
      k.drawArraysInstanced(a, b, c, d)
    }

    function Nb(a, b) {
      for (var c = lb[a], d = 0; d < a; d++) c[d] =
        q[b + 4 * d >> 2];
      k.drawBuffers(c)
    }

    function xc(a, b, c, d) {
      k.drawElements(a, b, c, d)
    }

    function Ta(a, b, c, d, e) {
      k.drawElementsInstanced(a, b, c, d, e)
    }

    function $f(a, b, c, d, e, g) {
      xc(a, d, e, g)
    }

    function ag(a) {
      k.enable(a)
    }

    function bg(a) {
      k.enableVertexAttribArray(a)
    }

    function cg(a) {
      k.endQuery(a)
    }

    function dg(a) {
      k.disjointTimerQueryExt.endQueryEXT(a)
    }

    function eg() {
      k.endTransformFeedback()
    }

    function fg(a, b) {
      return (a = k.fenceSync(a, b)) ? (b = m.getNewId(m.syncs), a.name = b, m.syncs[b] = a, b) : 0
    }

    function gg() {
      k.finish()
    }

    function hg() {
      k.flush()
    }

    function ig(a, b, c, d) {
      k.framebufferRenderbuffer(a, b, c, m.renderbuffers[d])
    }

    function jg(a, b, c, d, e) {
      k.framebufferTexture2D(a, b, c, m.textures[d], e)
    }

    function kg(a, b, c, d, e) {
      k.framebufferTextureLayer(a, b, m.textures[c], d, e)
    }

    function lg(a) {
      k.frontFace(a)
    }

    function pa(a, b, c, d) {
      for (var e = 0; e < a; e++) {
        var g = k[c](),
          h = g && m.getNewId(d);
        g ? (g.name = h, d[h] = g) : m.recordError(1282);
        q[b + 4 * e >> 2] = h
      }
    }

    function mg(a, b) {
      pa(a, b, "createBuffer", m.buffers)
    }

    function ng(a, b) {
      pa(a, b, "createFramebuffer", m.framebuffers)
    }

    function og(a, b) {
      pa(a,
        b, "createQuery", m.queries)
    }

    function pg(a, b) {
      for (var c = 0; c < a; c++) {
        var d = k.disjointTimerQueryExt.createQueryEXT();
        if (!d) {
          for (m.recordError(1282); c < a;) q[b + 4 * c++ >> 2] = 0;
          break
        }
        var e = m.getNewId(m.queries);
        d.name = e;
        m.queries[e] = d;
        q[b + 4 * c >> 2] = e
      }
    }

    function qg(a, b) {
      pa(a, b, "createRenderbuffer", m.renderbuffers)
    }

    function rg(a, b) {
      pa(a, b, "createSampler", m.samplers)
    }

    function sg(a, b) {
      pa(a, b, "createTexture", m.textures)
    }

    function tg(a, b) {
      pa(a, b, "createTransformFeedback", m.transformFeedbacks)
    }

    function yc(a, b) {
      pa(a, b, "createVertexArray",
        m.vaos)
    }

    function ug(a) {
      k.generateMipmap(a)
    }

    function zc(a, b, c, d, e, g, h, l) {
      b = m.programs[b];
      if (a = k[a](b, c)) d = l && ea(a.name, I, l, d), e && (q[e >> 2] = d), g && (q[g >> 2] = a.size), h && (q[h >> 2] = a.type)
    }

    function vg(a, b, c, d, e, g, h) {
      zc("getActiveAttrib", a, b, c, d, e, g, h)
    }

    function wg(a, b, c, d, e, g, h) {
      zc("getActiveUniform", a, b, c, d, e, g, h)
    }

    function xg(a, b, c, d, e) {
      a = m.programs[a];
      if (a = k.getActiveUniformBlockName(a, b)) e && 0 < c ? (c = ea(a, I, e, c), d && (q[d >> 2] = c)) : d && (q[d >> 2] = 0)
    }

    function yg(a, b, c, d) {
      if (d)
        if (a = m.programs[a], 35393 == c) c = k.getActiveUniformBlockName(a,
          b), q[d >> 2] = c.length + 1;
        else {
          if (a = k.getActiveUniformBlockParameter(a, b, c), null !== a)
            if (35395 == c)
              for (c = 0; c < a.length; c++) q[d + 4 * c >> 2] = a[c];
            else q[d >> 2] = a
        }
      else m.recordError(1281)
    }

    function zg(a, b, c, d, e) {
      if (e)
        if (0 < b && 0 == c) m.recordError(1281);
        else {
          a = m.programs[a];
          for (var g = [], h = 0; h < b; h++) g.push(q[c + 4 * h >> 2]);
          if (a = k.getActiveUniforms(a, g, d))
            for (b = a.length, h = 0; h < b; h++) q[e + 4 * h >> 2] = a[h]
        }
      else m.recordError(1281)
    }

    function Ag(a, b, c, d) {
      a = k.getAttachedShaders(m.programs[a]);
      var e = a.length;
      e > b && (e = b);
      q[c >> 2] = e;
      for (b =
        0; b < e; ++b) c = m.shaders.indexOf(a[b]), q[d + 4 * b >> 2] = c
    }

    function Bg(a, b) {
      return k.getAttribLocation(m.programs[a], S(b))
    }

    function mb(a, b) {
      P[a >> 2] = b;
      P[a + 4 >> 2] = (b - P[a >> 2]) / 4294967296
    }

    function nb(a, b, c) {
      if (b) {
        var d = void 0;
        switch (a) {
          case 36346:
            d = 1;
            break;
          case 36344:
            0 != c && 1 != c && m.recordError(1280);
            return;
          case 34814:
          case 36345:
            d = 0;
            break;
          case 34466:
            var e = k.getParameter(34467);
            d = e ? e.length : 0;
            break;
          case 33309:
            if (2 > m.currentContext.version) {
              m.recordError(1282);
              return
            }
            e = k.getSupportedExtensions() || [];
            d = 2 * e.length;
            break;
          case 33307:
          case 33308:
            if (2 > m.currentContext.version) {
              m.recordError(1280);
              return
            }
            d = 33307 == a ? 3 : 0
        }
        if (void 0 === d) switch (e = k.getParameter(a), typeof e) {
          case "number":
            d = e;
            break;
          case "boolean":
            d = e ? 1 : 0;
            break;
          case "string":
            m.recordError(1280);
            return;
          case "object":
            if (null === e) switch (a) {
              case 34964:
              case 35725:
              case 34965:
              case 36006:
              case 36007:
              case 32873:
              case 34229:
              case 36662:
              case 36663:
              case 35053:
              case 35055:
              case 36010:
              case 35097:
              case 35869:
              case 32874:
              case 36389:
              case 35983:
              case 35368:
              case 34068:
                d = 0;
                break;
              default:
                m.recordError(1280);
                return
            } else {
              if (e instanceof Float32Array || e instanceof Uint32Array || e instanceof Int32Array || e instanceof Array) {
                for (a = 0; a < e.length; ++a) switch (c) {
                  case 0:
                    q[b + 4 * a >> 2] = e[a];
                    break;
                  case 2:
                    D[b + 4 * a >> 2] = e[a];
                    break;
                  case 4:
                    T[b + a >> 0] = e[a] ? 1 : 0
                }
                return
              }
              try {
                d = e.name | 0
              } catch (g) {
                m.recordError(1280);
                ia("GL_INVALID_ENUM in glGet" + c + "v: Unknown object returned from WebGL getParameter(" + a + ")! (error: " + g + ")");
                return
              }
            }
            break;
          default:
            m.recordError(1280);
            ia("GL_INVALID_ENUM in glGet" + c + "v: Native code calling glGet" + c + "v(" +
              a + ") and it returns " + e + " of type " + typeof e + "!");
            return
        }
        switch (c) {
          case 1:
            mb(b, d);
            break;
          case 0:
            q[b >> 2] = d;
            break;
          case 2:
            D[b >> 2] = d;
            break;
          case 4:
            T[b >> 0] = d ? 1 : 0
        }
      } else m.recordError(1281)
    }

    function Cg(a, b) {
      nb(a, b, 4)
    }

    function Dg(a, b, c) {
      c ? mb(c, k.getBufferParameter(a, b)) : m.recordError(1281)
    }

    function Eg(a, b, c) {
      c ? q[c >> 2] = k.getBufferParameter(a, b) : m.recordError(1281)
    }

    function Fg() {
      var a = k.getError() || m.lastError;
      m.lastError = 0;
      return a
    }

    function Gg(a, b) {
      nb(a, b, 2)
    }

    function Hg(a, b) {
      return k.getFragDataLocation(m.programs[a],
        S(b))
    }

    function Ig(a, b, c, d) {
      a = k.getFramebufferAttachmentParameter(a, b, c);
      if (a instanceof WebGLRenderbuffer || a instanceof WebGLTexture) a = a.name | 0;
      q[d >> 2] = a
    }

    function Ac(a, b, c, d) {
      if (c) {
        b = k.getIndexedParameter(a, b);
        switch (typeof b) {
          case "boolean":
            a = b ? 1 : 0;
            break;
          case "number":
            a = b;
            break;
          case "object":
            if (null === b) switch (a) {
                case 35983:
                case 35368:
                  a = 0;
                  break;
                default:
                  m.recordError(1280);
                  return
              } else if (b instanceof WebGLBuffer) a = b.name | 0;
              else {
                m.recordError(1280);
                return
              } break;
          default:
            m.recordError(1280);
            return
        }
        switch (d) {
          case 1:
            mb(c,
              a);
            break;
          case 0:
            q[c >> 2] = a;
            break;
          case 2:
            D[c >> 2] = a;
            break;
          case 4:
            T[c >> 0] = a ? 1 : 0;
            break;
          default:
            throw "internal emscriptenWebGLGetIndexed() error, bad type: " + d;
        }
      } else m.recordError(1281)
    }

    function Jg(a, b, c) {
      Ac(a, b, c, 1)
    }

    function Kg(a, b) {
      nb(a, b, 1)
    }

    function Lg(a, b, c) {
      Ac(a, b, c, 0)
    }

    function Mg(a, b) {
      nb(a, b, 0)
    }

    function Ng(a, b, c, d, e) {
      if (0 > d) m.recordError(1281);
      else if (e) {
        if (a = k.getInternalformatParameter(a, b, c), null !== a)
          for (b = 0; b < a.length && b < d; ++b) q[e + 4 * b >> 2] = a[b]
      } else m.recordError(1281)
    }

    function Og() {
      m.recordError(1282)
    }

    function Pg(a, b, c, d) {
      a = k.getProgramInfoLog(m.programs[a]);
      null === a && (a = "(unknown error)");
      b = 0 < b && d ? ea(a, I, d, b) : 0;
      c && (q[c >> 2] = b)
    }

    function Qg(a, b, c) {
      if (c)
        if (a >= m.counter) m.recordError(1281);
        else if (a = m.programs[a], 35716 == b) a = k.getProgramInfoLog(a), null === a && (a = "(unknown error)"), q[c >> 2] = a.length + 1;
      else if (35719 == b) {
        if (!a.maxUniformLength)
          for (b = 0; b < k.getProgramParameter(a, 35718); ++b) a.maxUniformLength = Math.max(a.maxUniformLength, k.getActiveUniform(a, b).name.length + 1);
        q[c >> 2] = a.maxUniformLength
      } else if (35722 ==
        b) {
        if (!a.maxAttributeLength)
          for (b = 0; b < k.getProgramParameter(a, 35721); ++b) a.maxAttributeLength = Math.max(a.maxAttributeLength, k.getActiveAttrib(a, b).name.length + 1);
        q[c >> 2] = a.maxAttributeLength
      } else if (35381 == b) {
        if (!a.maxUniformBlockNameLength)
          for (b = 0; b < k.getProgramParameter(a, 35382); ++b) a.maxUniformBlockNameLength = Math.max(a.maxUniformBlockNameLength, k.getActiveUniformBlockName(a, b).length + 1);
        q[c >> 2] = a.maxUniformBlockNameLength
      } else q[c >> 2] = k.getProgramParameter(a, b);
      else m.recordError(1281)
    }

    function Bc(a,
      b, c) {
      c ? (a = m.queries[a], b = 2 > m.currentContext.version ? k.disjointTimerQueryExt.getQueryObjectEXT(a, b) : k.getQueryParameter(a, b), b = "boolean" == typeof b ? b ? 1 : 0 : b, mb(c, b)) : m.recordError(1281)
    }

    function Cc(a, b, c) {
      c ? (a = m.queries[a], b = k.disjointTimerQueryExt.getQueryObjectEXT(a, b), b = "boolean" == typeof b ? b ? 1 : 0 : b, q[c >> 2] = b) : m.recordError(1281)
    }

    function Rg(a, b, c) {
      c ? (a = m.queries[a], b = k.getQueryParameter(a, b), b = "boolean" == typeof b ? b ? 1 : 0 : b, q[c >> 2] = b) : m.recordError(1281)
    }

    function Sg(a, b, c) {
      c ? q[c >> 2] = k.getQuery(a, b) : m.recordError(1281)
    }

    function Tg(a, b, c) {
      c ? q[c >> 2] = k.disjointTimerQueryExt.getQueryEXT(a, b) : m.recordError(1281)
    }

    function Ug(a, b, c) {
      c ? q[c >> 2] = k.getRenderbufferParameter(a, b) : m.recordError(1281)
    }

    function Vg(a, b, c) {
      c ? D[c >> 2] = k.getSamplerParameter(m.samplers[a], b) : m.recordError(1281)
    }

    function Wg(a, b, c) {
      c ? q[c >> 2] = k.getSamplerParameter(m.samplers[a], b) : m.recordError(1281)
    }

    function Xg(a, b, c, d) {
      a = k.getShaderInfoLog(m.shaders[a]);
      null === a && (a = "(unknown error)");
      b = 0 < b && d ? ea(a, I, d, b) : 0;
      c && (q[c >> 2] = b)
    }

    function Yg(a, b, c, d) {
      a = k.getShaderPrecisionFormat(a,
        b);
      q[c >> 2] = a.rangeMin;
      q[c + 4 >> 2] = a.rangeMax;
      q[d >> 2] = a.precision
    }

    function Zg(a, b, c, d) {
      if (a = k.getShaderSource(m.shaders[a])) b = 0 < b && d ? ea(a, I, d, b) : 0, c && (q[c >> 2] = b)
    }

    function $g(a, b, c) {
      c ? 35716 == b ? (a = k.getShaderInfoLog(m.shaders[a]), null === a && (a = "(unknown error)"), a = a ? a.length + 1 : 0, q[c >> 2] = a) : 35720 == b ? (a = (a = k.getShaderSource(m.shaders[a])) ? a.length + 1 : 0, q[c >> 2] = a) : q[c >> 2] = k.getShaderParameter(m.shaders[a], b) : m.recordError(1281)
    }

    function Ua(a) {
      var b = hb(a) + 1,
        c = Ra(b);
      c && ea(a, I, c, b);
      return c
    }

    function ah(a) {
      var b =
        m.stringCache[a];
      if (!b) {
        switch (a) {
          case 7939:
            b = k.getSupportedExtensions() || [];
            b = b.concat(b.map(function(d) {
              return "GL_" + d
            }));
            b = Ua(b.join(" "));
            break;
          case 7936:
          case 7937:
          case 37445:
          case 37446:
            (b = k.getParameter(a)) || m.recordError(1280);
            b = b && Ua(b);
            break;
          case 7938:
            b = k.getParameter(7938);
            b = 2 <= m.currentContext.version ? "OpenGL ES 3.0 (" + b + ")" : "OpenGL ES 2.0 (" + b + ")";
            b = Ua(b);
            break;
          case 35724:
            b = k.getParameter(35724);
            var c = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
            c = b.match(c);
            null !== c && (3 == c[1].length &&
              (c[1] += "0"), b = "OpenGL ES GLSL ES " + c[1] + " (" + b + ")");
            b = Ua(b);
            break;
          default:
            m.recordError(1280)
        }
        m.stringCache[a] = b
      }
      return b
    }

    function bh(a, b) {
      if (2 > m.currentContext.version) return m.recordError(1282), 0;
      var c = m.stringiCache[a];
      if (c) return 0 > b || b >= c.length ? (m.recordError(1281), 0) : c[b];
      switch (a) {
        case 7939:
          return c = k.getSupportedExtensions() || [], c = c.concat(c.map(function(d) {
            return "GL_" + d
          })), c = c.map(function(d) {
            return Ua(d)
          }), c = m.stringiCache[a] = c, 0 > b || b >= c.length ? (m.recordError(1281), 0) : c[b];
        default:
          return m.recordError(1280),
            0
      }
    }

    function ch(a, b, c, d, e) {
      0 > c ? m.recordError(1281) : e ? (a = k.getSyncParameter(m.syncs[a], b), null !== a && (q[e >> 2] = a, d && (q[d >> 2] = 1))) : m.recordError(1281)
    }

    function dh(a, b, c) {
      c ? D[c >> 2] = k.getTexParameter(a, b) : m.recordError(1281)
    }

    function eh(a, b, c) {
      c ? q[c >> 2] = k.getTexParameter(a, b) : m.recordError(1281)
    }

    function fh(a, b, c, d, e, g, h) {
      a = m.programs[a];
      if (a = k.getTransformFeedbackVarying(a, b)) h && 0 < c ? (c = ea(a.name, I, h, c), d && (q[d >> 2] = c)) : d && (q[d >> 2] = 0), e && (q[e >> 2] = a.size), g && (q[g >> 2] = a.type)
    }

    function gh(a, b) {
      return k.getUniformBlockIndex(m.programs[a],
        S(b))
    }

    function hh(a, b, c, d) {
      if (d)
        if (0 < b && (0 == c || 0 == d)) m.recordError(1281);
        else {
          a = m.programs[a];
          for (var e = [], g = 0; g < b; g++) e.push(S(q[c + 4 * g >> 2]));
          if (a = k.getUniformIndices(a, e))
            for (b = a.length, g = 0; g < b; g++) q[d + 4 * g >> 2] = a[g]
        }
      else m.recordError(1281)
    }

    function Dc(a) {
      var b = a.uniformLocsById,
        c = a.uniformSizeAndIdsByName,
        d;
      if (!b)
        for (a.uniformLocsById = b = {}, a.uniformArrayNamesById = {}, d = 0; d < k.getProgramParameter(a, 35718); ++d) {
          var e = k.getActiveUniform(a, d);
          var g = e.name;
          e = e.size;
          var h = "]" == g.slice(-1) && g.lastIndexOf("[");
          h = 0 < h ? g.slice(0, h) : g;
          var l = a.uniformIdCounter;
          a.uniformIdCounter += e;
          c[h] = [e, l];
          for (g = 0; g < e; ++g) b[l] = g, a.uniformArrayNamesById[l++] = h
        }
    }

    function ih(a, b) {
      b = S(b);
      if (a = m.programs[a]) {
        Dc(a);
        var c = a.uniformLocsById,
          d = 0,
          e = b,
          g = "]" == b.slice(-1) && b.lastIndexOf("[");
        0 < g && (d = parseInt(b.slice(g + 1)) >>> 0, e = b.slice(0, g));
        if ((e = a.uniformSizeAndIdsByName[e]) && d < e[0] && (d += e[1], c[d] = c[d] || k.getUniformLocation(a, b))) return d
      } else m.recordError(1281);
      return -1
    }

    function J(a) {
      var b = k.currentProgram;
      if (b) {
        var c = b.uniformLocsById[a];
        "number" == typeof c && (b.uniformLocsById[a] = c = k.getUniformLocation(b, b.uniformArrayNamesById[a] + (0 < c ? "[" + c + "]" : "")));
        return c
      }
      m.recordError(1282)
    }

    function Ob(a, b, c, d) {
      if (c)
        if (a = m.programs[a], Dc(a), a = k.getUniform(a, J(b)), "number" == typeof a || "boolean" == typeof a) switch (d) {
          case 0:
            q[c >> 2] = a;
            break;
          case 2:
            D[c >> 2] = a
        } else
          for (b = 0; b < a.length; b++) switch (d) {
            case 0:
              q[c + 4 * b >> 2] = a[b];
              break;
            case 2:
              D[c + 4 * b >> 2] = a[b]
          } else m.recordError(1281)
    }

    function jh(a, b, c) {
      Ob(a, b, c, 2)
    }

    function kh(a, b, c) {
      Ob(a, b, c, 0)
    }

    function lh(a,
      b, c) {
      Ob(a, b, c, 0)
    }

    function Pb(a, b, c, d) {
      if (c)
        if (a = k.getVertexAttrib(a, b), 34975 == b) q[c >> 2] = a && a.name;
        else if ("number" == typeof a || "boolean" == typeof a) switch (d) {
        case 0:
          q[c >> 2] = a;
          break;
        case 2:
          D[c >> 2] = a;
          break;
        case 5:
          q[c >> 2] = Math.fround(a)
      } else
        for (b = 0; b < a.length; b++) switch (d) {
          case 0:
            q[c + 4 * b >> 2] = a[b];
            break;
          case 2:
            D[c + 4 * b >> 2] = a[b];
            break;
          case 5:
            q[c + 4 * b >> 2] = Math.fround(a[b])
        } else m.recordError(1281)
    }

    function Ec(a, b, c) {
      Pb(a, b, c, 0)
    }

    function mh(a, b, c) {
      c ? q[c >> 2] = k.getVertexAttribOffset(a, b) : m.recordError(1281)
    }

    function nh(a, b, c) {
      Pb(a, b, c, 2)
    }

    function oh(a, b, c) {
      Pb(a, b, c, 5)
    }

    function ph(a, b) {
      k.hint(a, b)
    }

    function qh(a, b, c) {
      for (var d = lb[b], e = 0; e < b; e++) d[e] = q[c + 4 * e >> 2];
      k.invalidateFramebuffer(a, d)
    }

    function rh(a, b, c, d, e, g, h) {
      for (var l = lb[b], p = 0; p < b; p++) l[p] = q[c + 4 * p >> 2];
      k.invalidateSubFramebuffer(a, l, d, e, g, h)
    }

    function sh(a) {
      return (a = m.buffers[a]) ? k.isBuffer(a) : 0
    }

    function th(a) {
      return k.isEnabled(a)
    }

    function uh(a) {
      return (a = m.framebuffers[a]) ? k.isFramebuffer(a) : 0
    }

    function vh(a) {
      return (a = m.programs[a]) ? k.isProgram(a) :
        0
    }

    function wh(a) {
      return (a = m.queries[a]) ? k.isQuery(a) : 0
    }

    function xh(a) {
      return (a = m.queries[a]) ? k.disjointTimerQueryExt.isQueryEXT(a) : 0
    }

    function yh(a) {
      return (a = m.renderbuffers[a]) ? k.isRenderbuffer(a) : 0
    }

    function zh(a) {
      return (a = m.samplers[a]) ? k.isSampler(a) : 0
    }

    function Ah(a) {
      return (a = m.shaders[a]) ? k.isShader(a) : 0
    }

    function Bh(a) {
      return k.isSync(m.syncs[a])
    }

    function Ch(a) {
      return (a = m.textures[a]) ? k.isTexture(a) : 0
    }

    function Dh(a) {
      return k.isTransformFeedback(m.transformFeedbacks[a])
    }

    function Fc(a) {
      return (a =
        m.vaos[a]) ? k.isVertexArray(a) : 0
    }

    function Eh(a) {
      k.lineWidth(a)
    }

    function Fh(a) {
      a = m.programs[a];
      k.linkProgram(a);
      a.uniformLocsById = 0;
      a.uniformSizeAndIdsByName = {}
    }

    function Gh() {
      k.pauseTransformFeedback()
    }

    function Hh(a, b) {
      3317 == a && (m.unpackAlignment = b);
      k.pixelStorei(a, b)
    }

    function Ih(a, b) {
      k.polygonOffset(a, b)
    }

    function Jh() {
      m.recordError(1280)
    }

    function Kh() {
      m.recordError(1280)
    }

    function Lh(a, b) {
      k.disjointTimerQueryExt.queryCounterEXT(m.queries[a], b)
    }

    function Mh(a) {
      k.readBuffer(a)
    }

    function Ca(a) {
      a -= 5120;
      return 0 ==
        a ? T : 1 == a ? I : 2 == a ? na : 4 == a ? q : 6 == a ? D : 5 == a || 28922 == a || 28520 == a || 30779 == a || 30782 == a ? P : Ga
    }

    function Da(a) {
      return 31 - Math.clz32(a.BYTES_PER_ELEMENT)
    }

    function Qb(a, b, c, d, e) {
      a = Ca(a);
      var g = Da(a),
        h = 1 << g,
        l = {
          5: 3,
          6: 4,
          8: 2,
          29502: 3,
          29504: 4,
          26917: 2,
          26918: 2,
          29846: 3,
          29847: 4
        };
      b = l[b - 6402] || 1;
      h *= b;
      b = m.unpackAlignment;
      c *= h;
      c = c + b - 1 & -b;
      d *= c;
      return a.subarray(e >> g, e + d >> g)
    }

    function Nh(a, b, c, d, e, g, h) {
      if (2 <= m.currentContext.version)
        if (k.currentPixelPackBufferBinding) k.readPixels(a, b, c, d, e, g, h);
        else {
          var l = Ca(g);
          k.readPixels(a, b,
            c, d, e, g, l, h >> Da(l))
        }
      else(h = Qb(g, e, c, d, h, e)) ? k.readPixels(a, b, c, d, e, g, h) : m.recordError(1280)
    }

    function Oh() {}

    function Ph(a, b, c, d) {
      k.renderbufferStorage(a, b, c, d)
    }

    function Qh(a, b, c, d, e) {
      k.renderbufferStorageMultisample(a, b, c, d, e)
    }

    function Rh() {
      k.resumeTransformFeedback()
    }

    function Sh(a, b) {
      k.sampleCoverage(a, !!b)
    }

    function Th(a, b, c) {
      k.samplerParameterf(m.samplers[a], b, c)
    }

    function Uh(a, b, c) {
      c = D[c >> 2];
      k.samplerParameterf(m.samplers[a], b, c)
    }

    function Vh(a, b, c) {
      k.samplerParameteri(m.samplers[a], b, c)
    }

    function Wh(a,
      b, c) {
      c = q[c >> 2];
      k.samplerParameteri(m.samplers[a], b, c)
    }

    function Xh(a, b, c, d) {
      k.scissor(a, b, c, d)
    }

    function Yh() {
      m.recordError(1280)
    }

    function Zh(a, b, c, d) {
      b = m.getSource(a, b, c, d);
      k.shaderSource(m.shaders[a], b)
    }

    function $h(a, b, c) {
      k.stencilFunc(a, b, c)
    }

    function ai(a, b, c, d) {
      k.stencilFuncSeparate(a, b, c, d)
    }

    function bi(a) {
      k.stencilMask(a)
    }

    function ci(a, b) {
      k.stencilMaskSeparate(a, b)
    }

    function di(a, b, c) {
      k.stencilOp(a, b, c)
    }

    function ei(a, b, c, d) {
      k.stencilOpSeparate(a, b, c, d)
    }

    function fi(a, b, c, d, e, g, h, l, p) {
      if (2 <= m.currentContext.version)
        if (k.currentPixelUnpackBufferBinding) k.texImage2D(a,
          b, c, d, e, g, h, l, p);
        else if (p) {
        var t = Ca(l);
        k.texImage2D(a, b, c, d, e, g, h, l, t, p >> Da(t))
      } else k.texImage2D(a, b, c, d, e, g, h, l, null);
      else k.texImage2D(a, b, c, d, e, g, h, l, p ? Qb(l, h, d, e, p, c) : null)
    }

    function gi(a, b, c, d, e, g, h, l, p, t) {
      if (k.currentPixelUnpackBufferBinding) k.texImage3D(a, b, c, d, e, g, h, l, p, t);
      else if (t) {
        var v = Ca(p);
        k.texImage3D(a, b, c, d, e, g, h, l, p, v, t >> Da(v))
      } else k.texImage3D(a, b, c, d, e, g, h, l, p, null)
    }

    function hi(a, b, c) {
      k.texParameterf(a, b, c)
    }

    function ii(a, b, c) {
      c = D[c >> 2];
      k.texParameterf(a, b, c)
    }

    function ji(a, b,
      c) {
      k.texParameteri(a, b, c)
    }

    function ki(a, b, c) {
      c = q[c >> 2];
      k.texParameteri(a, b, c)
    }

    function li(a, b, c, d, e) {
      k.texStorage2D(a, b, c, d, e)
    }

    function mi(a, b, c, d, e, g) {
      k.texStorage3D(a, b, c, d, e, g)
    }

    function ni(a, b, c, d, e, g, h, l, p) {
      if (2 <= m.currentContext.version)
        if (k.currentPixelUnpackBufferBinding) k.texSubImage2D(a, b, c, d, e, g, h, l, p);
        else if (p) {
        var t = Ca(l);
        k.texSubImage2D(a, b, c, d, e, g, h, l, t, p >> Da(t))
      } else k.texSubImage2D(a, b, c, d, e, g, h, l, null);
      else t = null, p && (t = Qb(l, h, e, g, p, 0)), k.texSubImage2D(a, b, c, d, e, g, h, l, t)
    }

    function oi(a,
      b, c, d, e, g, h, l, p, t, v) {
      if (k.currentPixelUnpackBufferBinding) k.texSubImage3D(a, b, c, d, e, g, h, l, p, t, v);
      else if (v) {
        var C = Ca(t);
        k.texSubImage3D(a, b, c, d, e, g, h, l, p, t, C, v >> Da(C))
      } else k.texSubImage3D(a, b, c, d, e, g, h, l, p, t, null)
    }

    function pi(a, b, c, d) {
      a = m.programs[a];
      for (var e = [], g = 0; g < b; g++) e.push(S(q[c + 4 * g >> 2]));
      k.transformFeedbackVaryings(a, e, d)
    }

    function qi(a, b) {
      k.uniform1f(J(a), b)
    }

    function ri(a, b, c) {
      if (2 <= m.currentContext.version) b && k.uniform1fv(J(a), D, c >> 2, b);
      else {
        if (288 >= b)
          for (var d = qa[b - 1], e = 0; e < b; ++e) d[e] =
            D[c + 4 * e >> 2];
        else d = D.subarray(c >> 2, c + 4 * b >> 2);
        k.uniform1fv(J(a), d)
      }
    }

    function si(a, b) {
      k.uniform1i(J(a), b)
    }

    function ti(a, b, c) {
      if (2 <= m.currentContext.version) b && k.uniform1iv(J(a), q, c >> 2, b);
      else {
        if (288 >= b)
          for (var d = Va[b - 1], e = 0; e < b; ++e) d[e] = q[c + 4 * e >> 2];
        else d = q.subarray(c >> 2, c + 4 * b >> 2);
        k.uniform1iv(J(a), d)
      }
    }

    function ui(a, b) {
      k.uniform1ui(J(a), b)
    }

    function vi(a, b, c) {
      b && k.uniform1uiv(J(a), P, c >> 2, b)
    }

    function wi(a, b, c) {
      k.uniform2f(J(a), b, c)
    }

    function xi(a, b, c) {
      if (2 <= m.currentContext.version) b && k.uniform2fv(J(a),
        D, c >> 2, 2 * b);
      else {
        if (144 >= b)
          for (var d = qa[2 * b - 1], e = 0; e < 2 * b; e += 2) d[e] = D[c + 4 * e >> 2], d[e + 1] = D[c + (4 * e + 4) >> 2];
        else d = D.subarray(c >> 2, c + 8 * b >> 2);
        k.uniform2fv(J(a), d)
      }
    }

    function yi(a, b, c) {
      k.uniform2i(J(a), b, c)
    }

    function zi(a, b, c) {
      if (2 <= m.currentContext.version) b && k.uniform2iv(J(a), q, c >> 2, 2 * b);
      else {
        if (144 >= b)
          for (var d = Va[2 * b - 1], e = 0; e < 2 * b; e += 2) d[e] = q[c + 4 * e >> 2], d[e + 1] = q[c + (4 * e + 4) >> 2];
        else d = q.subarray(c >> 2, c + 8 * b >> 2);
        k.uniform2iv(J(a), d)
      }
    }

    function Ai(a, b, c) {
      k.uniform2ui(J(a), b, c)
    }

    function Bi(a, b, c) {
      b && k.uniform2uiv(J(a),
        P, c >> 2, 2 * b)
    }

    function Ci(a, b, c, d) {
      k.uniform3f(J(a), b, c, d)
    }

    function Di(a, b, c) {
      if (2 <= m.currentContext.version) b && k.uniform3fv(J(a), D, c >> 2, 3 * b);
      else {
        if (96 >= b)
          for (var d = qa[3 * b - 1], e = 0; e < 3 * b; e += 3) d[e] = D[c + 4 * e >> 2], d[e + 1] = D[c + (4 * e + 4) >> 2], d[e + 2] = D[c + (4 * e + 8) >> 2];
        else d = D.subarray(c >> 2, c + 12 * b >> 2);
        k.uniform3fv(J(a), d)
      }
    }

    function Ei(a, b, c, d) {
      k.uniform3i(J(a), b, c, d)
    }

    function Fi(a, b, c) {
      if (2 <= m.currentContext.version) b && k.uniform3iv(J(a), q, c >> 2, 3 * b);
      else {
        if (96 >= b)
          for (var d = Va[3 * b - 1], e = 0; e < 3 * b; e += 3) d[e] = q[c + 4 * e >> 2],
            d[e + 1] = q[c + (4 * e + 4) >> 2], d[e + 2] = q[c + (4 * e + 8) >> 2];
        else d = q.subarray(c >> 2, c + 12 * b >> 2);
        k.uniform3iv(J(a), d)
      }
    }

    function Gi(a, b, c, d) {
      k.uniform3ui(J(a), b, c, d)
    }

    function Hi(a, b, c) {
      b && k.uniform3uiv(J(a), P, c >> 2, 3 * b)
    }

    function Ii(a, b, c, d, e) {
      k.uniform4f(J(a), b, c, d, e)
    }

    function Ji(a, b, c) {
      if (2 <= m.currentContext.version) b && k.uniform4fv(J(a), D, c >> 2, 4 * b);
      else {
        if (72 >= b) {
          var d = qa[4 * b - 1],
            e = D;
          c >>= 2;
          for (var g = 0; g < 4 * b; g += 4) {
            var h = c + g;
            d[g] = e[h];
            d[g + 1] = e[h + 1];
            d[g + 2] = e[h + 2];
            d[g + 3] = e[h + 3]
          }
        } else d = D.subarray(c >> 2, c + 16 * b >> 2);
        k.uniform4fv(J(a),
          d)
      }
    }

    function Ki(a, b, c, d, e) {
      k.uniform4i(J(a), b, c, d, e)
    }

    function Li(a, b, c) {
      if (2 <= m.currentContext.version) b && k.uniform4iv(J(a), q, c >> 2, 4 * b);
      else {
        if (72 >= b)
          for (var d = Va[4 * b - 1], e = 0; e < 4 * b; e += 4) d[e] = q[c + 4 * e >> 2], d[e + 1] = q[c + (4 * e + 4) >> 2], d[e + 2] = q[c + (4 * e + 8) >> 2], d[e + 3] = q[c + (4 * e + 12) >> 2];
        else d = q.subarray(c >> 2, c + 16 * b >> 2);
        k.uniform4iv(J(a), d)
      }
    }

    function Mi(a, b, c, d, e) {
      k.uniform4ui(J(a), b, c, d, e)
    }

    function Ni(a, b, c) {
      b && k.uniform4uiv(J(a), P, c >> 2, 4 * b)
    }

    function Oi(a, b, c) {
      a = m.programs[a];
      k.uniformBlockBinding(a, b, c)
    }

    function Pi(a,
      b, c, d) {
      if (2 <= m.currentContext.version) b && k.uniformMatrix2fv(J(a), !!c, D, d >> 2, 4 * b);
      else {
        if (72 >= b)
          for (var e = qa[4 * b - 1], g = 0; g < 4 * b; g += 4) e[g] = D[d + 4 * g >> 2], e[g + 1] = D[d + (4 * g + 4) >> 2], e[g + 2] = D[d + (4 * g + 8) >> 2], e[g + 3] = D[d + (4 * g + 12) >> 2];
        else e = D.subarray(d >> 2, d + 16 * b >> 2);
        k.uniformMatrix2fv(J(a), !!c, e)
      }
    }

    function Qi(a, b, c, d) {
      b && k.uniformMatrix2x3fv(J(a), !!c, D, d >> 2, 6 * b)
    }

    function Ri(a, b, c, d) {
      b && k.uniformMatrix2x4fv(J(a), !!c, D, d >> 2, 8 * b)
    }

    function Si(a, b, c, d) {
      if (2 <= m.currentContext.version) b && k.uniformMatrix3fv(J(a), !!c, D, d >>
        2, 9 * b);
      else {
        if (32 >= b)
          for (var e = qa[9 * b - 1], g = 0; g < 9 * b; g += 9) e[g] = D[d + 4 * g >> 2], e[g + 1] = D[d + (4 * g + 4) >> 2], e[g + 2] = D[d + (4 * g + 8) >> 2], e[g + 3] = D[d + (4 * g + 12) >> 2], e[g + 4] = D[d + (4 * g + 16) >> 2], e[g + 5] = D[d + (4 * g + 20) >> 2], e[g + 6] = D[d + (4 * g + 24) >> 2], e[g + 7] = D[d + (4 * g + 28) >> 2], e[g + 8] = D[d + (4 * g + 32) >> 2];
        else e = D.subarray(d >> 2, d + 36 * b >> 2);
        k.uniformMatrix3fv(J(a), !!c, e)
      }
    }

    function Ti(a, b, c, d) {
      b && k.uniformMatrix3x2fv(J(a), !!c, D, d >> 2, 6 * b)
    }

    function Ui(a, b, c, d) {
      b && k.uniformMatrix3x4fv(J(a), !!c, D, d >> 2, 12 * b)
    }

    function Vi(a, b, c, d) {
      if (2 <= m.currentContext.version) b &&
        k.uniformMatrix4fv(J(a), !!c, D, d >> 2, 16 * b);
      else {
        if (18 >= b) {
          var e = qa[16 * b - 1],
            g = D;
          d >>= 2;
          for (var h = 0; h < 16 * b; h += 16) {
            var l = d + h;
            e[h] = g[l];
            e[h + 1] = g[l + 1];
            e[h + 2] = g[l + 2];
            e[h + 3] = g[l + 3];
            e[h + 4] = g[l + 4];
            e[h + 5] = g[l + 5];
            e[h + 6] = g[l + 6];
            e[h + 7] = g[l + 7];
            e[h + 8] = g[l + 8];
            e[h + 9] = g[l + 9];
            e[h + 10] = g[l + 10];
            e[h + 11] = g[l + 11];
            e[h + 12] = g[l + 12];
            e[h + 13] = g[l + 13];
            e[h + 14] = g[l + 14];
            e[h + 15] = g[l + 15]
          }
        } else e = D.subarray(d >> 2, d + 64 * b >> 2);
        k.uniformMatrix4fv(J(a), !!c, e)
      }
    }

    function Wi(a, b, c, d) {
      b && k.uniformMatrix4x2fv(J(a), !!c, D, d >> 2, 8 * b)
    }

    function Xi(a, b, c,
      d) {
      b && k.uniformMatrix4x3fv(J(a), !!c, D, d >> 2, 12 * b)
    }

    function Yi(a) {
      a = m.programs[a];
      k.useProgram(a);
      k.currentProgram = a
    }

    function Zi(a) {
      k.validateProgram(m.programs[a])
    }

    function $i(a, b) {
      k.vertexAttrib1f(a, b)
    }

    function aj(a, b) {
      k.vertexAttrib1f(a, D[b >> 2])
    }

    function bj(a, b, c) {
      k.vertexAttrib2f(a, b, c)
    }

    function cj(a, b) {
      k.vertexAttrib2f(a, D[b >> 2], D[b + 4 >> 2])
    }

    function dj(a, b, c, d) {
      k.vertexAttrib3f(a, b, c, d)
    }

    function ej(a, b) {
      k.vertexAttrib3f(a, D[b >> 2], D[b + 4 >> 2], D[b + 8 >> 2])
    }

    function fj(a, b, c, d, e) {
      k.vertexAttrib4f(a, b,
        c, d, e)
    }

    function gj(a, b) {
      k.vertexAttrib4f(a, D[b >> 2], D[b + 4 >> 2], D[b + 8 >> 2], D[b + 12 >> 2])
    }

    function Wa(a, b) {
      k.vertexAttribDivisor(a, b)
    }

    function hj(a, b, c, d, e) {
      k.vertexAttribI4i(a, b, c, d, e)
    }

    function ij(a, b) {
      k.vertexAttribI4i(a, q[b >> 2], q[b + 4 >> 2], q[b + 8 >> 2], q[b + 12 >> 2])
    }

    function jj(a, b, c, d, e) {
      k.vertexAttribI4ui(a, b, c, d, e)
    }

    function kj(a, b) {
      k.vertexAttribI4ui(a, P[b >> 2], P[b + 4 >> 2], P[b + 8 >> 2], P[b + 12 >> 2])
    }

    function lj(a, b, c, d, e) {
      k.vertexAttribIPointer(a, b, c, d, e)
    }

    function mj(a, b, c, d, e, g) {
      k.vertexAttribPointer(a, b, c, !!d,
        e, g)
    }

    function nj(a, b, c, d) {
      k.viewport(a, b, c, d)
    }

    function oj(a, b, c, d) {
      c = (c >>> 0) + 4294967296 * d;
      k.waitSync(m.syncs[a], b, c)
    }

    function Gc(a, b) {
      if (0 >= a) return a;
      var c = 32 >= b ? Math.abs(1 << b - 1) : Math.pow(2, b - 1);
      a >= c && (32 >= b || a > c) && (a = -2 * c + a);
      return a
    }

    function Hc(a, b) {
      return 0 <= a ? a : 32 >= b ? 2 * Math.abs(1 << b - 1) + a : Math.pow(2, b) + a
    }

    function pj(a) {
      for (var b = a; I[b];) ++b;
      return b - a
    }

    function Ic(a, b, c) {
      c = 0 < c ? c : hb(a) + 1;
      c = Array(c);
      a = ea(a, c, 0, c.length);
      b && (c.length = a);
      return c
    }

    function qj(a, b) {
      function c(R) {
        var ca = d;
        ("double" ===
          R || "i64" === R) && ca & 7 && (ca += 4);
        d = ca;
        "double" === R ? (R = Za[d >> 3], d += 8) : "i64" == R ? (R = [q[d >> 2], q[d + 4 >> 2]], d += 8) : (R = q[d >> 2], d += 4);
        return R
      }
      for (var d = b, e = [], g, h;;) {
        var l = a;
        g = T[a >> 0];
        if (0 === g) break;
        h = T[a + 1 >> 0];
        if (37 == g) {
          var p = !1,
            t = b = !1,
            v = !1,
            C = !1;
          a: for (;;) {
            switch (h) {
              case 43:
                p = !0;
                break;
              case 45:
                b = !0;
                break;
              case 35:
                t = !0;
                break;
              case 48:
                if (v) break a;
                else {
                  v = !0;
                  break
                }
              case 32:
                C = !0;
                break;
              default:
                break a
            }
            a++;
            h = T[a + 1 >> 0]
          }
          var L = 0;
          if (42 == h) L = c("i32"), a++, h = T[a + 1 >> 0];
          else
            for (; 48 <= h && 57 >= h;) L = 10 * L + (h - 48), a++, h = T[a + 1 >> 0];
          var n = !1,
            x = -1;
          if (46 == h) {
            x = 0;
            n = !0;
            a++;
            h = T[a + 1 >> 0];
            if (42 == h) x = c("i32"), a++;
            else
              for (;;) {
                h = T[a + 1 >> 0];
                if (48 > h || 57 < h) break;
                x = 10 * x + (h - 48);
                a++
              }
            h = T[a + 1 >> 0]
          }
          0 > x && (x = 6, n = !1);
          switch (String.fromCharCode(h)) {
            case "h":
              h = T[a + 2 >> 0];
              if (104 == h) {
                a++;
                var B = 1
              } else B = 2;
              break;
            case "l":
              h = T[a + 2 >> 0];
              108 == h ? (a++, B = 8) : B = 4;
              break;
            case "L":
            case "q":
            case "j":
              B = 8;
              break;
            case "z":
            case "t":
            case "I":
              B = 4;
              break;
            default:
              B = null
          }
          B && a++;
          h = T[a + 1 >> 0];
          switch (String.fromCharCode(h)) {
            case "d":
            case "i":
            case "u":
            case "o":
            case "x":
            case "X":
            case "p":
              l = 100 ==
                h || 105 == h;
              B = B || 4;
              g = c("i" + 8 * B);
              8 == B && (g = 117 == h ? (g[0] >>> 0) + 4294967296 * (g[1] >>> 0) : (g[0] >>> 0) + 4294967296 * g[1]);
              if (4 >= B) {
                var M = Math.pow(256, B) - 1;
                g = (l ? Gc : Hc)(g & M, 8 * B)
              }
              M = Math.abs(g);
              l = "";
              if (100 == h || 105 == h) var y = Gc(g, 8 * B).toString(10);
              else if (117 == h) y = Hc(g, 8 * B).toString(10), g = Math.abs(g);
              else if (111 == h) y = (t ? "0" : "") + M.toString(8);
              else if (120 == h || 88 == h) {
                l = t && 0 != g ? "0x" : "";
                if (0 > g) {
                  g = -g;
                  y = (M - 1).toString(16);
                  M = [];
                  for (t = 0; t < y.length; t++) M.push((15 - parseInt(y[t], 16)).toString(16));
                  for (y = M.join(""); y.length < 2 * B;) y =
                    "f" + y
                } else y = M.toString(16);
                88 == h && (l = l.toUpperCase(), y = y.toUpperCase())
              } else 112 == h && (0 === M ? y = "(nil)" : (l = "0x", y = M.toString(16)));
              if (n)
                for (; y.length < x;) y = "0" + y;
              0 <= g && (p ? l = "+" + l : C && (l = " " + l));
              "-" == y.charAt(0) && (l = "-" + l, y = y.substr(1));
              for (; l.length + y.length < L;) b ? y += " " : v ? y = "0" + y : l = " " + l;
              y = l + y;
              y.split("").forEach(function(R) {
                e.push(R.charCodeAt(0))
              });
              break;
            case "f":
            case "F":
            case "e":
            case "E":
            case "g":
            case "G":
              g = c("double");
              if (isNaN(g)) y = "nan", v = !1;
              else if (isFinite(g)) {
                n = !1;
                B = Math.min(x, 20);
                if (103 == h ||
                  71 == h) n = !0, x = x || 1, B = parseInt(g.toExponential(B).split("e")[1], 10), x > B && -4 <= B ? (h = (103 == h ? "f" : "F").charCodeAt(0), x -= B + 1) : (h = (103 == h ? "e" : "E").charCodeAt(0), x--), B = Math.min(x, 20);
                if (101 == h || 69 == h) y = g.toExponential(B), /[eE][-+]\d$/.test(y) && (y = y.slice(0, -1) + "0" + y.slice(-1));
                else if (102 == h || 70 == h) y = g.toFixed(B), 0 === g && (0 > g || 0 === g && -Infinity === 1 / g) && (y = "-" + y);
                l = y.split("e");
                if (n && !t)
                  for (; 1 < l[0].length && l[0].includes(".") && ("0" == l[0].slice(-1) || "." == l[0].slice(-1));) l[0] = l[0].slice(0, -1);
                else
                  for (t && -1 ==
                    y.indexOf(".") && (l[0] += "."); x > B++;) l[0] += "0";
                y = l[0] + (1 < l.length ? "e" + l[1] : "");
                69 == h && (y = y.toUpperCase());
                0 <= g && (p ? y = "+" + y : C && (y = " " + y))
              } else y = (0 > g ? "-" : "") + "inf", v = !1;
              for (; y.length < L;) y = b ? y + " " : !v || "-" != y[0] && "+" != y[0] ? (v ? "0" : " ") + y : y[0] + "0" + y.slice(1);
              97 > h && (y = y.toUpperCase());
              y.split("").forEach(function(R) {
                e.push(R.charCodeAt(0))
              });
              break;
            case "s":
              v = (p = c("i8*")) ? pj(p) : 6;
              n && (v = Math.min(v, x));
              if (!b)
                for (; v < L--;) e.push(32);
              if (p)
                for (t = 0; t < v; t++) e.push(I[p++ >> 0]);
              else e = e.concat(Ic("(null)".substr(0, v),
                !0));
              if (b)
                for (; v < L--;) e.push(32);
              break;
            case "c":
              for (b && e.push(c("i8")); 0 < --L;) e.push(32);
              b || e.push(c("i8"));
              break;
            case "n":
              b = c("i32*");
              q[b >> 2] = e.length;
              break;
            case "%":
              e.push(g);
              break;
            default:
              for (t = l; t < a + 2; t++) e.push(T[t >> 0])
          }
          a += 2
        } else e.push(g), a += 1
      }
      return e
    }

    function Rb(a) {
      if (!a || !a.callee || !a.callee.name) return [null, "", ""];
      var b = a.callee.name,
        c = "(",
        d = !0,
        e;
      for (e in a) {
        var g = a[e];
        d || (c += ", ");
        d = !1;
        c = "number" == typeof g || "string" == typeof g ? c + g : c + ("(" + typeof g + "})")
      }
      c += ")";
      a = (a = a.callee.caller) ? a.arguments : [];
      d && (c = "");
      return [a, b, c]
    }

    function Sb() {
      var a = Error();
      if (!a.stack) {
        try {
          throw Error();
        } catch (b) {
          a = b
        }
        if (!a.stack) return "(no stack trace available)"
      }
      return a.stack.toString()
    }

    function rj(a) {
      var b = Sb(),
        c = b.lastIndexOf("_emscripten_log"),
        d = b.lastIndexOf("_emscripten_get_callstack");
      c = b.indexOf("\n", Math.max(c, d)) + 1;
      b = b.slice(c);
      a & 32 && Ba("EM_LOG_DEMANGLE is deprecated; ignoring");
      a & 8 && "undefined" == typeof emscripten_source_map && (Ba('Source map information is not available, emscripten_log with EM_LOG_C_STACK will be ignored. Build with "--pre-js $EMSCRIPTEN/src/emscripten-source-map.min.js" linker flag to add source map loading to code.'),
        a ^= 8, a |= 16);
      c = null;
      if (a & 128)
        for (c = Rb(arguments); c[1].includes("_emscripten_");) c = Rb(c[0]);
      d = b.split("\n");
      b = "";
      var e = RegExp("\\s*(.*?)@(.*?):([0-9]+):([0-9]+)"),
        g = RegExp("\\s*(.*?)@(.*):(.*)(:(.*))?"),
        h = RegExp("\\s*at (.*?) \\((.*):(.*):(.*)\\)"),
        l;
      for (l in d) {
        var p = d[l],
          t;
        if ((t = h.exec(p)) && 5 == t.length) {
          p = t[1];
          var v = t[2];
          var C = t[3];
          t = t[4]
        } else if ((t = e.exec(p)) || (t = g.exec(p)), t && 4 <= t.length) p = t[1], v = t[2], C = t[3], t = t[4] | 0;
        else {
          b += p + "\n";
          continue
        }
        var L = !1;
        if (a & 8) {
          var n = emscripten_source_map.originalPositionFor({
            line: C,
            column: t
          });
          if (L = n && n.source) a & 64 && (n.source = n.source.substring(n.source.replace(/\\/g, "/").lastIndexOf("/") + 1)), b += "    at " + p + " (" + n.source + ":" + n.line + ":" + n.column + ")\n"
        }
        if (a & 16 || !L) a & 64 && (v = v.substring(v.replace(/\\/g, "/").lastIndexOf("/") + 1)), b += (L ? "     = " + p : "    at " + p) + (" (" + v + ":" + C + ":" + t + ")\n");
        a & 128 && c[0] && (c[1] == p && 0 < c[2].length && (b = b.replace(/\s+$/, ""), b += " with values: " + c[1] + c[2] + "\n"), c = Rb(c[0]))
      }
      return b = b.replace(/\s+$/, "")
    }

    function sj(a, b, c) {
      b = qj(b, c);
      b = fa(b, 0);
      a & 24 && (b = b.replace(/\s+$/,
        ""), b += (0 < b.length ? "\n" : "") + rj(a));
      a & 1 ? a & 4 ? console.error(b) : a & 2 ? console.warn(b) : a & 512 ? console.info(b) : a & 256 ? console.debug(b) : console.log(b) : a & 6 ? ia(b) : Kb(b)
    }

    function tj() {
      K("Cannot use emscripten_pc_get_function without -sUSE_OFFSET_CONVERTER")
    }

    function uj(a) {
      var b = I.length;
      a >>>= 0;
      if (2147483648 < a) return !1;
      for (var c = 1; 4 >= c; c *= 2) {
        var d = b * (1 + .2 / c);
        d = Math.min(d, a + 100663296);
        var e = Math,
          g = e.min;
        d = Math.max(a, d);
        d += (65536 - d % 65536) % 65536;
        e = g.call(e, 2147483648, d);
        a: {
          g = Ya.buffer;e = e - g.byteLength + 65535 >>> 16;
          try {
            Ya.grow(e);
            F();
            var h = 1;
            break a
          } catch (l) {}
          h = void 0
        }
        if (h) return !0
      }
      return !1
    }

    function ob() {
      K("Cannot use convertFrameToPC (needed by __builtin_return_address) without -sUSE_OFFSET_CONVERTER");
      return 0
    }

    function Jc(a) {
      a.forEach(function(b) {
        var c = ob(b);
        c && (Ea[c] = b)
      })
    }

    function vj() {
      var a = Sb().split("\n");
      "Error" == a[0] && a.shift();
      Jc(a);
      Ea.last_addr = ob(a[3]);
      Ea.last_stack = a;
      return Ea.last_addr
    }

    function wj(a, b, c) {
      if (Ea.last_addr == a) var d = Ea.last_stack;
      else d = Sb().split("\n"), "Error" == d[0] && d.shift(), Jc(d);
      for (var e = 3; d[e] &&
        ob(d[e]) != a;) ++e;
      for (a = 0; a < c && d[a + e]; ++a) q[b + 4 * a >> 2] = ob(d[a + e]);
      return a
    }

    function xj(a) {
      try {
        if (!a) return window;
        "number" == typeof a && (a = yj[a] || S(a));
        return "#window" === a ? window : "#document" === a ? document : "#screen" === a ? screen : "#canvas" === a ? f.canvas : "string" == typeof a ? document.getElementById(a) : a
      } catch (b) {
        return null
      }
    }

    function zj(a, b) {
      b >>= 2;
      var c = q[b + 6];
      b = {
        alpha: !!q[b + 0],
        depth: !!q[b + 1],
        stencil: !!q[b + 2],
        antialias: !!q[b + 3],
        premultipliedAlpha: !!q[b + 4],
        preserveDrawingBuffer: !!q[b + 5],
        powerPreference: Aj[c],
        failIfMajorPerformanceCaveat: !!q[b +
          7],
        majorVersion: q[b + 8],
        minorVersion: q[b + 9],
        enableExtensionsByDefault: q[b + 10],
        explicitSwapControl: q[b + 11],
        proxyContextToMainThread: q[b + 12],
        renderViaOffscreenBackBuffer: q[b + 13]
      };
      "number" == typeof a && (a = S(a));
      a = a && "#canvas" !== a ? "undefined" != typeof m && m.offscreenCanvases[a] ? m.offscreenCanvases[a] : xj(a) : "undefined" != typeof m && m.offscreenCanvases.canvas ? m.offscreenCanvases.canvas : f.canvas;
      return !a || b.explicitSwapControl ? 0 : a = m.createContext(a, b)
    }

    function Bj(a) {
      a >>= 2;
      for (var b = 0; 14 > b; ++b) q[a + b] = 0;
      q[a + 0] = q[a +
        1] = q[a + 3] = q[a + 4] = q[a + 8] = q[a + 10] = 1
    }

    function Cj(a) {
      return (a = m.makeContextCurrent(a)) ? 0 : -5
    }

    function Xa() {
      if (!Xa.strings) {
        var a = ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
        a = {
          USER: "web_user",
          LOGNAME: "web_user",
          PATH: "/",
          PWD: "/",
          HOME: "/home/web_user",
          LANG: a,
          _: Tb || "./this.program"
        };
        for (var b in pb) void 0 === pb[b] ? delete a[b] : a[b] = pb[b];
        var c = [];
        for (b in a) c.push(b + "=" + a[b]);
        Xa.strings = c
      }
      return Xa.strings
    }

    function Dj(a, b) {
      var c = 0;
      Xa().forEach(function(d,
        e) {
        var g = b + c;
        P[a + 4 * e >> 2] = g;
        e = d;
        for (var h = 0; h < e.length; ++h) T[g++ >> 0] = e.charCodeAt(h);
        T[g >> 0] = 0;
        c += d.length + 1
      });
      return 0
    }

    function Ej(a, b) {
      var c = Xa();
      P[a >> 2] = c.length;
      var d = 0;
      c.forEach(function(e) {
        d += e.length + 1
      });
      P[b >> 2] = d;
      return 0
    }

    function Fj() {
      return 52
    }

    function Gj() {
      return 52
    }

    function Hj() {
      return 70
    }

    function Ij(a, b, c, d) {
      for (var e = 0, g = 0; g < c; g++) {
        var h = P[b >> 2],
          l = P[b + 4 >> 2];
        b += 8;
        for (var p = 0; p < l; p++) {
          var t = I[h + p],
            v = Jj[a];
          0 === t || 10 === t ? ((1 === a ? Kb : ia)(fa(v, 0)), v.length = 0) : v.push(t)
        }
        e += l
      }
      P[d >> 2] = e;
      return 0
    }

    function Kj() {
      if ("object" == typeof crypto && "function" == typeof crypto.getRandomValues) return function(d) {
        return crypto.getRandomValues(d)
      };
      if (wa) try {
        var a = require("crypto"),
          b = a.randomFillSync;
        if (b) return function(d) {
          return a.randomFillSync(d)
        };
        var c = a.randomBytes;
        return function(d) {
          return d.set(c(d.byteLength)), d
        }
      } catch (d) {}
      K("initRandomDevice")
    }

    function Kc(a) {
      return (Kc = Kj())(a)
    }

    function Lj(a, b) {
      Kc(I.subarray(a, a + b));
      return 0
    }

    function qb(a) {
      return 0 === a % 4 && (0 !== a % 100 || 0 === a % 400)
    }

    function Mj(a, b, c, d) {
      function e(n,
        x, B) {
        for (n = "number" == typeof n ? n.toString() : n || ""; n.length < x;) n = B[0] + n;
        return n
      }

      function g(n, x) {
        return e(n, x, "0")
      }

      function h(n, x) {
        function B(y) {
          return 0 > y ? -1 : 0 < y ? 1 : 0
        }
        var M;
        0 === (M = B(n.getFullYear() - x.getFullYear())) && 0 === (M = B(n.getMonth() - x.getMonth())) && (M = B(n.getDate() - x.getDate()));
        return M
      }

      function l(n) {
        switch (n.getDay()) {
          case 0:
            return new Date(n.getFullYear() - 1, 11, 29);
          case 1:
            return n;
          case 2:
            return new Date(n.getFullYear(), 0, 3);
          case 3:
            return new Date(n.getFullYear(), 0, 2);
          case 4:
            return new Date(n.getFullYear(),
              0, 1);
          case 5:
            return new Date(n.getFullYear() - 1, 11, 31);
          case 6:
            return new Date(n.getFullYear() - 1, 11, 30)
        }
      }

      function p(n) {
        a: {
          var x = new Date(n.tm_year + 1900, 0, 1);n = n.tm_yday;
          for (x = new Date(x.getTime()); 0 < n;) {
            var B = qb(x.getFullYear()),
              M = x.getMonth();
            B = (B ? Lc : Mc)[M];
            if (n > B - x.getDate()) n -= B - x.getDate() + 1, x.setDate(1), 11 > M ? x.setMonth(M + 1) : (x.setMonth(0), x.setFullYear(x.getFullYear() + 1));
            else {
              x.setDate(x.getDate() + n);
              n = x;
              break a
            }
          }
          n = x
        }
        M = new Date(n.getFullYear(), 0, 4);x = new Date(n.getFullYear() + 1, 0, 4);M = l(M);x = l(x);
        return 0 >= h(M, n) ? 0 >= h(x, n) ? n.getFullYear() + 1 : n.getFullYear() : n.getFullYear() - 1
      }
      var t = q[d + 40 >> 2];
      d = {
        tm_sec: q[d >> 2],
        tm_min: q[d + 4 >> 2],
        tm_hour: q[d + 8 >> 2],
        tm_mday: q[d + 12 >> 2],
        tm_mon: q[d + 16 >> 2],
        tm_year: q[d + 20 >> 2],
        tm_wday: q[d + 24 >> 2],
        tm_yday: q[d + 28 >> 2],
        tm_isdst: q[d + 32 >> 2],
        tm_gmtoff: q[d + 36 >> 2],
        tm_zone: t ? S(t) : ""
      };
      c = S(c);
      t = {
        "%c": "%a %b %d %H:%M:%S %Y",
        "%D": "%m/%d/%y",
        "%F": "%Y-%m-%d",
        "%h": "%b",
        "%r": "%I:%M:%S %p",
        "%R": "%H:%M",
        "%T": "%H:%M:%S",
        "%x": "%m/%d/%y",
        "%X": "%H:%M:%S",
        "%Ec": "%c",
        "%EC": "%C",
        "%Ex": "%m/%d/%y",
        "%EX": "%H:%M:%S",
        "%Ey": "%y",
        "%EY": "%Y",
        "%Od": "%d",
        "%Oe": "%e",
        "%OH": "%H",
        "%OI": "%I",
        "%Om": "%m",
        "%OM": "%M",
        "%OS": "%S",
        "%Ou": "%u",
        "%OU": "%U",
        "%OV": "%V",
        "%Ow": "%w",
        "%OW": "%W",
        "%Oy": "%y"
      };
      for (var v in t) c = c.replace(new RegExp(v, "g"), t[v]);
      var C = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
        L = "January February March April May June July August September October November December".split(" ");
      t = {
        "%a": function(n) {
          return C[n.tm_wday].substring(0, 3)
        },
        "%A": function(n) {
          return C[n.tm_wday]
        },
        "%b": function(n) {
          return L[n.tm_mon].substring(0, 3)
        },
        "%B": function(n) {
          return L[n.tm_mon]
        },
        "%C": function(n) {
          n = n.tm_year + 1900;
          return g(n / 100 | 0, 2)
        },
        "%d": function(n) {
          return g(n.tm_mday, 2)
        },
        "%e": function(n) {
          return e(n.tm_mday, 2, " ")
        },
        "%g": function(n) {
          return p(n).toString().substring(2)
        },
        "%G": function(n) {
          return p(n)
        },
        "%H": function(n) {
          return g(n.tm_hour, 2)
        },
        "%I": function(n) {
          n = n.tm_hour;
          0 == n ? n = 12 : 12 < n && (n -= 12);
          return g(n, 2)
        },
        "%j": function(n) {
          for (var x = n.tm_mday, B = qb(n.tm_year + 1900) ? Lc : Mc, M = 0, y = 0; y <= n.tm_mon -
            1; M += B[y++]);
          n = M;
          return g(x + n, 3)
        },
        "%m": function(n) {
          return g(n.tm_mon + 1, 2)
        },
        "%M": function(n) {
          return g(n.tm_min, 2)
        },
        "%n": function() {
          return "\n"
        },
        "%p": function(n) {
          return 0 <= n.tm_hour && 12 > n.tm_hour ? "AM" : "PM"
        },
        "%S": function(n) {
          return g(n.tm_sec, 2)
        },
        "%t": function() {
          return "\t"
        },
        "%u": function(n) {
          return n.tm_wday || 7
        },
        "%U": function(n) {
          n = n.tm_yday + 7 - n.tm_wday;
          return g(Math.floor(n / 7), 2)
        },
        "%V": function(n) {
          var x = Math.floor((n.tm_yday + 7 - (n.tm_wday + 6) % 7) / 7);
          2 >= (n.tm_wday + 371 - n.tm_yday - 2) % 7 && x++;
          if (x) 53 == x && (B = (n.tm_wday +
            371 - n.tm_yday) % 7, 4 == B || 3 == B && qb(n.tm_year) || (x = 1));
          else {
            x = 52;
            var B = (n.tm_wday + 7 - n.tm_yday - 1) % 7;
            (4 == B || 5 == B && qb(n.tm_year % 400 - 1)) && x++
          }
          return g(x, 2)
        },
        "%w": function(n) {
          return n.tm_wday
        },
        "%W": function(n) {
          n = n.tm_yday + 7 - (n.tm_wday + 6) % 7;
          return g(Math.floor(n / 7), 2)
        },
        "%y": function(n) {
          return (n.tm_year + 1900).toString().substring(2)
        },
        "%Y": function(n) {
          return n.tm_year + 1900
        },
        "%z": function(n) {
          n = n.tm_gmtoff;
          var x = 0 <= n;
          n = Math.abs(n) / 60;
          n = n / 60 * 100 + n % 60;
          return (x ? "+" : "-") + String("0000" + n).slice(-4)
        },
        "%Z": function(n) {
          return n.tm_zone
        },
        "%%": function() {
          return "%"
        }
      };
      c = c.replace(/%%/g, "\x00\x00");
      for (v in t) c.includes(v) && (c = c.replace(new RegExp(v, "g"), t[v](d)));
      c = c.replace(/\0\0/g, "%");
      v = Ic(c, !1);
      if (v.length > b) return 0;
      T.set(v, a);
      return v.length - 1
    }

    function Nj(a, b, c, d) {
      return Mj(a, b, c, d)
    }

    function Oj(a, b, c) {
      var d = rb();
      try {
        Nc(a, b, c)
      } catch (e) {
        sb(d);
        if (e !== e + 0) throw e;
        tb(1, 0)
      }
    }

    function Pj(a, b) {
      var c = rb();
      try {
        return Oc(a, b)
      } catch (d) {
        sb(c);
        if (d !== d + 0) throw d;
        tb(1, 0)
      }
    }

    function Qj(a, b, c, d, e, g) {
      var h = rb();
      try {
        Pc(a, b, c, d, e, g)
      } catch (l) {
        sb(h);
        if (l !== l + 0) throw l;
        tb(1, 0)
      }
    }

    function Qc() {
      function a() {
        if (!ub && (ub = !0, f.calledRun = !0, !ua)) {
          aa(Wb);
          Rc(f);
          if (f.onRuntimeInitialized) f.onRuntimeInitialized();
          if (f.postRun)
            for ("function" == typeof f.postRun && (f.postRun = [f.postRun]); f.postRun.length;) Sc.unshift(f.postRun.shift());
          aa(Sc)
        }
      }
      if (!(0 < ra)) {
        if (f.preRun)
          for ("function" == typeof f.preRun && (f.preRun = [f.preRun]); f.preRun.length;) Tc.unshift(f.preRun.shift());
        aa(Tc);
        0 < ra || (f.setStatus ? (f.setStatus("Running..."), setTimeout(function() {
          setTimeout(function() {
              f.setStatus("")
            },
            1);
          a()
        }, 1)) : a())
      }
    }
    w = void 0 === w ? {} : w;
    var f = "undefined" != typeof w ? w : {},
      Rc, $a;
    f.ready = new Promise(function(a, b) {
      Rc = a;
      $a = b
    });
    var Uc = Object.assign({}, f),
      Tb = "./this.program",
      kb = function(a, b) {
        throw b;
      },
      Vb = "object" == typeof window,
      va = "function" == typeof importScripts,
      wa = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node,
      ha = "";
    if (wa) {
      var Vc = require("fs"),
        Ub = require("path");
      ha = va ? Ub.dirname(ha) + "/" : __dirname + "/";
      var Wc = function(a, b) {
        a = a.startsWith("file://") ? new URL(a) :
          Ub.normalize(a);
        return Vc.readFileSync(a, b ? void 0 : "utf8")
      };
      var vb = function(a) {
        a = Wc(a, !0);
        a.buffer || (a = new Uint8Array(a));
        return a
      };
      var wb = function(a, b, c, d) {
        d = void 0 === d ? !0 : d;
        a = a.startsWith("file://") ? new URL(a) : Ub.normalize(a);
        Vc.readFile(a, d ? void 0 : "utf8", function(e, g) {
          e ? c(e) : b(d ? g.buffer : g)
        })
      };
      !f.thisProgram && 1 < process.argv.length && (Tb = process.argv[1].replace(/\\/g, "/"));
      kb = function(a, b) {
        process.exitCode = a;
        throw b;
      };
      f.inspect = function() {
        return "[Emscripten Module object]"
      }
    } else if (Vb || va) va ? ha = self.location.href :
      "undefined" != typeof document && document.currentScript && (ha = document.currentScript.src), u && (ha = u), ha = 0 !== ha.indexOf("blob:") ? ha.substr(0, ha.replace(/[?#].*/, "").lastIndexOf("/") + 1) : "", Wc = function(a) {
        var b = new XMLHttpRequest;
        b.open("GET", a, !1);
        b.send(null);
        return b.responseText
      }, va && (vb = function(a) {
        var b = new XMLHttpRequest;
        b.open("GET", a, !1);
        b.responseType = "arraybuffer";
        b.send(null);
        return new Uint8Array(b.response)
      }), wb = function(a, b, c) {
        var d = new XMLHttpRequest;
        d.open("GET", a, !0);
        d.responseType = "arraybuffer";
        d.onload = function() {
          200 == d.status || 0 == d.status && d.response ? b(d.response) : c()
        };
        d.onerror = c;
        d.send(null)
      };
    var Kb = f.print || console.log.bind(console),
      ia = f.printErr || console.error.bind(console);
    Object.assign(f, Uc);
    Uc = null;
    f.thisProgram && (Tb = f.thisProgram);
    f.quit && (kb = f.quit);
    var Ja;
    f.wasmBinary && (Ja = f.wasmBinary);
    var qc = f.noExitRuntime || !0;
    "object" != typeof WebAssembly && K("no native wasm support detected");
    var Ya, ua = !1,
      Ha, T, I, na, Ga, q, P, D, Za, Tc = [],
      Wb = [],
      Rj = [],
      Sc = [],
      ra = 0,
      xb = null,
      Ka = null;
    var Ia = "ink_engine_ink.wasm";
    Ia.startsWith("data:application/octet-stream;base64,") || (Ia = z(Ia));
    var tc = {
        327240: function(a, b, c, d) {
          return setTimeout(function() {
            return window.inkWasmRegistry[d].dynCall_vi(b, c)
          }, a)
        },
        327321: function(a) {
          clearTimeout(a)
        },
        327343: function(a, b) {
          window.inkHostRegistry[b].setTargetFPS(a)
        },
        327392: function(a) {
          window.inkHostRegistry[a].bindScreen()
        },
        327437: function(a, b) {
          window.inkHostRegistry[b].requestImage(S(a))
        },
        327500: function(a, b, c, d) {
          window.inkHostRegistry[d].setCursor(a, b, c)
        },
        327554: function(a, b, c) {
          window.inkHostRegistry[c].navigateToUri(S(a,
            b))
        },
        327622: function(a, b) {
          window.inkHostRegistry[b].setKeyboardMode(a)
        },
        327674: function(a) {
          return window.inkHostRegistry[a].shouldPreloadShaders()
        },
        327736: function(a) {
          return window.inkHostRegistry[a].shouldRegisterDocument()
        },
        327800: function(a, b, c, d, e, g) {
          a = window.inkHostRegistry[g].renderText(I.subarray(a, a + b), c, d);
          T.set(a, e)
        },
        327914: function(a, b, c, d, e, g) {
          return (a = window.inkHostRegistry[a].selectMatchingFont(S(b, c), d, !!e, g)) ? (b = hb(a) + 1, c = Ra(b), ea(a, I, c, b), c) : 0
        },
        328170: function(a, b, c) {
          window.inkHostRegistry[c].onSceneChange(new Uint8Array(I.subarray(a,
            a + b)))
        },
        328263: function(a, b, c, d, e, g, h, l, p) {
          window.inkHostRegistry[p].onImageExported(a, b, c, new Uint8ClampedArray(I.subarray(d, d + e)), g, h, S(l))
        },
        328403: function(a, b, c) {
          window.inkHostRegistry[c].onToolEvent(new Uint8Array(I.subarray(a, a + b)))
        },
        328494: function(a, b) {
          window.inkHostRegistry[b].onSequencePointReached(a)
        },
        328553: function(a, b, c) {
          window.inkHostRegistry[c].onFlagChanged(a, !!b)
        },
        328609: function(a) {
          window.inkHostRegistry[a].onCameraChanged()
        },
        328659: function(a, b) {
          window.inkHostRegistry[b].onCameraMovementStateChanged(!!a)
        },
        328726: function(a, b) {
          window.inkHostRegistry[b].onBlockingStateChanged(!!a)
        },
        328787: function(a) {
          window.inkHostRegistry[a].onInvisibleLayerActionPrevented()
        },
        328853: function(a, b, c) {
          window.inkHostRegistry[c].onPdfLoadSuccess(new Uint8Array(I.subarray(a, a + b)))
        },
        328949: function(a) {
          window.inkHostRegistry[a].onPdfLoadPasswordRequired()
        },
        329009: function(a, b, c) {
          window.inkHostRegistry[c].onPdfLoadFailure(S(a, b))
        },
        329080: function(a, b, c, d) {
          window.inkHostRegistry[d].onPdfSaveSuccess(a, new Uint8Array(I.subarray(b,
            b + c)))
        },
        329180: function(a, b, c, d) {
          window.inkHostRegistry[d].onPdfSaveFailure(a, S(b, c))
        },
        329255: function(a, b) {
          window.inkHostRegistry[a].onPdfUnsupportedFeature(b)
        },
        329315: function(a) {
          window.inkHostRegistry[a].onPdfFormChanged()
        },
        329366: function(a, b, c, d, e, g, h, l) {
          window.inkHostRegistry[a].onPdfFormFieldFocused(b, new Uint8Array(I.subarray(c, c + d)), e, !!g, S(h, l))
        },
        329503: function(a, b, c) {
          window.inkHostRegistry[c].onPdfFormTextFieldFocusChanged(!0, S(a, b))
        },
        329595: function(a) {
          window.inkHostRegistry[a].onPdfFormTextFieldFocusChanged(!1)
        },
        329665: function(a, b) {
          window.inkHostRegistry[b].onPendingTexturesChanged(!!a)
        },
        329728: function(a, b, c) {
          if (f.canvas) {
            var d = f.canvas.getContext("webgl");
            if (d) {
              var e = d.getExtension("WEBGL_debug_renderer_info");
              e && (ea(d.getParameter(e.UNMASKED_RENDERER_WEBGL), I, a, c), ea(d.getParameter(e.UNMASKED_VENDOR_WEBGL), I, b, c))
            }
          }
        },
        330014: function() {
          return !!f.ctx
        },
        330036: function() {
          debugger
        },
        330049: function() {
          return "undefined" !== typeof wasmOffsetConverter
        }
      },
      cb = {},
      ya = {},
      sa = {},
      bb = {},
      Yb = void 0,
      db = {},
      Zb = void 0,
      za = void 0,
      Cb = !1,
      cc = {},
      Na = [],
      Oa = void 0,
      Ma = {},
      hc = void 0,
      da = new yd,
      U = {
        toValue: function(a) {
          a || O("Cannot use deleted val. handle = " + a);
          return da.get(a).value
        },
        toHandle: function(a) {
          switch (a) {
            case void 0:
              return 1;
            case null:
              return 2;
            case !0:
              return 3;
            case !1:
              return 4;
            default:
              return da.allocate({
                refcount: 1,
                value: a
              })
          }
        }
      },
      ae = {},
      jb = [],
      mc = [],
      nc = {};
    wa && (global.performance = require("perf_hooks").performance);
    var Jb = function() {
      return performance.now()
    };
    var se = re,
      r = {
        mainLoop: {
          running: !1,
          scheduler: null,
          method: "",
          currentlyRunningMainloop: 0,
          func: null,
          arg: 0,
          timingMode: 0,
          timingValue: 0,
          currentFrameNumber: 0,
          queue: [],
          pause: function() {
            r.mainLoop.scheduler = null;
            r.mainLoop.currentlyRunningMainloop++
          },
          resume: function() {
            r.mainLoop.currentlyRunningMainloop++;
            var a = r.mainLoop.timingMode,
              b = r.mainLoop.timingValue,
              c = r.mainLoop.func;
            r.mainLoop.func = null;
            qe(c, 0, !1, r.mainLoop.arg, !0);
            Ib(a, b);
            r.mainLoop.scheduler()
          },
          updateStatus: function() {
            if (f.setStatus) {
              var a = f.statusMessage || "Please wait...",
                b = r.mainLoop.remainingBlockers,
                c = r.mainLoop.expectedBlockers;
              b ? b < c ? f.setStatus(a + " (" + (c - b) + "/" + c + ")") : f.setStatus(a) : f.setStatus("")
            }
          },
          runIter: function(a) {
            if (!ua) {
              if (f.preMainLoop) {
                var b = f.preMainLoop();
                if (!1 === b) return
              }
              Lb(a);
              f.postMainLoop && f.postMainLoop()
            }
          }
        },
        isFullscreen: !1,
        pointerLock: !1,
        moduleContextCreatedCallbacks: [],
        workers: [],
        init: function() {
          function a() {
            r.pointerLock = document.pointerLockElement === f.canvas || document.mozPointerLockElement === f.canvas || document.webkitPointerLockElement === f.canvas || document.msPointerLockElement === f.canvas
          }
          if (!r.initted) {
            r.initted = !0;
            var b = f.canvas;
            b && (b.requestPointerLock = b.requestPointerLock || b.mozRequestPointerLock || b.webkitRequestPointerLock || b.msRequestPointerLock || function() {}, b.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock || document.msExitPointerLock || function() {}, b.exitPointerLock = b.exitPointerLock.bind(document), document.addEventListener("pointerlockchange", a, !1), document.addEventListener("mozpointerlockchange", a, !1), document.addEventListener("webkitpointerlockchange",
              a, !1), document.addEventListener("mspointerlockchange", a, !1), f.elementPointerLock && b.addEventListener("click", function(c) {
              !r.pointerLock && f.canvas.requestPointerLock && (f.canvas.requestPointerLock(), c.preventDefault())
            }, !1))
          }
        },
        createContext: function(a, b, c, d) {
          if (b && f.ctx && a == f.canvas) return f.ctx;
          var e;
          if (b) {
            var g = {
              antialias: !1,
              alpha: !1,
              majorVersion: "undefined" != typeof WebGL2RenderingContext ? 2 : 1
            };
            if (d)
              for (var h in d) g[h] = d[h];
            if ("undefined" != typeof m && (e = m.createContext(a, g))) var l = m.getContext(e).GLctx
          } else l =
            a.getContext("2d");
          if (!l) return null;
          c && (b || "undefined" != typeof k && K("cannot set in module if GLctx is used, but we are a non-GL context that would replace it"), f.ctx = l, b && m.makeContextCurrent(e), f.useWebGL = b, r.moduleContextCreatedCallbacks.forEach(function(p) {
            return p()
          }), r.init());
          return l
        },
        destroyContext: function() {},
        fullscreenHandlersInstalled: !1,
        lockPointer: void 0,
        resizeCanvas: void 0,
        requestFullscreen: function(a, b) {
          function c() {
            r.isFullscreen = !1;
            var g = d.parentNode;
            (document.fullscreenElement ||
              document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === g ? (d.exitFullscreen = r.exitFullscreen, r.lockPointer && d.requestPointerLock(), r.isFullscreen = !0, r.resizeCanvas ? r.setFullscreenCanvasSize() : r.updateCanvasDimensions(d)) : (g.parentNode.insertBefore(d, g), g.parentNode.removeChild(g), r.resizeCanvas ? r.setWindowedCanvasSize() : r.updateCanvasDimensions(d));
            if (f.onFullScreen) f.onFullScreen(r.isFullscreen);
            if (f.onFullscreen) f.onFullscreen(r.isFullscreen)
          }
          r.lockPointer = a;
          r.resizeCanvas = b;
          "undefined" == typeof r.lockPointer && (r.lockPointer = !0);
          "undefined" == typeof r.resizeCanvas && (r.resizeCanvas = !1);
          var d = f.canvas;
          r.fullscreenHandlersInstalled || (r.fullscreenHandlersInstalled = !0, document.addEventListener("fullscreenchange", c, !1), document.addEventListener("mozfullscreenchange", c, !1), document.addEventListener("webkitfullscreenchange", c, !1), document.addEventListener("MSFullscreenChange", c, !1));
          var e = document.createElement("div");
          d.parentNode.insertBefore(e,
            d);
          e.appendChild(d);
          e.requestFullscreen = e.requestFullscreen || e.mozRequestFullScreen || e.msRequestFullscreen || (e.webkitRequestFullscreen ? function() {
            return e.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
          } : null) || (e.webkitRequestFullScreen ? function() {
            return e.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
          } : null);
          e.requestFullscreen()
        },
        exitFullscreen: function() {
          if (!r.isFullscreen) return !1;
          var a = document.exitFullscreen || document.cancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen ||
            document.webkitCancelFullScreen || function() {};
          a.apply(document, []);
          return !0
        },
        nextRAF: 0,
        fakeRequestAnimationFrame: function(a) {
          var b = Date.now();
          if (0 === r.nextRAF) r.nextRAF = b + 1E3 / 60;
          else
            for (; b + 2 >= r.nextRAF;) r.nextRAF += 1E3 / 60;
          b = Math.max(r.nextRAF - b, 0);
          setTimeout(a, b)
        },
        requestAnimationFrame: function(a) {
          if ("function" == typeof requestAnimationFrame) requestAnimationFrame(a);
          else {
            var b = r.fakeRequestAnimationFrame;
            b(a)
          }
        },
        safeSetTimeout: function(a, b) {
          return rc(a, b)
        },
        safeRequestAnimationFrame: function(a) {
          return r.requestAnimationFrame(function() {
            Lb(a)
          })
        },
        getMimetype: function(a) {
          return {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            bmp: "image/bmp",
            ogg: "audio/ogg",
            wav: "audio/wav",
            mp3: "audio/mpeg"
          } [a.substr(a.lastIndexOf(".") + 1)]
        },
        getUserMedia: function(a) {
          window.getUserMedia || (window.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia);
          window.getUserMedia(a)
        },
        getMovementX: function(a) {
          return a.movementX || a.mozMovementX || a.webkitMovementX || 0
        },
        getMovementY: function(a) {
          return a.movementY || a.mozMovementY || a.webkitMovementY || 0
        },
        getMouseWheelDelta: function(a) {
          switch (a.type) {
            case "DOMMouseScroll":
              var b =
                a.detail / 3;
              break;
            case "mousewheel":
              b = a.wheelDelta / 120;
              break;
            case "wheel":
              b = a.deltaY;
              switch (a.deltaMode) {
                case 0:
                  b /= 100;
                  break;
                case 1:
                  b /= 3;
                  break;
                case 2:
                  b *= 80;
                  break;
                default:
                  throw "unrecognized mouse wheel delta mode: " + a.deltaMode;
              }
              break;
            default:
              throw "unrecognized mouse wheel event: " + a.type;
          }
          return b
        },
        mouseX: 0,
        mouseY: 0,
        mouseMovementX: 0,
        mouseMovementY: 0,
        touches: {},
        lastTouches: {},
        calculateMouseEvent: function(a) {
          if (r.pointerLock) "mousemove" != a.type && "mozMovementX" in a ? r.mouseMovementX = r.mouseMovementY = 0 :
            (r.mouseMovementX = r.getMovementX(a), r.mouseMovementY = r.getMovementY(a)), "undefined" != typeof SDL ? (r.mouseX = SDL.mouseX + r.mouseMovementX, r.mouseY = SDL.mouseY + r.mouseMovementY) : (r.mouseX += r.mouseMovementX, r.mouseY += r.mouseMovementY);
          else {
            var b = f.canvas.getBoundingClientRect(),
              c = f.canvas.width,
              d = f.canvas.height,
              e = "undefined" != typeof window.scrollX ? window.scrollX : window.pageXOffset,
              g = "undefined" != typeof window.scrollY ? window.scrollY : window.pageYOffset;
            if ("touchstart" === a.type || "touchend" === a.type || "touchmove" ===
              a.type) {
              var h = a.touch;
              if (void 0 !== h)
                if (e = h.pageX - (e + b.left), g = h.pageY - (g + b.top), e *= c / b.width, g *= d / b.height, b = {
                    x: e,
                    y: g
                  }, "touchstart" === a.type) r.lastTouches[h.identifier] = b, r.touches[h.identifier] = b;
                else if ("touchend" === a.type || "touchmove" === a.type)(a = r.touches[h.identifier]) || (a = b), r.lastTouches[h.identifier] = a, r.touches[h.identifier] = b
            } else h = a.pageX - (e + b.left), a = a.pageY - (g + b.top), h *= c / b.width, a *= d / b.height, r.mouseMovementX = h - r.mouseX, r.mouseMovementY = a - r.mouseY, r.mouseX = h, r.mouseY = a
          }
        },
        resizeListeners: [],
        updateResizeListeners: function() {
          var a = f.canvas;
          r.resizeListeners.forEach(function(b) {
            return b(a.width, a.height)
          })
        },
        setCanvasSize: function(a, b, c) {
          var d = f.canvas;
          r.updateCanvasDimensions(d, a, b);
          c || r.updateResizeListeners()
        },
        windowedWidth: 0,
        windowedHeight: 0,
        setFullscreenCanvasSize: function() {
          if ("undefined" != typeof SDL) {
            var a = P[SDL.screen >> 2];
            a |= 8388608;
            q[SDL.screen >> 2] = a
          }
          r.updateCanvasDimensions(f.canvas);
          r.updateResizeListeners()
        },
        setWindowedCanvasSize: function() {
          if ("undefined" != typeof SDL) {
            var a =
              P[SDL.screen >> 2];
            a &= -8388609;
            q[SDL.screen >> 2] = a
          }
          r.updateCanvasDimensions(f.canvas);
          r.updateResizeListeners()
        },
        updateCanvasDimensions: function(a, b, c) {
          b && c ? (a.widthNative = b, a.heightNative = c) : (b = a.widthNative, c = a.heightNative);
          var d = b,
            e = c;
          f.forcedAspectRatio && 0 < f.forcedAspectRatio && (d / e < f.forcedAspectRatio ? d = Math.round(e * f.forcedAspectRatio) : e = Math.round(d / f.forcedAspectRatio));
          if ((document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement ||
              document.webkitCurrentFullScreenElement) === a.parentNode && "undefined" != typeof screen) {
            var g = Math.min(screen.width / d, screen.height / e);
            d = Math.round(d * g);
            e = Math.round(e * g)
          }
          r.resizeCanvas ? (a.width != d && (a.width = d), a.height != e && (a.height = e), "undefined" != typeof a.style && (a.style.removeProperty("width"), a.style.removeProperty("height"))) : (a.width != b && (a.width = b), a.height != c && (a.height = c), "undefined" != typeof a.style && (d != b || e != c ? (a.style.setProperty("width", d + "px", "important"), a.style.setProperty("height",
            e + "px", "important")) : (a.style.removeProperty("width"), a.style.removeProperty("height"))))
        }
      },
      E = {
        errorCode: 12288,
        defaultDisplayInitialized: !1,
        currentContext: 0,
        currentReadSurface: 0,
        currentDrawSurface: 0,
        contextAttributes: {
          alpha: !1,
          depth: !1,
          stencil: !1,
          antialias: !1
        },
        stringCache: {},
        setErrorCode: function(a) {
          E.errorCode = a
        },
        chooseConfig: function(a, b, c, d, e) {
          if (62E3 != a) return E.setErrorCode(12296), 0;
          if (b)
            for (;;) {
              a = q[b >> 2];
              if (12321 == a) a = q[b + 4 >> 2], E.contextAttributes.alpha = 0 < a;
              else if (12325 == a) a = q[b + 4 >> 2], E.contextAttributes.depth =
                0 < a;
              else if (12326 == a) a = q[b + 4 >> 2], E.contextAttributes.stencil = 0 < a;
              else if (12337 == a) a = q[b + 4 >> 2], E.contextAttributes.antialias = 0 < a;
              else if (12338 == a) a = q[b + 4 >> 2], E.contextAttributes.antialias = 1 == a;
              else if (12544 == a) a = q[b + 4 >> 2], E.contextAttributes.lowLatency = 12547 != a;
              else if (12344 == a) break;
              b += 8
            }
          if (!(c && d || e)) return E.setErrorCode(12300), 0;
          e && (q[e >> 2] = 1);
          c && 0 < d && (q[c >> 2] = 62002);
          E.setErrorCode(12288);
          return 1
        }
      },
      m = {
        counter: 1,
        buffers: [],
        programs: [],
        framebuffers: [],
        renderbuffers: [],
        textures: [],
        shaders: [],
        vaos: [],
        contexts: [],
        offscreenCanvases: {},
        queries: [],
        samplers: [],
        transformFeedbacks: [],
        syncs: [],
        stringCache: {},
        stringiCache: {},
        unpackAlignment: 4,
        recordError: function(a) {
          m.lastError || (m.lastError = a)
        },
        getNewId: function(a) {
          for (var b = m.counter++, c = a.length; c < b; c++) a[c] = null;
          return b
        },
        getSource: function(a, b, c, d) {
          a = "";
          for (var e = 0; e < b; ++e) {
            var g = d ? q[d + 4 * e >> 2] : -1;
            a += S(q[c + 4 * e >> 2], 0 > g ? void 0 : g)
          }
          return a
        },
        createContext: function(a, b) {
          if (f.preinitializedWebGLContext) {
            var c = f.preinitializedWebGLContext;
            b.majorVersion =
              Number(c.getParameter(c.VERSION).match(/^WebGL (\d+).\d+/)[1])
          } else a.getContextSafariWebGL2Fixed || (c = function(d, e) {
            e = a.getContextSafariWebGL2Fixed(d, e);
            return "webgl" == d == e instanceof WebGLRenderingContext ? e : null
          }, a.getContextSafariWebGL2Fixed = a.getContext, a.getContext = c), c = 1 < b.majorVersion ? a.getContext("webgl2", b) : a.getContext("webgl", b);
          return c ? b = m.registerContext(c, b) : 0
        },
        registerContext: function(a, b) {
          var c = m.getNewId(m.contexts),
            d = {
              handle: c,
              attributes: b,
              version: b.majorVersion,
              GLctx: a
            };
          a.canvas &&
            (a.canvas.GLctxObject = d);
          m.contexts[c] = d;
          ("undefined" == typeof b.enableExtensionsByDefault || b.enableExtensionsByDefault) && m.initExtensions(d);
          return c
        },
        makeContextCurrent: function(a) {
          m.currentContext = m.contexts[a];
          f.ctx = k = m.currentContext && m.currentContext.GLctx;
          return !(a && !k)
        },
        getContext: function(a) {
          return m.contexts[a]
        },
        deleteContext: function(a) {
          m.currentContext === m.contexts[a] && (m.currentContext = null);
          "object" == typeof N && N.removeAllHandlersOnTarget(m.contexts[a].GLctx.canvas);
          m.contexts[a] && m.contexts[a].GLctx.canvas &&
            (m.contexts[a].GLctx.canvas.GLctxObject = void 0);
          m.contexts[a] = null
        },
        initExtensions: function(a) {
          a || (a = m.currentContext);
          if (!a.initExtensionsDone) {
            a.initExtensionsDone = !0;
            var b = a.GLctx;
            ue(b);
            ve(b);
            we(b);
            b.dibvbi = b.getExtension("WEBGL_draw_instanced_base_vertex_base_instance");
            b.mdibvbi = b.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance");
            2 <= a.version && (b.disjointTimerQueryExt = b.getExtension("EXT_disjoint_timer_query_webgl2"));
            if (2 > a.version || !b.disjointTimerQueryExt) b.disjointTimerQueryExt =
              b.getExtension("EXT_disjoint_timer_query");
            b.multiDrawWebgl = b.getExtension("WEBGL_multi_draw");
            a = b.getSupportedExtensions() || [];
            a.forEach(function(c) {
              c.includes("lose_context") || c.includes("debug") || b.getExtension(c)
            })
          }
        }
      },
      Mb = [],
      Sj = Pe,
      Tj = Qe,
      Uj = Re,
      Vj = Se,
      Wj = Te,
      Xj = Ue,
      Yj = Ve,
      Zj = We,
      ak = Xe,
      bk = Ye,
      ck = Ze,
      dk = $e,
      ek = af,
      fk = bf,
      gk = vc,
      hk = vc,
      ik = hk,
      jk = cf,
      kk = df,
      lk = ef,
      mk = ff,
      nk = gf,
      ok = hf,
      pk = jf,
      qk = kf,
      rk = lf,
      sk = mf,
      tk = nf,
      uk = of,
      vk = pf,
      wk = qf,
      xk = rf,
      yk = sf,
      zk = tf,
      Ak = uf,
      Bk = vf,
      Ck = wf,
      Dk = xf,
      Ek = yf,
      Fk = zf,
      Gk = Af,
      Hk = Bf,
      Ik = Cf,
      Jk = Df,
      Kk = Ef,
      Lk =
      Ff,
      Mk = Gf,
      Nk = Hf,
      Ok = If,
      Pk = Jf,
      Qk = Kf,
      Rk = Lf,
      Sk = Mf,
      Tk = Nf,
      Uk = Of,
      Vk = Pf,
      Wk = Qf,
      Xk = Rf,
      Yk = Sf,
      Zk = wc,
      $k = wc,
      al = $k,
      bl = Tf,
      cl = Uf,
      dl = Vf,
      el = Wf,
      fl = Xf,
      gl = Yf,
      hl = Zf,
      il = Sa,
      jl = Sa,
      kl = jl,
      ll = Sa,
      ml = ll,
      nl = Sa,
      ol = nl,
      pl = Sa,
      ql = pl,
      lb = [],
      rl = Nb,
      sl = Nb,
      tl = sl,
      ul = Nb,
      vl = ul,
      wl = xc,
      xl = Ta,
      yl = Ta,
      zl = yl,
      Al = Ta,
      Bl = Al,
      Cl = Ta,
      Dl = Cl,
      El = Ta,
      Fl = El,
      Gl = $f,
      Hl = ag,
      Il = bg,
      Jl = cg,
      Kl = dg,
      Ll = eg,
      Ml = fg,
      Nl = gg,
      Ol = hg,
      Pl = ig,
      Ql = jg,
      Rl = kg,
      Sl = lg,
      Tl = mg,
      Ul = ng,
      Vl = og,
      Wl = pg,
      Xl = qg,
      Yl = rg,
      Zl = sg,
      $l = tg,
      am = yc,
      bm = yc,
      cm = bm,
      dm = ug,
      em = vg,
      fm = wg,
      gm = xg,
      hm = yg,
      im = zg,
      jm = Ag,
      km = Bg,
      lm = Cg,
      mm = Dg,
      nm = Eg,
      om = Fg,
      pm = Gg,
      qm = Hg,
      rm = Ig,
      sm = Jg,
      tm = Kg,
      um = Lg,
      vm = Mg,
      wm = Ng,
      xm = Og,
      ym = Pg,
      zm = Qg,
      Am = Bc,
      Bm = Cc,
      Cm = Bc,
      Dm = Cm,
      Em = Rg,
      Fm = Cc,
      Gm = Fm,
      Hm = Sg,
      Im = Tg,
      Jm = Ug,
      Km = Vg,
      Lm = Wg,
      Mm = Xg,
      Nm = Yg,
      Om = Zg,
      Pm = $g,
      Qm = ah,
      Rm = bh,
      Sm = ch,
      Tm = dh,
      Um = eh,
      Vm = fh,
      Wm = gh,
      Xm = hh,
      Ym = ih,
      Zm = jh,
      $m = kh,
      an = lh,
      bn = Ec,
      cn = Ec,
      dn = cn,
      en = mh,
      fn = nh,
      gn = oh,
      hn = ph,
      jn = qh,
      kn = rh,
      ln = sh,
      mn = th,
      nn = uh,
      on = vh,
      pn = wh,
      qn = xh,
      rn = yh,
      sn = zh,
      tn = Ah,
      un = Bh,
      vn = Ch,
      wn = Dh,
      xn = Fc,
      yn = Fc,
      zn = yn,
      An = Eh,
      Bn = Fh,
      Cn = Gh,
      Dn = Hh,
      En = Ih,
      Fn = Jh,
      Gn = Kh,
      Hn = Lh,
      In = Mh,
      Jn = Nh,
      Kn = Oh,
      Ln = Ph,
      Mn = Qh,
      Nn = Rh,
      On = Sh,
      Pn = Th,
      Qn = Uh,
      Rn = Vh,
      Sn = Wh,
      Tn =
      Xh,
      Un = Yh,
      Vn = Zh,
      Wn = $h,
      Xn = ai,
      Yn = bi,
      Zn = ci,
      $n = di,
      ao = ei,
      bo = fi,
      co = gi,
      eo = hi,
      fo = ii,
      go = ji,
      ho = ki,
      io = li,
      jo = mi,
      ko = ni,
      lo = oi,
      mo = pi,
      no = qi,
      qa = [],
      oo = ri,
      po = si,
      Va = [],
      qo = ti,
      ro = ui,
      so = vi,
      to = wi,
      uo = xi,
      vo = yi,
      wo = zi,
      xo = Ai,
      yo = Bi,
      zo = Ci,
      Ao = Di,
      Bo = Ei,
      Co = Fi,
      Do = Gi,
      Eo = Hi,
      Fo = Ii,
      Go = Ji,
      Ho = Ki,
      Io = Li,
      Jo = Mi,
      Ko = Ni,
      Lo = Oi,
      Mo = Pi,
      No = Qi,
      Oo = Ri,
      Po = Si,
      Qo = Ti,
      Ro = Ui,
      So = Vi,
      To = Wi,
      Uo = Xi,
      Vo = Yi,
      Wo = Zi,
      Xo = $i,
      Yo = aj,
      Zo = bj,
      $o = cj,
      ap = dj,
      bp = ej,
      cp = fj,
      dp = gj,
      ep = Wa,
      fp = Wa,
      gp = fp,
      hp = Wa,
      ip = hp,
      jp = Wa,
      kp = jp,
      lp = Wa,
      mp = lp,
      np = hj,
      op = ij,
      pp = jj,
      qp = kj,
      rp = lj,
      sp = mj,
      tp = nj,
      up = oj,
      Ea = {},
      N = {
        inEventHandler: 0,
        removeAllEventListeners: function() {
          for (var a = N.eventHandlers.length - 1; 0 <= a; --a) N._removeHandler(a);
          N.eventHandlers = [];
          N.deferredCalls = []
        },
        registerRemoveEventListeners: function() {
          N.removeEventListenersRegistered || (Rj.push(N.removeAllEventListeners), N.removeEventListenersRegistered = !0)
        },
        deferredCalls: [],
        deferCall: function(a, b, c) {
          function d(h, l) {
            if (h.length != l.length) return !1;
            for (var p in h)
              if (h[p] != l[p]) return !1;
            return !0
          }
          for (var e in N.deferredCalls) {
            var g = N.deferredCalls[e];
            if (g.targetFunction ==
              a && d(g.argsList, c)) return
          }
          N.deferredCalls.push({
            targetFunction: a,
            precedence: b,
            argsList: c
          });
          N.deferredCalls.sort(function(h, l) {
            return h.precedence < l.precedence
          })
        },
        removeDeferredCalls: function(a) {
          for (var b = 0; b < N.deferredCalls.length; ++b) N.deferredCalls[b].targetFunction == a && (N.deferredCalls.splice(b, 1), --b)
        },
        canPerformEventHandlerRequests: function() {
          return N.inEventHandler && N.currentEventHandler.allowsDeferredCalls
        },
        runDeferredCalls: function() {
          if (N.canPerformEventHandlerRequests())
            for (var a = 0; a < N.deferredCalls.length; ++a) {
              var b =
                N.deferredCalls[a];
              N.deferredCalls.splice(a, 1);
              --a;
              b.targetFunction.apply(null, b.argsList)
            }
        },
        eventHandlers: [],
        removeAllHandlersOnTarget: function(a, b) {
          for (var c = 0; c < N.eventHandlers.length; ++c) N.eventHandlers[c].target != a || b && b != N.eventHandlers[c].eventTypeString || N._removeHandler(c--)
        },
        _removeHandler: function(a) {
          var b = N.eventHandlers[a];
          b.target.removeEventListener(b.eventTypeString, b.eventListenerFunc, b.useCapture);
          N.eventHandlers.splice(a, 1)
        },
        registerOrRemoveHandler: function(a) {
          if (!a.target) return -4;
          var b = function(c) {
            ++N.inEventHandler;
            N.currentEventHandler = a;
            N.runDeferredCalls();
            a.handlerFunc(c);
            N.runDeferredCalls();
            --N.inEventHandler
          };
          if (a.callbackfunc) a.eventListenerFunc = b, a.target.addEventListener(a.eventTypeString, b, a.useCapture), N.eventHandlers.push(a), N.registerRemoveEventListeners();
          else
            for (b = 0; b < N.eventHandlers.length; ++b) N.eventHandlers[b].target == a.target && N.eventHandlers[b].eventTypeString == a.eventTypeString && N._removeHandler(b--);
          return 0
        },
        getNodeNameForTarget: function(a) {
          return a ?
            a == window ? "#window" : a == screen ? "#screen" : a && a.nodeName ? a.nodeName : "" : ""
        },
        fullscreenEnabled: function() {
          return document.fullscreenEnabled || document.webkitFullscreenEnabled
        }
      },
      Aj = ["default", "low-power", "high-performance"],
      yj = [0, "undefined" != typeof document ? document : 0, "undefined" != typeof window ? window : 0],
      vp = zj,
      pb = {},
      Jj = [null, [],
        []
      ],
      Lc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      Mc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    Yb = f.InternalError = zb(Error, "InternalError");
    ad();
    za = f.BindingError = zb(Error, "BindingError");
    oa.prototype.isAliasOf = cd;
    oa.prototype.clone = id;
    oa.prototype["delete"] = jd;
    oa.prototype.isDeleted = kd;
    oa.prototype.deleteLater = ld;
    f.getInheritedInstanceCount = dd;
    f.getLiveInheritedInstances = ed;
    f.flushPendingDeletes = Bb;
    f.setDelayFunction = fd;
    la.prototype.getPointee = qd;
    la.prototype.destructor = rd;
    la.prototype.argPackAdvance = 8;
    la.prototype.readValueFromPointer = xa;
    la.prototype.deleteObject = sd;
    la.prototype.fromWireType = hd;
    hc = f.UnboundTypeError = zb(Error, "UnboundTypeError");
    da.allocated.push({
      value: void 0
    }, {
      value: null
    }, {
      value: !0
    }, {
      value: !1
    });
    da.reserved = da.allocated.length;
    f.count_emval_handles = zd;
    f.requestFullscreen = function(a, b) {
      r.requestFullscreen(a, b)
    };
    f.requestAnimationFrame = function(a) {
      r.requestAnimationFrame(a)
    };
    f.setCanvasSize = function(a, b, c) {
      r.setCanvasSize(a, b, c)
    };
    f.pauseMainLoop = function() {
      r.mainLoop.pause()
    };
    f.resumeMainLoop = function() {
      r.mainLoop.resume()
    };
    f.getUserMedia = function() {
      r.getUserMedia()
    };
    f.createContext = function(a, b, c, d) {
      return r.createContext(a, b, c, d)
    };
    for (var k, ba = 0; 32 > ba; ++ba) lb.push(Array(ba));
    var wp = new Float32Array(288);
    for (ba = 0; 288 > ba; ++ba) qa[ba] = wp.subarray(0, ba + 1);
    var xp = new Int32Array(288);
    for (ba = 0; 288 > ba; ++ba) Va[ba] = xp.subarray(0, ba + 1);
    var Xc = {
      ua: Z,
      Wa: Fa,
      xd: Yc,
      L: Zc,
      Pa: $c,
      fb: bd,
      e: ud,
      g: vd,
      b: wd,
      c: xd,
      Na: Ad,
      h: Cd,
      a: Dd,
      F: Fd,
      t: Gd,
      k: Id,
      j: Jd,
      E: Kd,
      v: Rd,
      md: Sd,
      bd: Td,
      K: Ud,
      yc: Vd,
      qb: Wd,
      Za: Xd,
      Sa: Yd,
      x: Zd,
      C: $d,
      M: be,
      w: ce,
      f: Hb,
      u: de,
      p: fe,
      y: ge,
      m: he,
      Ze: ie,
      Lb: ke,
      z: le,
      q: me,
      o: ne,
      Va: oe,
      d: pe,
      B: te,
      Ba: xe,
      Aa: ye,
      Ka: ze,
      Ja: Ae,
      Da: Be,
      Fa: Ce,
      r: De,
      Ea: Ee,
      Ga: Fe,
      Ca: Ge,
      Ha: He,
      Ia: Ie,
      za: V,
      s: Je,
      i: Ke,
      Ma: Le,
      J: Me,
      A: Ne,
      Qa: Oe,
      l: Jb,
      $: Sj,
      _: Tj,
      Rc: Uj,
      pa: Vj,
      xc: Wj,
      Z: Xj,
      Y: Yj,
      uc: Zj,
      vc: ak,
      X: bk,
      W: ck,
      Bb: dk,
      V: ek,
      tb: fk,
      Dc: gk,
      ha: ik,
      U: jk,
      T: kk,
      S: lk,
      R: mk,
      Q: nk,
      Gc: ok,
      P: pk,
      O: qk,
      N: rk,
      Cf: sk,
      Zb: tk,
      _b: uk,
      ac: vk,
      $b: wk,
      Bf: xk,
      Af: yk,
      zf: zk,
      Kb: Ak,
      yf: Bk,
      xf: Ck,
      wf: Dk,
      Wc: Ek,
      vf: Fk,
      Vc: Gk,
      Xb: Hk,
      uf: Ik,
      tf: Jk,
      Xc: Kk,
      sf: Lk,
      rf: Mk,
      qf: Nk,
      pf: Ok,
      of: Pk,
      nf: Qk,
      Tc: Rk,
      ra: Sk,
      mf: Tk,
      Db: Uk,
      lf: Vk,
      Mb: Wk,
      kf: Xk,
      sb: Yk,
      Cc: Zk,
      ga: al,
      jf: bl,
      hf: cl,
      gf: dl,
      ff: el,
      ef: fl,
      df: gl,
      cf: hl,
      Qb: il,
      ca: kl,
      ab: ml,
      dd: ol,
      bb: ql,
      Nc: rl,
      ad: tl,
      da: vl,
      bf: wl,
      Pb: xl,
      ba: zl,
      _a: Bl,
      $a: Dl,
      cd: Fl,
      _c: Gl,
      af: Hl,
      $e: Il,
      Qc: Jl,
      oa: Kl,
      wc: Ll,
      Ob: Ml,
      _e: Nl,
      Ye: Ol,
      Xe: Pl,
      We: Ql,
      Ec: Rl,
      Ve: Sl,
      Ue: Tl,
      Se: Ul,
      Uc: Vl,
      sa: Wl,
      Re: Xl,
      Eb: Yl,
      Qe: Zl,
      rb: $l,
      Bc: am,
      fa: cm,
      Te: dm,
      Pe: em,
      Oe: fm,
      Sb: gm,
      Tb: hm,
      Vb: im,
      Ne: jm,
      Me: km,
      Le: lm,
      Fb: mm,
      Ke: nm,
      Je: om,
      Ie: pm,
      jc: qm,
      He: rm,
      Gb: sm,
      Ib: tm,
      zc: um,
      Ge: vm,
      eb: wm,
      mb: xm,
      Ee: ym,
      Fe: zm,
      ja: Am,
      la: Bm,
      ia: Dm,
      Oc: Em,
      ka: Gm,
      Pc: Hm,
      ma: Im,
      De: Jm,
      vb: Km,
      wb: Lm,
      Be: Mm,
      Ae: Nm,
      ze: Om,
      Ce: Pm,
      ye: Qm,
      Yb: Rm,
      Hb: Sm,
      xe: Tm,
      we: Um,
      sc: Vm,
      Ub: Wm,
      Wb: Xm,
      te: Ym,
      ve: Zm,
      ue: $m,
      kc: an,
      qc: bn,
      pc: dn,
      qe: en,
      se: fn,
      re: gn,
      pe: hn,
      jb: jn,
      ib: kn,
      oe: ln,
      ne: mn,
      me: nn,
      le: on,
      Sc: pn,
      qa: qn,
      ke: rn,
      Cb: sn,
      je: tn,
      Nb: un,
      ie: vn,
      pb: wn,
      Ac: xn,
      ea: zn,
      he: An,
      ge: Bn,
      ob: Cn,
      fe: Dn,
      ee: En,
      lb: Fn,
      kb: Gn,
      na: Hn,
      $c: In,
      de: Jn,
      ce: Kn,
      be: Ln,
      Fc: Mn,
      nb: Nn,
      ae: On,
      yb: Pn,
      xb: Qn,
      Ab: Rn,
      zb: Sn,
      $d: Tn,
      _d: Un,
      Zd: Vn,
      Yd: Wn,
      Xd: Xn,
      Wd: Yn,
      Vd: Zn,
      Ud: $n,
      Td: ao,
      Sd: bo,
      Zc: co,
      Rd: eo,
      Qd: fo,
      Pd: go,
      Od: ho,
      hb: io,
      gb: jo,
      Nd: ko,
      Yc: lo,
      tc: mo,
      Md: no,
      Ld: oo,
      Kd: po,
      Jd: qo,
      ic: ro,
      ec: so,
      Hd: to,
      Gd: uo,
      Fd: vo,
      Ed: wo,
      hc: xo,
      dc: yo,
      Dd: zo,
      Cd: Ao,
      Bd: Bo,
      Ad: Co,
      gc: Do,
      cc: Eo,
      zd: Fo,
      yd: Go,
      wd: Ho,
      vd: Io,
      fc: Jo,
      bc: Ko,
      Rb: Lo,
      ud: Mo,
      Mc: No,
      Kc: Oo,
      td: Po,
      Lc: Qo,
      Ic: Ro,
      sd: So,
      Jc: To,
      Hc: Uo,
      rd: Vo,
      qd: Wo,
      pd: Xo,
      od: Yo,
      nd: Zo,
      ld: $o,
      kd: ap,
      jd: bp,
      id: cp,
      hd: dp,
      ub: ep,
      aa: gp,
      cb: ip,
      ed: kp,
      db: mp,
      oc: np,
      mc: op,
      nc: pp,
      lc: qp,
      rc: rp,
      gd: sp,
      fd: tp,
      Jb: up,
      xa: sj,
      ta: tj,
      Ta: uj,
      wa: vj,
      va: wj,
      Df: vp,
      Ef: Bj,
      Id: Cj,
      Xa: Dj,
      Ya: Ej,
      I: Fj,
      G: Gj,
      Oa: Hj,
      H: Ij,
      ya: Lj,
      D: Pj,
      n: Oj,
      La: Qj,
      Ua: pc,
      Ra: Nj
    };
    Q();
    f._willPartialDraw = function() {
      return (f._willPartialDraw = f.asm.If).apply(null, arguments)
    };
    f._draw = function() {
      return (f._draw = f.asm.Jf).apply(null, arguments)
    };
    var Ra = function() {
        return (Ra = f.asm.Kf).apply(null, arguments)
      },
      ma = function() {
        return (ma = f.asm.Lf).apply(null, arguments)
      },
      gc = function() {
        return (gc =
          f.asm.Mf).apply(null, arguments)
      };
    f.__embind_initialize_bindings = function() {
      return (f.__embind_initialize_bindings = f.asm.Nf).apply(null, arguments)
    };
    var tb = function() {
        return (tb = f.asm.Of).apply(null, arguments)
      },
      rb = function() {
        return (rb = f.asm.Pf).apply(null, arguments)
      },
      sb = function() {
        return (sb = f.asm.Qf).apply(null, arguments)
      };
    f.dynCall_iiiii = function() {
      return (f.dynCall_iiiii = f.asm.Rf).apply(null, arguments)
    };
    f.dynCall_v = function() {
      return (f.dynCall_v = f.asm.Sf).apply(null, arguments)
    };
    f.dynCall_iidd = function() {
      return (f.dynCall_iidd =
        f.asm.Tf).apply(null, arguments)
    };
    f.dynCall_i = function() {
      return (f.dynCall_i = f.asm.Uf).apply(null, arguments)
    };
    var Oc = f.dynCall_ii = function() {
        return (Oc = f.dynCall_ii = f.asm.Vf).apply(null, arguments)
      },
      uc = f.dynCall_vi = function() {
        return (uc = f.dynCall_vi = f.asm.Wf).apply(null, arguments)
      };
    f.dynCall_iii = function() {
      return (f.dynCall_iii = f.asm.Xf).apply(null, arguments)
    };
    var Nc = f.dynCall_vii = function() {
      return (Nc = f.dynCall_vii = f.asm.Yf).apply(null, arguments)
    };
    f.dynCall_iiii = function() {
      return (f.dynCall_iiii = f.asm.Zf).apply(null,
        arguments)
    };
    f.dynCall_viii = function() {
      return (f.dynCall_viii = f.asm._f).apply(null, arguments)
    };
    f.dynCall_viiiifi = function() {
      return (f.dynCall_viiiifi = f.asm.$f).apply(null, arguments)
    };
    var Pc = f.dynCall_viiiii = function() {
      return (Pc = f.dynCall_viiiii = f.asm.ag).apply(null, arguments)
    };
    f.dynCall_viiii = function() {
      return (f.dynCall_viiii = f.asm.bg).apply(null, arguments)
    };
    f.dynCall_viiff = function() {
      return (f.dynCall_viiff = f.asm.cg).apply(null, arguments)
    };
    f.dynCall_fi = function() {
      return (f.dynCall_fi = f.asm.dg).apply(null,
        arguments)
    };
    f.dynCall_vid = function() {
      return (f.dynCall_vid = f.asm.eg).apply(null, arguments)
    };
    f.dynCall_d = function() {
      return (f.dynCall_d = f.asm.fg).apply(null, arguments)
    };
    f.dynCall_vif = function() {
      return (f.dynCall_vif = f.asm.gg).apply(null, arguments)
    };
    f.dynCall_fii = function() {
      return (f.dynCall_fii = f.asm.hg).apply(null, arguments)
    };
    f.dynCall_viif = function() {
      return (f.dynCall_viif = f.asm.ig).apply(null, arguments)
    };
    f.dynCall_dii = function() {
      return (f.dynCall_dii = f.asm.jg).apply(null, arguments)
    };
    f.dynCall_di = function() {
      return (f.dynCall_di =
        f.asm.kg).apply(null, arguments)
    };
    f.dynCall_viid = function() {
      return (f.dynCall_viid = f.asm.lg).apply(null, arguments)
    };
    f.dynCall_iiidd = function() {
      return (f.dynCall_iiidd = f.asm.mg).apply(null, arguments)
    };
    f.dynCall_iiiiii = function() {
      return (f.dynCall_iiiiii = f.asm.ng).apply(null, arguments)
    };
    f.dynCall_iiiiifi = function() {
      return (f.dynCall_iiiiifi = f.asm.og).apply(null, arguments)
    };
    f.dynCall_iiiff = function() {
      return (f.dynCall_iiiff = f.asm.pg).apply(null, arguments)
    };
    f.dynCall_iidi = function() {
      return (f.dynCall_iidi = f.asm.qg).apply(null,
        arguments)
    };
    f.dynCall_viiiiii = function() {
      return (f.dynCall_viiiiii = f.asm.rg).apply(null, arguments)
    };
    f.dynCall_viiif = function() {
      return (f.dynCall_viiif = f.asm.sg).apply(null, arguments)
    };
    f.dynCall_viiiif = function() {
      return (f.dynCall_viiiif = f.asm.tg).apply(null, arguments)
    };
    f.dynCall_viiiiiiii = function() {
      return (f.dynCall_viiiiiiii = f.asm.ug).apply(null, arguments)
    };
    f.dynCall_iiiijij = function() {
      return (f.dynCall_iiiijij = f.asm.vg).apply(null, arguments)
    };
    f.dynCall_viidi = function() {
      return (f.dynCall_viidi = f.asm.wg).apply(null,
        arguments)
    };
    f.dynCall_viifi = function() {
      return (f.dynCall_viifi = f.asm.xg).apply(null, arguments)
    };
    f.dynCall_viiifi = function() {
      return (f.dynCall_viiifi = f.asm.yg).apply(null, arguments)
    };
    f.dynCall_viiid = function() {
      return (f.dynCall_viiid = f.asm.zg).apply(null, arguments)
    };
    f.dynCall_fiiif = function() {
      return (f.dynCall_fiiif = f.asm.Ag).apply(null, arguments)
    };
    f.dynCall_viidiff = function() {
      return (f.dynCall_viidiff = f.asm.Bg).apply(null, arguments)
    };
    f.dynCall_viiidi = function() {
      return (f.dynCall_viiidi = f.asm.Cg).apply(null,
        arguments)
    };
    f.dynCall_iiidi = function() {
      return (f.dynCall_iiidi = f.asm.Dg).apply(null, arguments)
    };
    f.dynCall_vidii = function() {
      return (f.dynCall_vidii = f.asm.Eg).apply(null, arguments)
    };
    f.dynCall_vifidi = function() {
      return (f.dynCall_vifidi = f.asm.Fg).apply(null, arguments)
    };
    f.dynCall_viiiiiii = function() {
      return (f.dynCall_viiiiiii = f.asm.Gg).apply(null, arguments)
    };
    f.dynCall_fif = function() {
      return (f.dynCall_fif = f.asm.Hg).apply(null, arguments)
    };
    f.dynCall_viidii = function() {
      return (f.dynCall_viidii = f.asm.Ig).apply(null,
        arguments)
    };
    f.dynCall_fiii = function() {
      return (f.dynCall_fiii = f.asm.Jg).apply(null, arguments)
    };
    f.dynCall_iiiif = function() {
      return (f.dynCall_iiiif = f.asm.Kg).apply(null, arguments)
    };
    f.dynCall_viiiff = function() {
      return (f.dynCall_viiiff = f.asm.Lg).apply(null, arguments)
    };
    f.dynCall_viiiiid = function() {
      return (f.dynCall_viiiiid = f.asm.Mg).apply(null, arguments)
    };
    f.dynCall_viiiid = function() {
      return (f.dynCall_viiiid = f.asm.Ng).apply(null, arguments)
    };
    f.dynCall_iiiiiii = function() {
      return (f.dynCall_iiiiiii = f.asm.Og).apply(null,
        arguments)
    };
    f.dynCall_ji = function() {
      return (f.dynCall_ji = f.asm.Pg).apply(null, arguments)
    };
    f.dynCall_viijii = function() {
      return (f.dynCall_viijii = f.asm.Qg).apply(null, arguments)
    };
    f.dynCall_vij = function() {
      return (f.dynCall_vij = f.asm.Rg).apply(null, arguments)
    };
    f.dynCall_vijjj = function() {
      return (f.dynCall_vijjj = f.asm.Sg).apply(null, arguments)
    };
    f.dynCall_vj = function() {
      return (f.dynCall_vj = f.asm.Tg).apply(null, arguments)
    };
    f.dynCall_viij = function() {
      return (f.dynCall_viij = f.asm.Ug).apply(null, arguments)
    };
    f.dynCall_viiiiij =
      function() {
        return (f.dynCall_viiiiij = f.asm.Vg).apply(null, arguments)
      };
    f.dynCall_vffff = function() {
      return (f.dynCall_vffff = f.asm.Wg).apply(null, arguments)
    };
    f.dynCall_vf = function() {
      return (f.dynCall_vf = f.asm.Xg).apply(null, arguments)
    };
    f.dynCall_viiiiiiiii = function() {
      return (f.dynCall_viiiiiiiii = f.asm.Yg).apply(null, arguments)
    };
    f.dynCall_vff = function() {
      return (f.dynCall_vff = f.asm.Zg).apply(null, arguments)
    };
    f.dynCall_vfi = function() {
      return (f.dynCall_vfi = f.asm._g).apply(null, arguments)
    };
    f.dynCall_viff = function() {
      return (f.dynCall_viff =
        f.asm.$g).apply(null, arguments)
    };
    f.dynCall_vifff = function() {
      return (f.dynCall_vifff = f.asm.ah).apply(null, arguments)
    };
    f.dynCall_viffff = function() {
      return (f.dynCall_viffff = f.asm.bh).apply(null, arguments)
    };
    f.dynCall_viiiiiiiiii = function() {
      return (f.dynCall_viiiiiiiiii = f.asm.ch).apply(null, arguments)
    };
    f.dynCall_viiiiiiiiiii = function() {
      return (f.dynCall_viiiiiiiiiii = f.asm.dh).apply(null, arguments)
    };
    f.dynCall_iijjiiii = function() {
      return (f.dynCall_iijjiiii = f.asm.eh).apply(null, arguments)
    };
    f.dynCall_jiji = function() {
      return (f.dynCall_jiji =
        f.asm.fh).apply(null, arguments)
    };
    f.dynCall_iiiiiiiii = function() {
      return (f.dynCall_iiiiiiiii = f.asm.gh).apply(null, arguments)
    };
    f.dynCall_iiiiij = function() {
      return (f.dynCall_iiiiij = f.asm.hh).apply(null, arguments)
    };
    f.dynCall_iiiiid = function() {
      return (f.dynCall_iiiiid = f.asm.ih).apply(null, arguments)
    };
    f.dynCall_iiiiijj = function() {
      return (f.dynCall_iiiiijj = f.asm.jh).apply(null, arguments)
    };
    f.dynCall_iiiiiiii = function() {
      return (f.dynCall_iiiiiiii = f.asm.kh).apply(null, arguments)
    };
    f.dynCall_iiiiiijj = function() {
      return (f.dynCall_iiiiiijj =
        f.asm.lh).apply(null, arguments)
    };
    f.___start_em_js = 330106;
    f.___stop_em_js = 330629;
    f.ENV = pb;
    var ub;
    Ka = function b() {
      ub || Qc();
      ub || (Ka = b)
    };
    if (f.preInit)
      for ("function" == typeof f.preInit && (f.preInit = [f.preInit]); 0 < f.preInit.length;) f.preInit.pop()();
    Qc();
    return w.ready
  }
}();
"object" === typeof exports && "object" === typeof module ? module.exports = inkLoadWasmModule : "function" === typeof define && define.amd ? define([], function() {
  return inkLoadWasmModule
}) : "object" === typeof exports && (exports.inkLoadWasmModule = inkLoadWasmModule);
(function() {
  var u = "undefined" != typeof window && window === this ? this : "undefined" != typeof global && null != global ? global : this;
  u.inkLoadWasmPostRun && u.inkLoadWasmPostRun()
})();