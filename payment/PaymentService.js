var module = angular.module('cards.services.Payment',[]);

module.service('PaymentService', [
	'BulletService'
	,'ErrorService'
	,'RequestFactory'
	,'$q'
	,function (
	BulletService
	,ErrorService
	,RequestFactory
	,$q
	) {

	var Service = {};

	Service.setStripePublishableKey = (function() {
		var defer = $q.defer();
		var req = RequestFactory.stripePublishableKey();
		BulletService.fire(req).then(function(resp){
			if (resp.header.result === "ok") {
				var key = resp.body.key;
				Stripe.setPublishableKey(key);
			}
		});
	})();

	Service.validateCardNo = function (cardNo) {
		var defer = $q.defer();
		var req = RequestFactory.validateCardNo(cardNo);
		BulletService.fire(req).then(function(resp){
			if (resp.header.result === "ok") {
				if (resp.body.result === "ok") {
					defer.resolve(resp.body);
				} else {
 					ErrorService.report({ msg: "Card validation failed", clue : resp });
					defer.reject("error");
				}
			} else if (resp.header.result === "timeout") {
 				ErrorService.report({ msg: "Could not validate card", clue : req });
				defer.reject("error");
			}
		});

		return defer.promise;
	};

	return Service;
}]);
