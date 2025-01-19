sap.ui.jsview(TASK_EXECUTOR_CLIENT_VIEW_TASK_DETAILS, {
    getControllerName: function () {
        return TASK_EXECUTOR_CLIENT_CONTROLLER_TASK_DETAILS;
    },

    createContent: function (oController) {
        const oPage = new sap.m.Page(TASK_EXECUTOR_CLIENT_PAGE_TASK_DETAILS, {
            title: TASK_EXECUTOR_CLIENT_PAGE_TASK_DETAILS_TITLE,
            showNavButton: true
        });
        oPage
            .setVisible(false)
            .setBusyIndicatorDelay(0)
            .attachNavButtonPress(() => {
                oController.navToPrevious();
            });
        this.createErrorDialog(oPage);
        this.createTaskDetailsPageLayout(oPage);
        this.createTaskExecutionDialog(oPage);
        this.createTaskDeletionDialog(oPage);
        return oPage;
    },

    createTaskDetailsPageLayout: function (oPage) {
        const objHeader = new sap.m.ObjectHeader("taskDetailsPageObjectHeader", {
            backgroundDesign: sap.m.BackgroundDesign.Translucent,
            numberUnit: "Task ID"
        });
        const iconTabBar = new sap.m.IconTabBar("taskDetailsPageIconTabBar");
        iconTabBar.addStyleClass("sapUiNoContentPadding");
        const taskDetailsFilter = new sap.m.IconTabFilter("taskDetailsFilter", {
            icon: "sap-icon://activity-items"
        });
        taskDetailsFilter.setKey("taskDetails");
        const taskActionsFilter = new sap.m.IconTabFilter("taskActionsFilter", {
            icon: "sap-icon://action"
        });
        taskActionsFilter.setKey("taskActions");
        this.createTaskActionButtons(taskActionsFilter);
        iconTabBar.addItem(taskDetailsFilter);
        iconTabBar.addItem(taskActionsFilter);
        oPage.addContent(objHeader);
        oPage.addContent(iconTabBar);
    },

    createTaskActionButtons: function (taskDetailsFilter) {
        const thisView = this;
        const oController = this.getController();
        const executeTaskButton = new sap.m.Button({
            icon: "sap-icon://media-play",
            text: "Execute Task"
        });
        executeTaskButton.addStyleClass("sapUiTinyMarginEnd").attachPress(() => {
            thisView.showInitTaskExecution();
        });
        const updateTaskButton = new sap.m.Button({
            icon: "sap-icon://request",
            text: "Update Task",
            type: sap.m.ButtonType.Attention
        });
        updateTaskButton.addStyleClass("sapUiTinyMarginEnd").attachPress(() => {
            const modelObj = this.getModel().getProperty("/obj");
            const taskId = modelObj.getId();
            oController.navigateToUpdateTask(taskId);
        });
        const deleteTaskButton = new sap.m.Button({
            icon: "sap-icon://delete",
            text: "Delete Task",
            type: sap.m.ButtonType.Reject
        });
        deleteTaskButton.addStyleClass("sapUiTinyMarginEnd").attachPress(() => {
            thisView.showDeleteTaskDialog();
        });

        const taskActionsFlexBox = new sap.m.FlexBox({
            wrap: sap.m.FlexWrap.Wrap,
            justifyContent: sap.m.FlexJustifyContent.Center
        });
        taskActionsFlexBox.addStyleClass("sapUiMediumMarginTopBottom");
        taskActionsFlexBox.addItem(executeTaskButton);
        taskActionsFlexBox.addItem(updateTaskButton);
        taskActionsFlexBox.addItem(deleteTaskButton);
        taskDetailsFilter.addContent(taskActionsFlexBox);
    },

    createErrorDialog: function (oPage) {
        const oController = this.getController();
        const errorDialog = new sap.m.Dialog("taskDetailsErrorDialog", {
            title: "An Error has Occurred",
            titleAlignment: sap.m.TitleAlignment.Center,
            type: sap.m.DialogType.Message
        });
        const errorMessageStrip = new sap.m.MessageStrip("taskDetailsDialogErrorStrip", {
            type: sap.ui.core.MessageType.Error,
            showIcon: true
        });
        errorMessageStrip.addStyleClass("sapUiResponsiveMargin");
        const errorMessageDialogButton = new sap.m.Button("taskDetailsErrorDialogButton", {
            text: "Return to Tasks Listing",
            type: sap.m.ButtonType.Emphasized
        });
        errorMessageDialogButton.attachPress(() => {
            errorDialog.close();
            oController.returnToTasksListing();
        });
        errorDialog.addContent(errorMessageStrip);
        errorDialog.addButton(errorMessageDialogButton);
        oPage.addContent(errorDialog);
    },

    createTaskExecutionDialog: function (oPage) {
        const oController = this.getController();
        const executeTaskDialog = new sap.m.Dialog("taskDetailsExecuteTaskDialog", {
            titleAlignment: sap.m.TitleAlignment.Center,
            type: sap.m.DialogType.Message
        });
        executeTaskDialog.setBusyIndicatorDelay(0);

        const errorMessageStrip = new sap.m.MessageStrip("taskDetailsExecuteTaskDialogErrorStrip", {
            type: sap.ui.core.MessageType.Error,
            showIcon: true
        });
        errorMessageStrip.addStyleClass("sapUiResponsiveMargin");

        const flexBoxPasswordInput = new sap.m.FlexBox(
            "taskDetailsExecuteTaskDialogPasswordInputWrapper",
            {
                wrap: sap.m.FlexWrap.Wrap,
                alignItems: sap.m.FlexAlignItems.Center,
                direction: sap.m.FlexDirection.Column
            }
        );
        const passwordInput = new sap.m.Input("taskDetailsExecuteTaskPasswordInput", {
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
        const passwordInputLabel = new sap.m.Label("taskDetailsExecuteTaskDialogPasswordPrompt", {
            labelFor: "taskDetailsExecuteTaskPasswordInput"
        });
        flexBoxPasswordInput.addItem(passwordInputLabel);
        flexBoxPasswordInput.addItem(passwordInput);

        const executeTaskDialogButton = new sap.m.Button(
            "taskDetailsExecuteTaskDialogExecuteButton",
            { text: "Execute task", type: sap.m.ButtonType.Emphasized }
        );
        executeTaskDialogButton.attachPress(() => {
            if (oController.validatePassword()) {
                executeTaskDialog.setBusy(true);
                oController.executeTask();
            }
        });
        const executeTaskDialogDismissButton = new sap.m.Button(
            "taskDetailsExecuteTaskDialogDismissButton",
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
        const deleteTaskDialog = new sap.m.Dialog("taskDetailsDeleteTaskDialog", {
            titleAlignment: sap.m.TitleAlignment.Center,
            type: sap.m.DialogType.Message
        });
        deleteTaskDialog.setBusyIndicatorDelay(0);

        const errorMessageStrip = new sap.m.MessageStrip("taskDetailsDeleteTaskDialogErrorStrip", {
            type: sap.ui.core.MessageType.Error,
            showIcon: true
        });
        errorMessageStrip.addStyleClass("sapUiResponsiveMargin");

        const warningMessageStrip = new sap.m.MessageStrip(
            "taskDetailsDeleteTaskDialogWarningStrip",
            { type: sap.ui.core.MessageType.Warning, showIcon: true }
        );
        warningMessageStrip.addStyleClass("sapUiResponsiveMargin");

        const deleteTaskDialogYesButton = new sap.m.Button("taskDetailsDeleteTaskDialogYesButton", {
            text: "Yes",
            type: sap.m.ButtonType.Success
        });
        deleteTaskDialogYesButton.attachPress(() => {
            deleteTaskDialog.setBusy(true);
            oController.deleteTask();
        });
        const deleteTaskDialogNoButton = new sap.m.Button("taskDetailsDeleteTaskDialogNoButton", {
            text: "No",
            type: sap.m.ButtonType.Negative
        });
        deleteTaskDialogNoButton.attachPress(() => {
            deleteTaskDialog.close();
        });
        const deleteTaskDialogDismissButton = new sap.m.Button(
            "taskDetailsDeleteTaskDialogDismissButton",
            { text: "Return to Tasks Listing", type: sap.m.ButtonType.Emphasized }
        );
        deleteTaskDialogDismissButton.attachPress(() => {
            deleteTaskDialog.close();
            oController.returnToTasksListing();
        });
        deleteTaskDialog.addContent(errorMessageStrip);
        deleteTaskDialog.addContent(warningMessageStrip);
        deleteTaskDialog.addButton(deleteTaskDialogYesButton);
        deleteTaskDialog.addButton(deleteTaskDialogNoButton);
        deleteTaskDialog.addButton(deleteTaskDialogDismissButton);

        oPage.addContent(deleteTaskDialog);
    },

    resetPageContent: function () {
        const oController = this.getController();
        const objHeader = oController.globalById("taskDetailsPageObjectHeader");
        const taskDetailsFilter = oController.globalById("taskDetailsFilter");
        const iconTabBar = oController.globalById("taskDetailsPageIconTabBar");
        const taskDetailsObjects = taskDetailsFilter.getContent();

        objHeader.setVisible(false);

        for (const item of taskDetailsObjects) {
            taskDetailsFilter.removeContent(item);
            item.destroy();
        }

        iconTabBar.setSelectedKey("taskDetails").setVisible(false);
    },

    applyModel: function () {
        const modelObj = this.getModel().getProperty("/obj");
        const message = modelObj.getMessage();
        const taskId = modelObj.getId();

        this.resetPageContent();

        if (message) {
            this.showFatalErrorMessage();
        } else if (typeof taskId !== "undefined") {
            this.showTaskDetails();
        }
    },

    showTaskDetails: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");

        const objHeader = oController.globalById("taskDetailsPageObjectHeader");
        objHeader.setTitle(modelObj.getDescription()).setNumber(modelObj.getId()).setVisible(true);

        const iconTabBar = oController.globalById("taskDetailsPageIconTabBar");
        iconTabBar.setVisible(true);

        const taskDetailsFilter = oController.globalById("taskDetailsFilter");
        this.addTaskDetailsForm(taskDetailsFilter);
    },

    addTaskDetailsForm: function (taskDetailsFilter) {
        const modelObj = this.getModel().getProperty("/obj");
        const envVars = modelObj.getEnvironmentVars();
        const form = new sap.ui.layout.form.SimpleForm({
            layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout
        });
        const contentToPush = [];

        contentToPush.push(
            ...[
                new sap.m.Label({ text: "Command" }),
                new sap.m.Text({ text: modelObj.getCommand() })
            ]
        );
        contentToPush.push(
            ...[
                new sap.m.Label({ text: "Command parameters" }),
                new sap.m.Text({ text: modelObj.getParameters() })
            ]
        );

        if (Object.keys(envVars) != false) {
            for (const envVar in envVars) {
                contentToPush.push(
                    ...[
                        new sap.m.Label({ text: "Environment variable " + envVar }),
                        new sap.m.Text({ text: envVars[envVar] })
                    ]
                );
            }
        }

        contentToPush.push(
            ...[
                new sap.m.Label({ text: "User that will run the task" }),
                new sap.m.Text({ text: modelObj.getUsername() })
            ]
        );

        for (const content of contentToPush) {
            form.addContent(content);
        }

        taskDetailsFilter.addContent(form);
    },

    showFatalErrorMessage: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const message = modelObj.getMessage();

        oController.globalById("taskDetailsDialogErrorStrip").setText(message);
        oController.globalById("taskDetailsErrorDialog").open();
    },

    showInitTaskExecution: function () {
        const oController = this.getController();
        const oPage = oController.globalById(TASK_EXECUTOR_CLIENT_PAGE_TASK_DETAILS);
        const modelObj = this.getModel().getProperty("/obj");
        const taskUsername = modelObj.getUsername();
        const executeTaskDialog = oController.globalById("taskDetailsExecuteTaskDialog");
        const errorMessageStrip = oController.globalById("taskDetailsExecuteTaskDialogErrorStrip");
        const passwordInputPrompt = oController.globalById(
            "taskDetailsExecuteTaskDialogPasswordPrompt"
        );
        const passwordInputWrapper = oController.globalById(
            "taskDetailsExecuteTaskDialogPasswordInputWrapper"
        );
        const passwordInput = oController.globalById("taskDetailsExecuteTaskPasswordInput");
        const executeTaskDialogButton = oController.globalById(
            "taskDetailsExecuteTaskDialogExecuteButton"
        );
        const dismissDialogButton = oController.globalById(
            "taskDetailsExecuteTaskDialogDismissButton"
        );

        if (!taskUsername) {
            oPage.setBusy(true);
            oController.executeTask();
            return;
        } 
        executeTaskDialog.setTitle("Execute Task");
        passwordInputPrompt.setText("Password for user '" + taskUsername + "': ");
        passwordInput.setValue();
        errorMessageStrip.setVisible(false);
        passwordInputWrapper.setVisible(true);
        executeTaskDialogButton.setVisible(true);
        dismissDialogButton.setText("Close");
        executeTaskDialog.open();
        
    },

    showExecutionErrorMessage: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const taskUsername = modelObj.getUsername();
        const submitErrorMessage = modelObj.getSubmitErrorMessage();
        const executeTaskDialog = oController.globalById("taskDetailsExecuteTaskDialog");
        const errorMessageStrip = oController.globalById("taskDetailsExecuteTaskDialogErrorStrip");
        const passwordInputPrompt = oController.globalById(
            "taskDetailsExecuteTaskDialogPasswordPrompt"
        );
        const passwordInputWrapper = oController.globalById(
            "taskDetailsExecuteTaskDialogPasswordInputWrapper"
        );
        const executeTaskDialogButton = oController.globalById(
            "taskDetailsExecuteTaskDialogExecuteButton"
        );
        const dismissDialogButton = oController.globalById(
            "taskDetailsExecuteTaskDialogDismissButton"
        );

        errorMessageStrip.setText(submitErrorMessage);
        errorMessageStrip.setVisible(true);

        if (!taskUsername) {
            executeTaskDialog.setTitle("Task Execution Failure");
            passwordInputWrapper.setVisible(false);
            executeTaskDialogButton.setVisible(false);
            dismissDialogButton.setText("Dismiss");
        } else {
            executeTaskDialog.setTitle("Execute Task");
            passwordInputWrapper.setVisible(true);
            executeTaskDialogButton.setVisible(true);
            dismissDialogButton.setText("Close");
        }

        executeTaskDialog.open();
    },

    showDeleteTaskDialog: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const deleteTaskDialog = oController.globalById("taskDetailsDeleteTaskDialog");
        const errorMessageStrip = oController.globalById("taskDetailsDeleteTaskDialogErrorStrip");
        const warningMessageStrip = oController.globalById(
            "taskDetailsDeleteTaskDialogWarningStrip"
        );
        const dismissButton = oController.globalById("taskDetailsDeleteTaskDialogDismissButton");
        const yesButton = oController.globalById("taskDetailsDeleteTaskDialogYesButton");
        const noButton = oController.globalById("taskDetailsDeleteTaskDialogNoButton");

        dismissButton.setVisible(false);
        yesButton.setVisible(true);
        noButton.setVisible(true);
        errorMessageStrip.setVisible(false);
        warningMessageStrip.setVisible(true);

        deleteTaskDialog.setTitle("Deleting This Task");
        warningMessageStrip.setText(
            "Are you sure that you want to delete this task?\n\nThis action cannot be undone."
        );

        deleteTaskDialog.open();
    },

    showDeletionErrorMessage: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const submitErrorMessage = modelObj.getSubmitErrorMessage();
        const deleteTaskDialog = oController.globalById("taskDetailsDeleteTaskDialog");
        const errorMessageStrip = oController.globalById("taskDetailsDeleteTaskDialogErrorStrip");
        const warningMessageStrip = oController.globalById(
            "taskDetailsDeleteTaskDialogWarningStrip"
        );
        const dismissButton = oController.globalById("taskDetailsDeleteTaskDialogDismissButton");
        const yesButton = oController.globalById("taskDetailsDeleteTaskDialogYesButton");
        const noButton = oController.globalById("taskDetailsDeleteTaskDialogNoButton");

        warningMessageStrip.setVisible(false);
        dismissButton.setVisible(true);
        yesButton.setVisible(false);
        noButton.setVisible(false);

        errorMessageStrip.setText(submitErrorMessage);
        errorMessageStrip.setVisible(true);

        deleteTaskDialog.setTitle("Task Deletion Failure");

        deleteTaskDialog.open();
    },

    loadPage: function (taskId) {
        const oController = this.getController();
        oController.pageLoaded(taskId);
    },

    hideLoading: function () {
        const oController = this.getController();
        const ongoingTaskPage = this.getController().globalById(
            TASK_EXECUTOR_CLIENT_PAGE_TASK_DETAILS
        );
        if (oController.getApp().getBusy()) {
            oController.getApp().setBusy(false);
        }
        if (!ongoingTaskPage.getVisible()) {
            ongoingTaskPage.setVisible(true);
        }
    }
});
