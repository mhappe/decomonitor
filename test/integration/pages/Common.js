sap.ui.define(["sap/ui/test/Opa5"],function(e){"use strict";function t(e,t){var r=jQuery.sap.getResourcePath("prodrive/EWM_DECON_MONITOR/app",".html");t=t?"?"+t:"";if(e){e="#"+(e.indexOf("/")===0?e.substring(1):e)}else{e=""}return r+t+e}return e.extend("prodrive.EWM_DECON_MONITOR.test.integration.pages.Common",{iStartMyApp:function(e){var r;e=e||{};var n=e.delay||50;r="serverDelay="+n;this.iStartMyAppInAFrame(t(e.hash,r))},createAWaitForAnEntitySet:function(e){return{success:function(){var t=false,r;this.getMockServer().then(function(n){r=n.getEntitySetData(e.entitySet);t=true});return this.waitFor({check:function(){return t},success:function(){e.success.call(this,r)},errorMessage:"was not able to retireve the entity set "+e.entitySet})}}},getMockServer:function(){return new Promise(function(t){e.getWindow().sap.ui.require(["prodrive/EWM_DECON_MONITOR/localService/mockserver"],function(e){t(e.getMockServer())})})},iStartMyAppOnADesktopToTestErrorHandler:function(e){this.iStartMyAppInAFrame(t("",e))}})});