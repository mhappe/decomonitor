/*global location history */
sap.ui.define([
	"sap/tl/ewm/lib/reuse/controllers/Base.controller",
	"prodrive/EWM_DECON_MONITOR/model/formatter"
], function (BaseController, formatter) {
	"use strict";

	return BaseController.extend("prodrive.EWM_DECON_MONITOR.controller.Monitor", {

		// formatter: formatter

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */

		onInit: function () {
			BaseController.prototype.onInit.apply(this, arguments);

			var that = this;
			this.triggerCounter = 0;
			this.intervalTrigger = new sap.ui.core.IntervalTrigger(0);
			this.intervalTrigger.addListener(function () {
				that.refreshModel();
			});
			// When metadata of the main model is loaded, get user parameters, in case
			// a mandatory parameter is missing, the EWM user parameter popup is displayed
			// to maintain the missing parameters
			var fnGetUserDefaultParameters = function () {
				this.getOwnerComponent().getModel().read("/UserDefaultsSet(UserName='')", {
					success: function (oData) {
						that.triggerCounter = 0;
						that.intervalTrigger.setInterval(oData.RefreshIntervalSeconds * 1000); // * 1000 as property is in seconds
					}
				});

			}.bind(this);
			// Read parameters, error is handled by the base controller
			this.getOwnerComponent().getModel().metadataLoaded().then(fnGetUserDefaultParameters, fnGetUserDefaultParameters);

		},
		refreshModel: function () {
			this.triggerCounter += 1;
			if (this.triggerCounter > 1) {
				// No referesh for fist trigger as model is just loaded
				this.getOwnerComponent().getModel().refresh(true);
			}
		},
		onExit: function () {
			this.intervalTrigger.setInterval(0);
		},

		onFilterbarFilterChange: function (oEvent) {
			this.intervalTrigger.setInterval(0);
		},

		/**
		 * Navigate to handling unit
		 * @public
		 */
		onHULinkPress: function (oEvent) {
			var sHandlingUnitId = oEvent.getSource().getBindingContext().getObject().HandlingUnitId;
			var sWareHouseNumber = oEvent.getSource().getBindingContext().getObject().WarehouseNumber;
			this._openHandlingUnit(sHandlingUnitId, sWareHouseNumber);
		},

		onHUIdentPress: function (oEvent) {
			var sHandlingUnitId = oEvent.getSource().getBindingContext().getObject().Huident;
			var sWareHouseNumber = oEvent.getSource().getBindingContext().getObject().WarehouseNumber;
			this._openHandlingUnit(sHandlingUnitId, sWareHouseNumber);
		},

		_openHandlingUnit: function (sHandlingUnitId, sWarehouseNumber) {
			var oParams = {
				"HandlingUnitId": sHandlingUnitId,
				"WarehouseNumber": sWarehouseNumber
			};

			this.navigateToObject("EWMHandlingUnit", "displaySingle", oParams);
		},
		/**
		 * Navigate to reference document
		 * @public
		 */
		onDocumentIdLinkPress: function (oEvent) {
			var sDocumentGuid = oEvent.getSource().getBindingContext().getObject().DocumentGuid;
			var sWareHouseNumber = oEvent.getSource().getBindingContext().getObject().WarehouseNumber;
			var sDocumentCategory = oEvent.getSource().getBindingContext().getObject().DocumentCategory;
			var oParams = {
				"WarehouseNumber": sWareHouseNumber,
				"DocumentCategory": sDocumentCategory,
				"DocumentGuid": sDocumentGuid
			};
			this.navigateToObject("Z_EWM_DECON_MON", "displayRefDocument", oParams);
		},

		onWarehouseTaskLinkPress: function (oEvent) {
			var sWarehouseTask = oEvent.getSource().getBindingContext().getObject().WarehouseTask;
			var sWareHouseNumber = oEvent.getSource().getBindingContext().getObject().WarehouseNumber;
			var oParams = {
				"WarehouseNumber": sWareHouseNumber,
				"WarehouseTask": sWarehouseTask
			};
			this.navigateToObject("EWMWarehouseTask", "displaySingle", oParams);
		},

		navigateToObject: function (sSemanticObject, sSemanticObjectAction, oParams) {
			var oCrossAppNav = this.getCrossAppNav();
			var sHref = oCrossAppNav.hrefForExternal({
				target: {
					semanticObject: sSemanticObject,
					action: sSemanticObjectAction
				},
				params: oParams
			});

			oCrossAppNav.toExternal({
				target: {
					shellHash: sHref
				}
			});

		},
		onFilterBarGo: function (oEvent) {
			// On new selection clear table selections
			var oStockTable = this.getView().byId("idStorageBinTable").getTable();
			if (oStockTable) {
				oStockTable.removeSelections();
			}
			// Enable auto refresh
			this.triggerCounter = 0;
			var oUserDefaults = this.getView().getModel().getObject("/UserDefaultsSet('')");
			if (this.intervalTrigger && oUserDefaults) {
				// Get the refreshInterval
				this.intervalTrigger.setInterval(oUserDefaults.RefreshIntervalSeconds * 1000); // * 1000 as property is in seconds
			}

		},

		_processBinSelectionSmartTable: function (oRebindEvent) {
			// In case an entry of the master table is selected, filter detail table for selected entry
			// There is backend locked which determines which tasks should be visible
			// For this logic the fields DocumentGuid, Consolidation group,
			// Document category and documenttype should be set as filter values
			var oStockTable = this.getView().byId("idStorageBinTable").getTable();
			var aSelectedItemContexts = oStockTable.getSelectedContexts();
			if (aSelectedItemContexts[0]) {
				// Only one item could be selected
				oRebindEvent.getParameters().bindingParams.filters.push(new sap.ui.model.Filter("DocumentGuid", "EQ", aSelectedItemContexts[0].getObject()
					.DocumentGuid));
				oRebindEvent.getParameters().bindingParams.filters.push(new sap.ui.model.Filter("ConsolidationGroup", "EQ",
					aSelectedItemContexts[
						0].getObject()
					.ConsolidationGroup));
				oRebindEvent.getParameters().bindingParams.filters.push(new sap.ui.model.Filter("DocumentCategory", "EQ", aSelectedItemContexts[
						0]
					.getObject()
					.DocumentCategory));
				oRebindEvent.getParameters().bindingParams.filters.push(new sap.ui.model.Filter("DocumentType", "EQ", aSelectedItemContexts[0].getObject()
					.DocumentType));
			}
		},

		_skipFilterBarFiltersSmartTable: function (oRebindEvent) {
			// Filter out properties which are not available in the entityset.
			// Filters transported from smartfilterbar to table
			var oMetaModel = oRebindEvent.getSource().getModel().getMetaModel();
			var i = oRebindEvent.getParameters().bindingParams.filters.length;
			while (i--) {
				var mainFilter = oRebindEvent.getParameters().bindingParams.filters[i];
				var j = mainFilter.aFilters.length;
				while (j--) {
					var oPropertyFilter = mainFilter.aFilters[j];
					// get the filter property
					if (oPropertyFilter._bMultiFilter === true) {
						var sPath = oPropertyFilter.aFilters[0].sPath;
					} else if (oPropertyFilter._bMultiFilter === false) {
						sPath = oPropertyFilter.sPath;
					}
					var oEntitySet = oMetaModel.getODataEntitySet(oRebindEvent.getSource().getEntitySet());
					var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
					if (sPath && !oEntityType || !oMetaModel.getODataProperty(oEntityType, sPath)) {
						mainFilter.aFilters.splice(j, 1);

					}
				}
				if (mainFilter.aFilters.length === 0) {
					oRebindEvent.getParameters().bindingParams.filters.splice(i, 1);
				}
			}
		},

		onBeforeRebindOpenTaskTable: function (oEvent) {
			// Filter out properties which are not available in the entityset.
			this._skipFilterBarFiltersSmartTable(oEvent);

			// Filter out selected records from master Bin table
			this._processBinSelectionSmartTable(oEvent);
		},
		onBeforeRebindDecoStockTable: function (oEvent) {
			// Filter out properties which are not available in the entityset.
			this._skipFilterBarFiltersSmartTable(oEvent);
			// Filter out selected records from master Bin table
			this._processBinSelectionSmartTable(oEvent);
		},
		onMasterSelectionChange: function (oEvent) {
			// Selection on Bin table changed, rebind open tasks and deco stocl
			this.getView().byId("idOpenTaskTable").rebindTable();
			this.getView().byId("idDecoStockTable").rebindTable();
		},

		getCrossAppNav: function () {
			return sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
		}

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

	});
});