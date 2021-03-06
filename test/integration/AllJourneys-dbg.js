/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"prodrive/EWM_DECON_MONITOR/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"prodrive/EWM_DECON_MONITOR/test/integration/pages/Worklist",
	"prodrive/EWM_DECON_MONITOR/test/integration/pages/Object",
	"prodrive/EWM_DECON_MONITOR/test/integration/pages/NotFound",
	"prodrive/EWM_DECON_MONITOR/test/integration/pages/Browser",
	"prodrive/EWM_DECON_MONITOR/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "prodrive.EWM_DECON_MONITOR.view."
	});

	sap.ui.require([
		"prodrive/EWM_DECON_MONITOR/test/integration/WorklistJourney",
		"prodrive/EWM_DECON_MONITOR/test/integration/ObjectJourney",
		"prodrive/EWM_DECON_MONITOR/test/integration/NavigationJourney",
		"prodrive/EWM_DECON_MONITOR/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});