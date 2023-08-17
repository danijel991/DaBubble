import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subscription } from "rxjs";
import { UserDataInterface, UserDataService } from "../service-moduls/user.service";
import { DirectMessageToUserInterface } from "../service-moduls/direct-message-to-user.service";
import { map } from "rxjs/operators";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ThreadDataInterface, ThreadDataService } from "../service-moduls/thread.service";
import { collection, doc, Firestore, getDoc, updateDoc } from "@angular/fire/firestore";
import { MessageDataService } from '../service-moduls/message.service';

@Component({
  selector: 'app-direct-message-to-user',
  templateUrl: './direct-message-to-user.component.html',
  styleUrls: ['./direct-message-to-user.component.scss']
})
export class DirectMessageToUserComponent implements OnInit, OnChanges {

  private threadUpdateSubscription: Subscription = new Subscription();

  typedEmoji: string = '';
  reactionEmojis = ['👍', '😂', '🚀', '❤️', '😮', '🎉'];
  emojisClickedBefore: number | undefined;

  [x: string]: any;



  userData: UserDataInterface[] = [];
  messageData: DirectMessageToUserInterface[] = [];

  threadData: ThreadDataInterface[] = [];

  mentionUser = new FormControl('');
  userList: string[] = [];

  selectedMessage: DirectMessageToUserInterface | null = null;



  directChat: string = "";

  updateDirectChatId: string = "";

  messageInput: string[] = [];
  messageId: string = '';
  sentByName: string[] = [];
  usersFromUserData: string[] = [];
  isProfileCardOpen: boolean = false;
  isLogoutContainerOpen: boolean = false;
  currentUser: string = '';
  currentUserId: string = '';




  emojipickeractive = false;
  reactionListOpen = false;
  toggleUserList: boolean = true;

  triggerCRUDHTML: boolean = true;
  loading: boolean = false;


  searchResults: UserDataInterface[] = [];


  constructor(
    private messageDataService: MessageDataService,
    // private directMessageToUserInterface: DirectMessageToUserInterface,
    public userDataService: UserDataService,

    private threadDataService: ThreadDataService,
    private firestore: Firestore,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes here', this.sentByName)
  }

  ngOnInit(): void {
  }

  getCurrentUserId() {
    this.currentUserId = this.userDataService.currentUser;
  }

  public typeEmoji($event: any): void {
    this.messageInput = this.messageInput + $event.character;
  }

  isNewDay(
    currentMessage: DirectMessageToUserInterface,
    previousMessage: DirectMessageToUserInterface
  ): boolean {
    if (!previousMessage) {
      return true;
    }

    const currentDate = new Date(currentMessage.time!);
    const previousDate = new Date(previousMessage.time!);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    return (
      currentDate.getFullYear() !== previousDate.getFullYear() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getDate() !== previousDate.getDate() ||
      currentDate.getTime() === today.getTime() ||
      currentDate.getTime() === yesterday.getTime()
    );
  }

  sendDirectMessageToUser() {
    console.log('sendDirectMessageToUser test');
  }

  reaction(messageEmoji: string, index: number) {
    if (this.emojisClickedBefore === index) {
      document
        .getElementById(`reaction${this.emojisClickedBefore}`)
        ?.classList.remove('showEmojis');
      this.emojisClickedBefore = undefined;
    } else {
      if (this.emojisClickedBefore !== null) {
        document
          .getElementById(`reaction${this.emojisClickedBefore}`)
          ?.classList.remove('showEmojis');
      }
      document.getElementById(`reaction${index}`)?.classList.add('showEmojis');
      this.emojisClickedBefore = index;
    }
  }

  reactWithEmoji(emoji: string, index: number, messageId: string) {
    let emojiArray = this.messageData[index].emojis;
    if (this.existReaction(index)) {
      let indexWithCurrentUser = emojiArray.findIndex((reaction: { [x: string]: string; }) => reaction['reaction-from'] === this.currentUser);
      emojiArray[indexWithCurrentUser] = { 'emoji': emoji, 'reaction-from': this.currentUser };
    } else {
      emojiArray.push({ 'emoji': emoji, 'reaction-from': this.currentUser });
    }
    // this.messageDataService.updateMessage(messageId, emojiArray);
    this.emojisClickedBefore = undefined;
    this.reactionListOpen = false;
  }


  existReaction(index: number): boolean {
    return this.messageData[index].emojis.some((reaction: { [x: string]: string; }) => {
      return reaction['reaction-from'] === this.currentUser;
    });
  }

  showReaction(index: number) {
    let item = document.getElementById(`reactionlist${index}`);
    this.messageData.forEach((message, i) => {
      let hideItems = document.getElementById(`reactionlist${i}`);
      hideItems?.classList.remove('show-list-of-reactions');
    });
    if (!this.reactionListOpen) {
      item?.classList.add('show-list-of-reactions');
      this.reactionListOpen = true;
    } else {
      this.reactionListOpen = false;
    }
  }

  toggleEmojiPicker() {
    this.emojipickeractive = !this.emojipickeractive;
  }

  openUserProfile(id: any) {
    this.isProfileCardOpen = true;
    this.isLogoutContainerOpen = false;
    this.userDataService.getCurrentUserData(id);
  }

  closeUserProfile() {
    this.isProfileCardOpen = false;
  }

  formatTimeStamp(time: number | undefined): string {
    if (typeof time === 'undefined') {
      return 'N/A';
    }

    const dateObj = new Date(time);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const amOrPm = hours >= 12 ? 'pm' : 'am';

    return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
  }

  getFormattedDate(time: number | undefined): string {
    if (typeof time === 'undefined') {
      return '';
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const messageDate = new Date(time);
    messageDate.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === currentDate.getTime()) {
      return 'Today';
    }

    const yesterday = new Date(currentDate);
    yesterday.setDate(currentDate.getDate() - 1);

    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }


  async compareIds() {
    // this.directMessageToUserInterface.messageData$.subscribe(
    //   (messages) => {

    //     this.userDataService.getUserData().pipe(
    //       map((userData) => userData.map(user => user.id))
    //     ).subscribe(
    //       (userIds: string[]) => {

    //         const userIdToNameMap: { [id: string]: string } = {};
    //         this.userData.forEach(user => {
    //           if (userIds.includes(user.id)) {
    //             userIdToNameMap[user.id] = user.name;
    //           }
    //         });
    //         const matches: string[] = [];
    //         messages.forEach((message) => {
    //           if (this.currentUserId && userIdToNameMap.hasOwnProperty(this.currentUserId)) {
    //             const senderName = userIdToNameMap[this.currentUserId];
    //             matches.push(this.currentUserId);
    //             this.currentUser = senderName;
    //           }
    //         });
    //       }
    //     );
    //   }
    // );
  }

  async deleteMessage(messageId: any) {
    if (!messageId) {
      return;
    }
    try {
      await this.messageDataService.deleteMessage(messageId);
      this.messageData = this.messageData.filter(message => message.id !== messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }


}