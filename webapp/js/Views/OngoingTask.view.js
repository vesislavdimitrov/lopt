sap.ui.jsview(TASK_EXECUTOR_CLIENT_VIEW_ONGOING_TASK, {
    getControllerName: function () {
        return TASK_EXECUTOR_CLIENT_CONTROLLER_ONGOING_TASK;
    },

    createContent: function (oController) {},

    loadPage: function () {
        const oController = this.getController();
        this.destroyContent();
        this.removeContent();
        const oPage = new sap.m.Page(TASK_EXECUTOR_CLIENT_PAGE_ONGOING_TASK, {
            title: TASK_EXECUTOR_CLIENT_PAGE_ONGOING_TASK_TITLE
        });
        oPage.setVisible(false);
        const oBlockLayout = new sap.ui.layout.BlockLayout({
            background: sap.ui.layout.BlockBackgroundType.Dashboard
        });
        const blockLayoutRows = this.createBlockLayoutRows();
        for (const row of blockLayoutRows) {
            oBlockLayout.addContent(row);
        }

        oPage.addContent(oBlockLayout);
        this.addContent(oPage);
        oController.pageLoaded();
    },

    createBlockLayoutRows: function () {
        const blockLayoutRows = [
            new sap.ui.layout.BlockLayoutRow(),
            new sap.ui.layout.BlockLayoutRow()
        ];

        const blockLayoutRow0Cell0 = new sap.ui.layout.BlockLayoutCell();
        const ongoingTaskPageHeaderFlexBox = new sap.m.FlexBox("ongoingTaskPageHeader", {
            wrap: sap.m.FlexWrap.Wrap,
            alignItems: sap.m.FlexAlignItems.Center,
            justifyContent: sap.m.FlexJustifyContent.SpaceBetween
        });

        this.createTaskStatusFlexBox(ongoingTaskPageHeaderFlexBox);
        this.createTaskControlsFlexBox(ongoingTaskPageHeaderFlexBox);
        blockLayoutRow0Cell0.addContent(ongoingTaskPageHeaderFlexBox);
        blockLayoutRows[0].addContent(blockLayoutRow0Cell0);

        const blockLayoutRow1Cell0 = new sap.ui.layout.BlockLayoutCell("taskLogCell", {
            title: "Task log"
        });
        this.createOngoingTaskLogContainer(blockLayoutRow1Cell0);
        blockLayoutRows[1].addContent(blockLayoutRow1Cell0);
        return blockLayoutRows;
    },

    createTaskStatusFlexBox: function (ongoingTaskPageHeaderFlexBox) {
        const taskStatusFlexBox = new sap.m.FlexBox("taskStatus", { wrap: sap.m.FlexWrap.Wrap });
        const taskStatusTitle = new sap.m.Title({ text: "Task status:" });
        taskStatusTitle.addStyleClass("sapUiTinyMarginEnd");
        const taskStatusValue = new sap.m.Title("ongoingTaskStatus");
        taskStatusFlexBox.addItem(taskStatusTitle);
        taskStatusFlexBox.addItem(taskStatusValue);
        ongoingTaskPageHeaderFlexBox.addItem(taskStatusFlexBox);
    },

    createTaskControlsFlexBox: function (ongoingTaskPageHeaderFlexBox) {
        const oController = this.getController();
        const taskControlsFlexBox = new sap.m.FlexBox("taskControls", {
            wrap: sap.m.FlexWrap.Wrap
        });
        const resumeTaskButton = new sap.m.Button("resumeTask", {
            icon: "sap-icon://media-play",
            text: "Resume Task Execution",
            type: sap.m.ButtonType.Accept
        });
        resumeTaskButton.addStyleClass("sapUiTinyMarginEnd").attachPress(() => {
            oController.taskAction(RESUME_TASK_PATH);
        });
        const pauseTaskButton = new sap.m.Button("pauseTask", {
            icon: "sap-icon://media-pause",
            text: "Pause Task Execution",
            type: sap.m.ButtonType.Attention
        });
        pauseTaskButton.addStyleClass("sapUiTinyMarginEnd").attachPress(() => {
            oController.taskAction(PAUSE_TASK_PATH);
        });
        const stopTaskButton = new sap.m.Button("stopTask", {
            icon: "sap-icon://color-fill",
            text: "Stop Task Execution",
            type: sap.m.ButtonType.Reject
        });
        stopTaskButton.addStyleClass("sapUiTinyMarginEnd").attachPress(() => {
            oController.taskAction(STOP_TASK_PATH);
        });
        taskControlsFlexBox.addItem(resumeTaskButton);
        taskControlsFlexBox.addItem(pauseTaskButton);
        taskControlsFlexBox.addItem(stopTaskButton);
        ongoingTaskPageHeaderFlexBox.addItem(taskControlsFlexBox);
    },

    createOngoingTaskLogContainer: function (cell) {
        const ongoingTaskLogFormattedText = new sap.m.FormattedText("ongoingTaskLog");
        cell.addContent(ongoingTaskLogFormattedText);
    },

    hideLoading: function () {
        const oController = this.getController();
        const ongoingTaskPage = this.getController().globalById(
            TASK_EXECUTOR_CLIENT_PAGE_ONGOING_TASK
        );
        if (oController.getApp().getBusy()) {
            oController.getApp().setBusy(false);
        }
        if (!ongoingTaskPage.getVisible()) {
            ongoingTaskPage.setVisible(true);
        }
    },

    pushToLog: function (log) {
        const oController = this.getController();
        const ongoingTaskLogElement = oController.globalById("ongoingTaskLog");
        const currentlyDisplayedText = ongoingTaskLogElement
            .getHtmlText()
            .split("<br>")
            .filter((element) => element);
        const incomingLog = log.split("\n").filter((element) => element);
        if (incomingLog.length > currentlyDisplayedText.length) {
            if (currentlyDisplayedText.length) {
                incomingLog.splice(0, currentlyDisplayedText.length);
            }
            currentlyDisplayedText.push(...incomingLog);
            ongoingTaskLogElement.setHtmlText(currentlyDisplayedText.join("<br>"));
        }
    },

    applyModel: function () {
        const modelObj = this.getModel().getProperty("/obj");
        const runningTaskStatus = modelObj.getRunningTaskStatus();
        const log = modelObj.getLog();
        const exit_code = modelObj.getExitCode();
        if (runningTaskStatus) {
            this.applyRunningTaskStatusModel(runningTaskStatus);
        } else if (log && typeof exit_code == "number") {
            this.applyTaskReviewModel(log, exit_code);
        } else if (log) {
            this.pushToLog(log);
        }

        this.hideLoading();
    },

    applyRunningTaskStatusModel: function (runningTaskStatus) {
        const oController = this.getController();
        oController
            .globalById("ongoingTaskStatus")
            .setText(TASK_STATES[runningTaskStatus].statusText);
        switch (runningTaskStatus) {
            case "0":
                oController.globalById("resumeTask").setEnabled(false);
                oController.globalById("pauseTask").setEnabled(true);
                oController.globalById("stopTask").setEnabled(true);
                break;
            case "1":
                oController.globalById("resumeTask").setEnabled(true);
                oController.globalById("pauseTask").setEnabled(false);
                oController.globalById("stopTask").setEnabled(true);
                break;
        }
    },

    applyTaskReviewModel: function (log, exit_code) {
        const oController = this.getController();
        const ongoingTaskPageHeader = oController.globalById("ongoingTaskPageHeader");
        const taskControlsBox = oController.globalById("taskControls");
        this.pushToLog(log);

        let taskCompletionStatus = "Success";
        if (exit_code > 0) {
            taskCompletionStatus = "Error";
        }

        taskCompletionStatus += " (Exit code " + exit_code + ")";
        oController.globalById("ongoingTaskStatus").setText(taskCompletionStatus);

        if (taskControlsBox) {
            ongoingTaskPageHeader.removeItem(taskControlsBox);
            taskControlsBox.destroy();

            this.createRegexFilterInput(ongoingTaskPageHeader);
            this.createDownloadTaskLogButton(ongoingTaskPageHeader);
            this.createContinueToLaunchpadButton(ongoingTaskPageHeader);
        }
    },

    createRegexFilterInput: function (ongoingTaskPageHeader) {
        const oController = this.getController();
        const regexFilterInput = new sap.m.Input("regexFilterInput");
        regexFilterInput
            .setPlaceholder("Enter a regex to filter the log...")
            .setWidth("225px")
            .attachLiveChange((oEvent) => {
                oController.onRegexFilterChange(oEvent);
            });
        ongoingTaskPageHeader.addItem(regexFilterInput);
    },

    createDownloadTaskLogButton: function (ongoingTaskPageHeader) {
        const oController = this.getController();
        const downloadTaskLogButton = new sap.m.Button({ text: "Download task log" });
        downloadTaskLogButton.attachPress(() => {
            oController.onDownloadLogButtonClicked();
        });
        ongoingTaskPageHeader.addItem(downloadTaskLogButton);
    },

    createContinueToLaunchpadButton: function (ongoingTaskPageHeader) {
        const oController = this.getController();
        const continueToLaunchpadButton = new sap.m.Button({
            text: "Finish task log review",
            type: sap.m.ButtonType.Emphasized
        });
        continueToLaunchpadButton.attachPress(() => {
            oController.finishTaskLogReview();
        });
        ongoingTaskPageHeader.addItem(continueToLaunchpadButton);
    },

    changeRegexInputDesign: function (design) {
        const oController = this.getController();
        const oInput = oController.globalById("regexFilterInput");
        switch (design) {
            case "error":
                oInput
                    .setValueState(sap.ui.core.ValueState.Error)
                    .setShowValueStateMessage(true)
                    .setValueStateText("Invalid regex");
                break;
            case "warning":
                oInput
                    .setValueState(sap.ui.core.ValueState.Warning)
                    .setShowValueStateMessage(true)
                    .setValueStateText("No matches");
                break;
            case "success":
                oInput.setValueState(sap.ui.core.ValueState.Success);
                break;
            default:
                oInput.setValueState(sap.ui.core.ValueState.None);
                break;
        }
    },

    cleanUpDisplayLog: function () {
        const oController = this.getController();
        const ongoingTaskLogElement = oController.globalById("ongoingTaskLog");
        ongoingTaskLogElement.setHtmlText("");
    },

    logFiltered: function (log) {
        const oController = this.getController();
        const ongoingTaskLogElement = oController.globalById("ongoingTaskLog");
        this.changeTaskLogTitle(true);
        ongoingTaskLogElement.setHtmlText(log.join("<br>"));
    },

    changeTaskLogTitle: function (filtered = false) {
        const oController = this.getController();
        const oTaskLogCell = oController.globalById("taskLogCell");
        let taskLogTitle = "Task log";
        if (filtered) {
            taskLogTitle = "Filtered task log";
        }
        oTaskLogCell.setTitle(taskLogTitle);
    }
});
