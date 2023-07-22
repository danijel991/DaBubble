import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-emojis',
  templateUrl: './emojis.component.html',
  styleUrls: ['./emojis.component.scss']
})

export class EmojisComponent implements OnInit{

  constructor(public chat: ChatComponent) {

  }
  typedEmoji: string = "";
  @Output() emojiChanged = new EventEmitter<string>();
  
  searchValue: string = '';
  myEmojis: any;
  emojiSelectorIcon = document.getElementById('emojiSelectorIcon');
  emojiSelector = document.getElementById('emojiSelector');
  emojiList:Array<any> = [];
  allEmojis:Array<any> = [];
  filteredEmojiList = [];

  url = 'https://emoji-api.com/emojis?access_key=60ede231f07183acd1dbb4bdd7dde0797f62e95e'

  

  ngOnInit(): void {
    this.getEmojis();
  }


  getEmojis() {
    fetch(this.url)
      .then(res => res.json())
      .then(data => this.loadEmoji(data));
  }


  loadEmoji(data:[]) {
    data.forEach(emoji => {
      this.emojiList.push(emoji);
      this.allEmojis.push(emoji);
    });
    console.log(this.emojiList);
    
  }

  showInInput(emoji:string) {
    this.chat.typedEmoji = emoji;
    this.emojiChanged.emit(this.typedEmoji);
  }

  
  

  search() {
    const filteredList = this.allEmojis.filter(emoji => {
      return emoji.unicodeName.toLowerCase().startsWith(this.searchValue.toLowerCase());
    });
    this.emojiList = filteredList;
  }

}
