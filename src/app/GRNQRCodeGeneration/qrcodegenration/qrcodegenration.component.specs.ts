import { QRcodegenrationComponent} from './qrcodegenration.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

describe('worskstationComponent', () => {
  let component: QRcodegenrationComponent;
  let fixture: ComponentFixture<QRcodegenrationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QRcodegenrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QRcodegenrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
