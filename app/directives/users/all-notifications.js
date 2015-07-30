define(['text!./all-notifications.html','app','lodash','utilities/km-user-notification-service',
        'utilities/km-utilities','filters/moment','ionsound'], function(template,app,_) {
    app.directive('allNotifications', function() {
        return {
            restrict: 'EAC',
            replace: true,
            template: template,
            controller: ['$scope', '$rootScope', 'IUserNotificationService', '$timeout', '$filter','authentication',
                function($scope, $rootScope, userNotificationService, $timeout, $filter, authentication) {


                    var pageNumber = 0;
                    var pageLength = 1000;

                    //============================================================
                    //
                    //
                    //============================================================
                    $scope.timePassed = function(createdOn) {
                        return $filter("fromNow")(createdOn);
                    }
    	           var notificationTimer;
                    //============================================================
                    //
                    //
                    //============================================================
                    function getNotification() {
                        if ($rootScope.user && $rootScope.user.isAuthenticated) {
                            // if (canQuery) {
                            var queryMyNotifications;
                            // canQuery = false;
                            queryMyNotifications = {$or:[{'state': 'read'},{'state': 'unread'}]};
                            if ($scope.notifications) {
                                var notification = _.first($scope.notifications);
                                if (notification)
                                    queryMyNotifications = {
                                        $and: [{
                                            "createdOn": {
                                                "$gt": new Date(notification.createdOn).toISOString()
                                            },
                                            $or:[{'state': 'read'},{'state': 'unread'}]
                                        }]
                                    };
                            }
    	                    var continueNotification = true;
                            userNotificationService.query(queryMyNotifications, pageNumber, pageLength)
                                .then(function(data) {
                                    if (!data || data.length === 0)
                                        return;
                                    var localNotifications;
                                    if ($scope.notifications) {
                                        localNotifications = _.clone($scope.notifications);
                                        _.each(data, function(message) {
                                            localNotifications.push(message);
                                        });

                                        if(ion)
                                            ion.sound.play("bell_ring");
                                    } else {
                                        localNotifications = data;
                                    }
                                    $scope.notifications = [];
                                    $scope.notifications = $filter("orderBy")(localNotifications, 'createdOn', true);
                                })
                                .catch(function(error){
                                    if(error.data.statusCode==401){
                                        continueNotification = false;
                                    }
                                })
                                .finally(function() {
                                   if(continueNotification)
                                        notificationTimer =  $timeout(function() { getNotification();}, 10000);
                                });
                            //}
                        }

                    };
                    //============================================================
                    //
                    //
                    //============================================================
                    $scope.updateStatus = function(notification,status, $event) {
                        userNotificationService.update(notification.id, {
                                'state': status
                            })
                            .then(function() {
                                notification.state = status;
                            });
                            if($event)
                                $event.stopPropagation();
                    };

                    //============================================================
                    //
                    //
                    //============================================================
                    $scope.isUnread = function(notification) {

                        return notification && notification.state == 'unread';
                    };

                    $scope.$on('$destroy', function(evt){
                        $timeout.cancel(notificationTimer);
                    });

//                    $scope.$on('signIn', function(evt,user){
//                        $timeout(function(){
//                            console.log('notification after signin')
//                            getNotification();
//                            },5000);
//                    });
    	           $scope.$on('signOut', function(evt,user){
                       $timeout.cancel(notificationTimer);
                    });

                    getNotification();

                    $rootScope.$watch('user', function(newVla,oldVal){
                        if(newVla && newVla!=oldVal){
                            $timeout.cancel(notificationTimer);
                            getNotification();
                        }
                    });

                    $scope.getURL = function(notification){

                        if(notification.type=='documentNotification')
                            return '/management/requests/' + notification.data.workflowId + '/publishRecord';
                        else
                            return '#';//'/mailbox/' + notification.id;
                    }

                    ion.sound({
                        sounds: [
                            {
                                name: "bell_ring"
                            }
                        ],
                        volume: 0.5,
                        path: "/app/libs/ionsound/sounds/",
                        preload: true
                    });
                }
            ]

        };
    });
});
