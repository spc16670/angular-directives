'use strict';
/**
 *
 *
 */
var module = angular.module('cards.directives.Payment', []);

module.directive('payment',[
	'UtilsService'
	,'ConstantsService'
	,'$log'
	,'PaymentService'
	,'SessionService'
	,function(
	UtilsService
	,ConstantsService
	,$log
	,PaymentService
	,SessionService
	) {
	return {
		restrict : 'E'
		,scope : { paymentModel: '=paymentModel' } // create an isolated scope
		//,templateUrl : "templates/payment.html" 
		,template : "<button class=\"btn btn-default\" ng-click=\"pay($event)\">Pay with card</button>" 
		,replace : true
		,link : function( scope , element , attributes ) {

			var user = SessionService.user;
	
			var handler = StripeCheckout.configure({
				key: 'pk_test_ubCWb7ONdg7bHDiYFmp4C6v0',
				image: '/img/documentation/checkout/marketplace.png',
				locale: 'auto',
				token: function(token) {
					// You can access the token ID with `token.id`.
					// Get the token ID to your server-side code for use.
				}
			});

			scope.pay = function($event) {
				handler.open({
					name: 'Demo Site',
					description: '2 widgets',
					email : user.info.email,
					zipCode: true,
					currency: "gbp",
					amount: 2000
				});
				$event.preventDefault();				
			}	



			if ( angular.isUndefined(scope.paymentModel) ) {
				scope.paymentModel = {};
			}

			scope.months = ConstantsService.CALENDAR.MONTHS;                      	
			scope.years = ConstantsService.CALENDAR.YEARS;

			scope.errorMsg = { show : false, text : ConstantsService.TEXT.INPUT_MISSING };
			scope.payment = { expiry : {}, cardNo : { no: null, type: null, valid : false }, valid : false };

			scope.$watch(function(){ return scope.payment },function(){
				
				//============= VALIDATE CARD NO ==============
				if (!!(scope.payment.firstFour
					&& scope.payment.secondFour
					&& scope.payment.thirdFour
					&& scope.payment.fourthFour)) {
					scope.payment.cardNo.no = scope.payment.firstFour
                                        	+ scope.payment.secondFour
                                        	+ scope.payment.thirdFour
                                        	+ scope.payment.fourthFour;
					PaymentService.validateCardNo(scope.payment.cardNo.no).then(function(ok){
						scope.payment.cardNo.type = ok.type;
						scope.payment.cardNo.valid = ok.valid;
						if (!scope.payment.cardNo.valid) {
							scope.errorMsg.text = ConstantsService.TEXT.INVALID_CARD_NO;
						}
					},function(error){
						scope.payment.cardNo.no = null;
						scope.payment.cardNo.type = null;
						scope.payment.cardNo.valid = false;
					});
				} else {
					scope.payment.cardNo.no = null;
					scope.payment.cardNo.type = null;
					scope.payment.cardNo.valid = false;
				}
 
				//=============== VALIDATE FORM ===============
				//
				if (scope.payment.cardNo.valid) {
					if (!!(scope.payment.name
						&& scope.payment.expiry.month
						&& scope.payment.expiry.year
						&& scope.payment.cvv)) {
						scope.payment.valid = true;
					} else {
						scope.errorMsg.text = ConstantsService.TEXT.INPUT_MISSING;
						scope.payment.valid = false;
					};

				} else {
					scope.payment.valid = false;
				}

				
				scope.errorMsg.show = false;
			},true);
	
			scope.ok = function() {
				if (scope.payment.valid) {
					scope.paymentModel = angular.copy(scope.payment);
				} else {
					scope.errorMsg.show = true;
				}
			}
		
		}
	}
}]);


