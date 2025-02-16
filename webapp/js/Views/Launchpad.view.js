sap.ui.jsview(LOPT_VIEW_LAUNCHPAD, {
    getControllerName: function () {
        return LOPT_CONTROLLER_LAUNCHPAD;
    },

    createContent: function (oController) {
        const oPage = new sap.m.Page(LOPT_PAGE_LAUNCHPAD, {
            title: LOPT_PAGE_LAUNCHPAD_TITLE
        });
        oPage.setVisible(false).setBusyIndicatorDelay(0);

        this.createErrorMessageStrip(oPage);

        const verticalLayout = new sap.ui.layout.VerticalLayout();
        verticalLayout.addStyleClass("sapUiResponsiveMargin");
        this.createActionsTilesTitle(verticalLayout);
        this.createTiles(verticalLayout);
        oPage.addContent(verticalLayout);
        return oPage;
    },

    createErrorMessageStrip: function (oPage) {
        const errorMessageStrip = new sap.m.MessageStrip("errorMessageStrip", {
            type: sap.ui.core.MessageType.Error,
            showIcon: true
        });
        errorMessageStrip.addStyleClass("sapUiResponsiveMargin").setVisible(false);
        oPage.addContent(errorMessageStrip);
    },

    createActionsTilesTitle: function (verticalLayout) {
        const layoutActionsTitle = new sap.m.Title({
            text: "Actions",
            titleStyle: sap.ui.core.TitleLevel.H4
        });
        layoutActionsTitle
            .addStyleClass("sapUiTinyMarginBegin")
            .addStyleClass("sapUiTinyMarginTopBottom");
        verticalLayout.addContent(layoutActionsTitle);
    },

    createTiles: function (verticalLayout) {
        const horizontalLayout = new sap.ui.layout.HorizontalLayout("launchpadPageTilesContainer", {
            allowWrapping: true
        });

        this.createCreateTaskTile(horizontalLayout);
        this.createGetTasksTile(horizontalLayout);
        this.createCreateUserTile(horizontalLayout);
        this.createGetUsersTile(horizontalLayout);
        this.createUploadScriptsTile(horizontalLayout);

        verticalLayout.addContent(horizontalLayout);
    },

    createCreateTaskTile: function (horizontalLayout) {
        const oController = this.getController();
        const createTaskTile = new sap.m.GenericTile({
            header: "Create Task",
            subheader: "Create a new task",
            failedText: ACTION_UNAVAILABLE
        });
        createTaskTile
            .addStyleClass("sapUiTinyMarginBegin")
            .addStyleClass("sapUiTinyMarginBottom")
            .attachPress(() => {
                if (createTaskTile.getState() != sap.m.LoadState.Failed) {
                    oController.navTo(NAV_CREATE_TASK);
                }
            });
        const tileContent = new sap.m.TileContent();
        const createTaskTileContent = new sap.m.ImageContent({ src: "sap-icon://add-document" });
        tileContent.setContent(createTaskTileContent);
        createTaskTile.addTileContent(tileContent);
        horizontalLayout.addContent(createTaskTile);
    },

    createGetTasksTile: function (horizontalLayout) {
        const oController = this.getController();
        const getTasksTile = new sap.m.GenericTile({
            header: "Browse Tasks",
            subheader: "Get  a listing of all tasks",
            failedText: ACTION_UNAVAILABLE
        });
        getTasksTile
            .addStyleClass("sapUiTinyMarginBegin")
            .addStyleClass("sapUiTinyMarginBottom")
            .attachPress(() => {
                if (getTasksTile.getState() != sap.m.LoadState.Failed) {
                    oController.navTo(NAV_GET_TASKS);
                }
            });
        const tileContent = new sap.m.TileContent();
        const getTasksTileContent = new sap.m.ImageContent({
            src: "sap-icon://accounting-document-verification"
        });
        tileContent.setContent(getTasksTileContent);
        getTasksTile.addTileContent(tileContent);
        horizontalLayout.addContent(getTasksTile);
    },

    createCreateUserTile: function (horizontalLayout) {
        const oController = this.getController();
        const createUserTile = new sap.m.GenericTile({
            header: "Create User",
            subheader: "Create a new user",
            failedText: ACTION_UNAVAILABLE
        });
        createUserTile
            .addStyleClass("sapUiTinyMarginBegin")
            .addStyleClass("sapUiTinyMarginBottom")
            .attachPress(() => {
                if (createUserTile.getState() != sap.m.LoadState.Failed) {
                    oController.navTo(NAV_CREATE_USER);
                }
            });
        const tileContent = new sap.m.TileContent();
        const createUserTileContent = new sap.m.ImageContent({ src: "sap-icon://add-employee" });
        tileContent.setContent(createUserTileContent);
        createUserTile.addTileContent(tileContent);
        horizontalLayout.addContent(createUserTile);
    },

    createGetUsersTile: function (horizontalLayout) {
        const oController = this.getController();
        const getUsersTile = new sap.m.GenericTile({
            header: "Browse Users",
            subheader: "Get a listing of all users",
            failedText: ACTION_UNAVAILABLE
        });
        getUsersTile
            .addStyleClass("sapUiTinyMarginBegin")
            .addStyleClass("sapUiTinyMarginBottom")
            .attachPress(() => {
                if (getUsersTile.getState() != sap.m.LoadState.Failed) {
                    oController.navTo(NAV_GET_USERS);
                }
            });
        const tileContent = new sap.m.TileContent();
        const getUsersTileContent = new sap.m.ImageContent({
            src: "sap-icon://kpi-managing-my-area"
        });
        tileContent.setContent(getUsersTileContent);
        getUsersTile.addTileContent(tileContent);
        horizontalLayout.addContent(getUsersTile);
    },

    createUploadScriptsTile: function (horizontalLayout) {
        const oController = this.getController();
        const uploadScriptTile = new sap.m.GenericTile({
            header: "Upload Scripts",
            subheader: "Upload content from the local device",
            failedText: ACTION_UNAVAILABLE
        });
        uploadScriptTile
            .addStyleClass("sapUiTinyMarginBegin")
            .addStyleClass("sapUiTinyMarginBottom")
            .attachPress(() => {
                if (uploadScriptTile.getState() != sap.m.LoadState.Failed) {
                    oController.navTo(NAV_UPLOAD_SCRIPT);
                }
            });

        const tileContent = new sap.m.TileContent();
        const uploadScriptTileContent = new sap.m.ImageContent({
            src: "sap-icon://upload"
        });
        tileContent.setContent(uploadScriptTileContent);
        uploadScriptTile.addTileContent(tileContent);
        horizontalLayout.addContent(uploadScriptTile);
    },

    applyModel: function () {
        const modelObj = this.getModel().getProperty("/obj");
        const errorMessage = modelObj.getMessage();
        const oController = this.getController();
        const launchpadPage = oController.globalById(LOPT_PAGE_LAUNCHPAD);
        const errorMessageStrip = oController.globalById("errorMessageStrip");
        const launchpadPageTiles = oController
            .globalById("launchpadPageTilesContainer")
            .getContent();

        launchpadPage.setBusy(false);
        if (errorMessage) {
            errorMessageStrip.setVisible(true).setText(errorMessage);
            oController.toggleMainPageNav(false);
            for (const tile of launchpadPageTiles) {
                tile.setState(sap.m.LoadState.Failed);
            }
        } else {
            errorMessageStrip.setVisible(false);
            oController.toggleMainPageNav(true);
            for (const tile of launchpadPageTiles) {
                tile.setState(sap.m.LoadState.Loaded);
            }
        }
    },

    loadPage: function () {
        const oController = this.getController();
        const errorMessageStrip = oController.globalById("errorMessageStrip");
        const launchpadPage = oController.globalById(LOPT_PAGE_LAUNCHPAD);
        errorMessageStrip.setVisible(false);
        launchpadPage.setBusy(true);
        oController.pageLoaded();
    },

    hideLoading: function () {
        const viewPage = this.getController().globalById(LOPT_PAGE_LAUNCHPAD);
        if (!viewPage.getVisible()) {
            viewPage.setVisible(true);
        }
    }
});
