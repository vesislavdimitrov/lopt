sap.ui.define(["./BaseController"], function (BaseController) {
    "use strict";

    return BaseController.extend(LOPT_CONTROLLER_GET_USERS, {
        pageLoaded: function () {
            this.checkRestApiAvailability();
        },

        deleteUserDialogCheckboxChanged(oEvent) {
            const checkbox = oEvent.getSource();
            const modelObj = this.getView().getModel().getProperty("/obj");
            modelObj.setShouldDeleteHome(checkbox.getSelected());
        },

        refreshUsersListing: function () {
            this.getView().createUsersListingTable();
            this.fetchAllUsers();
        },

        deleteUser: function () {
            const thisController = this;
            const modelObj = this.getView().getModel().getProperty("/obj");
            const user = modelObj.getUser();
            const deleteUserDialog = this.globalById("getUsersDeleteUserDialog");

            $.ajax({
                type: "DELETE",
                headers: { "Authorization": "Basic " + jQuery.sap.storage.get('token') },
                url: CONFIG.API_BASE_URL + USERS_PATH + "/" + user.username,
                data: JSON.stringify({ delete_home: modelObj.getShouldDeleteHome() }),
                success: function (result) {
                    if (deleteUserDialog.isBusy()) {
                        deleteUserDialog.setBusy(false);
                        deleteUserDialog.close();
                    }
                },
                error: function (xhr, status, error) {
                    if (deleteUserDialog.isBusy()) {
                        deleteUserDialog.setBusy(false);
                    }

                    if (xhr.readyState != 4) {
                        thisController.serverNotAvailable(
                            "the serer has returned an unexpected response or might be down"
                        );
                        thisController
                            .getView()
                            .getModel()
                            .getProperty("/obj")
                            .setShouldNotFireAfterCloseDeleteDialog(true);
                        deleteUserDialog.close();
                    } else {
                        const result = JSON.parse(xhr.responseText);
                        modelObj.setServerContactErrorMessage(result.message);
                        thisController.getView().showDeletionErrorMessage();
                    }
                }
            });
        },

        onSearchUsersListing: function (oEvent) {
            const query = oEvent.getSource().getValue();
            const table = this.globalById("usersListingTable");
            const tableItems = table.getItems();
            let usersShown = 0;
            for (const columnListItem of tableItems) {
                const cells = columnListItem.getCells();
                const taskData = [cells[0].getText(), cells[1].getText()];
                let showRow = false;
                for (const data of taskData) {
                    if (data.match(new RegExp("(" + query + ")+", "i"))) {
                        showRow = true;
                        usersShown++;
                        break;
                    }
                }
                columnListItem.setVisible(showRow);
            }
            this.getView().changeUsersCount(usersShown);
        },

        fetchAllUsers: function () {
            const thisController = this;
            $.ajax({
                type: "GET",
                headers: { "Authorization": "Basic " + jQuery.sap.storage.get('token') },
                url: CONFIG.API_BASE_URL + USERS_PATH,
                success: function (result) {
                    thisController.passModel(new UsersListingObjectModel({ users: result }));
                },
                error: function (xhr, status, error) {
                    thisController.displayFatalErrorMessage("There are no users available.");
                }
            });
        },

        checkRestApiAvailability: function () {
            const thisController = this;
            $.ajax({
                type: "GET",
                headers: { "Authorization": "Basic " + jQuery.sap.storage.get('token') },
                url: CONFIG.API_BASE_URL + "/",
                success: function (result) {
                    if (result.message != "Lopt is available") {
                        thisController.serverNotAvailable(
                            "the server has returned an unexpected response"
                        );
                        return;
                    }
                    thisController.getView().hideLoading();
                    thisController.fetchAllUsers();
                },
                error: function (xhr, status, error) {
                    thisController.serverNotAvailable("the serer cannot be reached");
                }
            });
        },

        serverNotAvailable: function (message) {
            this.displayFatalErrorMessage(
                "The Lopt REST API is currently unavailable (" + message + ")."
            );
        },

        displayFatalErrorMessage: function (message) {
            const obj = {
                message: message
            };
            this.passModel(new UsersListingObjectModel(obj));
        }
    });
});
