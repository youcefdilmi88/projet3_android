import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-dessins',
  templateUrl: './dessins.component.html',
  styleUrls: ['./dessins.component.scss']
})
export class DessinsComponent implements OnInit {

  private readonly BASE_URL: string = "https://projet3-3990-207.herokuapp.com/";
  
  imageUrlArray: string[] = ["../../../assets/avatar_1.png", "../../../assets/avatar_2.png", "../../../assets/avatar_3.png", "../../../assets/avatar_4.png"];
  public centerImage: number = 0;
  public leftImage: number = this.imageUrlArray.length - 1;
  public rightImage: number = 1;


  constructor(
    private socketService: SocketService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.loadImages();
  }

      // for right button
      rightSideSlide(): void {
        this.leftImage = this.centerImage;
        this.centerImage = this.rightImage;
        if (this.rightImage >= this.imageUrlArray.length - 1) {
            this.rightImage = 0;
        } else {
            this.rightImage++;
        }
        this.loadImages();
  }

  // for left button
  leftSideSlide(): void {
      this.rightImage = this.centerImage;
      this.centerImage = this.leftImage;
      if (this.leftImage === 0) this.leftImage = this.imageUrlArray.length - 1;
      else {
          this.leftImage--;
      }
      this.loadImages();
  }

  loadImages(): void {
    if (this.imageUrlArray.length === 1) {
        const mainView = document.getElementById('mainView');
        mainView!.style.background = 'url(' + this.imageUrlArray[this.centerImage] + ')';
    }

    if (this.imageUrlArray.length === 2) {
        const mainView = document.getElementById('mainView');
        mainView!.style.background = 'url(' + this.imageUrlArray[this.centerImage] + ')';

        const rightView = document.getElementById('rightView');
        rightView!.style.background = 'url(' + this.imageUrlArray[this.rightImage] + ')';
        
    } else {
        const mainView = document.getElementById('mainView');
        mainView!.style.backgroundImage = 'url(' + this.imageUrlArray[this.centerImage] + ')'

        const leftView = document.getElementById('leftView');
        leftView!.style.backgroundImage = 'url(' + this.imageUrlArray[this.leftImage] + ')';

        const rightView = document.getElementById('rightView');
        rightView!.style.backgroundImage = 'url(' + this.imageUrlArray[this.rightImage] + ')';
    }
}

  openDessins() {
    console.log(this.imageUrlArray[this.centerImage]);
  }


  logout() {
    let link = this.BASE_URL + "user/logoutUser";

    this.socketService.disconnectSocket();

    this.http.post<any>(link,{ useremail: this.socketService.email }).pipe(
      catchError(async (err) => console.log("error catched" + err))
    ).subscribe((data: any) => {

      if (data.message == "success") {
        console.log("sayonara");
      }   
    });
  }


}
