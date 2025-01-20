sap.ui.jsview(TASK_EXECUTOR_CLIENT_VIEW_UPLOAD_SCRIPT, {
    getControllerName: function () {
        return TASK_EXECUTOR_CLIENT_CONTROLLER_UPLOAD_SCRIPT;
    },

    createContent: function (oController) {
        const oPage = this.createPage(oController);
        this.createBlockLayout(oPage, oController);
        return oPage;
    },

    createPage: function (oController) {
        const oPage = new sap.m.Page(TASK_EXECUTOR_CLIENT_PAGE_UPLOAD_SCRIPT, {
            title: TASK_EXECUTOR_CLIENT_PAGE_UPLOAD_SCRIPT_TITLE,
            showNavButton: true
        });

        oPage.setVisible(false)
            .setBusyIndicatorDelay(0)
            .attachNavButtonPress(() => {
                oController.navToPrevious();
            });
        return oPage;
    },

    createBlockLayout: function (oPage, oController) {
        const oBlockLayout = this.createBlockLayoutElement();
        const blockLayoutRow = new sap.ui.layout.BlockLayoutRow();
        const blockLayoutCell = new sap.ui.layout.BlockLayoutCell({
            title: "Select a script to upload from the local device"
        });

        this.createSuccessMessageStrip(blockLayoutCell);
        this.createFailureMessageStrip(blockLayoutCell);
        this.createFileUploader(blockLayoutCell, oController);

        blockLayoutRow.addContent(blockLayoutCell);
        oBlockLayout.addContent(blockLayoutRow);
        oPage.addContent(oBlockLayout);
    },

    createBlockLayoutElement: function () {
        return new sap.ui.layout.BlockLayout("uploadScriptPageLayout", {
            background: sap.ui.layout.BlockBackgroundType.Dashboard
        });
    },

    createSuccessMessageStrip: function (blockLayoutCell) {
        const oSuccessStrip = new sap.m.MessageStrip("uploadScriptSuccessMessageStrip", {
            showIcon: true,
            showCloseButton: true,
            type: sap.ui.core.MessageType.Success,
            visible: false
        }).addStyleClass("sapUiMediumMarginBottom");

        blockLayoutCell.addContent(oSuccessStrip);
    },

    createFailureMessageStrip: function (blockLayoutCell) {
        const oFailureStrip = new sap.m.MessageStrip("uploadScriptFailureMessageStrip", {
            showIcon: true,
            showCloseButton: true,
            type: sap.ui.core.MessageType.Error,
            visible: false
        }).addStyleClass("sapUiMediumMarginBottom");

        blockLayoutCell.addContent(oFailureStrip);
    },

    createFileUploader: function (blockLayoutCell, oController) {
        const wrappingFlexBox = this.createWrappingFlexBox();
        const oUploader = this.createFileUploaderElement(oController);
        const oSubmitAsTaskButton = this.createSubmitAsTaskButton(oController);
        const oSubmitButton = this.createSubmitButton(oController);

        wrappingFlexBox.addItem(oUploader);
        wrappingFlexBox.addItem(oSubmitAsTaskButton);
        wrappingFlexBox.addItem(oSubmitButton);
        blockLayoutCell.addContent(wrappingFlexBox);
    },

    createWrappingFlexBox: function () {
        return new sap.m.FlexBox({
            alignItems: sap.m.FlexAlignItems.Center,
            direction: sap.m.FlexDirection.Column,
            justifyContent: sap.m.FlexAlignItems.Start
        });
    },

    createFileUploaderElement: function (oController) {
        const oFileUploader =  new sap.ui.unified.FileUploader({
            id: 'fileUploader',
            buttonOnly: false,
            placeholder: "Choose a shell script to upload...",
            fileType: ['sh'],
            uploadOnChange: false,
            maximumFileSize: 10, //mb
            change: function (oEvent) {
                const fileName = oEvent.getParameter("newValue");
                sap.m.MessageToast.show(`File selected: ${fileName}`);
                const file = oEvent.getParameter("files")[0];
                oController.setSelectedFile(file);
            }
        });
        oFileUploader.addStyleClass("sapUiMediumMarginTop");
        return oFileUploader;
    },

    createSubmitButton: function (oController) {
        const oSubmitButton = new sap.m.Button({
            text: "Upload",
            press: function () {
                oController.uploadFile();
            }
        });
        return oSubmitButton;
    },

    createSubmitAsTaskButton: function (oController) {
        const thisView = this;
        const oSubmitButton = new sap.m.Button({
            text: "Upload and Create task",
            type: sap.m.ButtonType.Emphasized,
            press: function () {
                oController.uploadFile(function(fileName) {
                    oController.navTo(NAV_CREATE_TASK);
                    thisView
                        .getController()
                        .globalById("taskEditorCommandInput")
                        // should be exported by server
                        .setValue(`$\{${WORKSPACE_ENV_VAR_KEY}\}/${fileName}`);
                    thisView
                        .getController()
                        .globalById("taskEditorCommandInput")
                        .setEnabled(false);
                });
            }
        });
        oSubmitButton.addStyleClass("sapUiMediumMarginTop");
        return oSubmitButton;
    },

    showSuccessMessageAndCleanFields: function () {
        this.getController().globalById("uploadScriptFailureMessageStrip").setVisible(false);
        const oSuccessStrip = this.getController().globalById("uploadScriptSuccessMessageStrip");
        oSuccessStrip.setText("File has been uploaded successfully.").setVisible(true);
        const oFileUploader = this.getController().globalById("fileUploader");
        oFileUploader.clear();
    },

    showErrorMessageAndCleanFields : function () {
        this.getController().globalById("uploadScriptSuccessMessageStrip").setVisible(false);
        const oFailureStrip = this.getController().globalById("uploadScriptFailureMessageStrip");
        oFailureStrip.setText("There was an error when trying to upload the file.").setVisible(true);
        const oFileUploader = this.getController().globalById("fileUploader");
        oFileUploader.clear();
    },

    loadPage: function () {
        const oController = this.getController();
        oController.pageLoaded();
    },

    cleanUp: function () {
        this.getController().globalById("uploadScriptSuccessMessageStrip").setVisible(false);
        this.getController().globalById("uploadScriptFailureMessageStrip").setVisible(false);
        this.getController().globalById("fileUploader").clear();
    },

    hideLoading: function () {
        const oController = this.getController();
        const ongoingTaskPage = oController.globalById(TASK_EXECUTOR_CLIENT_PAGE_UPLOAD_SCRIPT);
        if (oController.getApp().getBusy()) {
            oController.getApp().setBusy(false);
        }
        if (!ongoingTaskPage.getVisible()) {
            ongoingTaskPage.setVisible(true);
        }
    }
});
