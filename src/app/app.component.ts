import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderService } from './core/services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet,CommonModule],
})
export class AppComponent implements OnInit {

  ngOnInit() {

    console.log("appplication started")
    
  }
  constructor(public loaderService: LoaderService) {}
}
