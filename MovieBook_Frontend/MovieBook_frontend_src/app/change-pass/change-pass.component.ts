import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AuthChangePassInfo } from '../auth/changepass-info';

@Component({
  selector: 'app-change-pass',
  templateUrl: './change-pass.component.html',
  styleUrls: ['./change-pass.component.css']
})
export class ChangePassComponent {
  form: any = {
    username: null,
    newPassword: null,
    confirmPassword: null
  };
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private authService: AuthService) {}

    onSubmit(): void {
    const { username, newPassword, confirmPassword } = this.form;
  
    if (!newPassword || !confirmPassword) {
      this.errorMessage = 'Both password fields are required.';
      return;
    }
  
    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }
  
    const changePassInfo = { username, newPassword, confirmPassword };
  
    this.authService.changePassword(changePassInfo).subscribe({
      next: (data) => {
        this.successMessage = 'Password changed successfully!';
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'An error occurred while changing the password.';
        this.successMessage = null;
      },
    });
  }
}