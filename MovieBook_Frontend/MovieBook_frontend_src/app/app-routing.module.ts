import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ChangePassComponent } from "./change-pass/change-pass.component";
import { MovieListComponent } from "./movie-list/movie-list.component";
import { AddMovieComponent } from "./add-movie/add-movie.component";
import { MyTicketsComponent } from "./my-tickets/my-tickets.component";
import { BookTicketComponent } from "./book-ticket/book-ticket.component";


const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "auth/login", component: LoginComponent },
  { path: "home/signup", component: RegisterComponent },
  { path: 'movie/:id', component: MovieListComponent },
  { path: "change_password", component: ChangePassComponent },
  { path: "add-movie", component: AddMovieComponent},
  { path: "my-tickets", component: MyTicketsComponent },
  { path: "book-ticket/:id", component: BookTicketComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
