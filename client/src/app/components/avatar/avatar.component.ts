import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { URL } from '../../../../constants';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {

  fileName = '';

  BASE_URL:String=URL;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {

  }

  onFileSelected(event:any) {

    const file:File = event.target.files[0];

    if (file) {

        this.fileName = file.name;

        const formData = new FormData();

        formData.append("thumbnail", file);

        const upload$ = this.http.post("/api/thumbnail-upload", formData);

        upload$.subscribe();
    }
  }


  processFile(fileInput: HTMLInputElement) {
    let image:number[]=[];
    if(fileInput.files && fileInput.files[0] != null) {
      let file: File = fileInput.files[0];
      console.log(file);
      var reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        var arrayBuffer = reader.result
        const typedArray = new Uint8Array(arrayBuffer as ArrayBuffer);
        const array = [...typedArray];    
        image=array;
        console.log(image);
        
        let user={
          name:"123",
          image:image
        }
  
        console.log("post",user.image)
  
        this.http.post(this.BASE_URL+"image/upload",user).subscribe((data)=>{
          console.log(data);
        })
      };
      


    
     
    }
  }

}


