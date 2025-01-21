sap.ui.jsview(LOPT_VIEW_MAIN, {
    getControllerName: function () {
        return LOPT_CONTROLLER_MAIN;
    },

    createContent: function (oController) {
        const toolPage = new sap.tnt.ToolPage(LOPT_PAGE_MAIN, {
            sideExpanded: false
        });

        this.createToolPageHeader(toolPage);
        this.createToolPageSideContent(toolPage);
        this.createToolPageMainContent(toolPage);
        this.createChangeThemeDialog(toolPage);

        return toolPage;
    },

    createChangeThemeDialog: function (toolPage) {
        const oController = this.getController();
        const dialog = new sap.m.Dialog("changeThemeDialog", {
            title: "Pick a theme",
            icon: "sap-icon://palette"
        });
        const closeButton = new sap.m.Button("changeThemeDialogCloseButton", {
            text: "Close",
            type: sap.m.ButtonType.Emphasized
        });
        closeButton.attachPress(() => {
            dialog.close();
        });
        const themeList = new sap.m.List("changeThemeList");
        for (const theme of THEMES) {
            const themeItem = new sap.m.StandardListItem({ title: theme.name });
            themeItem.setType(sap.m.ListType.Active).attachPress(() => {
                oController.themeChanged(theme.id);
                dialog.close();
            });
            themeList.addItem(themeItem);
        }

        dialog.addContent(themeList);
        dialog.addButton(closeButton);
        toolPage.addMainContent(dialog);
    },

    createSideNavToggleButton: function (toolPageHeader) {
        const oController = this.getController();
        const sideNavToggleButton = new sap.m.Button(SIDE_NAV_TOGGLE_BUTTON, {
            icon: "sap-icon://menu2",
            type: "Transparent"
        });
        sideNavToggleButton.attachPress(oController.sideNavToggleClicked);
        const buttonLayoutData = new sap.ui.core.LayoutData({
            layoutData: new sap.m.OverflowToolbarLayoutData({ priority: "NeverOverflow" })
        });
        sideNavToggleButton.setLayoutData(buttonLayoutData);
        toolPageHeader.addContent(sideNavToggleButton);
    },

    createTitle: function (toolPageHeader) {
        toolPageHeader.addContent(new sap.m.ToolbarSpacer());
        toolPageHeader.addContent(
            new sap.m.HBox({
                items: [
                    new sap.ui.core.Icon({
                        src: "sap-icon://internet-browser",
                        size: "1.5rem",
                        tooltip: "Icon Tooltip"
                    }),
                    new sap.m.Title({
                        text: "Lopt Web",
                        level: "H1",
                        textAlign: sap.ui.core.TextAlign.Left
                    }).addStyleClass("sapUiTinyMarginBegin")
                ],
            })
        );
        toolPageHeader.addContent(new sap.m.ToolbarSpacer());
    },

    createChangeThemeButton: function (toolPageHeader) {
        const oController = this.getController();
        const changeThemeButton = new sap.m.Button({
            icon: "sap-icon://palette",
            type: "Transparent",
            tooltip: "Change Theme"
        });
        changeThemeButton.attachPress(oController.changeThemeClicked);
        const buttonLayoutData = new sap.ui.core.LayoutData({
            layoutData: new sap.m.OverflowToolbarLayoutData({ priority: "NeverOverflow" })
        });
        changeThemeButton.setLayoutData(buttonLayoutData);
        toolPageHeader.addContent(changeThemeButton);
    },

    createToolPageHeader: function (toolPage) {
        const toolPageHeader = new sap.tnt.ToolHeader();

        this.createSideNavToggleButton(toolPageHeader);
        this.createTitle(toolPageHeader);
        this.createChangeThemeButton(toolPageHeader);

        toolPage.setHeader(toolPageHeader);
    },

    createToolPageSideContent: function (toolPage) {
        const toolPageSideContent = new sap.tnt.SideNavigation("sideNav");
        const sideNavigationList = new sap.tnt.NavigationList();
        for (const item of NAV_CONTENT) {
            sideNavigationList.addItem(
                new sap.tnt.NavigationListItem(item.id, {
                    icon: item.icon,
                    text: item.text,
                    href: "#/" + item.route
                }).setKey(item.id)
            );
        }
        toolPageSideContent.setItem(sideNavigationList);
        toolPage.setSideContent(toolPageSideContent);
    },

    createToolPageMainContent: function (toolPage) {
        const oApp = new sap.m.App(LOPT_APP);
        oApp.setBusyIndicatorDelay(0);
        toolPage.addMainContent(oApp);
    },

    changeSelectedNavKey: function (key) {
        this.getController().globalById("sideNav").setSelectedKey(key);
    }
});
