sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend(LOPT_BASE_CONTROLLER, {
        toggleMainPageNav: function (toggle) {
            const sideNavigationToggleButton = this.globalById(SIDE_NAV_TOGGLE_BUTTON);
            sideNavigationToggleButton.setEnabled(toggle);
            for (const item of this.getMainPage().getSideContent().getItem().getItems()) {
                item.setEnabled(toggle);
            }
        },

        globalById: function (id) {
            return sap.ui.getCore().byId(id);
        },

        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        getApp: function () {
            return sap.ui.getCore().byId(LOPT_APP);
        },

        getMainPage: function () {
            return this.globalById(LOPT_PAGE_MAIN);
        },

        getFirstChildViewController: function () {
            return this.globalById(LOPT_VIEW_ONGOING_TASK).getController();
        },

        getCurrentRouteName: function () {
            const router = this.getFirstChildViewController().getRouter();
            const currentHash = router.getHashChanger().getHash();
            const routeInfo = router.getRouteInfoByHash(currentHash);
            return routeInfo && routeInfo.name != NAV_HOME ? routeInfo.name : NAV_LAUNCHPAD;
        },

        getCurrentRouteArguments: function () {
            const router = this.getFirstChildViewController().getRouter();
            const currentHash = router.getHashChanger().getHash();
            return router.getRouteInfoByHash(currentHash).arguments;
        },

        navToPrevious: function () {
            const mainModel = this.getFirstChildViewController().getOwnerComponent().getModel();
            const routeHistory = mainModel.getProperty("/routeHistory");
            routeHistory.splice(routeHistory.length - 1, 1); // remove the current route from the route history
            const prevRoute = routeHistory.pop();
            let route = NAV_LAUNCHPAD;
            let args;

            if (prevRoute) {
                route = prevRoute.route;
                args = prevRoute.arguments;

                if (route == this.getCurrentRouteName()) {
                    route = NAV_LAUNCHPAD;
                }
            }

            this.navTo(route, args);
        },

        navTo: function (route, args) {
            this.getFirstChildViewController().getRouter().navTo(route, args);
        },

        passModel: function (obj) {
            const ob = {
                obj: obj
            };
            this.getView().setModel(new sap.ui.model.json.JSONModel(ob));
            this.getView().applyModel();
        },

        getModelObjProperty: function () {
            return this.getView().getModel().getProperty("/obj");
        },

        navigateToLaunchpad: function () {
            this.navTo(NAV_LAUNCHPAD);
        },

        requiredFieldChanged: function (oEvent) {
            const oSource = oEvent.getSource();
            if (oSource.getValueState() == sap.ui.core.ValueState.Error) {
                oSource.setValueState(sap.ui.core.ValueState.None);
            }
        },

        logIn: function(password, callback) {
            $.ajax({
                url: CONFIG.API_BASE_URL + LOGIN_PATH,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ password: password }),
                success: function(response) {
                    if (response.token) {
                        jQuery.sap.storage.put('token', response.token);
                        callback(true);
                        return;
                    }
                    callback(false);
                },
                error: function(xhr, status, error) {
                    callback(false);
                }
            });
        },

        isLoggedIn: function () {
            return jQuery.sap.storage.get('token') !== null
        },
    });
});
