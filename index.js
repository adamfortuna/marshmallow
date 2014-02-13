var app = angular.module("marshmallow", []);

app.controller("RecorderController", function($scope) {

  // Starts a recording
  $scope.record = function() {
    console.log('Recording...');
    $scope.startingTime = new Date();
    $scope.changes = [];
    $scope.editor.clearHistory();
    $scope.isRecording = true;
  }

   // Stop the active recording
  $scope.stopRecording = function() {
    $scope.isRecording = false;
    $scope.hasRecording = true;
  }

  // Saves a single change in the editor
  $scope.logChange = function(content, cursor) {
    if(!$scope.isRecording) { return false; }
    $scope.changes.push(new Date()-$scope.startingTime);
  }

  // Plays a recording
  $scope.play = function() {
    var time;
    $scope.isPlaying = true;
    $scope.isPaused = false;

    // Rewind the editor history back to the beginning
    for(var i=0, length=$scope.editor.historySize().undo; i<length; i++) {
      $scope.editor.undo();
    }


    // Todo: Make the editor readonly.
   _.each($scope.changes, function(change) {
     setTimeout(function(editor) {
       editor.redo();
     }.bind(this, $scope.editor), change);
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
        syntax: 'javascript',
        historyEventDelay: 50
      });

      scope.editor.on('change', function() {
        scope.logChange();
      });
    }
  }
});
