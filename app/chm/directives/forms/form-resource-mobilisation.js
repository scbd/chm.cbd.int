angular.module('kmApp').compileProvider // lazy
.directive('editResourceMobilisation', ['authHttp', "URI", "$filter", "$q", "guid", "$timeout", function ($http, URI, $filter, $q, guid, $timeout) {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/forms/form-resource-mobilisation.partial.html',
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope, $element)
		{
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = 'general';
			$scope.review   = { locale : "en" };
			$scope.options  = {
				countries:		function () { return $http.get("/api/v2013/thesaurus/domains/countries/terms",								{ cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'name'); }); },
				confidence:		function () { return $http.get("/api/v2013/thesaurus/domains/AB782477-9942-4C6B-B9F0-79A82915A069/terms",	{ cache: true }).then(function (o) { return o.data; }); },
				ownerBehalf:	function () { return $http.get("/api/v2013/thesaurus/domains/1FBEF0A8-EE94-4E6B-8547-8EDFCB1E2301/terms",	{ cache: true }).then(function (o) { return o.data; }); },
				currency: [
					{ identifier: 'Afghanistan Afghani (AFN)', name: 'Afghanistan Afghani (AFN)' },
					{ identifier: 'Albanian Lek (ALL)', name: 'Albanian Lek (ALL)' },
					{ identifier: 'Algerian Dinar (DZD)', name: 'Algerian Dinar (DZD)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Angolan Kwanza (AOA)', name: 'Angolan Kwanza (AOA)' },
					{ identifier: 'East Caribbean Dollar (XCD)', name: 'East Caribbean Dollar (XCD)' },
					{ identifier: 'East Caribbean Dollar (XCD)', name: 'East Caribbean Dollar (XCD)' },
					{ identifier: 'East Caribbean Dollar (XCD)', name: 'East Caribbean Dollar (XCD)' },
					{ identifier: 'Argentine Peso (ARS)', name: 'Argentine Peso (ARS)' },
					{ identifier: 'Armenian Dram (AMD)', name: 'Armenian Dram (AMD)' },
					{ identifier: 'Aruban Guilder (AWG)', name: 'Aruban Guilder (AWG)' },
					{ identifier: 'Australian Dollar (AUD)', name: 'Australian Dollar (AUD)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Azerbaijan New Manat (AZN)', name: 'Azerbaijan New Manat (AZN)' },
					{ identifier: 'Bahamian Dollar (BSD)', name: 'Bahamian Dollar (BSD)' },
					{ identifier: 'Bahraini Dinar (BHD)', name: 'Bahraini Dinar (BHD)' },
					{ identifier: 'Bangladeshi Taka (BDT)', name: 'Bangladeshi Taka (BDT)' },
					{ identifier: 'Barbados Dollar (BBD)', name: 'Barbados Dollar (BBD)' },
					{ identifier: 'Belarussian Ruble (BYR)', name: 'Belarussian Ruble (BYR)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Belize Dollar (BZD)', name: 'Belize Dollar (BZD)' },
					{ identifier: 'CFA Franc BCEAO (XOF)', name: 'CFA Franc BCEAO (XOF)' },
					{ identifier: 'Bermudian Dollar (BMD)', name: 'Bermudian Dollar (BMD)' },
					{ identifier: 'Bhutan Ngultrum (BTN)', name: 'Bhutan Ngultrum (BTN)' },
					{ identifier: 'Boliviano (BOB)', name: 'Boliviano (BOB)' },
					{ identifier: 'Marka (BAM)', name: 'Marka (BAM)' },
					{ identifier: 'Botswana Pula (BWP)', name: 'Botswana Pula (BWP)' },
					{ identifier: 'Norwegian Krone (NOK)', name: 'Norwegian Krone (NOK)' },
					{ identifier: 'Brazilian Real (BRL)', name: 'Brazilian Real (BRL)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'Brunei Dollar (BND)', name: 'Brunei Dollar (BND)' },
					{ identifier: 'Bulgarian Lev (BGN)', name: 'Bulgarian Lev (BGN)' },
					{ identifier: 'CFA Franc BCEAO (XOF)', name: 'CFA Franc BCEAO (XOF)' },
					{ identifier: 'Burundi Franc (BIF)', name: 'Burundi Franc (BIF)' },
					{ identifier: 'Kampuchean Riel (KHR)', name: 'Kampuchean Riel (KHR)' },
					{ identifier: 'CFA Franc BEAC (XAF)', name: 'CFA Franc BEAC (XAF)' },
					{ identifier: 'Canadian Dollar (CAD)', name: 'Canadian Dollar (CAD)' },
					{ identifier: 'Cape Verde Escudo (CVE)', name: 'Cape Verde Escudo (CVE)' },
					{ identifier: 'Cayman Islands Dollar (KYD)', name: 'Cayman Islands Dollar (KYD)' },
					{ identifier: 'CFA Franc BEAC (XAF)', name: 'CFA Franc BEAC (XAF)' },
					{ identifier: 'CFA Franc BEAC (XAF)', name: 'CFA Franc BEAC (XAF)' },
					{ identifier: 'Chilean Peso (CLP)', name: 'Chilean Peso (CLP)' },
					{ identifier: 'Yuan Renminbi (CNY)', name: 'Yuan Renminbi (CNY)' },
					{ identifier: 'Australian Dollar (AUD)', name: 'Australian Dollar (AUD)' },
					{ identifier: 'Australian Dollar (AUD)', name: 'Australian Dollar (AUD)' },
					{ identifier: 'Colombian Peso (COP)', name: 'Colombian Peso (COP)' },
					{ identifier: 'Comoros Franc (KMF)', name: 'Comoros Franc (KMF)' },
					{ identifier: 'CFA Franc BEAC (XAF)', name: 'CFA Franc BEAC (XAF)' },
					{ identifier: 'Francs (CDF)', name: 'Francs (CDF)' },
					{ identifier: 'New Zealand Dollar (NZD)', name: 'New Zealand Dollar (NZD)' },
					{ identifier: 'Costa Rican Colon (CRC)', name: 'Costa Rican Colon (CRC)' },
					{ identifier: 'Croatian Kuna (HRK)', name: 'Croatian Kuna (HRK)' },
					{ identifier: 'Cuban Peso (CUP)', name: 'Cuban Peso (CUP)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Czech Koruna (CZK)', name: 'Czech Koruna (CZK)' },
					{ identifier: 'Danish Krone (DKK)', name: 'Danish Krone (DKK)' },
					{ identifier: 'Djibouti Franc (DJF)', name: 'Djibouti Franc (DJF)' },
					{ identifier: 'East Caribbean Dollar (XCD)', name: 'East Caribbean Dollar (XCD)' },
					{ identifier: 'Dominican Peso (DOP)', name: 'Dominican Peso (DOP)' },
					{ identifier: 'Ecuador Sucre (ECS)', name: 'Ecuador Sucre (ECS)' },
					{ identifier: 'Egyptian Pound (EGP)', name: 'Egyptian Pound (EGP)' },
					{ identifier: 'El Salvador Colon (SVC)', name: 'El Salvador Colon (SVC)' },
					{ identifier: 'CFA Franc BEAC (XAF)', name: 'CFA Franc BEAC (XAF)' },
					{ identifier: 'Eritrean Nakfa (ERN)', name: 'Eritrean Nakfa (ERN)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Ethiopian Birr (ETB)', name: 'Ethiopian Birr (ETB)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Falkland Islands Pound (FKP)', name: 'Falkland Islands Pound (FKP)' },
					{ identifier: 'Danish Krone (DKK)', name: 'Danish Krone (DKK)' },
					{ identifier: 'Fiji Dollar (FJD)', name: 'Fiji Dollar (FJD)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'CFA Franc BEAC (XAF)', name: 'CFA Franc BEAC (XAF)' },
					{ identifier: 'Gambian Dalasi (GMD)', name: 'Gambian Dalasi (GMD)' },
					{ identifier: 'Georgian Lari (GEL)', name: 'Georgian Lari (GEL)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Ghanaian Cedi (GHS)', name: 'Ghanaian Cedi (GHS)' },
					{ identifier: 'Gibraltar Pound (GIP)', name: 'Gibraltar Pound (GIP)' },
					{ identifier: 'Pound Sterling (GBP)', name: 'Pound Sterling (GBP)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Danish Krone (DKK)', name: 'Danish Krone (DKK)' },
					{ identifier: 'East Carribean Dollar (XCD)', name: 'East Carribean Dollar (XCD)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'Guatemalan Quetzal (QTQ)', name: 'Guatemalan Quetzal (QTQ)' },
					{ identifier: 'Pound Sterling (GGP)', name: 'Pound Sterling (GGP)' },
					{ identifier: 'Guinea Franc (GNF)', name: 'Guinea Franc (GNF)' },
					{ identifier: 'Guinea-Bissau Peso (GWP)', name: 'Guinea-Bissau Peso (GWP)' },
					{ identifier: 'Guyana Dollar (GYD)', name: 'Guyana Dollar (GYD)' },
					{ identifier: 'Haitian Gourde (HTG)', name: 'Haitian Gourde (HTG)' },
					{ identifier: 'Australian Dollar (AUD)', name: 'Australian Dollar (AUD)' },
					{ identifier: 'Honduran Lempira (HNL)', name: 'Honduran Lempira (HNL)' },
					{ identifier: 'Hong Kong Dollar (HKD)', name: 'Hong Kong Dollar (HKD)' },
					{ identifier: 'Hungarian Forint (HUF)', name: 'Hungarian Forint (HUF)' },
					{ identifier: 'Iceland Krona (ISK)', name: 'Iceland Krona (ISK)' },
					{ identifier: 'Indian Rupee (INR)', name: 'Indian Rupee (INR)' },
					{ identifier: 'Indonesian Rupiah (IDR)', name: 'Indonesian Rupiah (IDR)' },
					{ identifier: 'Iranian Rial (IRR)', name: 'Iranian Rial (IRR)' },
					{ identifier: 'Iraqi Dinar (IQD)', name: 'Iraqi Dinar (IQD)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Pound Sterling (GBP)', name: 'Pound Sterling (GBP)' },
					{ identifier: 'Israeli New Shekel (ILS)', name: 'Israeli New Shekel (ILS)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'CFA Franc BCEAO (XOF)', name: 'CFA Franc BCEAO (XOF)' },
					{ identifier: 'Jamaican Dollar (JMD)', name: 'Jamaican Dollar (JMD)' },
					{ identifier: 'Japanese Yen (JPY)', name: 'Japanese Yen (JPY)' },
					{ identifier: 'Pound Sterling (GBP)', name: 'Pound Sterling (GBP)' },
					{ identifier: 'Jordanian Dinar (JOD)', name: 'Jordanian Dinar (JOD)' },
					{ identifier: 'Kazakhstan Tenge (KZT)', name: 'Kazakhstan Tenge (KZT)' },
					{ identifier: 'Kenyan Shilling (KES)', name: 'Kenyan Shilling (KES)' },
					{ identifier: 'Australian Dollar (AUD)', name: 'Australian Dollar (AUD)' },
					{ identifier: 'North Korean Won (KPW)', name: 'North Korean Won (KPW)' },
					{ identifier: 'Korean Won (KRW)', name: 'Korean Won (KRW)' },
					{ identifier: 'Kuwaiti Dinar (KWD)', name: 'Kuwaiti Dinar (KWD)' },
					{ identifier: 'Som (KGS)', name: 'Som (KGS)' },
					{ identifier: 'Lao Kip (LAK)', name: 'Lao Kip (LAK)' },
					{ identifier: 'Latvian Lats (LVL)', name: 'Latvian Lats (LVL)' },
					{ identifier: 'Lebanese Pound (LBP)', name: 'Lebanese Pound (LBP)' },
					{ identifier: 'Lesotho Loti (LSL)', name: 'Lesotho Loti (LSL)' },
					{ identifier: 'Liberian Dollar (LRD)', name: 'Liberian Dollar (LRD)' },
					{ identifier: 'Libyan Dinar (LYD)', name: 'Libyan Dinar (LYD)' },
					{ identifier: 'Swiss Franc (CHF)', name: 'Swiss Franc (CHF)' },
					{ identifier: 'Lithuanian Litas (LTL)', name: 'Lithuanian Litas (LTL)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Macau Pataca (MOP)', name: 'Macau Pataca (MOP)' },
					{ identifier: 'Denar (MKD)', name: 'Denar (MKD)' },
					{ identifier: 'Malagasy Franc (MGF)', name: 'Malagasy Franc (MGF)' },
					{ identifier: 'Malawi Kwacha (MWK)', name: 'Malawi Kwacha (MWK)' },
					{ identifier: 'Malaysian Ringgit (MYR)', name: 'Malaysian Ringgit (MYR)' },
					{ identifier: 'Maldive Rufiyaa (MVR)', name: 'Maldive Rufiyaa (MVR)' },
					{ identifier: 'CFA Franc BCEAO (XOF)', name: 'CFA Franc BCEAO (XOF)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Mauritanian Ouguiya (MRO)', name: 'Mauritanian Ouguiya (MRO)' },
					{ identifier: 'Mauritius Rupee (MUR)', name: 'Mauritius Rupee (MUR)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Mexican Nuevo Peso (MXN)', name: 'Mexican Nuevo Peso (MXN)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'Moldovan Leu (MDL)', name: 'Moldovan Leu (MDL)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Mongolian Tugrik (MNT)', name: 'Mongolian Tugrik (MNT)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'East Caribbean Dollar (XCD)', name: 'East Caribbean Dollar (XCD)' },
					{ identifier: 'Moroccan Dirham (MAD)', name: 'Moroccan Dirham (MAD)' },
					{ identifier: 'Mozambique Metical (MZN)', name: 'Mozambique Metical (MZN)' },
					{ identifier: 'Myanmar Kyat (MMK)', name: 'Myanmar Kyat (MMK)' },
					{ identifier: 'Namibian Dollar (NAD)', name: 'Namibian Dollar (NAD)' },
					{ identifier: 'Australian Dollar (AUD)', name: 'Australian Dollar (AUD)' },
					{ identifier: 'Nepalese Rupee (NPR)', name: 'Nepalese Rupee (NPR)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Netherlands Antillean Guilder (ANG)', name: 'Netherlands Antillean Guilder (ANG)' },
					{ identifier: 'CFP Franc (XPF)', name: 'CFP Franc (XPF)' },
					{ identifier: 'New Zealand Dollar (NZD)', name: 'New Zealand Dollar (NZD)' },
					{ identifier: 'Nicaraguan Cordoba Oro (NIO)', name: 'Nicaraguan Cordoba Oro (NIO)' },
					{ identifier: 'CFA Franc BCEAO (XOF)', name: 'CFA Franc BCEAO (XOF)' },
					{ identifier: 'Nigerian Naira (NGN)', name: 'Nigerian Naira (NGN)' },
					{ identifier: 'New Zealand Dollar (NZD)', name: 'New Zealand Dollar (NZD)' },
					{ identifier: 'Australian Dollar (AUD)', name: 'Australian Dollar (AUD)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'Norwegian Krone (NOK)', name: 'Norwegian Krone (NOK)' },
					{ identifier: 'Omani Rial (OMR)', name: 'Omani Rial (OMR)' },
					{ identifier: 'Pakistan Rupee (PKR)', name: 'Pakistan Rupee (PKR)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'Panamanian Balboa (PAB)', name: 'Panamanian Balboa (PAB)' },
					{ identifier: 'Papua New Guinea Kina (PGK)', name: 'Papua New Guinea Kina (PGK)' },
					{ identifier: 'Paraguay Guarani (PYG)', name: 'Paraguay Guarani (PYG)' },
					{ identifier: 'Peruvian Nuevo Sol (PEN)', name: 'Peruvian Nuevo Sol (PEN)' },
					{ identifier: 'Philippine Peso (PHP)', name: 'Philippine Peso (PHP)' },
					{ identifier: 'New Zealand Dollar (NZD)', name: 'New Zealand Dollar (NZD)' },
					{ identifier: 'Polish Zloty (PLN)', name: 'Polish Zloty (PLN)' },
					{ identifier: 'CFP Franc (XPF)', name: 'CFP Franc (XPF)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'Qatari Rial (QAR)', name: 'Qatari Rial (QAR)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Romanian New Leu (RON)', name: 'Romanian New Leu (RON)' },
					{ identifier: 'Russian Ruble (RUB)', name: 'Russian Ruble (RUB)' },
					{ identifier: 'Rwanda Franc (RWF)', name: 'Rwanda Franc (RWF)' },
					{ identifier: 'St. Helena Pound (SHP)', name: 'St. Helena Pound (SHP)' },
					{ identifier: 'East Caribbean Dollar (XCD)', name: 'East Caribbean Dollar (XCD)' },
					{ identifier: 'East Caribbean Dollar (XCD)', name: 'East Caribbean Dollar (XCD)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'East Caribbean Dollar (XCD)', name: 'East Caribbean Dollar (XCD)' },
					{ identifier: 'Samoan Tala (WST)', name: 'Samoan Tala (WST)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Dobra (STD)', name: 'Dobra (STD)' },
					{ identifier: 'Saudi Riyal (SAR)', name: 'Saudi Riyal (SAR)' },
					{ identifier: 'CFA Franc BCEAO (XOF)', name: 'CFA Franc BCEAO (XOF)' },
					{ identifier: 'Dinar (RSD)', name: 'Dinar (RSD)' },
					{ identifier: 'Seychelles Rupee (SCR)', name: 'Seychelles Rupee (SCR)' },
					{ identifier: 'Sierra Leone Leone (SLL)', name: 'Sierra Leone Leone (SLL)' },
					{ identifier: 'Singapore Dollar (SGD)', name: 'Singapore Dollar (SGD)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Solomon Islands Dollar (SBD)', name: 'Solomon Islands Dollar (SBD)' },
					{ identifier: 'Somali Shilling (SOS)', name: 'Somali Shilling (SOS)' },
					{ identifier: 'South African Rand (ZAR)', name: 'South African Rand (ZAR)' },
					{ identifier: 'Pound Sterling (GBP)', name: 'Pound Sterling (GBP)' },
					{ identifier: 'South Sudan Pound (SSP)', name: 'South Sudan Pound (SSP)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Sri Lanka Rupee (LKR)', name: 'Sri Lanka Rupee (LKR)' },
					{ identifier: 'Sudanese Pound (SDG)', name: 'Sudanese Pound (SDG)' },
					{ identifier: 'Surinam Dollar (SRD)', name: 'Surinam Dollar (SRD)' },
					{ identifier: 'Norwegian Krone (NOK)', name: 'Norwegian Krone (NOK)' },
					{ identifier: 'Swaziland Lilangeni (SZL)', name: 'Swaziland Lilangeni (SZL)' },
					{ identifier: 'Swedish Krona (SEK)', name: 'Swedish Krona (SEK)' },
					{ identifier: 'Swiss Franc (CHF)', name: 'Swiss Franc (CHF)' },
					{ identifier: 'Syrian Pound (SYP)', name: 'Syrian Pound (SYP)' },
					{ identifier: 'Taiwan Dollar (TWD)', name: 'Taiwan Dollar (TWD)' },
					{ identifier: 'Tajik Somoni (TJS)', name: 'Tajik Somoni (TJS)' },
					{ identifier: 'Tanzanian Shilling (TZS)', name: 'Tanzanian Shilling (TZS)' },
					{ identifier: 'Thai Baht (THB)', name: 'Thai Baht (THB)' },
					{ identifier: 'CFA Franc BCEAO (XOF)', name: 'CFA Franc BCEAO (XOF)' },
					{ identifier: 'New Zealand Dollar (NZD)', name: 'New Zealand Dollar (NZD)' },
					{ identifier: 'Tongan Pa\'anga (TOP)', name: 'Tongan Pa\'anga (TOP)' },
					{ identifier: 'Trinidad and Tobago Dollar (TTD)', name: 'Trinidad and Tobago Dollar (TTD)' },
					{ identifier: 'Tunisian Dollar (TND)', name: 'Tunisian Dollar (TND)' },
					{ identifier: 'Turkish Lira (TRY)', name: 'Turkish Lira (TRY)' },
					{ identifier: 'Manat (TMT)', name: 'Manat (TMT)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'Australian Dollar (AUD)', name: 'Australian Dollar (AUD)' },
					{ identifier: 'Pound Sterling (GBP)', name: 'Pound Sterling (GBP)' },
					{ identifier: 'Uganda Shilling (UGX)', name: 'Uganda Shilling (UGX)' },
					{ identifier: 'Ukraine Hryvnia (UAH)', name: 'Ukraine Hryvnia (UAH)' },
					{ identifier: 'Arab Emirates Dirham (AED)', name: 'Arab Emirates Dirham (AED)' },
					{ identifier: 'Uruguayan Peso (UYU)', name: 'Uruguayan Peso (UYU)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'Uzbekistan Sum (UZS)', name: 'Uzbekistan Sum (UZS)' },
					{ identifier: 'Vanuatu Vatu (VUV)', name: 'Vanuatu Vatu (VUV)' },
					{ identifier: 'Euro (EUR)', name: 'Euro (EUR)' },
					{ identifier: 'Venezuelan Bolivar (VEF)', name: 'Venezuelan Bolivar (VEF)' },
					{ identifier: 'Vietnamese Dong (VND)', name: 'Vietnamese Dong (VND)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'US Dollar (USD)', name: 'US Dollar (USD)' },
					{ identifier: 'CFP Franc (XPF)', name: 'CFP Franc (XPF)' },
					{ identifier: 'Moroccan Dirham (MAD)', name: 'Moroccan Dirham (MAD)' },
					{ identifier: 'Yemeni Rial (YER)', name: 'Yemeni Rial (YER)' },
					{ identifier: 'Zambian Kwacha (ZMW)', name: 'Zambian Kwacha (ZMW)' },
					{ identifier: 'Zimbabwe Dollar (ZWD)', name: 'Zimbabwe Dollar (ZWD)' },
				]
			};

			//==================================
			//
			//==================================
			$scope.$watch('tab', function(tab) {

				if(!tab)
					return;

				if(tab == "general"   )     { $scope.prevTab = "general";         $scope.nextTab = "identification" }
				if(tab == "identification") { $scope.prevTab = "general";         $scope.nextTab = "section1" }
				if(tab == "section1"  )     { $scope.prevTab = "identification"; $scope.nextTab = "section2" }
				if(tab == "section2"  ) { $scope.prevTab = "section1";    $scope.nextTab = "section3" }
				if(tab == "section3"  ) { $scope.prevTab = "section2";    $scope.nextTab = "section4" }
				if(tab == "section4"  ) { $scope.prevTab = "section3";    $scope.nextTab = "section5" }
				if(tab == "section5"  ) { $scope.prevTab = "section4";    $scope.nextTab = "review" }
				if(tab == "review"    ) { $scope.prevTab = "section5"; $scope.nextTab = "review" }

				if (tab == 'review')
					$scope.validate();

			});

			$scope.init();
		},
		controller : ['$scope', "$q", "$location", 'IStorage', "Enumerable",  "editFormUtility", "authentication", "ngProgress", "managementUrls", function ($scope, $q, $location, storage, Enumerable, editFormUtility, authentication, ngProgress, managementUrls) 
		{
			//==================================
			//
			//==================================
			$scope.isLoading = function() {
				return $scope.status=="loading";
			}

			//==================================
			//
			//==================================
			$scope.hasError = function(field) {
				return $scope.error!=null;
			}

			//==================================
			//
			//==================================
			$scope.init = function() {

				if(!authentication.user().isAuthenticated) {
					$location.search({returnUrl : $location.url() });
					$location.path('/management/signin');
					return;
				}

				if ($scope.document)
					return;

				ngProgress.start();

				$scope.status = "loading";

				var promise = null;
				var schema  = "resourceMobilisation";
				var qs = $location.search();


				if(qs.uid) { // Load
					promise = editFormUtility.load(qs.uid, schema);
				}
				else { // Create

					promise = $q.when(guid()).then(function(identifier) {
						return storage.drafts.security.canCreate(identifier, schema).then(function(isAllowed) {

							if (!isAllowed)
								throw { data: { error: "Not allowed" }, status: "notAuthorized" };

							return identifier;
						});
					}).then(function(identifier) {

						return {
							header: {
								identifier: identifier,
								schema   : schema,
								languages: ["en"]
							},
							government: authentication.user().government ? { identifier: authentication.user().government } : undefined
						};
					});
				}

				promise.then(function(doc) {
						
					$scope.cleanUp(doc);
			        return doc;

				}).then(function(doc) {

					$scope.status = "ready";
					$scope.document = doc;

				}).catch(function(err) {

					$scope.onError(err.data, err.status)
					throw err;

				}).finally(function() {
					ngProgress.complete();
				});
			}

			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {
				document = document || $scope.document;

				if (!document)
					return $q.when(true);


				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

				return $q.when(false);
			};

			//==================================
			//
			//==================================
			$scope.validate = function(clone) {

				$scope.validationReport = null;

				var oDocument = $scope.document;

				if (clone !== false)
					oDocument = angular.fromJson(angular.toJson(oDocument));
				$scope.reviewDocument = oDocument;

				return $scope.cleanUp(oDocument).then(function(cleanUpError) {
					return storage.documents.validate(oDocument).then(
						function(success) {
							$scope.validationReport = success.data;
							return cleanUpError || !!(success.data && success.data.errors && success.data.errors.length);
						},
						function(error) {
							$scope.onError(error.data);
							return true;
						}
					);
				});
			}

			//==================================
			//
			//==================================
			$scope.isFieldValid = function(field) {
				if (field && $scope.validationReport && $scope.validationReport.errors)
					return !Enumerable.From($scope.validationReport.errors).Any(function(x){return x.property==field})

				return true;
			}


			//==================================
			//
			//==================================
			$scope.onPreSaveDraft = function() {
				return $scope.cleanUp();
			}

			//==================================
			//
			//==================================
			$scope.onPrePublish = function() {
				return $scope.validate(false).then(function(hasError) {
					if (hasError)
						$scope.tab = "review";
					return hasError;
				});
			}

			//==================================
			//
			//==================================
			$scope.onPostWorkflow = function(data) {
				$location.url(managementUrls.workflows);
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function(data) {
				$location.url("/database/record?documentID=" + data.documentID);
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function(data) {
				$location.url(managementUrls.drafts);
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				if($location.search().returnUrl)
					$location.url($location.search().returnUrl);	
				else
					$location.url(managementUrls.root);
			};

			//==================================
			//
			//==================================
			$scope.onError = function(error, status)
			{
				$scope.status = "error";

				if (status == "notAuthorized") {
					$scope.status = "hidden";
					$scope.error  = "You are not authorized to modify this record";
				}
				else if (status == 404) {
					$scope.status = "hidden";
					$scope.error  = "Record not found.";
				}
				else if (status == "badSchema") {
					$scope.status = "hidden";
					$scope.error  = "Record type is invalid.";
				}
				else if (error.Message)
					$scope.error = error.Message
				else
					$scope.error = error;
			}
			
			//==================================
			//
			//==================================
			$scope.loadRecords = function(identifier, schema) {

				if (identifier) { //lookup single record
					var deferred = $q.defer();

					storage.documents.get(identifier, { info: "" })
						.then(function(r) {
							deferred.resolve(r.data);
						}, function(e) {
							if (e.status == 404) {
								storage.drafts.get(identifier, { info: "" })
									.then(function(r) { deferred.resolve(r.data)},
										  function(e) { deferred.reject (e)});
							}
							else {
								deferred.reject (e)
							}
						});
					return deferred.promise;
				}

				//Load all record of specified schema;

				var sQuery = "type eq '" + encodeURI(schema) + "'";

				return $q.all([storage.documents.query(sQuery, null, { cache: true }), 
							   storage.drafts   .query(sQuery, null, { cache: true })])
					.then(function(results) {
						var qResult = Enumerable.From (results[0].data.Items)
												.Union(results[1].data.Items, "$.identifier");
						return qResult.ToArray();
					});
			}

			//==================================
			//
			//==================================
			$scope.isValueDirectlyRelated = function (resource) {

				if (!resource || !resource.category)
					return false;

				var qStatus = Enumerable.From([resource.category]);

				return qStatus.Any(function (o) { return o.identifier == "4BE226BA-E72F-4A8A-939E-6FCF0FA76CE4" });
			}

			//==================================
			//
			//==================================
			$scope.isValueIndirectlyRelated = function (resource) {
				if (!resource || !resource.category)
					return false;

				var qStatus = Enumerable.From([resource.category]);

				return qStatus.Any(function (o) { return o.identifier == "4B931A40-8032-41BD-BBD7-B16905E41DF2" });
			}

			//==================================
			//
			//==================================
			$scope.isValueDireclyAndIndirectlyRelated = function (resource) {
				if (!resource || !resource.category)
					return false;

				var qStatus = Enumerable.From([resource.category]);

				return qStatus.Any(function (o) { return o.identifier == "2BBC9278-A50C-4B3C-AF2C-BBC103405DE4" });
			}

			//==================================
			//
			//==================================
			$scope.getTotalDirected = function (financiaResources) {
				var value = 0;
				angular.forEach(financiaResources, function (resource, i) {
					if ($scope.isValueDirectlyRelated(resource) &&
						$.isNumeric(resource.amount)) {
						value += parseInt(resource.amount);
					}
				});

				return value
			}

			//==================================
			//
			//==================================
			$scope.getTotalIndirected = function (financiaResources) {
				var value = 0;
				angular.forEach(financiaResources, function (resource, i) {
					if ($scope.isValueIndirectlyRelated(resource) &&
						$.isNumeric(resource.amount)) {
						value += parseInt(resource.amount);
					}
				});

				return value
			}

			//==================================
			//
			//==================================
			$scope.getTotalDirectedAndIndirectly = function (financiaResources) {
				var value = 0;
				angular.forEach(financiaResources, function (resource, i) {
					if ($scope.isValueDireclyAndIndirectlyRelated(resource) &&
						$.isNumeric(resource.amount)) {
						value += parseInt(resource.amount);
					}
				});
				return value
			}

			//==================================
			//
			//==================================
			$scope.getOverallTotal = function (financiaResources) {
				var value = 0;
				angular.forEach(financiaResources, function (resource, i) {
					if ($.isNumeric(resource.amount)) {
						value += parseInt(resource.amount);
					}
				});
				return value
			}

			//==================================
			//
			//==================================
			$scope.getValueForConfidence = function (confidence) {
				if (confidence) {
					if (confidence.identifier == "D8BC6348-D1F9-4DA4-A8C0-7AE149939ABE") { return 3; } //high
					else if (confidence.identifier == "42526EE6-68F3-4E8A-BC2B-3BE60DA2EB32") { return 2; } //medium
					else if (confidence.identifier == "6FBEDE59-88DB-45FB-AACB-13C68406BD67") { return 1; } //low
				}
				else { return 0; }
			}

			//==================================
			//
			//==================================
			$scope.confidenceAverage = function (financialResources) {
				var value = 0;
				var nbItems = 0;
				angular.forEach(financialResources, function (resource, i) {
					if (resource.amount) {
						value += $scope.getValueForConfidence(resource.confidence)
						nbItems++;
					}
				});
				if (value==0) { return "No value selected"; }
				value = value / nbItems;
				if (value > 2) { return "High"; }
				else if (value > 1) { return "Medium"; }
				else { return "Low"; }
			}
		}]
	}
}])
	//============================================================
	//
	//
	//============================================================
	.directive('resourceMobilisationTransactionList', function ($http) {
		return {
			restrict: 'EAC',
			templateUrl: '/app/chm/directives/forms/form-resource-mobilisation-transaction-list',
			replace: true,
			transclude: false,
			require: "?ngModel",
			scope: {
				placeholder: "@",
				binding: "=ngModel",
				required: "@"
			},
			link: function ($scope, $element, attrs, ngModelController) {
				$scope.skipLoad = false;
				$scope.resources = [];
				$scope.$watch('binding', $scope.load);
				$scope.$watch('binding', function () {
					ngModelController.$setViewValue($scope.binding);
				});
				$scope.options = {
					type: function () { return $http.get("/api/v2013/thesaurus/domains/33D62DA5-D4A9-48A6-AAE0-3EEAA23D5EB0/terms", { cache: true }).then(function (o) { return o.data; }); },
					category: function () { return $http.get("/api/v2013/thesaurus/domains/A9AB3215-353C-4077-8E8C-AF1BF0A89645/terms", { cache: true }).then(function (o) { return o.data; }); },
					confidence: function () { return $http.get("/api/v2013/thesaurus/domains/AB782477-9942-4C6B-B9F0-79A82915A069/terms", { cache: true }).then(function (o) { return o.data; }); },
					year: [
						{ identifier: "2000", name: "2000" },
						{ identifier: "2001", name: "2001" },
						{ identifier: "2002", name: "2002" },
						{ identifier: "2003", name: "2003" },
						{ identifier: "2004", name: "2004" },
						{ identifier: "2005", name: "2005" },
						{ identifier: "2006", name: "2006" },
						{ identifier: "2007", name: "2007" },
						{ identifier: "2008", name: "2008" },
						{ identifier: "2009", name: "2009" },
						{ identifier: "2010", name: "2010" },
						{ identifier: "2011", name: "2011" },
						{ identifier: "2012", name: "2012" },
						{ identifier: "2013", name: "2013" },
						{ identifier: "2014", name: "2014" },
						{ identifier: "2015", name: "2015" },
						{ identifier: "2016", name: "2016" },
						{ identifier: "2017", name: "2017" },
						{ identifier: "2018", name: "2018" },
						{ identifier: "2019", name: "2019" },
						{ identifier: "2020", name: "2020" },
					]
				};
			},
			controller: ["$scope", function ($scope) {
				//==============================
				//
				//==============================
				$scope.load = function () {
					if ($scope.skipLoad) {
						$scope.skipLoad = false;
						return;
					}

					var oBinding = $scope.binding || [];

					$scope.resources = [];

					angular.forEach(oBinding, function (resource, i) {
						$scope.resources.push(resource);
					});
				};

				//==============================
				//
				//==============================
				$scope.remove = function (index) {
					$scope.resources.splice(index, 1);

					$scope.save();
				};

				//==============================
				//
				//==============================
				$scope.save = function () {
					var oNewBinding = [];
					var oResources = $scope.resources;

					angular.forEach(oResources, function (resource, i) {
						if (!$.isEmptyObject(resource))
							oNewBinding.push(resource);
					});

					$scope.binding = !$.isEmptyObject(oNewBinding) ? oNewBinding : undefined;
					$scope.skipLoad = true;
				};

				//==============================
				//
				//==============================
				$scope.getResources = function () {
					if ($scope.resources.length == 0)
						$scope.resources.push(new Object());

					var sLastValue = $scope.resources[$scope.resources.length - 1];

					//NOTE: IE can set value to 'undefined' for a moment  
					if ($scope.hasValue(sLastValue)) {
						$scope.resources.push(new Object());
					}
					return $scope.resources;
				};

				$scope.hasValue = function (sValue) {
					return sValue && (
						sValue.year != undefined ||
						sValue.type != undefined ||
						sValue.category != undefined ||
						sValue.amount != undefined ||
						sValue.confidence != undefined
						);
				}

				//==============================
				//
				//==============================
				$scope.isRequired = function () {
					return $scope.required != undefined
						&& $.isEmptyObject($scope.binding);
				}
			}]
		}
	})

	//============================================================
	//
	//
	//============================================================
	.directive('resourceMobilisationCountryTransactionList', function ($http) {
		return {
			restrict: 'EAC',
			templateUrl: '/app/chm/directives/forms/form-resource-mobilisation-country-transaction-list',
			replace: true,
			transclude: false,
			require: "?ngModel",
			scope: {
				placeholder: "@",
				binding: "=ngModel",
				required: "@"
			},
			link: function ($scope, $element, attrs, ngModelController) {
				$scope.skipLoad = false;
				$scope.resources = [];
				$scope.$watch('binding', $scope.load);
				$scope.$watch('binding', function () {
					ngModelController.$setViewValue($scope.binding);
				});
				$scope.options = {
					source:			function () { return $http.get("/api/v2013/thesaurus/domains/09A1F957-C1B8-4419-90A3-168DE3CD1676/terms", { cache: true }).then(function (o) { return o.data; }); },
					category:		function () { return $http.get("/api/v2013/thesaurus/domains/A9AB3215-353C-4077-8E8C-AF1BF0A89645/terms", { cache: true }).then(function (o) { return o.data; }); },
					confidence:		function () { return $http.get("/api/v2013/thesaurus/domains/AB782477-9942-4C6B-B9F0-79A82915A069/terms", { cache: true }).then(function (o) { return o.data; }); },
					year: [
						{ identifier: "2000", name: "2000" },
						{ identifier: "2001", name: "2001" },
						{ identifier: "2002", name: "2002" },
						{ identifier: "2003", name: "2003" },
						{ identifier: "2004", name: "2004" },
						{ identifier: "2005", name: "2005" },
						{ identifier: "2006", name: "2006" },
						{ identifier: "2007", name: "2007" },
						{ identifier: "2008", name: "2008" },
						{ identifier: "2009", name: "2009" },
						{ identifier: "2010", name: "2010" },
						{ identifier: "2011", name: "2011" },
						{ identifier: "2012", name: "2012" },
						{ identifier: "2013", name: "2013" },
						{ identifier: "2014", name: "2014" },
						{ identifier: "2015", name: "2015" },
						{ identifier: "2016", name: "2016" },
						{ identifier: "2017", name: "2017" },
						{ identifier: "2018", name: "2018" },
						{ identifier: "2019", name: "2019" },
						{ identifier: "2020", name: "2020" },
					]
				};
			},
			controller: ["$scope", function ($scope) {


				//==============================
				//
				//==============================
				$scope.load = function () {
					if ($scope.skipLoad) {
						$scope.skipLoad = false;
						return;
					}

					var oBinding = $scope.binding || [];

					$scope.resources = [];

					angular.forEach(oBinding, function (resource, i) {
						$scope.resources.push(resource);
					});
				};

				//==============================
				//
				//==============================
				$scope.remove = function (index) {
					$scope.resources.splice(index, 1);

					$scope.save();
				};

				//==============================
				//
				//==============================
				$scope.save = function () {
					var oNewBinding = [];
					var oResources = $scope.resources;

					angular.forEach(oResources, function (resource, i) {
						if (!$.isEmptyObject(resource))
							oNewBinding.push(resource);
					});

					$scope.binding = !$.isEmptyObject(oNewBinding) ? oNewBinding : undefined;
					$scope.skipLoad = true;
				};

				//==============================
				//
				//==============================
				$scope.getResources = function () {
					if ($scope.resources.length == 0)
						$scope.resources.push(new Object());

					var sLastValue = $scope.resources[$scope.resources.length - 1];

					//NOTE: IE can set value to 'undefined' for a moment  
					if ($scope.hasValue(sLastValue)) {
						$scope.resources.push(new Object());
					}
					return $scope.resources;
				};

				$scope.hasValue = function (sValue) {
					return sValue && (
						sValue.year != undefined ||
						sValue.source != undefined ||
						sValue.category != undefined ||
						sValue.amount != undefined ||
						sValue.confidence != undefined
						);
				}

				//==============================
				//
				//==============================
				$scope.isRequired = function () {
					return $scope.required != undefined
						&& $.isEmptyObject($scope.binding);
				}

			}]
		}
	})

	//============================================================
	//
	//
	//============================================================
	.directive('resourceMobilisationFinancialMechanismList', function ($http) {
		return {
			restrict: 'EAC',
			templateUrl: '/app/chm/directives/forms/resource-mobilisation-financial-mechanism-list',
			replace: true,
			transclude: false,
			require: "?ngModel",
			scope: {
				placeholder: "@",
				binding: "=ngModel",
				required: "@",
				locale: "="
			},
			link: function ($scope, $element, attrs, ngModelController) {
				$scope.skipLoad = false;
				$scope.resources = [];
				$scope.$watch('binding', $scope.load);
				$scope.$watch('binding', function () {
					ngModelController.$setViewValue($scope.binding);
				});
			},
			controller: ["$scope", function ($scope) {
				//==============================
				//
				//==============================
				$scope.load = function () {
					if ($scope.skipLoad) {
						$scope.skipLoad = false;
						return;
					}

					var oBinding = $scope.binding || [];

					$scope.resources = [];

					angular.forEach(oBinding, function (resource, i) {
						$scope.resources.push(resource);
					});
				};

				//==============================
				//
				//==============================
				$scope.remove = function (index) {
					$scope.resources.splice(index, 1);

					$scope.save();
				};

				//==============================
				//
				//==============================
				$scope.save = function () {
					var oNewBinding = [];
					var oResources = $scope.resources;

					angular.forEach(oResources, function (resource, i) {
						if (!$.isEmptyObject(resource))
							oNewBinding.push(resource);
					});

					$scope.binding = !$.isEmptyObject(oNewBinding) ? oNewBinding : undefined;
					$scope.skipLoad = true;
				};

				//==============================
				//
				//==============================
				$scope.getResources = function () {
					if ($scope.resources.length == 0)
						$scope.resources.push(new Object());

					var sLastValue = $scope.resources[$scope.resources.length - 1];

					//NOTE: IE can set value to 'undefined' for a moment  
					if ($scope.hasValue(sLastValue)) {
						$scope.resources.push(new Object());
					}
					return $scope.resources;
				};

				$scope.hasValue = function (sValue) {
					return sValue && (
						sValue.type != undefined ||
						sValue.resourceGenerated != undefined ||
						sValue.description != undefined
						);
				}

				//==============================
				//
				//==============================
				$scope.isRequired = function () {
					return $scope.required != undefined
						&& $.isEmptyObject($scope.binding);
				}

			}]
		}
	})
	//============================================================
	//
	//
	//============================================================
	.directive('resourceMobilisationResourceInitiativesList', function ($http) {
		return {
			restrict: 'EAC',
			templateUrl: '/app/chm/directives/forms/resource-mobilisation-resource-intiatives-list',
			replace: true,
			transclude: false,
			require: "?ngModel",
			scope: {
				placeholder: "@",
				binding: "=ngModel",
				required: "@",
				locale: "="
		},
			link: function ($scope, $element, attrs, ngModelController) {
				$scope.skipLoad = false;
				$scope.resources = [];
				$scope.$watch('binding', $scope.load);
				$scope.$watch('binding', function () {
					ngModelController.$setViewValue($scope.binding);
				});
			},
			controller: ["$scope", function ($scope) {
				//==============================
				//
				//==============================
				$scope.load = function () {
					if ($scope.skipLoad) {
						$scope.skipLoad = false;
						return;
					}

					var oBinding = $scope.binding || [];

					$scope.resources = [];

					angular.forEach(oBinding, function (resource, i) {
						$scope.resources.push(resource);
					});
				};

				//==============================
				//
				//==============================
				$scope.remove = function (index) {
					$scope.resources.splice(index, 1);

					$scope.save();
				};

				//==============================
				//
				//==============================
				$scope.save = function () {
					var oNewBinding = [];
					var oResources = $scope.resources;

					angular.forEach(oResources, function (resource, i) {
						if (!$.isEmptyObject(resource))
							oNewBinding.push(resource);
					});

					$scope.binding = !$.isEmptyObject(oNewBinding) ? oNewBinding : undefined;
					$scope.skipLoad = true;
				};

				//==============================
				//
				//==============================
				$scope.getResources = function () {
					if ($scope.resources.length == 0)
						$scope.resources.push(new Object());

					var sLastValue = $scope.resources[$scope.resources.length - 1];

					//NOTE: IE can set value to 'undefined' for a moment  
					if ($scope.hasValue(sLastValue)) {
						$scope.resources.push(new Object());
					}
					return $scope.resources;
				};

				$scope.hasValue = function (sValue) {
					return sValue && (
						sValue.initiative != undefined ||
						sValue.description != undefined
						);
				}

				//==============================
				//
				//==============================
				$scope.isRequired = function () {
					return $scope.required != undefined
						&& $.isEmptyObject($scope.binding);
				}

			}]
		}
	});