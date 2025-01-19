class UsersListingObjectModel {
    constructor(json) {
        this.message = json.message;
        this.users = json.users;
    }

    getMessage() {
        return this.message;
    }

    getShouldNotFireAfterCloseDeleteDialog() {
        return Boolean(this.shouldFireAfterCloseDeleteDialog);
    }

    setShouldNotFireAfterCloseDeleteDialog(bool) {
        this.shouldFireAfterCloseDeleteDialog = bool;
    }

    getUsers() {
        return this.users;
    }

    getUser() {
        return this.user;
    }

    setUser(user) {
        this.user = user;
    }

    getShouldDeleteHome() {
        return Boolean(this.shouldDeleteHome);
    }

    setShouldDeleteHome(bool) {
        this.shouldDeleteHome = bool;
    }

    getServerContactErrorMessage() {
        return this.serverContactErrorMessage;
    }

    setServerContactErrorMessage(serverContactErrorMessage) {
        this.serverContactErrorMessage = serverContactErrorMessage;
    }
}
