class UserObjectModel {
    constructor(json) {
        this.message = json.message;
        this.submitErrorMessage = json.submitErrorMessage;
        this.user = {
            uid: json.id,
            username: json.username
        };
    }

    getMessage() {
        return this.message;
    }

    setMessage(message) {
        this.message = message;
    }

    getSubmitErrorMessage() {
        return this.submitErrorMessage;
    }

    setSubmitErrorMessage(message) {
        this.submitErrorMessage = message;
    }

    getUser() {
        return this.user;
    }

    getUid() {
        return this.user.uid;
    }

    setUid(uid) {
        this.user.uid = uid;
    }

    getUsername() {
        return this.user.username;
    }

    setUsername(username) {
        this.user.username = username;
    }

    getPassword() {
        return this.user.password;
    }

    setPassword(password) {
        this.user.password = password;
    }

    validateUid() {
        const regex = new RegExp("^\\d*$");
        return regex.test(this.user.uid);
    }

    validateUsername() {
        const regex = new RegExp("^[a-z_]([a-z0-9_-]{0,31}|[a-z0-9_-]{0,30}$)$");
        return regex.test(this.user.username);
    }

    validatePassword() {
        if (!this.user.password) {
            return false;
        }
        return true;
    }
}
