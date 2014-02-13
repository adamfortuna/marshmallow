var app = angular.module("marshmallow", []);

app.controller("RecorderController", function($scope) {

  // Starts a recording
  $scope.record = function() {
    console.log('Recording...');
    //dom('body').addClass('recording');
    $scope.startingTime = new Date();
    $scope.changes = [];
    $scope.startingCode = $scope.editor.getValue();
    $scope.isRecording = true;
  }

   // Stop the active recording
  $scope.stopRecording = function() {
    console.log('Stopped Recording...');
    console.log($scope.changes);
    $scope.isRecording = false;
    $scope.hasRecording = true;
  }

  // Saves a single change in the editor
  $scope.logChange = function(change) {
    if(!$scope.isRecording) { return false; }
    console.log('saving change...')
    $scope.changes.push({
      time: new Date(),
      diff: change
    });
  }

  // Plays a recording
  $scope.play = function() {
    var startTime = new Date(),
        lines = [],
        time,
        changes,
        newChar,
        currentPos;

    $scope.isPlaying = true;
    $scope.isPaused = false;

    // Setup the initial state of the editor when the recording started
    $scope.editor.setValue($scope.startingCode);
    $scope.editor.eachLine(function(line) {
      lines.push(line.text);
    });

    _.each($scope.changes, function(change) {
      changes = change.diff.text
      newChar = change.diff.text[0];
      currentPos = change.diff.from;
      time = change.time - $scope.startingTime;

      if(changes.length > 1) {
        // New line
        lines.push(newChar);
      } else if(lines[currentPos.line].length <= currentPos.ch) {
        // New Character
        lines[currentPos.line] = lines[currentPos.line].concat(newChar)
      }

      // Set the new line on the editor
      setTimeout(function(line, text) {
        if(line > $scope.editor.lineCount()-1) {
          console.log("Adding a new line.");
          $scope.editor.setValue($scope.editor.getValue() + "\n");
        } else {
          console.log("Setting line "+ line + " to " + text);
          $scope.editor.setLine(line, text);
        }
      }.bind(this, currentPos.line, lines[currentPos.line]), time)
    });
  }

  // Pauses playing a recording
  $scope.pause = function() {
    $scope.isPlaying = false;
    $scope.isPaused = true;
  }
});

app.directive('editor', function() {
  return {
    restrict: "E",
    template: "<div id='editor'></div>",
    link: function(scope, element, attrs) {
      scope.editor = CodeMirror(element.find('div')[0], {
        indentUnit: 2,
        tabSize: 2,
        theme: 'vibrant-ink',
        lineNumbers: true,
        lineWrapping: true,
        gutters: ["CodeMirror-foldgutter"],
        syntax: 'javascript'
      });

      scope.editor.on('change', function(cm, change) {
        scope.logChange(change);
      });
    }
  }
});
