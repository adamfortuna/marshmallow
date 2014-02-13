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
  $scope.logChange = function(content, cursor) {
    if(!$scope.isRecording) { return false; }
    console.log('saving content...')
    $scope.changes.push({
      time: new Date(),
      content: content,
      cursor: cursor
    });
  }

  // Plays a recording
  $scope.play = function() {
    var time;
    $scope.isPlaying = true;
    $scope.isPaused = false;

    // Todo: Make the editor readonly.

    // Setup the initial state of the editor when the recording started
    $scope.editor.setValue($scope.startingCode);

    _.each($scope.changes, function(change) {
      time = change.time - $scope.startingTime;

      // Set the new line on the editor
      setTimeout(function(editor, content, cursor) {
        editor.setValue(content);
        editor.setCursor(cursor);

      }.bind(this, $scope.editor, change.content, change.cursor), time)
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
        scope.logChange(cm.getValue(), change.from);
      });
    }
  }
});
