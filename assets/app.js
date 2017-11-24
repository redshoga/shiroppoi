(function() {
  'use strict';

  var code = document.getElementById("code");
  var load = document.getElementById("load");
  var step = document.getElementById("step");
  var run = document.getElementById("run");
  var reset = document.getElementById("reset");
  var result = document.getElementById("result");
  var sample = document.getElementById("sample");

  var Bf;
  var bf;
  var UI;

  var ButtonState;

  ButtonState = {
    init: function() {
      step.disabled = true;
      run.disabled = true;
      reset.disabled = true;
    },
    afterLoad: function() {
      load.disabled = true;
      code.disabled = true;
      step.disabled = false;
      run.disabled = false;
      reset.disabled = false;
    },
    lastStep: function() {
      step.disabled = true;
      run.disabled = true;
    },
    afterReset: function() {
      load.disabled = false;
      code.disabled = false;
      step.disabled = true;
      run.disabled = true;
      reset.disabled = true;
    }
  };

  UI = function(id) {
    this.id = id;
    this.el = document.getElementById(id);
    this.update = function(data, current) {
      var span;
      var i;
      while (this.el.firstChild) {
        this.el.removeChild(this.el.firstChild);
      }
      for (i=0; i<data.length; i++) {
        span = document.createElement("span");
        span.appendChild(document.createTextNode(data[i]));
        if (this.id === "ui_cells") {
          span.title = "cells[" + i + "]";
        }
        if (current === i) {
          span.className = "current";
        }
        this.el.appendChild(span);
      }
    }
  }

  Bf = function() {
    var codeString;
    var pos;
    var cells = [];
    var ptr;
    var outputString;
    var bracemap = [];

    var uiCode = new UI("ui_code");
    var uiCells = new UI("ui_cells");
    var uiOutput = new UI("ui_output");

    var commandMap = {
      "白": increment,
      "臼": decrement,
      "日": forward,
      "曰": back,
      "目": input,
      "且": output,
      "旦": startLoop,
      "亘": endLoop
    }

    var commandMapInv = {
      "startLoop": "旦",
      "endLoop": "亘"
    }

    this.createBracemap = function() {
      var stack = [];
      var i;
      var start;
      var counter = 0;
      for (i=0; i<codeString.length; i++) {
        if (codeString[i] === commandMapInv["startLoop"]) {
          stack.push(i);
          counter++;
        } else if (codeString[i] === commandMapInv["endLoop"]) {
          start = stack.pop();
          bracemap[start] = i;
          bracemap[i] = start;
          counter--;
        }
      }
      if (stack.length !== 0) {
        throw "too many " + commandMapInv["startLoop"] + " !"
      }
      if (counter < 0) {
        throw "too many " + commandMapInv["endLoop"] + " !"
      }
    };

    function increment() {
      cells[ptr]++;
      if (cells[ptr] > 255) {
        cells[ptr] = 0;
      }
    }

    function decrement() {
      cells[ptr]--;
      if (cells[ptr] < 0) {
        cells[ptr] = 255;
      }
    }

    function forward() {
      ptr++;
      if (ptr === cells.length) {
        cells.push(0);
      }
    }

    function back() {
      ptr--;
      if (ptr < 0) {
        throw "bad cell address!";
      }
    }

    function input() {
      var v = prompt("Enter one character");
      if (v === "" || v === null || v.charCodeAt(0) > 255) {
        cells[ptr] = 0;
      } else {
        cells[ptr] = v.charCodeAt(0);
      }
    }

    function output() {
      outputString += String.fromCharCode(cells[ptr]);
    }

    function startLoop() {
      if (cells[ptr] === 0) {
        pos = bracemap[pos];
      }
    }

    function endLoop() {
      if (cells[ptr] !== 0) {
        pos = bracemap[pos];
      }
    }

    this.load = function(s) {
      codeString = s;
      pos = 0;
      cells = Array(20).fill(0);
      ptr = 0;
      outputString = '';
      try {
        this.createBracemap();
      } catch(e) {
        alert(e);
        return;
      }
      this.updateUI();
    };

    this.updateUI = function() {
      uiCode.update(codeString, pos);
      uiCells.update(cells, ptr);
      uiOutput.update(outputString);
    }

    this.step = function() {
      this.compute();
      pos++;
      this.updateUI();
      if (pos >= codeString.length) {
        ButtonState.lastStep();
      }
    };

    this.compute = function() {
      try {
        commandMap[codeString[pos]]();
      } catch(e) {
        alert(e);
        return;
      }
    }

    this.run = function() {
      while (pos < codeString.length) {
        this.step();
      }
    };
  };

  // button events
  load.addEventListener("click", function() {
    var codeString = code.value.replace(/[^白臼日曰目且旦亘]/g, '');
    if (codeString === "") {
      return;
    }
    ButtonState.afterLoad();
    result.className = "";
    bf.load(codeString);
  });
  step.addEventListener("click", function() {
    bf.step();
  });
  run.addEventListener("click", function() {
    bf.run();
  });
  reset.addEventListener("click", function() {
    ButtonState.afterReset();
    result.className = "hidden";
  });
  sample.addEventListener("click", function() {
    var sampleCode = "白白白白白白白白白旦日白白白白白白白白日白白白白白白白白白白白日白白白白白曰曰曰臼亘日且日白白且白白白白白白白且且白白白且日臼且臼臼臼臼臼臼臼臼臼臼臼臼且曰白白白白白白白白且臼臼臼臼臼臼臼臼且白白白且臼臼臼臼臼臼且臼臼臼臼臼臼臼臼且日白且";
    code.value = sampleCode;
  });

  // init
  bf = new Bf();
  ButtonState.init();
  code.focus();
})();
