angular.module('todoApp').directive('todoEditor', function(){
    return {
        template: '<input type="text" ng-model="todoText"  size="60" placeholder="add new todo here" class="form-control" ng-keypress="doNothingOnKeyPress($event)">',
        restrict: 'E',
        controller: function($scope, $indexedDB, $log) {
            var isEmpty = function(str) {
                return (!str || 0 === str.trim().length);
            };

            $scope.addTodo = function() {
                var tags = [];
                var todoText = "";
                var priority = 1;
                $scope.todoText.split(" ").forEach(function(token){
                    if (!isEmpty(token)) {
                        if (token.charAt(0) === '#') {
                            tags.push(token.substr(1));
                        } else if (token.charAt(0) === '!'){
                            priority = parseInt(token.substr(1));
                        } else {
                            todoText = todoText.length === 0 ? token : todoText + " " + token;
                        }
                    }
                });

                if (isEmpty(todoText)) {
                    return;
                }

                var newTodo = {text: todoText, done: false, selected: false, priority: priority, created: new Date(), tags: tags};

                $indexedDB.openStore('todos', function(todos){

                    todos.insert(newTodo).then(function(newKeys){
                        newTodo.key = newKeys[0];
                        $scope.todos.push(newTodo);
                        $scope.todoText = '';
                        $log.debug("Saved new todo to the db");
                        $scope.updateTags();
                    });
                });
            };

        }
    };
});