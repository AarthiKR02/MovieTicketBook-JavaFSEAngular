export class AuthChangePassInfo {

    username: string;
    newPassword: string;
    confirmPassword: string;
  
    constructor(username: string, newPassword: string, confirmPassword: string) {
      this.username = username;
      this.newPassword = newPassword;
      this.confirmPassword = confirmPassword;
    }
  }