angular.module('transportBiddingApp', [
  'ngSanitize',
  'ui.bootstrap'
]);

angular.module('transportBiddingApp').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/', { templateUrl: 'partials/food_table.html', 
      controller: 'BidTableCtrl' })
    $routeProvider.otherwise({redirectTo: '/'});
  }]);
