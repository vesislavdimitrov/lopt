sap.ui.jsview(TASK_EXECUTOR_CLIENT_VIEW_TASK_EDITOR, {
    getControllerName: function () {
        return TASK_EXECUTOR_CLIENT_CONTROLLER_TASK_EDITOR;
    },

    createContent: function (oController) {
        const oPage = new sap.m.Page(TASK_EXECUTOR_CLIENT_PAGE_TASK_EDITOR, {
            showNavButton: true
        });
        oPage
            .setVisible(false)
            .setBusyIndicatorDelay(0)
            .attachNavButtonPress(() => {
                oController.navToPrevious();
            });
        this.createErrorDialog(oPage);
        return oPage;
    },

    createErrorDialog: function (oPage) {
        const oController = this.getController();
        const errorDialog = new sap.m.Dialog("taskEditorErrorDialog", {
            title: "An Error has Occurred",
            titleAlignment: sap.m.TitleAlignment.Center,
            type: sap.m.DialogType.Message
        });
        const errorMessageStrip = new sap.m.MessageStrip("taskEditorDialogErrorStrip", {
            type: sap.ui.core.MessageType.Error,
            showIcon: true
        });
        errorMessageStrip.addStyleClass("sapUiResponsiveMargin");
        const errorMessageDialogButton = new sap.m.Button("taskEditorErrorDialogButton", {
            text: "Continue to Launchpad",
            type: sap.m.ButtonType.Emphasized
        });
        errorMessageDialogButton.attachPress(() => {
            errorDialog.close();
            oController.navigateToLaunchpad();
        });
        const errorMessageReturnToPreviousDialogButton = new sap.m.Button(
            "taskEditorReturnToPreviousDialogButton",
            { text: "Return to Tasks Listing", type: sap.m.ButtonType.Emphasized }
        );
        errorMessageReturnToPreviousDialogButton.attachPress(() => {
            errorDialog.close();
            oController.returnToTasksListing();
        });
        const errorMessageDialogDismissButton = new sap.m.Button(
            "taskEditorErrorDialogDismissButton",
            { text: "Dismiss", type: sap.m.ButtonType.Emphasized }
        );
        errorMessageDialogDismissButton.attachPress(() => {
            errorDialog.close();
        });
        errorDialog.addContent(errorMessageStrip);
        errorDialog.addButton(errorMessageDialogButton);
        errorDialog.addButton(errorMessageDialogDismissButton);
        errorDialog.addButton(errorMessageReturnToPreviousDialogButton);
        oPage.addContent(errorDialog);
    },

    createForm: function (oPage) {
        const oBlockLayout = new sap.ui.layout.BlockLayout("taskEditorPageLayout", {
            background: sap.ui.layout.BlockBackgroundType.Dashboard
        });
        const blockLayoutRow = new sap.ui.layout.BlockLayoutRow();
        const blockLayoutCell = new sap.ui.layout.BlockLayoutCell({ title: "Task Details" });
        this.createSuccessMessageStrip(blockLayoutCell);
        this.fillFormBlockLayout(blockLayoutCell);
        blockLayoutRow.addContent(blockLayoutCell);
        oBlockLayout.addContent(blockLayoutRow);
        oPage.addContent(oBlockLayout);
    },

    fillFormBlockLayout: function (blockLayoutCell) {
        const wrappingFlexBox = new sap.m.FlexBox("taskEditorFormWrappingFlexBox", {
            alignItems: sap.m.FlexAlignItems.Center,
            direction: sap.m.FlexDirection.Column
        });

        this.createIdField(wrappingFlexBox);
        this.createCommandInput(wrappingFlexBox);
        this.createParametersInput(wrappingFlexBox);
        this.createDescriptionInput(wrappingFlexBox);
        this.createEnvironmentVariablesInput(wrappingFlexBox);
        this.createUsernameInput(wrappingFlexBox);
        this.createSubmitButton(wrappingFlexBox);

        blockLayoutCell.addContent(wrappingFlexBox);
    },

    createSuccessMessageStrip: function (blockLayoutCell) {
        const successStrip = new sap.m.MessageStrip("taskEditorSuccessMessageStrip", {
            showIcon: true,
            showCloseButton: true,
            type: sap.ui.core.MessageType.Success
        });
        successStrip.addStyleClass("sapUiMediumMarginBottom").setVisible(false);
        blockLayoutCell.addContent(successStrip);
    },

    createIdField: function (wrappingFlexBox) {
        const flexBoxIdInput = new sap.m.FlexBox("taskEditorIdField", {
            wrap: sap.m.FlexWrap.Wrap,
            alignItems: sap.m.FlexAlignItems.Start,
            direction: sap.m.FlexDirection.Column
        });
        const inputId = new sap.m.Input("taskEditorIdInput");
        inputId.addStyleClass("sapUiSmallMarginBottom").setWidth("295px").setEnabled(false);
        const inputIdLabel = new sap.m.Label({ text: "ID: " });
        flexBoxIdInput.addItem(inputIdLabel);
        flexBoxIdInput.addItem(inputId);
        flexBoxIdInput.setVisible(false);
        wrappingFlexBox.addItem(flexBoxIdInput);
    },

    createCommandInput: function (wrappingFlexBox) {
        const oController = this.getController();
        const flexBoxCommandInput = new sap.m.FlexBox({
            wrap: sap.m.FlexWrap.Wrap,
            alignItems: sap.m.FlexAlignItems.Start,
            direction: sap.m.FlexDirection.Column
        });
        const inputCommand = new sap.m.Input("taskEditorCommandInput");
        inputCommand
            .addStyleClass("sapUiSmallMarginBottom")
            .setWidth("295px")
            .setShowValueStateMessage(true)
            .setValueStateText("Required")
            .setRequired(true)
            .attachLiveChange((oEvent) => {
                oController.requiredFieldChanged(oEvent);
            });
        const inputCommandLabel = new sap.m.Label({
            text: "Command: ",
            labelFor: "taskEditorCommandInput"
        });
        flexBoxCommandInput.addItem(inputCommandLabel);
        flexBoxCommandInput.addItem(inputCommand);
        wrappingFlexBox.addItem(flexBoxCommandInput);
    },

    createCommandInput: function (wrappingFlexBox) {
        const oController = this.getController();
        const flexBoxCommandInput = new sap.m.FlexBox({
            wrap: sap.m.FlexWrap.Wrap,
            alignItems: sap.m.FlexAlignItems.Start,
            direction: sap.m.FlexDirection.Column
        });
        const inputCommand = new sap.m.Input("taskEditorCommandInput");
        inputCommand
            .addStyleClass("sapUiSmallMarginBottom")
            .setWidth("295px")
            .setShowValueStateMessage(true)
            .setValueStateText("Required")
            .setRequired(true)
            .attachLiveChange((oEvent) => {
                oController.requiredFieldChanged(oEvent);
            });
        const inputCommandLabel = new sap.m.Label({
            text: "Command: ",
            labelFor: "taskEditorCommandInput"
        });
        flexBoxCommandInput.addItem(inputCommandLabel);
        flexBoxCommandInput.addItem(inputCommand);
        wrappingFlexBox.addItem(flexBoxCommandInput);
    },

    createParametersInput: function (wrappingFlexBox) {
        const flexBoxParametersInput = new sap.m.FlexBox({
            wrap: sap.m.FlexWrap.Wrap,
            alignItems: sap.m.FlexAlignItems.Start,
            direction: sap.m.FlexDirection.Column
        });
        const inputParameters = new sap.m.Input("taskEditorParametersInput");
        inputParameters.addStyleClass("sapUiSmallMarginBottom").setWidth("295px");
        const inputParametersLabel = new sap.m.Label({
            text: "Command parameters: ",
            labelFor: "taskEditorParametersInput"
        });
        flexBoxParametersInput.addItem(inputParametersLabel);
        flexBoxParametersInput.addItem(inputParameters);
        wrappingFlexBox.addItem(flexBoxParametersInput);
    },

    createDescriptionInput: function (wrappingFlexBox) {
        const oController = this.getController();
        const flexBoxDescriptionInput = new sap.m.FlexBox({
            wrap: sap.m.FlexWrap.Wrap,
            alignItems: sap.m.FlexAlignItems.Start,
            direction: sap.m.FlexDirection.Column
        });
        const inputDescription = new sap.m.Input("taskEditorDescriptionInput");
        inputDescription
            .addStyleClass("sapUiSmallMarginBottom")
            .setWidth("295px")
            .setShowValueStateMessage(true)
            .setValueStateText("Required")
            .setRequired(true)
            .attachLiveChange((oEvent) => {
                oController.requiredFieldChanged(oEvent);
            });
        const inputDescriptionLabel = new sap.m.Label({
            text: "Task description: ",
            labelFor: "taskEditorDescriptionInput"
        });
        flexBoxDescriptionInput.addItem(inputDescriptionLabel);
        flexBoxDescriptionInput.addItem(inputDescription);
        wrappingFlexBox.addItem(flexBoxDescriptionInput);
    },

    createEnvironmentVariablesInput: function (wrappingFlexBox) {
        const thisView = this;
        const flexBoxEnvironmentVariablesInput = new sap.m.FlexBox(
            "taskEditorEnvironmentVariablesInput",
            {
                wrap: sap.m.FlexWrap.Wrap,
                alignItems: sap.m.FlexAlignItems.Start,
                direction: sap.m.FlexDirection.Column
            }
        );
        const inputEnvironmentVariablesLabel = new sap.m.Label({
            text: "Task's environment variables: "
        });
        inputEnvironmentVariablesLabel.setWidth("295px");
        const inputEnvironmentVariablesPlusButton = new sap.m.Button({ icon: "sap-icon://add" });
        inputEnvironmentVariablesPlusButton
            .addStyleClass("sapUiSmallMarginBottom")
            .attachPress(() => {
                thisView.createKeyValuePairInput(flexBoxEnvironmentVariablesInput);
            });
        flexBoxEnvironmentVariablesInput.addItem(inputEnvironmentVariablesLabel);
        flexBoxEnvironmentVariablesInput.addItem(inputEnvironmentVariablesPlusButton);
        wrappingFlexBox.addItem(flexBoxEnvironmentVariablesInput);
    },

    createKeyValuePairInput: function (flexBoxEnvironmentVariablesInput, keyToInput, valueToInput) {
        const oController = this.getController();
        const keyValuePairFlexBox = new sap.m.FlexBox({
            wrap: sap.m.FlexWrap.Wrap,
            alignItems: sap.m.FlexAlignItems.Center
        });
        const inputKeyLabel = new sap.m.Label({ text: "Key:", required: true });
        inputKeyLabel.addStyleClass("sapUiTinyMarginEnd");
        const inputKey = new sap.m.Input();
        inputKey
            .setWidth("90px")
            .setShowValueStateMessage(true)
            .setValueStateText("Invalid key")
            .setRequired(true)
            .attachLiveChange((oEvent) => {
                oController.requiredFieldChanged(oEvent);
            });
        if (keyToInput) {
            inputKey.setValue(keyToInput);
        }
        const inputValueLabel = new sap.m.Label({ text: "Value:", required: true });
        inputValueLabel.addStyleClass("sapUiTinyMarginEnd").addStyleClass("sapUiSmallMarginBegin");
        const inputValue = new sap.m.Input();
        inputValue
            .setWidth("90px")
            .addStyleClass("sapUiSmallMarginEnd")
            .setShowValueStateMessage(true)
            .setValueStateText("Invalid value")
            .setRequired(true)
            .attachLiveChange((oEvent) => {
                oController.requiredFieldChanged(oEvent);
            });
        if (valueToInput) {
            inputValue.setValue(valueToInput);
        }
        const removeKeyValuePair = new sap.m.Button({ icon: "sap-icon://less" });
        removeKeyValuePair.attachPress(() => {
            flexBoxEnvironmentVariablesInput.removeItem(keyValuePairFlexBox);
            keyValuePairFlexBox.destroy();
        });
        keyValuePairFlexBox.addItem(inputKeyLabel);
        keyValuePairFlexBox.addItem(inputKey);
        keyValuePairFlexBox.addItem(inputValueLabel);
        keyValuePairFlexBox.addItem(inputValue);
        keyValuePairFlexBox.addItem(removeKeyValuePair);
        flexBoxEnvironmentVariablesInput.insertItem(
            keyValuePairFlexBox,
            flexBoxEnvironmentVariablesInput.getItems().length - 1
        );
    },

    createUsernameInput: function (wrappingFlexBox) {
        const flexBoxUsernameInput = new sap.m.FlexBox({
            wrap: sap.m.FlexWrap.Wrap,
            alignItems: sap.m.FlexAlignItems.Start,
            direction: sap.m.FlexDirection.Column
        });
        const inputUsername = new sap.m.Input("taskEditorUsernameInput", {
            placeholder: "Leave empty for the user who ran the server"
        });
        inputUsername.addStyleClass("sapUiSmallMarginBottom").setWidth("295px");
        const inputUsernameLabel = new sap.m.Label({
            text: "Username of the user that will run the task: ",
            labelFor: "taskEditorUsernameInput"
        });
        flexBoxUsernameInput.addItem(inputUsernameLabel);
        flexBoxUsernameInput.addItem(inputUsername);
        wrappingFlexBox.addItem(flexBoxUsernameInput);
    },

    createSubmitButton: function (wrappingFlexBox) {
        const oController = this.getController();
        const submitButton = new sap.m.Button("taskEditorSubmitButton", {
            type: sap.m.ButtonType.Emphasized,
            text: "Submit"
        });
        submitButton
            .attachPress(() => {
                oController.submitTask();
            })
            .setBusyIndicatorDelay(0);
        wrappingFlexBox.addItem(submitButton);
    },

    applyModel: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const message = modelObj.getMessage();
        const isUpdateTaskPage = modelObj.getIsUpdateTaskPage();
        const taskId = modelObj.getId();

        const oSuccessStrip = oController.globalById("taskEditorSuccessMessageStrip");
        if (oSuccessStrip.getVisible()) {
            oSuccessStrip.setVisible(false);
        }

        if (message && isUpdateTaskPage) {
            this.showFatalErrorMessage(true);
        } else if (message) {
            this.showFatalErrorMessage();
        } else if (typeof taskId !== "undefined" && isUpdateTaskPage) {
            this.fillUpdateTaskForm();
        }
    },

    fillUpdateTaskForm: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const taskId = modelObj.getId();
        const command = modelObj.getCommand();
        const parameters = modelObj.getParameters();
        const description = modelObj.getDescription();
        const environmentVars = modelObj.getEnvironmentVars();
        const username = modelObj.getUsername();
        const taskEditorIdField = oController.globalById("taskEditorIdField");
        const taskEditorIdInput = oController.globalById("taskEditorIdInput");
        const taskEditorCommandInput = oController.globalById("taskEditorCommandInput");
        const taskEditorParametersInput = oController.globalById("taskEditorParametersInput");
        const taskEditorDescriptionInput = oController.globalById("taskEditorDescriptionInput");
        const taskEditorUsernameInput = oController.globalById("taskEditorUsernameInput");
        const taskEditorEnvironmentVariablesInput = oController.globalById(
            "taskEditorEnvironmentVariablesInput"
        );

        taskEditorIdField.setVisible(true);
        taskEditorIdInput.setValue(taskId);
        taskEditorCommandInput.setValue(command);
        if (parameters) {
            taskEditorParametersInput.setValue(parameters);
        }
        taskEditorDescriptionInput.setValue(description);
        if (username) {
            taskEditorUsernameInput.setValue(username);
        }
        if (Object.keys(environmentVars) != false) {
            for (const envVar in environmentVars) {
                this.createKeyValuePairInput(
                    taskEditorEnvironmentVariablesInput,
                    envVar,
                    environmentVars[envVar]
                );
            }
        }
    },

    showFatalErrorMessage: function (isUpdateTask = false) {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const message = modelObj.getMessage();

        oController.globalById("taskEditorDialogErrorStrip").setText(message);
        oController.globalById("taskEditorErrorDialogDismissButton").setVisible(false);
        oController.globalById("taskEditorErrorDialogButton").setVisible(!isUpdateTask);
        oController.globalById("taskEditorReturnToPreviousDialogButton").setVisible(isUpdateTask);
        oController.globalById("taskEditorErrorDialog").open();
    },

    showSubmitErrorMessage: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const submitErrorMessage = modelObj.getSubmitErrorMessage();

        oController.globalById("taskEditorDialogErrorStrip").setText(submitErrorMessage);
        oController.globalById("taskEditorErrorDialogDismissButton").setVisible(true);
        oController.globalById("taskEditorErrorDialogButton").setVisible(false);
        oController.globalById("taskEditorReturnToPreviousDialogButton").setVisible(false);
        oController.globalById("taskEditorErrorDialog").open();
    },

    showSuccessMessageAndCleanFields: function () {
        const oController = this.getController();
        const modelObj = this.getModel().getProperty("/obj");
        const taskId = modelObj.getId();
        const isUpdateTaskPage = modelObj.getIsUpdateTaskPage();

        const oSuccessStrip = oController.globalById("taskEditorSuccessMessageStrip");
        oSuccessStrip
            .setText("Task with ID " + taskId + " has been created successfully.")
            .setVisible(true);
        if (!isUpdateTaskPage) {
            const oFormWrappingFlexBox = oController.globalById("taskEditorFormWrappingFlexBox");
            oFormWrappingFlexBox.destroyItems();
            oFormWrappingFlexBox.removeAllItems();
            const oFormWrappingFlexBoxParent = oFormWrappingFlexBox.getParent();
            oFormWrappingFlexBoxParent.removeContent(oFormWrappingFlexBox);
            oFormWrappingFlexBox.destroy();
            this.fillFormBlockLayout(oFormWrappingFlexBoxParent);
        } else {
            oSuccessStrip.setText("Task with ID " + taskId + " has been updated successfully.");
        }
    },

    loadPage: function (pageType, taskId) {
        const oController = this.getController();
        const oPage = oController.globalById(TASK_EXECUTOR_CLIENT_PAGE_TASK_EDITOR);
        const taskEditorPageLayout = oController.globalById("taskEditorPageLayout");
        if (taskEditorPageLayout) {
            oPage.removeContent(taskEditorPageLayout);
            taskEditorPageLayout.destroy();
        }
        if (pageType == NAV_UPDATE_TASK) {
            oPage.setTitle("Update Task");
        } else {
            oPage.setTitle("Create Task");
        }
        this.createForm(oPage);
        oController.pageLoaded(taskId);
    },

    hideLoading: function () {
        const oController = this.getController();
        const ongoingTaskPage = this.getController().globalById(
            TASK_EXECUTOR_CLIENT_PAGE_TASK_EDITOR
        );
        if (oController.getApp().getBusy()) {
            oController.getApp().setBusy(false);
        }
        if (!ongoingTaskPage.getVisible()) {
            ongoingTaskPage.setVisible(true);
        }
    }
});
