sap.ui.define(["./BaseController"], function (BaseController) {
    "use strict";

    return BaseController.extend(LOPT_CONTROLLER_UPLOAD_SCRIPT, {
        selectedFile: null,

        setSelectedFile: function (file) {
            this.selectedFile = file;
        },

        pageLoaded: function () {
            this.getView().cleanUp();
            this.getView().hideLoading();
        },

        uploadFile: function (navToCreateTaskCallback) {
            const oFileUploader = this.globalById("fileUploader");
            const oFile = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];

            if (!oFile) {
                return;
            }

            const oFormData = new FormData();
            oFormData.append("script", oFile);
            const thisController = this;
            $.ajax({
                url: CONFIG.API_BASE_URL + UPLOAD_PATH,
                type: "POST",
                data: oFormData,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                success: function (response) {
                    thisController.globalById(LOPT_PAGE_UPLOAD_SCRIPT).setBusy(false);
                    thisController.getView().showSuccessMessageAndCleanFields();

                    if (navToCreateTaskCallback) {
                        navToCreateTaskCallback(oFile.name);
                    }
                },
                error: function (xhr, status, error) {
                    thisController.globalById(LOPT_PAGE_CREATE_USER).setBusy(false);
                    thisController.getView().showErrorMessageAndCleanFields();
                }
            });
        }
    });
});
