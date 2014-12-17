angular.module('todoApp', ['ui.bootstrap', 'indexedDB'])
    .config(function ($indexedDBProvider) {
        $indexedDBProvider
            .connection('todoDB')
            .upgradeDatabase(1, function(event, db, tx){
                var objStore = db.createObjectStore('todos', {keyPath: "created"});
                console.log("Store created");
            });
    });

angular.module('todoApp')
    .controller('TodoController', ['$scope', '$indexedDB', function($scope, $indexedDB) {
        $scope.todos = [];

        $indexedDB.openStore('todos', function(todos){
            todos.getAll().then(function(todos) {
                console.log("Got the items from store");
                $scope.todos = todos;
                });
            });

        $scope.addTodo = function() {
            $indexedDB.openStore('todos', function(todos){
                var created = new Date().getTime();
                var newTodo = {text: $scope.todoText, done: false, selected: false, priority: 0, created: created};
                todos.insert(newTodo).then(function(){
                    $scope.todos.push(newTodo);
                    $scope.todoText = '';
                    console.log ("Saved new todo to the db");
                });
            });
        };

        $scope.remaining = function() {
            var count = 0;
            angular.forEach($scope.todos, function(todo) {
                count += todo.done ? 0 : 1;
            });
            return count;
        };

        $scope.completeSelected = function(){
            $indexedDB.openStore('todos', function(todoStore){
                angular.forEach($scope.todos, function(todo){
                    if (todo.selected) {
                        todo.selected = false;
                        todo.completed = new Date();
                        todo.done = true;
                        todoStore.upsert(todo).then(function(){
                            console.log("Updated an object");
                        });
                    }
                });
            });

        };

        $scope.keyPressed = function($event){
            if ($event.keyCode == 65 || $event.keyCode == 97) {
                angular.forEach($scope.todos, function(todo){
                if (!todo.done) {
                    todo.selected = true;
                }});
            } else if ($event.keyCode == 78 || $event.keyCode == 110) {
                angular.forEach($scope.todos, function(todo){
                        todo.selected = false;
                    });
            } else if ($event.keyCode >= 49 && $event.keyCode <= 51) {
                angular.forEach($scope.todos, function(todo){
                    if (todo.selected){
                        todo.priority = $event.keyCode - 49;
                    }
                });
            }

            console.log('Voila!' + $event.keyCode);
        };
        $scope.doNothingOnKeyPress = function($event){
            $event.stopImmediatePropagation();
        };

    }]);