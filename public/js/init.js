((global) => {
  'use strict';

  global.app = Elm.Main.init({
    node: document.getElementById('elm')
  });
})(this);
