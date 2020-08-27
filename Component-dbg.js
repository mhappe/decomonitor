/* global document */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/tl/ewm/lib/reuse/components/base/Component"
], function (UIComponent, BaseComponent) {
	"use strict";

	return BaseComponent.extend("prodrive.EWM_DECON_MONITOR.Component", {

		metadata: {
			manifest: "json"
		},
		initialPage: "monitor",

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function () {

			// call the base component's init function
			BaseComponent.prototype.init.apply(this, arguments);
		}
	});

});