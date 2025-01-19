sap.ui.define(["./BaseController"], function (BaseController) {
    "use strict";

    return BaseController.extend(TASK_EXECUTOR_CLIENT_CONTROLLER_MAIN, {
        onInit: function () {
            const thisController = this;
            this.applySavedTheme();
            this.createViews().then(() => {
                thisController.pushCurrentRouteToRouteHistory();
                thisController.getRouter().navTo(NAV_HOME);
                thisController
                    .getRouter()
                    .attachRouteMatched(thisController.onRouteChange.bind(thisController));
                thisController.getRouter().navTo(NAV_ONGOING_TASK);
            });
        },

        pushCurrentRouteToRouteHistory: function () {
            const mainModel = this.getOwnerComponent().getModel();
            const newRoute = {
                route: this.getCurrentRouteName(),
                arguments: this.getCurrentRouteArguments()
            };
            if (mainModel) {
                const routeHistory = mainModel.getProperty("/routeHistory");
                routeHistory.push(newRoute);
            } else {
                this.getOwnerComponent().setModel(
                    new sap.ui.model.json.JSONModel({
                        routeHistory: [newRoute]
                    })
                );
            }
        },

        createViews: async function () {
            this.getApp().addPage(
                await sap.ui.core.mvc.JSView.create({
                    id: TASK_EXECUTOR_CLIENT_VIEW_ONGOING_TASK,
                    viewName: TASK_EXECUTOR_CLIENT_VIEW_ONGOING_TASK
                })
            );
            this.getApp().addPage(
                await sap.ui.core.mvc.JSView.create({
                    id: TASK_EXECUTOR_CLIENT_VIEW_LAUNCHPAD,
                    viewName: TASK_EXECUTOR_CLIENT_VIEW_LAUNCHPAD
                })
            );
            this.getApp().addPage(
                await sap.ui.core.mvc.JSView.create({
                    id: TASK_EXECUTOR_CLIENT_VIEW_TASK_EDITOR,
                    viewName: TASK_EXECUTOR_CLIENT_VIEW_TASK_EDITOR
                })
            );
            this.getApp().addPage(
                await sap.ui.core.mvc.JSView.create({
                    id: TASK_EXECUTOR_CLIENT_VIEW_GET_TASKS,
                    viewName: TASK_EXECUTOR_CLIENT_VIEW_GET_TASKS
                })
            );
            this.getApp().addPage(
                await sap.ui.core.mvc.JSView.create({
                    id: TASK_EXECUTOR_CLIENT_VIEW_TASK_DETAILS,
                    viewName: TASK_EXECUTOR_CLIENT_VIEW_TASK_DETAILS
                })
            );
            this.getApp().addPage(
                await sap.ui.core.mvc.JSView.create({
                    id: TASK_EXECUTOR_CLIENT_VIEW_CREATE_USER,
                    viewName: TASK_EXECUTOR_CLIENT_VIEW_CREATE_USER
                })
            );
            this.getApp().addPage(
                await sap.ui.core.mvc.JSView.create({
                    id: TASK_EXECUTOR_CLIENT_VIEW_GET_USERS,
                    viewName: TASK_EXECUTOR_CLIENT_VIEW_GET_USERS
                })
            );
            this.getApp().addPage(
                await sap.ui.core.mvc.JSView.create({
                    id: TASK_EXECUTOR_CLIENT_VIEW_UPLOAD_SCRIPT,
                    viewName: TASK_EXECUTOR_CLIENT_VIEW_UPLOAD_SCRIPT
                })
            );
        },

        onRouteChange: function (oEvent) {
            const routeName = oEvent.getParameter("name");
            const args = oEvent.getParameter("arguments");
            switch (routeName) {
                case NAV_ONGOING_TASK:
                    this.toggleMainPageNav(false);
                    this.getApp().setBusy(true);
                    this.getApp().to(TASK_EXECUTOR_CLIENT_VIEW_ONGOING_TASK);
                    this.getApp().getCurrentPage().loadPage();
                    this.changeHTMLPageTitle(TASK_EXECUTOR_CLIENT_PAGE_ONGOING_TASK_TITLE);
                    this.pushCurrentRouteToRouteHistory();
                    break;
                case NAV_LAUNCHPAD:
                    this.getApp().setBusy(true);
                    this.getApp().to(TASK_EXECUTOR_CLIENT_VIEW_LAUNCHPAD);
                    this.getApp().getCurrentPage().loadPage();
                    // launchpad is the only page that doesn't toggle 'busy'
                    this.getApp().setBusy(false);
                    this.getView().changeSelectedNavKey(routeName);
                    this.changeHTMLPageTitle(TASK_EXECUTOR_CLIENT_PAGE_LAUNCHPAD_TITLE);
                    this.pushCurrentRouteToRouteHistory();
                    break;
                case NAV_CREATE_TASK:
                    this.getApp().setBusy(true);
                    this.getApp().to(TASK_EXECUTOR_CLIENT_VIEW_TASK_EDITOR);
                    this.getApp().getCurrentPage().loadPage(NAV_CREATE_TASK);
                    this.getView().changeSelectedNavKey(routeName);
                    this.changeHTMLPageTitle(TASK_EXECUTOR_CLIENT_PAGE_CREATE_TASK_TITLE);
                    this.pushCurrentRouteToRouteHistory();
                    break;
                case NAV_GET_TASKS:
                    this.getApp().setBusy(true);
                    this.getApp().to(TASK_EXECUTOR_CLIENT_VIEW_GET_TASKS);
                    this.getApp().getCurrentPage().loadPage();
                    this.getView().changeSelectedNavKey(routeName);
                    this.changeHTMLPageTitle(TASK_EXECUTOR_CLIENT_PAGE_GET_TASKS_TITLE);
                    this.pushCurrentRouteToRouteHistory();
                    break;
                case NAV_TASKS:
                    this.getApp().setBusy(true);
                    this.getApp().to(TASK_EXECUTOR_CLIENT_VIEW_TASK_DETAILS);
                    this.getApp().getCurrentPage().loadPage(args.taskId);
                    this.getView().changeSelectedNavKey(routeName);
                    this.changeHTMLPageTitle(TASK_EXECUTOR_CLIENT_PAGE_TASK_DETAILS_TITLE);
                    this.pushCurrentRouteToRouteHistory();
                    break;
                case NAV_UPDATE_TASK:
                    this.getApp().setBusy(true);
                    this.getApp().to(TASK_EXECUTOR_CLIENT_VIEW_TASK_EDITOR);
                    this.getApp().getCurrentPage().loadPage(NAV_UPDATE_TASK, args.taskId);
                    this.getView().changeSelectedNavKey(routeName);
                    this.changeHTMLPageTitle(TASK_EXECUTOR_CLIENT_PAGE_UPDATE_TASK_TITLE);
                    this.pushCurrentRouteToRouteHistory();
                    break;
                case NAV_CREATE_USER:
                    this.getApp().setBusy(true);
                    this.getApp().to(TASK_EXECUTOR_CLIENT_VIEW_CREATE_USER);
                    this.getApp().getCurrentPage().loadPage(NAV_CREATE_USER);
                    this.getView().changeSelectedNavKey(routeName);
                    this.changeHTMLPageTitle(TASK_EXECUTOR_CLIENT_PAGE_CREATE_USER_TITLE);
                    this.pushCurrentRouteToRouteHistory();
                    break;
                case NAV_GET_USERS:
                    this.getApp().setBusy(true);
                    this.getApp().to(TASK_EXECUTOR_CLIENT_VIEW_GET_USERS);
                    this.getApp().getCurrentPage().loadPage();
                    this.getView().changeSelectedNavKey(routeName);
                    this.changeHTMLPageTitle(TASK_EXECUTOR_CLIENT_PAGE_GET_USERS_TITLE);
                    this.pushCurrentRouteToRouteHistory();
                    break;
                case NAV_UPLOAD_SCRIPT:
                    this.getApp().setBusy(true);
                    this.getApp().to(TASK_EXECUTOR_CLIENT_VIEW_UPLOAD_SCRIPT);
                    this.getApp().getCurrentPage().loadPage();
                    this.getView().changeSelectedNavKey(routeName);
                    this.changeHTMLPageTitle(TASK_EXECUTOR_CLIENT_PAGE_UPLOAD_SCRIPT_TITLE);
                    this.pushCurrentRouteToRouteHistory();
                    break;
            }
        },

        sideNavToggleClicked: function () {
            sap.ui.getCore().byId(TASK_EXECUTOR_CLIENT_PAGE_MAIN).toggleSideContentMode();
        },

        changeHTMLPageTitle: function (title) {
            document.title = "Lopt | " + title;
        },

        changeThemeClicked: function () {
            const storage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            const savedTheme = storage.get(SAVED_THEME_STORAGE_PREFIX);
            const changeThemeDialog = sap.ui.getCore().byId("changeThemeDialog");
            const themeItems = sap.ui.getCore().byId("changeThemeList").getItems();
            let selectedThemeIndex = 0;
            for (let i = 0; i < THEMES.length; i++) {
                if (THEMES[i].id == savedTheme) {
                    selectedThemeIndex = i;
                    break;
                }
            }

            for (let i = 0; i < themeItems.length; i++) {
                if (i == selectedThemeIndex) {
                    themeItems[i].setIcon("sap-icon://sys-enter-2");
                    continue;
                }
                themeItems[i].setIcon(null);
            }

            changeThemeDialog.open();
        },

        themeChanged: function (themeId) {
            const storage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            storage.put(SAVED_THEME_STORAGE_PREFIX, themeId);
            sap.ui.getCore().applyTheme(themeId);
        },

        applySavedTheme: function () {
            const storage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
            const savedTheme = storage.get(SAVED_THEME_STORAGE_PREFIX);
            if (!savedTheme) {
                this.themeChanged(DEFAULT_THEME);
                return;
            }
            sap.ui.getCore().applyTheme(savedTheme);
        }
    });
});
