sap.ui.define(["./BaseController"], function (BaseController) {
    "use strict";

    return BaseController.extend(LOPT_CONTROLLER_CREATE_USER, {
        pageLoaded: function () {
            this.checkRestApiAvailability();
        },

        saveModel: function () {
            const modelObj = this.getView().getModel().getProperty("/obj");
            modelObj.setUsername(this.globalById("createUserUsernameInput").getValue());
            modelObj.setPassword(this.globalById("createUserPasswordInput").getValue());
            modelObj.setUid(this.globalById("createUserUidInput").getValue());
        },

        submitUser: function () {
            this.saveModel();
            const validationSuccessful = this.validateUser();
            if (validationSuccessful) {
                this.globalById(LOPT_PAGE_CREATE_USER).setBusy(true);
                this.sendUser();
                return;
            }
        },

        sendUser: function () {
            const thisController = this;
            const modelObj = this.getView().getModel().getProperty("/obj");
            const userToSend = modelObj.getUser();
            $.ajax({
                type: "POST",
                headers: { "Authorization": BASIC_AUTH_PREFIX + jQuery.sap.storage.get('token') },
                url: CONFIG.API_BASE_URL + USERS_PATH,
                data: JSON.stringify(userToSend),
                success: function (result) {
                    thisController.globalById(LOPT_PAGE_CREATE_USER).setBusy(false);
                    thisController.getView().showSuccessMessageAndCleanFields();
                },
                error: function (xhr, status, error) {
                    thisController.globalById(LOPT_PAGE_CREATE_USER).setBusy(false);
                    if (xhr.readyState != 4 || xhr.status != 400) {
                        thisController.serverNotAvailable(
                            "the server has returned an unexpected response or might be down"
                        );
                    } else {
                        const result = JSON.parse(xhr.responseText);
                        const obj = {
                            submitErrorMessage: result.message
                        };
                        thisController.passModel(new UserObjectModel(obj));
                    }
                }
            });
        },

        validateUser: function () {
            const modelObj = this.getView().getModel().getProperty("/obj");
            const usernameInput = this.globalById("createUserUsernameInput");
            const passwordInput = this.globalById("createUserPasswordInput");
            const uidInput = this.globalById("createUserUidInput");

            let validationSuccessful = true;

            if (!modelObj.validateUsername()) {
                usernameInput.setValueState(sap.ui.core.ValueState.Error);
                validationSuccessful = false;
            }

            if (!modelObj.validatePassword()) {
                passwordInput.setValueState(sap.ui.core.ValueState.Error);
                validationSuccessful = false;
            }

            if (!modelObj.validateUid()) {
                uidInput.setValueState(sap.ui.core.ValueState.Error);
                validationSuccessful = false;
            }

            return validationSuccessful;
        },

        checkRestApiAvailability: function () {
            const thisController = this;
            $.ajax({
                type: "GET",
                headers: { "Authorization": BASIC_AUTH_PREFIX + jQuery.sap.storage.get('token') },
                url: CONFIG.API_BASE_URL + "/",
                success: function (result) {
                    if (result.message != "Lopt is available") {
                        thisController.serverNotAvailable(
                            "the server has returned an unexpected response"
                        );
                        return;
                    }
                    thisController.getView().hideLoading();
                    thisController.passModel(new UserObjectModel({}));
                },
                error: function (xhr, status, error) {
                    thisController.serverNotAvailable("the server cannot be reached");
                }
            });
        },

        serverNotAvailable: function (message) {
            const obj = {
                message: "The Lopt REST API is currently unavailable (" + message + ")."
            };
            this.passModel(new UserObjectModel(obj));
        }
    });
});
