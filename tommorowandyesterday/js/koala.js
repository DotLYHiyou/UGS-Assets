var makeKoalaJS;
(function() {
  function WeakMapWrapper() {
    var wm;
    if (typeof WeakMap != "undefined")
      wm = new WeakMap();
    var key = "koala_id" + Math.random();
    var data = [];
    this.set = function(obj, value) {
      if (wm)
        return wm.set(obj, value);

      if (!obj[key])
        genKoalaID(obj);
      data[obj[key]] = value;
    }

    function genKoalaID(obj) {
      obj[key] = data.length;
    }
    this.get = function(obj) {
      if (wm)
        return wm.get(obj);
      return data[obj[key]];
    }
    this.delete = function(obj) {
      if (wm)
        return wm.delete(obj);
      delete data[obj[key]];
    }
  }

  function Space(size) {
    var xsize = size;
    var ysize = size;
    var data = [];
    var wm = new WeakMapWrapper();

    function getData(x, y) {
      if (!data[x])
        data[x] = [];
      if (!data[x][y])
        data[x][y] = [];
      return data[x][y];
    }

    function addThingTo(thing, x, y) {
      var obj = wm.get(thing);
      if (!obj) {
        obj = {
          startx: x,
          starty: y,
          endx: x,
          endy: y
        };
        wm.set(thing, obj);
      }
      if (x < obj.startx)
        obj.startx = x;
      if (x > obj.endx)
        obj.endx = x;
      if (y < obj.starty)
        obj.starty = y;
      if (y > obj.endy)
        obj.endy = y;
      var spot = getData(x, y);
      spot.push(thing);
    }

    function rectsFromThing(thing) {
      var x = Math.floor(thing.x / xsize);
      if (thing.x % xsize == 0)
        x -= 1;
      var y = Math.floor(thing.y / xsize);
      if (thing.y % ysize == 0)
        y -= 1;
      var width = thing.width || thing.w || 0;
      var height = thing.height || thing.h || 0;
      var xx = Math.floor((thing.x + width) / xsize);
      var yy = Math.floor((thing.y + height) / ysize);

      return {
        startx: x,
        starty: y,
        endx: xx,
        endy: yy
      }
    }

    function collideWithThingAnd(thing, and) {
      var rects = rectsFromThing(thing);
      for (var x = rects.startx; x <= rects.endx; x++) {
        for (var y = rects.starty; y <= rects.endy; y++) {
          and(thing, x, y);
        }
      }
    }

    this.getThings = function(rect) {
      var retVal = [];
      var retSet;
      if (typeof Set != "undefined")
        retSet = new Set();
      collideWithThingAnd(rect, function(r, x, y) {
        var newData = getData(x, y);

        for (var i = 0; i < newData.length; i++) {
          if (retSet) {
            retSet.add(newData[i]);
            continue;
          }
          var goodToGo = true;
          var newObj = newData[i];
          for (var j = 0; j < retVal.length; j++) {
            if (newObj == retVal[j]) {
              goodToGo = false;
              break;
            }
          }
          if (goodToGo) retVal.push(newObj)
        }
      });
      if (retSet) {
        retSet.forEach(function(b) {
          retVal.push(b);
        })
      }
      return retVal;
    };
    this.putThing = function(thing) {
      collideWithThingAnd(thing, addThingTo);
    };
    this.removeThing = function(thing) {
      var bounds = wm.get(thing);
      if (!bounds)
        return false;

      for (var x = bounds.startx; x <= bounds.endx; x++)
        for (var y = bounds.starty; y <= bounds.endy; y++) {
          var d = getData(x, y);
          for (var i = 0; i < d.length; i++) {
            if (d[i] === thing) {
              d.splice(i, 1);
              break;
            }
          }
        }
      wm.delete(thing);
      return true;
    };
    this.returnData = function() {
      return data;
    };
    this.moveThing = function(thing) {
      if (this.removeThing(thing))
        this.putThing(thing);
    };
  }
  makeKoalaJS = function() {
    var raw = [];
    var wm = new WeakMapWrapper();
    var space = false;
    var koala = function(obj, fn) {
      // Add Object with k(object)
      if (typeof obj == "object") {
        koala.add(obj);
        return;
      }
      // Otherwise perform a query
      return koala.query(obj, fn);
    }
    koala.space = false;

    function query(workspace, q, fn) {
      var args = splitQuery(q);

      for (var i = 0; i < args.length; i++)
        workspace = switcher(args[i], workspace);

      if (fn) {
        var retVal = [];
        for (var i = 0; i < workspace.length; i++)
          retVal.push(fn(workspace[i]));
        return retVal;
      }
      return workspace;
    }
    koala.query = function(q, fn) {
      return query(raw, q, fn);
    };
    koala.add = function(e) {
      koala.remove(e);
      wm.set(e, raw.length);
      raw.push(e);
      if (space && "x" in e && "y" in e)
        space.putThing(e);
      for (var q in statics) {
        if (query([e], q).length)
          statics[q].add(e);
      }

    };
    var dirty = 0;
    koala.remove = function(input) {
      for (var q in statics) {
        statics[q].remove(input);
      }
      var koala_id, obj;
      if (typeof input == "object") {
        obj = input;
        koala_id = wm.get(obj);
      } else {
        koala_id = input;
        if (!(koala_id in raw))
          return false;
        obj = raw[koala_id];
      }

      if (koala_id in raw) {
        dirty++;
        wm.delete(obj);
        if (space)
          space.removeThing(obj);
        delete raw[koala_id];
        koala.clean();
        return true;
      }
      return false;
    };

    function splitQuery(x) {
      var delim = [".", "<", ">", "!"];
      var closest = [];
      var index = 0;
      var retval = [];
      for (var i = 0; i < delim.length; i++) {
        closest[i] = x.indexOf(delim[i]);
      }
      var go;
      var c = x.length;
      while (true) {
        go = false;
        for (var i = 0; i < closest.length; i++) {
          if (closest[i] < index) {
            closest[i] = x.indexOf(delim[i], index);
          }
          if (closest[i] >= 0 && closest[i] < c) {
            c = closest[i];
            go = true;
          }
        }
        if (!go) {
          break;
        }
        retval.push(x.substring(index - 1, c));
        index = c + 1;
        c = x.length;
      }
      retval.splice(0, 1);
      retval.push(x.substr(index - 1));
      return retval;
    }

    function switcher(t, w) {
      if (typeof t == "string") {
        return processString(t, w);
      }
    };

    /**
     * Processes the query. Filters the workspace
     */
    function processString(t, workspace) {
      var search, eq, parts, retval = [],
        hasEquals = false,
        w = workspace;
      if (typeof w == "undefined")
        w = raw;
      if (w === raw && statics[t]) {
        return statics[t].query(t);
      }
      parts = t.substr(1).split("=");
      search = parts[0];
      if (parts.length > 1) {
        eq = JSON.parse(parts[1]);
        hasEquals = true;
      }
      switch (t.charAt(0)) {
        case ".":
          if (hasEquals) {
            for (var i = 0; i < w.length; i++)
              if (w[i] && w[i][search] === eq)
                retval.push(w[i]);
          } else {
            for (var i = 0; i < w.length; i++)
              if (w[i] && w[i][search])
                retval.push(w[i]);
          }
          break;
        case "!":
          if (hasEquals) {
            for (var i = 0; i < w.length; i++)
              if (w[i] && w[i][search] !== eq)
                retval.push(w[i]);
          } else {
            for (var i = 0; i < w.length; i++)
              if (w[i] && !w[i][search])
                retval.push(w[i]);
          }
          break;
        case ">":
          for (var i = 0; i < w.length; i++)
            if (w[i] && w[i][search])
              retval.push(w[i][search]());
          break;

        case "<":
          for (var i = 0; i < w.length; i++)
            if (w[i])
              retval.push(w[i][search]);
          break;

      }
      return retval;
    }

    koala.clean = function() {
      if (dirty >= raw.length / 2) {
        var newRaw = [];
        for (var i in raw) {
          var index = newRaw.push(raw[i]) - 1;
          wm.set(raw[i], index);
        }
        raw = newRaw;
        dirty = 0;
      }
    };
    var EPS = 0.01;
    koala.setEPS = function(e) {
      EPS = e;
    };
    koala.rect = function(rect) {
      var r = {
        x: rect.x - EPS,
        y: rect.y - EPS,
        width: (rect.width || rect.w || 0) + EPS * 2,
        height: (rect.height || rect.h || 0) + EPS * 2
      }
      var workspace = raw,
        nextWorkspace = [];
      if (space) {
        workspace = space.getThings(r);
      }

      for (var i = 0; i < workspace.length; i++)
        if (koala.collide(r, workspace[i]))
          nextWorkspace.push(workspace[i]);

      return function(q, fn) {
        return query(nextWorkspace, q, fn);
      }
    };
    var statics = {};
    /**
     * Static stuff
     */
    koala.static = function(q) {
      if (q in statics)
        return;
      var temp = makeKoalaJS();
      koala.query(q, temp.add);
      statics[q] = temp;
    };
    /**
     * need to refresh after static fields change
     * Like after changing location for rect to work
     */
    koala.refresh = function(obj) {
      if (space && "x" in obj && "y" in obj)
        space.moveThing(obj);
    }
    koala.refreshAll = function() {
      for (var i = 0; i < raw.length; i++) {
        koala.refresh(raw[i]);
      }
    }
    koala.setSpace = function(s) {
      if (s && s > 0)
        space = new Space(s);
      else
        space = false;
      koala.refreshAll();
    }
    /**
     * Helper Functions
     */
    koala.merge = function(x, y) {
      for (var i in y)
        x[i] = y[i];
    };;
    koala.collide = function(a, b) {
      if (!("x" in a && "x" in b && "y" in a && "y" in b))
        return false;
      var aw = a.width || a.w || 0;
      var bw = b.width || a.w || 0;
      var ah = a.height || a.h || 0;
      var bh = b.height || b.h || 0;
      return (a.x + aw >= b.x && b.x + bw >= a.x && a.y + ah >= b.y && b.y + bh >= a.y);
    };
    return koala;
  }

  if (typeof module != "undefined")
    module.exports = makeKoalaJS;
})();