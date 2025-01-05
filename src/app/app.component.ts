import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderService } from './core/services/loader.service';
import { SessionServiceService } from './shared/ui/session-service.service';

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
    // this.setBrowserZoom(80);
    
  }
  constructor(public loaderService: LoaderService, private sessionService:SessionServiceService,private renderer: Renderer2) {}
  setBrowserZoom(percentage: number): void {
    const zoomLevel = percentage / 100;
    this.renderer.setStyle(document.body, 'zoom', zoomLevel.toString());
  }
}
