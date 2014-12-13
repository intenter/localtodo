angular.module('todoApp', ['ui.bootstrap']);
angular.module('todoApp')
    .controller('TodoController', ['$scope', function($scope) {
        $scope.todos = [
            {text:'learn angular', done:false, selected:false, priority:2, created: new Date()},
            {text:'build an angular app', done:false, selected:false, priority:1, created: new Date()}];

        $scope.addTodo = function() {
            $scope.todos.push({text:$scope.todoText, done:false, selected:false, priority:0, created: new Date()});
            $scope.todoText = '';
        };

        $scope.remaining = function() {
            var count = 0;
            angular.forEach($scope.todos, function(todo) {
                count += todo.done ? 0 : 1;
            });
            return count;
        };

        $scope.completeSelected = function(){
            angular.forEach($scope.todos, function(todo){
                if (todo.selected) {
                    todo.selected = false;
                    todo.completed = new Date();
                    todo.done = true;
                }
            });
        };

        $scope.archive = function() {
            var oldTodos = $scope.todos;
            $scope.todos = [];
            angular.forEach(oldTodos, function(todo) {
                if (!todo.done) $scope.todos.push(todo);
            });

        };
    }]);