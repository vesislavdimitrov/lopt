sap.ui.jsview(TASK_EXECUTOR_CLIENT_VIEW_GET_TASKS, {
    getControllerName: function () {
        return TASK_EXECUTOR_CLIENT_CONTROLLER_GET_TASKS;
    },

    createContent: function (oController) {
        const oPage = new sap.m.Page(TASK_EXECUTOR_CLIENT_PAGE_GET_TASKS, {
            title: TASK_EXECUTOR_CLIENT_PAGE_GET_TASKS_TITLE,
            showNavButton: true
        });
        oPage
            .setVisible(false)
            .setBusyIndicatorDelay(0)
            .attachNavButtonPress(() => {
                oController.navToPrevious();
            });
        this.createErrorDialog(oPage);
        this.createTaskExecutionDialog(oPage);
        this.createTaskDeletionDialog(oPage);
        return oPage;
    },

    createErrorDialog: function (oPage) {
        const oController = this.getController();
        const errorDialog = new sap.m.Dialog("getTasksErrorDialog", {
            title: "An Error has Occurred",
            titleAlignment: sap.m.TitleAlignment.Center,
            type: sap.m.DialogType.Message
        });
        const errorMessageStrip = new sap.m.MessageStrip("getTasksDialogErrorStrip", {
            type: sap.ui.core.MessageType.Error,
            showIcon: true
        });
        errorMessageStrip.addStyleClass("sapUiResponsiveMargin");
        const errorMessageDialogButton = new sap.m.Button("getTasksErrorDialogButton", {
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
        const oOldTable = oController.globalById("tasksListingTable");
        if (oOldTable) {
            oOldTable.destroyItems();
            oPage.removeContent(oOldTable);
            oOldTable.destroy();
        }
    },

    createTasksListingTable: function () {
        const oController = this.getController();
        const oPage = oController.globalById(TASK_EXECUTOR_CLIENT_PAGE_GET_TASKS);

        this.destroyOldTable(oPage);
        const oTable = new sap.m.Table("tasksListingTable");
        oTable.addStyleClass("sapUiResponsiveMargin").setWidth("auto");
        this.createTasksListingTableHeader(oTable);
        this.createTasksListingTableColumns(oTable);
        oPage.addContent(oTable);
    },

    createTasksListingTableHeader: function (oTable) {
        const oController = this.getController();
        const headerToolbar = new sap.m.Toolbar();
        const tasksListingLabel = new sap.m.Label("tasksListingTableHeading");
        const toolbarSpacer = new sap.m.ToolbarSpacer();
        const searchField = new sap.m.SearchField({ showSearchButton: false });
        searchField.setWidth("auto").attachLiveChange((oEvent) => {
            oController.onSearchTasksListing(oEvent);
        });
        headerToolbar.addContent(tasksListingLabel);
        headerToolbar.addContent(toolbarSpacer);
        headerToolbar.addContent(searchField);
        oTable.setHeaderToolbar(headerToolbar);
    },

    createTasksListingTableColumns: function (oTable) {
        const idColumn = new sap.m.Column({ vAlign: sap.ui.core.VerticalAlign.Middle });
        idColumn.setWidth("10%").setHeader(new sap.m.Text({ text: "ID" }));
        const descriptionColumn = new sap.m.Column({ vAlign: sap.ui.core.VerticalAlign.Middle });
        descriptionColumn.setWidth("45%").setHeader(new sap.m.Text({ text: "Description" }));
        const actionsColumn = new sap.m.Column({
            vAlign: sap.ui.core.VerticalAlign.Middle,
            hAlign: sap.ui.core.TextAlign.Center
        });
        actionsColumn.setWidth("45%").setHeader(new sap.m.Text({ text: "Actions" }));
        oTable.addColumn(idColumn);
        oTable.addColumn(descriptionColumn);
        oTable.addColumn(actionsColumn);
    },

    applyModel: function () {
        const modelObj = this.getModel().getProperty("/obj");
        const message = modelObj.getMessage();
        const tasks = modelObj.getTasks();

        if (message) {
            this.showFatalErrorMessage();
        } else if (tasks) {
            this.showTasksListing();
        }
    },

    showTasksListing: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const tasks = modelObj.getTasks();
        const oTable = oController.globalById("tasksListingTable");

        this.changeTasksCount(tasks.length);
        for (const task of tasks) {
            const row = new sap.m.ColumnListItem({ vAlign: sap.ui.core.VerticalAlign.Middle });
            row.setType(sap.m.ListType.Navigation)
                .attachPress(() => {
                    oController.navigateToTask(task.id);
                })
                .addCell(new sap.m.Text({ text: task.id }))
                .addCell(new sap.m.Text({ text: task.description }));
            this.createTaskListingButtons(row, task);
            oTable.addItem(row);
        }
    },

    changeTasksCount: function (count) {
        const oController = this.getController();
        oController.globalById("tasksListingTableHeading").setText("Tasks (" + count + ")");
    },

    createTaskListingButtons: function (row, task) {
        const thisView = this;
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const executeTaskButton = new sap.m.Button({
            icon: "sap-icon://media-play",
            text: "Execute Task"
        });
        executeTaskButton.addStyleClass("sapUiTinyMarginEnd").attachPress(() => {
            modelObj.setTask(task);
            thisView.showInitTaskExecution();
        });
        const updateTaskButton = new sap.m.Button({
            icon: "sap-icon://request",
            text: "Update Task",
            type: sap.m.ButtonType.Attention
        });
        updateTaskButton.addStyleClass("sapUiTinyMarginEnd").attachPress(() => {
            modelObj.setTask(task);
            oController.navigateToUpdateTask(task.id);
        });
        const deleteTaskButton = new sap.m.Button({
            icon: "sap-icon://delete",
            text: "Delete Task",
            type: sap.m.ButtonType.Reject
        });
        deleteTaskButton.addStyleClass("sapUiTinyMarginEnd").attachPress(() => {
            modelObj.setTask(task);
            thisView.showDeleteTaskDialog();
        });
        const taskActionsFlexBox = new sap.m.FlexBox({
            wrap: sap.m.FlexWrap.Wrap,
            justifyContent: sap.m.FlexJustifyContent.Center
        });
        taskActionsFlexBox.addItem(executeTaskButton);
        taskActionsFlexBox.addItem(updateTaskButton);
        taskActionsFlexBox.addItem(deleteTaskButton);
        row.addCell(taskActionsFlexBox);
    },

    createTaskExecutionDialog: function (oPage) {
        const oController = this.getController();
        const executeTaskDialog = new sap.m.Dialog("getTasksExecuteTaskDialog", {
            titleAlignment: sap.m.TitleAlignment.Center,
            type: sap.m.DialogType.Message
        });
        executeTaskDialog.setBusyIndicatorDelay(0);

        const errorMessageStrip = new sap.m.MessageStrip("getTasksExecuteTaskDialogErrorStrip", {
            type: sap.ui.core.MessageType.Error,
            showIcon: true
        });
        errorMessageStrip.addStyleClass("sapUiResponsiveMargin");

        const flexBoxPasswordInput = new sap.m.FlexBox(
            "getTasksExecuteTaskDialogPasswordInputWrapper",
            {
                wrap: sap.m.FlexWrap.Wrap,
                alignItems: sap.m.FlexAlignItems.Center,
                direction: sap.m.FlexDirection.Column
            }
        );
        const passwordInput = new sap.m.Input("getTasksExecuteTaskPasswordInput", {
            type: sap.m.InputType.Password
        });
        passwordInput
            .addStyleClass("sapUiSmallMarginBottom")
            .setShowValueStateMessage(true)
            .setValueStateText("Required")
            .setRequired(true)
            .setWidth("295px")
            .attachLiveChange((oEvent) => {
                oController.requiredFieldChanged(oEvent);
            });
        const passwordInputLabel = new sap.m.Label("getTasksExecuteTaskDialogPasswordPrompt", {
            labelFor: "getTasksExecuteTaskPasswordInput"
        });
        flexBoxPasswordInput.addItem(passwordInputLabel);
        flexBoxPasswordInput.addItem(passwordInput);

        const executeTaskDialogButton = new sap.m.Button("getTasksExecuteTaskDialogExecuteButton", {
            text: "Execute task",
            type: sap.m.ButtonType.Emphasized
        });
        executeTaskDialogButton.attachPress(() => {
            if (oController.validatePassword()) {
                executeTaskDialog.setBusy(true);
                oController.executeTask();
            }
        });
        const executeTaskDialogDismissButton = new sap.m.Button(
            "getTasksExecuteTaskDialogDismissButton",
            { text: "Dismiss", type: sap.m.ButtonType.Emphasized }
        );
        executeTaskDialogDismissButton.attachPress(() => {
            executeTaskDialog.close();
        });
        executeTaskDialog.addContent(errorMessageStrip);
        executeTaskDialog.addContent(flexBoxPasswordInput);
        executeTaskDialog.addButton(executeTaskDialogButton);
        executeTaskDialog.addButton(executeTaskDialogDismissButton);
        oPage.addContent(executeTaskDialog);
    },

    createTaskDeletionDialog: function (oPage) {
        const thisView = this;
        const oController = this.getController();
        const deleteTaskDialog = new sap.m.Dialog("getTasksDeleteTaskDialog", {
            titleAlignment: sap.m.TitleAlignment.Center,
            type: sap.m.DialogType.Message
        });
        deleteTaskDialog.setBusyIndicatorDelay(0).attachAfterClose(() => {
            const modelObj = thisView.getModel().getProperty("/obj");
            if (!modelObj.getShouldNotFireAfterCloseDeleteDialog()) {
                oController.refreshTasksListing();
            } else {
                modelObj.setShouldNotFireAfterCloseDeleteDialog(false);
            }
        });

        const errorMessageStrip = new sap.m.MessageStrip("getTasksDeleteTaskDialogErrorStrip", {
            type: sap.ui.core.MessageType.Error,
            showIcon: true
        });
        errorMessageStrip.addStyleClass("sapUiResponsiveMargin");

        const warningMessageStrip = new sap.m.MessageStrip("getTasksDeleteTaskDialogWarningStrip", {
            type: sap.ui.core.MessageType.Warning,
            showIcon: true
        });
        warningMessageStrip.addStyleClass("sapUiResponsiveMargin");

        const deleteTaskDialogYesButton = new sap.m.Button("getTasksDeleteTaskDialogYesButton", {
            text: "Yes",
            type: sap.m.ButtonType.Success
        });
        deleteTaskDialogYesButton.attachPress(() => {
            deleteTaskDialog.setBusy(true);
            oController.deleteTask();
        });
        const deleteTaskDialogNoButton = new sap.m.Button("getTasksDeleteTaskDialogNoButton", {
            text: "No",
            type: sap.m.ButtonType.Negative
        });
        deleteTaskDialogNoButton.attachPress(() => {
            const modelObj = thisView.getModel().getProperty("/obj");
            modelObj.setShouldNotFireAfterCloseDeleteDialog(true);
            deleteTaskDialog.close();
        });
        const deleteTaskDialogDismissButton = new sap.m.Button(
            "getTasksDeleteTaskDialogDismissButton",
            { text: "Dismiss", type: sap.m.ButtonType.Emphasized }
        );
        deleteTaskDialogDismissButton.attachPress(() => {
            deleteTaskDialog.close();
        });
        deleteTaskDialog.addContent(errorMessageStrip);
        deleteTaskDialog.addContent(warningMessageStrip);
        deleteTaskDialog.addButton(deleteTaskDialogYesButton);
        deleteTaskDialog.addButton(deleteTaskDialogNoButton);
        deleteTaskDialog.addButton(deleteTaskDialogDismissButton);

        oPage.addContent(deleteTaskDialog);
    },

    showFatalErrorMessage: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const message = modelObj.getMessage();

        oController.globalById("getTasksDialogErrorStrip").setText(message);
        oController.globalById("getTasksErrorDialog").open();
    },

    showInitTaskExecution: function () {
        const oController = this.getController();
        const oPage = oController.globalById(TASK_EXECUTOR_CLIENT_PAGE_GET_TASKS);
        const modelObj = this.getModel().getProperty("/obj");
        const task = modelObj.getTask();
        const executeTaskDialog = oController.globalById("getTasksExecuteTaskDialog");
        const errorMessageStrip = oController.globalById("getTasksExecuteTaskDialogErrorStrip");
        const passwordInputPrompt = oController.globalById(
            "getTasksExecuteTaskDialogPasswordPrompt"
        );
        const passwordInputWrapper = oController.globalById(
            "getTasksExecuteTaskDialogPasswordInputWrapper"
        );
        const passwordInput = oController.globalById("getTasksExecuteTaskPasswordInput");
        const executeTaskDialogButton = oController.globalById(
            "getTasksExecuteTaskDialogExecuteButton"
        );
        const dismissDialogButton = oController.globalById(
            "getTasksExecuteTaskDialogDismissButton"
        );
        if (!task.username) {
            oPage.setBusy(true);
            oController.executeTask();
        } else {
            executeTaskDialog.setTitle("Execute Task with ID " + task.id);
            passwordInputPrompt.setText("Password for user '" + task.username + "': ");
            passwordInput.setValue();
            errorMessageStrip.setVisible(false);
            passwordInputWrapper.setVisible(true);
            executeTaskDialogButton.setVisible(true);
            dismissDialogButton.setText("Close");
            executeTaskDialog.open();
        }
    },

    showExecutionErrorMessage: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const task = modelObj.getTask();
        const serverContactErrorMessage = modelObj.getServerContactErrorMessage();
        const executeTaskDialog = oController.globalById("getTasksExecuteTaskDialog");
        const errorMessageStrip = oController.globalById("getTasksExecuteTaskDialogErrorStrip");
        const passwordInputWrapper = oController.globalById(
            "getTasksExecuteTaskDialogPasswordInputWrapper"
        );
        const executeTaskDialogButton = oController.globalById(
            "getTasksExecuteTaskDialogExecuteButton"
        );
        const dismissDialogButton = oController.globalById(
            "getTasksExecuteTaskDialogDismissButton"
        );

        errorMessageStrip.setText(serverContactErrorMessage);
        errorMessageStrip.setVisible(true);

        if (!task.username) {
            executeTaskDialog.setTitle("Task Execution Failure");
            passwordInputWrapper.setVisible(false);
            executeTaskDialogButton.setVisible(false);
            dismissDialogButton.setText("Dismiss");
        } else {
            executeTaskDialog.setTitle("Execute Task with ID " + task.id);
            passwordInputWrapper.setVisible(true);
            executeTaskDialogButton.setVisible(true);
            dismissDialogButton.setText("Close");
        }

        executeTaskDialog.open();
    },

    showDeleteTaskDialog: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const task = modelObj.getTask();
        const deleteTaskDialog = oController.globalById("getTasksDeleteTaskDialog");
        const errorMessageStrip = oController.globalById("getTasksDeleteTaskDialogErrorStrip");
        const warningMessageStrip = oController.globalById("getTasksDeleteTaskDialogWarningStrip");
        const dismissButton = oController.globalById("getTasksDeleteTaskDialogDismissButton");
        const yesButton = oController.globalById("getTasksDeleteTaskDialogYesButton");
        const noButton = oController.globalById("getTasksDeleteTaskDialogNoButton");

        dismissButton.setVisible(false);
        yesButton.setVisible(true);
        noButton.setVisible(true);
        errorMessageStrip.setVisible(false);
        warningMessageStrip.setVisible(true);

        deleteTaskDialog.setTitle("Deleting Task with ID " + task.id);
        warningMessageStrip.setText(
            "Are you sure that you want to delete the task with ID " +
                task.id +
                ', "' +
                task.description +
                '"?\n\nThis action cannot be undone.'
        );

        deleteTaskDialog.open();
    },

    showDeletionErrorMessage: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const serverContactErrorMessage = modelObj.getServerContactErrorMessage();
        const deleteTaskDialog = oController.globalById("getTasksDeleteTaskDialog");
        const errorMessageStrip = oController.globalById("getTasksDeleteTaskDialogErrorStrip");
        const warningMessageStrip = oController.globalById("getTasksDeleteTaskDialogWarningStrip");
        const dismissButton = oController.globalById("getTasksDeleteTaskDialogDismissButton");
        const yesButton = oController.globalById("getTasksDeleteTaskDialogYesButton");
        const noButton = oController.globalById("getTasksDeleteTaskDialogNoButton");

        warningMessageStrip.setVisible(false);
        dismissButton.setVisible(true);
        yesButton.setVisible(false);
        noButton.setVisible(false);

        errorMessageStrip.setText(serverContactErrorMessage);
        errorMessageStrip.setVisible(true);

        deleteTaskDialog.setTitle("Task Deletion Failure");
    },

    loadPage: function () {
        const oController = this.getController();
        this.createTasksListingTable();
        oController.pageLoaded();
    },

    hideLoading: function () {
        const oController = this.getController();
        const ongoingTaskPage = this.getController().globalById(
            TASK_EXECUTOR_CLIENT_PAGE_GET_TASKS
        );
        if (oController.getApp().getBusy()) {
            oController.getApp().setBusy(false);
        }
        if (!ongoingTaskPage.getVisible()) {
            ongoingTaskPage.setVisible(true);
        }
    }
});
