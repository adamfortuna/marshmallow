var app = angular.module("marshmallow", []);

app.directive('recorder', function() {
  return {
    restrict: 'E',
    template: 
      '<controls editor="editor"></controls>' +
      '<editor editor="editor"></editor>'
  }
});

app.directive('controls', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      editor: '='
    },
    template:
      "<div id='controls' class='is-{{status}}'>" +
      "  <record editor='editor' changes='changes' starting-time='startingTime' status='status'></record>" +
      "  <play editor='editor' changes='changes' starting-time='startingTime' status='status'></play>" +
      "</div>",
    controller: function($scope) {
      $scope.status = 'unrecoded';
      $scope.startingTime = null;
    }
  }
});

app.directive('record', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      editor: '=',
      changes: '=',
      startingTime: '=',
      status: '=',
    },
    template:
      "<div>" +
      "  <button id='record' ng-click='record()'>Record</button>" + 
      "  <button id='stop' ng-click='stop()'>Stop</button>" + 
      "</div>",
    link: function(scope, element, attr) {
      var logChanges = function() {
        console.log("logging change");
        scope.changes.push(new Date() - scope.startingTime);
      };

      scope.record = function() {
        console.log('recording');
        scope.editor.clearHistory();
        scope.startingTime = new Date();
        scope.status = "recording";
        scope.changes = [];

        scope.editor.on('change', logChanges);
      }

      scope.stop = function() {
        console.log('stopping');
        scope.status = "stopped";
        scope.editor.off('change', logChanges);
      }
    }
  }
});

app.directive('play', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      editor: '=',
      changes: '=',
      startingTime: '=',
      status: '=',
    },
    template:
      "<div>" +
      "  <button id='play' ng-click='play()'>Play</button>" +
      "  <button id='pause' ng-click='pause()'>Pause</button>" +
      "</div>",

    link: function(scope, element, attr) {

      // Plays the passed in step at the appropriate time
      scope.playNext = function(changes, lastTime, step) {
        lastTime = lastTime || 0;
        step = step || 0;
        if(scope.status !== 'playing') {
          return true;
        } else if (changes.length === 0) {
          scope.status = 'stopped'
          scope.$apply();
          return true;
        }

        scope.step = step;
        var nextChangeTime = changes.shift(),
            timeUntilNextChange = nextChangeTime - lastTime;

        setTimeout(function() {
          scope.editor.redo();
          scope.step = step;
          scope.playNext(changes, nextChangeTime, step);
        }, timeUntilNextChange);
      };

      scope.pause = function() {
        console.log('pause');
        scope.status = "paused";
      }

      scope.play = function() {
        var changes;
        console.log('playing')

        if(scope.status === 'paused') {
          changes = scope.changes.slice(scope.step, scope.changes.length)
        } else {
          // Rewind the editor history back to the beginning
          for(var i=0, length=scope.editor.historySize().undo; i<length; i++) {
            scope.editor.undo();
          }

          // Kickoff playing all of the changes
          scope.step = 0;
          changes = scope.changes.slice(0);
        }    

        scope.status = 'playing';
        scope.playNext(changes);
      }
    }
  }
});

app.directive('editor', function() {
  return {
    restrict: "E",
    replace: true,
    template: "<div id='editor'></div>",
    scope: {
      editor: '='
    },
    link: function(scope, element, attrs) {
      scope.editor = CodeMirror(element[0], {
        indentUnit: 2,
        tabSize: 2,
        theme: 'vibrant-ink',
        lineNumbers: true,
        lineWrapping: true,
        gutters: ["CodeMirror-foldgutter"],
        syntax: 'javascript',
        historyEventDelay: 50
      });
    }
  }
});
