sap.ui.jsview(LOPT_VIEW_GET_USERS, {
    getControllerName: function () {
        return LOPT_CONTROLLER_GET_USERS;
    },

    createContent: function (oController) {
        const oPage = new sap.m.Page(LOPT_PAGE_GET_USERS, {
            title: LOPT_PAGE_GET_USERS_TITLE,
            showNavButton: true
        });
        oPage
            .setVisible(false)
            .setBusyIndicatorDelay(0)
            .attachNavButtonPress(() => {
                oController.navToPrevious();
            });
        this.createErrorDialog(oPage);
        this.createUserDeletionDialog(oPage);
        return oPage;
    },

    createErrorDialog: function (oPage) {
        const oController = this.getController();
        const errorDialog = new sap.m.Dialog("getUsersErrorDialog", {
            title: "An Error has Occurred",
            titleAlignment: sap.m.TitleAlignment.Center,
            type: sap.m.DialogType.Message
        });
        const errorMessageStrip = new sap.m.MessageStrip("getUsersDialogErrorStrip", {
            type: sap.ui.core.MessageType.Error,
            showIcon: true
        });
        errorMessageStrip.addStyleClass("sapUiResponsiveMargin");
        const errorMessageDialogButton = new sap.m.Button("getUsersErrorDialogButton", {
            text: "Continue to Launchpad",
            type: sap.m.ButtonType.Emphasized
        });
        errorMessageDialogButton.attachPress(() => {
            errorDialog.close();
            oController.navigateToLaunchpad();
        });
        errorDialog.addContent(errorMessageStrip);
        errorDialog.addButton(errorMessageDialogButton);
        oPage.addContent(errorDialog);
    },

    destroyOldTable: function (oPage) {
        const oController = this.getController();
        const oOldTable = oController.globalById("usersListingTable");
        if (oOldTable) {
            oOldTable.destroyItems();
            oPage.removeContent(oOldTable);
            oOldTable.destroy();
        }
    },

    createUsersListingTable: function () {
        const oController = this.getController();
        const oPage = oController.globalById(LOPT_PAGE_GET_USERS);

        this.destroyOldTable(oPage);
        const oTable = new sap.m.Table("usersListingTable");
        oTable.addStyleClass("sapUiResponsiveMargin").setWidth("auto");
        this.createUsersListingTableHeader(oTable);
        this.createUsersListingTableColumns(oTable);
        oPage.addContent(oTable);
    },

    createUsersListingTableHeader: function (oTable) {
        const oController = this.getController();
        const headerToolbar = new sap.m.Toolbar();
        const usersListingLabel = new sap.m.Label("usersListingTableHeading");
        const toolbarSpacer = new sap.m.ToolbarSpacer();
        const searchField = new sap.m.SearchField({ showSearchButton: false });
        searchField.setWidth("auto").attachLiveChange((oEvent) => {
            oController.onSearchUsersListing(oEvent);
        });
        headerToolbar.addContent(usersListingLabel);
        headerToolbar.addContent(toolbarSpacer);
        headerToolbar.addContent(searchField);
        oTable.setHeaderToolbar(headerToolbar);
    },

    createUsersListingTableColumns: function (oTable) {
        const uidColumn = new sap.m.Column({ vAlign: sap.ui.core.VerticalAlign.Middle });
        uidColumn.setWidth("20%").setHeader(new sap.m.Text({ text: "UID" }));
        const usernameColumn = new sap.m.Column({ vAlign: sap.ui.core.VerticalAlign.Middle });
        usernameColumn.setWidth("40%").setHeader(new sap.m.Text({ text: "Username" }));
        const actionsColumn = new sap.m.Column({
            vAlign: sap.ui.core.VerticalAlign.Middle,
            hAlign: sap.ui.core.TextAlign.Center
        });
        actionsColumn.setWidth("40%").setHeader(new sap.m.Text({ text: "Actions" }));
        oTable.addColumn(uidColumn);
        oTable.addColumn(usernameColumn);
        oTable.addColumn(actionsColumn);
    },

    applyModel: function () {
        const modelObj = this.getModel().getProperty("/obj");
        const message = modelObj.getMessage();
        const users = modelObj.getUsers();

        if (message) {
            this.showFatalErrorMessage();
        } else if (users) {
            this.showUsersListing();
        }
    },

    showUsersListing: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const users = modelObj.getUsers();
        const oTable = oController.globalById("usersListingTable");

        this.changeUsersCount(users.length);
        for (const user of users) {
            const row = new sap.m.ColumnListItem({ vAlign: sap.ui.core.VerticalAlign.Middle });
            row.addCell(new sap.m.Text({ text: user.uid })).addCell(
                new sap.m.Text({ text: user.username })
            );
            this.createUserListingButtons(row, user);
            oTable.addItem(row);
        }
    },

    changeUsersCount: function (count) {
        const oController = this.getController();
        oController
            .globalById("usersListingTableHeading")
            .setText("Users created by Lopt (" + count + ")");
    },

    createUserListingButtons: function (row, user) {
        const thisView = this;
        const modelObj = this.getModel().getProperty("/obj");
        const deleteUserButton = new sap.m.Button({
            icon: "sap-icon://delete",
            text: "Delete User",
            type: sap.m.ButtonType.Reject
        });
        deleteUserButton.addStyleClass("sapUiTinyMarginBeginEnd").attachPress(() => {
            modelObj.setUser(user);
            thisView.showDeleteUserDialog();
        });
        //attach onpress for each button
        const userActionsFlexBox = new sap.m.FlexBox({
            wrap: sap.m.FlexWrap.Wrap,
            justifyContent: sap.m.FlexJustifyContent.Center
        });
        userActionsFlexBox.addItem(deleteUserButton);
        row.addCell(userActionsFlexBox);
    },

    createUserDeletionDialog: function (oPage) {
        const thisView = this;
        const oController = this.getController();
        const deleteUserDialog = new sap.m.Dialog("getUsersDeleteUserDialog", {
            titleAlignment: sap.m.TitleAlignment.Center,
            type: sap.m.DialogType.Message
        });
        deleteUserDialog.setBusyIndicatorDelay(0).attachAfterClose(() => {
            const modelObj = thisView.getModel().getProperty("/obj");
            if (!modelObj.getShouldNotFireAfterCloseDeleteDialog()) {
                oController.refreshUsersListing();
            } else {
                modelObj.setShouldNotFireAfterCloseDeleteDialog(false);
            }
        });

        const errorMessageStrip = new sap.m.MessageStrip("getUsersDeleteUserDialogErrorStrip", {
            type: sap.ui.core.MessageType.Error,
            showIcon: true
        });
        errorMessageStrip.addStyleClass("sapUiResponsiveMargin");

        const warningMessageStrip = new sap.m.MessageStrip("getUsersDeleteUserDialogWarningStrip", {
            type: sap.ui.core.MessageType.Warning,
            showIcon: true
        });
        warningMessageStrip.addStyleClass("sapUiResponsiveMargin");

        const deleteUserDialogYesButton = new sap.m.Button("getUsersDeleteUserDialogYesButton", {
            text: "Yes",
            type: sap.m.ButtonType.Success
        });
        deleteUserDialogYesButton.attachPress(() => {
            deleteUserDialog.setBusy(true);
            oController.deleteUser();
        });
        const deleteUserDialogNoButton = new sap.m.Button("getUsersDeleteUserDialogNoButton", {
            text: "No",
            type: sap.m.ButtonType.Negative
        });
        deleteUserDialogNoButton.attachPress(() => {
            const modelObj = thisView.getModel().getProperty("/obj");
            modelObj.setShouldNotFireAfterCloseDeleteDialog(true);
            deleteUserDialog.close();
        });
        const deleteUserDialogDismissButton = new sap.m.Button(
            "getUsersDeleteUserDialogDismissButton",
            { text: "Dismiss", type: sap.m.ButtonType.Emphasized }
        );
        deleteUserDialogDismissButton.attachPress(() => {
            deleteUserDialog.close();
        });

        const deleteUserDialogCheckbox = new sap.m.CheckBox("getUsersDeleteUserDialogCheckbox", {
            text: "Delete the user's home directory"
        });
        deleteUserDialogCheckbox.attachSelect((oEvent) => {
            oController.deleteUserDialogCheckboxChanged(oEvent);
        });

        deleteUserDialog.addContent(errorMessageStrip);
        deleteUserDialog.addContent(warningMessageStrip);
        deleteUserDialog.addContent(deleteUserDialogCheckbox);
        deleteUserDialog.addButton(deleteUserDialogYesButton);
        deleteUserDialog.addButton(deleteUserDialogNoButton);
        deleteUserDialog.addButton(deleteUserDialogDismissButton);

        oPage.addContent(deleteUserDialog);
    },

    showFatalErrorMessage: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const message = modelObj.getMessage();

        oController.globalById("getUsersDialogErrorStrip").setText(message);
        oController.globalById("getUsersErrorDialog").open();
    },

    showDeleteUserDialog: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const user = modelObj.getUser();
        const deleteUserDialog = oController.globalById("getUsersDeleteUserDialog");
        const errorMessageStrip = oController.globalById("getUsersDeleteUserDialogErrorStrip");
        const warningMessageStrip = oController.globalById("getUsersDeleteUserDialogWarningStrip");
        const deleteHomeCheckbox = oController.globalById("getUsersDeleteUserDialogCheckbox");
        const dismissButton = oController.globalById("getUsersDeleteUserDialogDismissButton");
        const yesButton = oController.globalById("getUsersDeleteUserDialogYesButton");
        const noButton = oController.globalById("getUsersDeleteUserDialogNoButton");

        dismissButton.setVisible(false);
        yesButton.setVisible(true);
        noButton.setVisible(true);
        errorMessageStrip.setVisible(false);
        warningMessageStrip.setVisible(true);

        deleteHomeCheckbox.setVisible(true);
        deleteHomeCheckbox.setSelected(false);

        deleteUserDialog.setTitle("Deleting User '" + user.username + "'");
        warningMessageStrip.setText(
            "Are you sure that you want to delete '" +
                user.username +
                "'?\n\nThis action cannot be undone."
        );

        deleteUserDialog.open();
    },

    showDeletionErrorMessage: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const serverContactErrorMessage = modelObj.getServerContactErrorMessage();
        const deleteUserDialog = oController.globalById("getUsersDeleteUserDialog");
        const errorMessageStrip = oController.globalById("getUsersDeleteUserDialogErrorStrip");
        const warningMessageStrip = oController.globalById("getUsersDeleteUserDialogWarningStrip");
        const deleteHomeCheckbox = oController.globalById("getUsersDeleteUserDialogCheckbox");
        const dismissButton = oController.globalById("getUsersDeleteUserDialogDismissButton");
        const yesButton = oController.globalById("getUsersDeleteUserDialogYesButton");
        const noButton = oController.globalById("getUsersDeleteUserDialogNoButton");

        warningMessageStrip.setVisible(false);
        dismissButton.setVisible(true);
        yesButton.setVisible(false);
        noButton.setVisible(false);

        deleteHomeCheckbox.setVisible(false);

        errorMessageStrip.setText(serverContactErrorMessage);
        errorMessageStrip.setVisible(true);

        deleteUserDialog.setTitle("User Deletion Failure");
    },

    loadPage: function () {
        const oController = this.getController();
        this.createUsersListingTable();
        oController.pageLoaded();
    },

    hideLoading: function () {
        const oController = this.getController();
        const ongoingTaskPage = this.getController().globalById(
            LOPT_PAGE_GET_USERS
        );
        if (oController.getApp().getBusy()) {
            oController.getApp().setBusy(false);
        }
        if (!ongoingTaskPage.getVisible()) {
            ongoingTaskPage.setVisible(true);
        }
    }
});
