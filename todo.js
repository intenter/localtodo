angular.module('todoApp', ['ui.bootstrap', 'indexedDB'])
    .config(function ($indexedDBProvider) {
        $indexedDBProvider
            .connection('todoDB')
            .upgradeDatabase(1, function(event, db, tx){
                var objStore = db.createObjectStore('todos', {keyPath: "created"});
                console.log("Store created");
            }).upgradeDatabase(2, function(event, db, tx){
                db.deleteObjectStore('todos');
                var objStore = db.createObjectStore('todos', {keyPath: "key", autoIncrement: true});
            });
    });

angular.module('todoApp')
    .controller('TodoController', ['$scope', '$indexedDB', '$log', function($scope, $indexedDB, $log) {
        $scope.todos = [];

        $indexedDB.openStore('todos', function(todos){
            todos.getAll().then(function(todos) {
                $log.debug("Got the items from store");
                angular.forEach(todos, function(todo){
                    todo.selected = false;
                });
                $scope.todos = todos;
                });
            });

        var isEmpty = function(str) {
            return (!str || 0 === str.trim().length);
        };

        $scope.addTodo = function() {
            var tags = [];
            var todoText = "";
            $scope.todoText.split(" ").forEach(function(token){
                if (!isEmpty(token)) {
                    if (token.charAt(0) === '#') {
                        tags.push(token.substr(1));
                    } else {
                        todoText = todoText.length === 0 ? token : " " + token;
                    }
                }
            });

            if (isEmpty(todoText)) {
                return;
            }

            var newTodo = {text: todoText, done: false, selected: false, priority: 0, created: new Date(), tags: tags};

            $indexedDB.openStore('todos', function(todos){

                todos.insert(newTodo).then(function(newKeys){
                    newTodo.key = newKeys[0];
                    $scope.todos.push(newTodo);
                    $scope.todoText = '';
                    $log.debug("Saved new todo to the db");
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
                            $log.debug("Updated an object");
                        });
                    }
                });
            });
        };

        $scope.searchFor = function (str){
            $scope.searchString = str;
            $log.debug(str);
        };

        function setPriority(priority) {
            $indexedDB.openStore('todos', function(todoStore){
                angular.forEach($scope.todos, function(todo){
                    if (todo.selected) {
                        todo.priority = priority;
                        todoStore.upsert(todo).then(function(){
                            $log.debug("Updated an object");
                        });
                    }
                });
            });
        }

        function selectAllNotCompleted(select) {
            angular.forEach($scope.todos, function (todo) {
                todo.selected = select;
            });
        }

        $scope.keyPressed = function($event){
            if ($event.keyCode == 65 || $event.keyCode == 97) {
                selectAllNotCompleted(true);
            } else if ($event.keyCode == 78 || $event.keyCode == 110) {
                selectAllNotCompleted(false);
            } else if ($event.keyCode >= 49 && $event.keyCode <= 51) {
                setPriority($event.keyCode - 49);
            }
            $log.debug('Key pressed: ' + $event.keyCode);
        };

        $scope.doNothingOnKeyPress = function($event){
            $event.stopImmediatePropagation();
        };

    }]);