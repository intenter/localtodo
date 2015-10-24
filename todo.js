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
        $scope.activeTags = [];
        $scope.tagsSorting = "-count";

        $indexedDB.openStore('todos', function(todos){
            todos.getAll().then(function(todos) {
                $log.debug("Got the items from store");
                angular.forEach(todos, function(todo){
                    todo.selected = false;
                });
                $scope.todos = todos;
                });
            });

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
                            $scope.updateTags();
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

        $scope.selectAllNotCompleted = function(select) {
            angular.forEach($scope.todos, function (todo) {
                if (!todo.done){
                    todo.selected = select;
                }
            });
        };

        $scope.keyPressed = function($event){
            if ($event.keyCode == 65 || $event.keyCode == 97) {
                $scope.selectAllNotCompleted(true);
            } else if ($event.keyCode == 78 || $event.keyCode == 110) {
                $scope.selectAllNotCompleted(false);
            } else if ($event.keyCode == 67 || $event.keyCode == 99) {
                $scope.searchString = '';
            } else if ($event.keyCode >= 49 && $event.keyCode <= 51) {
                setPriority($event.keyCode - 48);
            }
            $log.debug('Key pressed: ' + $event.keyCode);
        };

        $scope.updateTags = function (){
            $log.debug("Updating tags array");
            var activeTagsMap = {};
            angular.forEach($scope.todos, function(todo){
                if (!todo.done) {
                    angular.forEach(todo.tags, function (tag){
                        if (tag in activeTagsMap) {
                            var oldValue = activeTagsMap[tag];
                            oldValue ++;
                            activeTagsMap[tag] = oldValue;
                        } else {
                            activeTagsMap[tag] = 1;
                        }
                    });
                }
            });
            var activeTags = [];
            angular.forEach(activeTagsMap, function(count, tag){
                $log.debug("adding tag " + tag + ": " + count);
                this.push ({"tag":tag, "count":count});
            }, activeTags);
            $scope.activeTags = activeTags;
        };

        $scope.$watch('todos', $scope.updateTags);

        $scope.doNothingOnKeyPress = function($event){
            $event.stopImmediatePropagation();
        };

    }]);