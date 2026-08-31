import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiDownload, HiVideoCamera, HiShare, HiCheck, HiX, HiChevronLeft, HiChevronRight, HiVolumeUp, HiVolumeOff, HiHeart } from 'react-icons/hi';
import FieldEditor from '../components/FieldEditor';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TEMPLATES } from '../data/templates';

// Festival-specific field configurations
const FESTIVAL_FIELDS = {
  ganpati: {
    title: 'Ganesh Chaturthi',
    fields: [
      { key: 'blessingLine', label: 'Blessing line', placeholder: '|| Shri Ganeshay Namah ||', maxLength: 60 },
      { key: 'hostName', label: "Who's inviting", placeholder: 'Shri & Sau. Deshmukh Family', maxLength: 60 },
      { key: 'message', label: 'Invitation message', placeholder: 'warmly invites you to Ganpati Bappa\'s arrival at our home', maxLength: 160 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Ganesh Chaturthi', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Sthapana', maxLength: 60 },
      { key: 'date', label: 'Sthapana date', placeholder: 'Monday, 14 September 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Aarti times', placeholder: 'Aarti — 7:00 AM & 7:30 PM daily', maxLength: 160 },
      { key: 'visarjanLabel', label: 'The word above visarjan', placeholder: 'Visarjan', maxLength: 60 },
      { key: 'visarjanDate', label: 'Visarjan date', placeholder: 'Friday, 25 September 2026', maxLength: 160 },
      { key: 'venue', label: 'Address', placeholder: '101, Shivsagar Society,\nThane (W)', maxLength: 160 },
      { key: 'closingLine', label: 'Closing line', placeholder: 'Ganpati Bappa Morya', maxLength: 60 },
    ],
  },
  wedding: {
    title: 'Wedding',
    fields: [
      { key: 'blessingLine', label: 'Blessing line', placeholder: '|| Shubh Vivah ||', maxLength: 60 },
      { key: 'hostName', label: "Who's inviting", placeholder: 'Mr. & Mrs. Sharma', maxLength: 60 },
      { key: 'message', label: 'Invitation message', placeholder: 'Request the pleasure of your company at the wedding of', maxLength: 160 },
      { key: 'groomName', label: "Groom's name", placeholder: 'Rahul', maxLength: 40 },
      { key: 'brideName', label: "Bride's name", placeholder: 'Priya', maxLength: 40 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Wedding Ceremony', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Sunday, 15 December 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '7:00 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Grand Ballroom, Taj Hotel, Mumbai', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Your presence is our blessing', maxLength: 80 },
    ],
  },
  birthday: {
    title: 'Birthday',
    fields: [
      { key: 'blessingLine', label: 'Top line', placeholder: 'You are invited!', maxLength: 60 },
      { key: 'hostName', label: "Who's inviting", placeholder: "Aarav's Parents", maxLength: 60 },
      { key: 'message', label: 'Message', placeholder: 'Celebrate with us as our little one turns', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: "Aarav's 5th Birthday Bash!", maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Saturday, 20 March 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '4:00 PM - 7:00 PM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Fun Zone, Andheri West, Mumbai', maxLength: 120 },
      { key: 'closingLine', label: 'Closing line', placeholder: 'Come dressed in your favorite superhero costume!', maxLength: 100 },
    ],
  },
  navratri: {
    title: 'Navratri',
    fields: [
      { key: 'blessingLine', label: 'Blessing line', placeholder: '|| Jai Mata Di ||', maxLength: 60 },
      { key: 'hostName', label: "Who's inviting", placeholder: 'Sharma Family', maxLength: 60 },
      { key: 'message', label: 'Invitation message', placeholder: 'Cordially invite you to join us for', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Navratri Garba Night', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Friday, 3 October 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Aarti time', placeholder: '7:00 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Community Hall, Sector 15, Noida', maxLength: 120 },
      { key: 'closingLine', label: 'Closing line', placeholder: 'Dress in traditional attire', maxLength: 80 },
    ],
  },
  janmashtami: {
    title: 'Janmashtami',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Hare Krishna Hare Rama ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Patel Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Invite you to celebrate the divine birth of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Shri Krishna Janmashtami', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Monday, 24 August 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Aarti / Dahi Handi Time', placeholder: '12:00 AM (Midnight)', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'ISKCON Temple, Juhu, Mumbai', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Come dressed as Radha-Krishna', maxLength: 80 },
    ],
  },
  'griha-pravesh': {
    title: 'Griha Pravesh',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Shubh Griha Pravesh ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Mehta Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'We are delighted to invite you to our', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Griha Pravesh Ceremony', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Sunday, 10 January 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Muhurat Time', placeholder: '10:30 AM', maxLength: 60 },
      { key: 'venue', label: 'New Home Address', placeholder: 'Flat 402, Sunrise Apartments, Pune', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Bless our new home with your presence', maxLength: 80 },
    ],
  },
  engagement: {
    title: 'Engagement',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Shubh Vivah ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Mr. & Mrs. Gupta', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Request the honor of your presence at the engagement of', maxLength: 120 },
      { key: 'groomName', label: "Groom's Name", placeholder: 'Vikram', maxLength: 40 },
      { key: 'brideName', label: "Bride's Name", placeholder: 'Ananya', maxLength: 40 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Ring Ceremony', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Saturday, 14 February 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '6:00 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'The Leela Palace, New Delhi', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Your blessings make it complete', maxLength: 80 },
    ],
  },
  haldi: {
    title: 'Haldi',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Shubh Vivah ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Both Families', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us for the colorful celebration of', maxLength: 80 },
      { key: 'groomName', label: "Groom's Name", placeholder: 'Arjun', maxLength: 40 },
      { key: 'brideName', label: "Bride's Name", placeholder: 'Sneha', maxLength: 40 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Haldi Ceremony', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Friday, 20 March 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '10:00 AM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Farmhouse, Chhatarpur, New Delhi', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Wear yellow and join the fun!', maxLength: 80 },
    ],
  },
  diwali: {
    title: 'Diwali',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Shubh Deepavali ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Sharma Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Invite you to celebrate the festival of lights with', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Diwali Celebration', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Monday, 4 November 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Puja Time', placeholder: '6:30 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Residence, Vasant Vihar, New Delhi', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'May the light illuminate your life', maxLength: 80 },
    ],
  },
  holi: {
    title: 'Holi',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Holi Hai! ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Verma Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us for a colorful celebration of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Holi Festival', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Saturday, 14 March 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '10:00 AM - 4:00 PM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Community Center, Sector 22, Chandigarh', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Wear white and bring your colors!', maxLength: 80 },
    ],
  },
  dussehra: {
    title: 'Dussehra',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Jai Shri Ram ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Agarwal Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Invite you to celebrate the victory of good over evil', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Dussehra Celebration', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Thursday, 15 October 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Ravan Dahan Time', placeholder: '8:00 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Ramlila Ground, Connaught Place, Delhi', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Celebrate the triumph of righteousness', maxLength: 80 },
    ],
  },
  'maha-shivratri': {
    title: 'Maha Shivratri',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Om Namah Shivaya ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Iyer Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us in worship on the great night of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Maha Shivratri', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Monday, 17 February 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Puja Time', placeholder: '6:00 PM - 6:00 AM (Night-long)', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Kashi Vishwanath Temple, Varanasi', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Har Har Mahadev!', maxLength: 80 },
    ],
  },
  'ram-navami': {
    title: 'Ram Navami',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Jai Shri Ram ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Tiwari Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Celebrate the divine birth of Lord', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Shri Ram Navami', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Tuesday, 7 April 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Aarti Time', placeholder: '12:00 PM (Madhyanha)', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Ram Temple, Ayodhya', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Siya Ram, Siya Ram', maxLength: 80 },
    ],
  },
  'makar-sankranti': {
    title: 'Makar Sankranti',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Tilgul Ghya ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Deshmukh Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Invite you to celebrate the harvest festival of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Makar Sankranti', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Wednesday, 14 January 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: 'Morning Puja at 8:00 AM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Residence, Koregaon Park, Pune', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Fly kites and share tilgul!', maxLength: 80 },
    ],
  },
  pongal: {
    title: 'Pongal',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Pongalo Pongal ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Rajagopalan Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us to celebrate the harvest festival of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Pongal Festival', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Thursday, 14 January 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Pongal Time', placeholder: '6:30 AM (Sunrise)', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Home, T. Nagar, Chennai', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Thai pirandhal vazhi pirakkum!', maxLength: 80 },
    ],
  },
  onam: {
    title: 'Onam',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Happy Onam ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Nair Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Celebrate the harvest festival and homecoming of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Onam Festival', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Saturday, 29 August 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Onasadya Time', placeholder: '12:00 PM (Afternoon Feast)', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Home, Kochi, Kerala', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Pookalam and Vallam Kali await!', maxLength: 80 },
    ],
  },
  'eid-ul-fitr': {
    title: 'Eid-ul-Fitr',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Eid Mubarak!', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Khan Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us in celebrating the end of Ramadan with', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Eid-ul-Fitr Celebration', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Friday, 20 March 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Eid Prayer Time', placeholder: '8:00 AM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Jama Masjid, Old Delhi', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'May Allah accept our fasts and prayers', maxLength: 80 },
    ],
  },
  'eid-ul-adha': {
    title: 'Eid-ul-Adha',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Eid Mubarak!', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Ansari Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Celebrate the festival of sacrifice with', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Eid-ul-Adha (Bakrid)', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Tuesday, 27 May 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Eid Prayer Time', placeholder: '7:30 AM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Idgah Ground, Mumbai', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'May your sacrifice be accepted', maxLength: 80 },
    ],
  },
  muharram: {
    title: 'Muharram',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Ya Hussain', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Community', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us in observing the sacred month of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Muharram', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: '1st Muharram 1448 AH', maxLength: 60 },
      { key: 'aartiTimes', label: 'Majlis Time', placeholder: 'Evening after Maghrib', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Imambada, Lucknow', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Labbaik Ya Hussain', maxLength: 80 },
    ],
  },
  'milad-un-nabi': {
    title: 'Milad-un-Nabi',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Sal-Allahu Alaihi Wasallam', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Muslim Community', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Celebrate the birth of Prophet', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Eid Milad-un-Nabi', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: '12th Rabi-ul-Awwal 1448 AH', maxLength: 60 },
      { key: 'aartiTimes', label: 'Jashn Time', placeholder: 'After Isha Prayer', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Local Mosque/Community Center', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Peace be upon the Prophet', maxLength: 80 },
    ],
  },
  christmas: {
    title: 'Christmas',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Merry Christmas!', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'D\'Souza Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us in celebrating the birth of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Christmas Celebration', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Friday, 25 December 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Midnight Mass', placeholder: '12:00 AM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Holy Cross Church, Bandra, Mumbai', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Joy to the World!', maxLength: 80 },
    ],
  },
  easter: {
    title: 'Easter',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'He is Risen!', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Fernandes Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Celebrate the resurrection of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Easter Sunday', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Sunday, 5 April 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Service Time', placeholder: '10:00 AM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'St. Mary\'s Cathedral, New Delhi', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Alleluia! Christ is Risen!', maxLength: 80 },
    ],
  },
  'good-friday': {
    title: 'Good Friday',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'In Loving Memory', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Christian Community', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us in commemorating the crucifixion of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Good Friday', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Friday, 3 April 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Service Time', placeholder: '3:00 PM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Local Church', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'For God so loved the world', maxLength: 80 },
    ],
  },
  vaisakhi: {
    title: 'Vaisakhi',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Waheguru Ji Ka Khalsa', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Singh Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Celebrate the harvest and the birth of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Vaisakhi', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Monday, 13 April 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Nagar Kirtan Time', placeholder: '8:00 AM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Gurudwara Bangla Sahib, New Delhi', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Jo Bole So Nihal, Sat Sri Akal!', maxLength: 80 },
    ],
  },
  gurpurab: {
    title: 'Gurpurab',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Ik Onkar', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Khalsa Sangat', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us in celebrating the birth of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Guru Nanak Jayanti', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Thursday, 12 November 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Akhand Path Time', placeholder: '48-hour continuous reading', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Golden Temple, Amritsar', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Sat Sri Akal!', maxLength: 80 },
    ],
  },
  'buddha-purnima': {
    title: 'Buddha Purnima',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Namo Buddhaya', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Buddhist Sangha', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Celebrate the birth, enlightenment, and parinirvana of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Buddha Purnima', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Monday, 1 June 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Puja Time', placeholder: 'Morning 6:00 AM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Mahabodhi Temple, Bodh Gaya', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Peace and compassion to all beings', maxLength: 80 },
    ],
  },
  'mahavir-jayanti': {
    title: 'Mahavir Jayanti',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Namokar Mantra ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Jain Sangh', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Celebrate the birth of the 24th Tirthankara', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Mahavir Jayanti', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Thursday, 9 April 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Puja Time', placeholder: '6:00 AM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Jain Temple, Palitana, Gujarat', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Ahimsa Paramo Dharma', maxLength: 80 },
    ],
  },
  paryushan: {
    title: 'Paryushan',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Micchami Dukkadam ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Jain Community', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us for the sacred period of fasting and repentance during', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Paryushan Parva', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: '8 Days (August-September 2026)', maxLength: 60 },
      { key: 'aartiTimes', label: 'Pratikraman Time', placeholder: 'Evening 6:00 PM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Jain Derasar, Mumbai', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Forgive us our trespasses', maxLength: 80 },
    ],
  },
  // New categories added for 100+ templates
  'durga-puja': {
    title: 'Durga Puja',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Durga Maa Ki Jai ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Bose Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Invite you to celebrate the homecoming of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Durga Puja', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Friday, 9 October 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Aarti Time', placeholder: '7:00 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Durga Puja Pandal, Kolkata', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Durga Maa Ki Jai!', maxLength: 80 },
    ],
  },
  mehndi: {
    title: 'Mehndi',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Mehndi Rachao ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Bride\'s Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us for an evening of henna, music and joy', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Mehndi Ceremony', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Wednesday, 11 February 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '5:00 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Rose Garden, Jaipur', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Let your hands tell the story', maxLength: 80 },
    ],
  },
  sangeet: {
    title: 'Sangeet',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Sangeet Ki Raat', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Both Families', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Dance the night away at the musical celebration of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Sangeet Night', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Thursday, 12 February 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '7:00 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Grand Banquet Hall, Mumbai', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Bring your dancing shoes!', maxLength: 80 },
    ],
  },
  reception: {
    title: 'Reception',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'With Joy We Invite', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Mr. & Mrs. Kapoor', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Request the pleasure of your company at the reception of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Wedding Reception', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Saturday, 20 February 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '8:00 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'The Leela Palace, New Delhi', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Dinner, drinks and celebrations await', maxLength: 80 },
    ],
  },
  anniversary: {
    title: 'Anniversary',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Celebrating Love', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Amit & Priya', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Invite you to celebrate our journey of togetherness', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: '25th Anniversary', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Sunday, 15 November 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '7:00 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Taj Lands End, Mumbai', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Love, laughter and happily ever after', maxLength: 80 },
    ],
  },
  'baby-shower': {
    title: 'Baby Shower',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'A Little One is on the Way', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Mom-to-be Priya & Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us to shower blessings on the arrival of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Baby Shower', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Saturday, 10 April 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '4:00 PM - 7:00 PM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Garden Terrace, Pune', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Tiny hands, big blessings', maxLength: 80 },
    ],
  },
  'baby-announcement': {
    title: 'Baby Announcement',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Welcome Baby', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Proud Parents', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'We are thrilled to announce the arrival of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Birth Announcement', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Born on 5 April 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: 'Visit us anytime', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Our Home, Mumbai', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Bless our little miracle', maxLength: 80 },
    ],
  },
  naamkaran: {
    title: 'Naamkaran',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Naamkaran Sanskar ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Sharma Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Invite you to bless our little one on their naming ceremony', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Naamkaran Ceremony', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Saturday, 25 April 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '11:00 AM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Residence, Delhi', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Your blessings mean the world', maxLength: 80 },
    ],
  },
  satyanarayan: {
    title: 'Satyanarayan Puja',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Shri Satyanarayan ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Gupta Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Invite you to seek blessings at', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Satyanarayan Katha', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Sunday, 18 January 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Puja Time', placeholder: '6:00 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Home, Vashi, Navi Mumbai', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Prasad and blessings await', maxLength: 80 },
    ],
  },
  mundan: {
    title: 'Mundan Ceremony',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Mundan Sanskar ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Agarwal Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Invite you to bless our child on their first haircut ceremony', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Mundan Ceremony', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Friday, 20 February 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Muhurat Time', placeholder: '10:30 AM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Temple, Ujjain', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Bless our little one', maxLength: 80 },
    ],
  },
  'thread-ceremony': {
    title: 'Thread Ceremony',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Janeu Sanskar ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Iyer Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Invite you to bless our son on his sacred thread ceremony', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Upanayana', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Sunday, 15 March 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Muhurat Time', placeholder: '8:00 AM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Gurukul, Chennai', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Gayatri Mantra and blessings', maxLength: 80 },
    ],
  },
  // Occasions that arrived with the vector catalogue — each gets its own ritual
  // vocabulary so no card ever shows Sthapana/Visarjan labels by accident.
  'karva-chauth': {
    title: 'Karva Chauth', titleHi: 'करवा चौथ', titleMr: 'करवा चौथ',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Suhaag Sukh ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Priya & Amit', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join us for the vrat katha and moon-lit blessings of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Karva Chauth Vrat', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Vrat Katha', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Monday, 26 October 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Parana (Moonrise)', placeholder: 'Moonrise at 8:42 PM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Residence, C-Scheme, Jaipur', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'For the love that keeps the fast', maxLength: 80 },
    ],
  },
  teej: {
    title: 'Hariyali Teej', titleHi: 'हरियाली तीज', titleMr: 'हरियाली तीज',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Gauri Aayee ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Saxena Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Join the swing, the singar and the holi of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Hariyali Teej', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Teej Puja', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Friday, 31 July 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Gauri Aarti', placeholder: 'Evening 6:30 PM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Family Haveli, Lucknow', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Green bangles, green dupattas, green joy', maxLength: 80 },
    ],
  },
  'bhai-dooj': {
    title: 'Bhai Dooj', titleHi: 'भाई दूज', titleMr: 'भाऊबीज',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| दीर्घायु प्रभोः ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Sister Anjali & Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Tika, thali and a long life of togetherness at', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Bhai Dooj / Bhaubeej', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Tika Muhurat', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Tuesday, 17 November 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Tika Time', placeholder: '12:45 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: "Sister's Residence, Kothrud, Pune", maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Aayee bhaiya ki dhoop', maxLength: 80 },
    ],
  },
  chhath: {
    title: 'Chhath Puja', titleHi: 'छठ पूजा', titleMr: 'छठ पूजा',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| सूर्य नमः ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Rai Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Arghya to the rising and setting sun with the family of', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Chhath Puja', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Nahay Khay', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Wednesday, 28 October 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Sandhya Arghya', placeholder: 'Sunset 5:28 PM at the ghat', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Nahar Pond Ghat, Darbhanga', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Usha geets at sunrise, arghya at sunset', maxLength: 80 },
    ],
  },
  'gudi-padwa': {
    title: 'Gudi Padwa / Ugadi', titleHi: 'गुडी पडवा / युगादी', titleMr: 'गुढी पडवो / उगादी',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| श्री सिद्धि ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Kulkarni Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Gudi praveshan, panchang sevan and mango-neem blessings at', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Gudi Padwa', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Gudi Stapana', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Thursday, 19 March 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Muhurat', placeholder: 'Gudi raised at 7:14 AM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Residence, Shivaji Nagar, Pune', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Nava varshachi hardik shubhekachna', maxLength: 80 },
    ],
  },
  'saraswati-puja': {
    title: 'Saraswati Puja', titleHi: 'सरस्वती पूजा', titleMr: 'सारस्वत पूजन',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| सरस्वत्यै नमः ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Mukherjee Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Haldi-kumkum, veena and bhandara blessings on', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Saraswati Puja · Vasant Panchami', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Puja & Bhandara', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Sunday, 25 January 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Aarti Time', placeholder: '10:00 AM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Residence, Park Street, Kolkata', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'May Maa Saraswati bless your learning', maxLength: 80 },
    ],
  },
  annaprashan: {
    title: 'Annaprashan', titleHi: 'अन्नप्राशन', titleMr: 'भातभट्टी',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| अन्नप्राशन संस्कार ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Iyer Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'First spoon of rice, first taste of blessings at', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Annaprashan of little Veda', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Muhurat', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Thursday, 12 November 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Annaprashan Time', placeholder: '11:30 AM (after Ganesh puja)', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: "Grandparents' home, T. Nagar, Chennai", maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Sweet bites, big blessings', maxLength: 80 },
    ],
  },
  dhanteras: {
    title: 'Dhanteras', titleHi: 'धनतेरस', titleMr: 'धनत्रयोदशी',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| शुभ लाभ ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Gupta Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Diyas, lakshmi puja and a little gold on', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Dhanteras Puja', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Puja Muhurat', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Friday, 30 October 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Lakshmi Aarti', placeholder: 'Prado Kaal — 6:12 PM', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Residence, Sadashiv Peth, Pune', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Yamadeep lighted at sunset', maxLength: 80 },
    ],
  },
  'raksha-bandhan': {
    title: 'Raksha Bandhan', titleHi: 'रक्षाबंधन', titleMr: 'नारलीपूर्णिमा',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| बहना का प्यार ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Verma Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'The sacred thread of protection is being tied at', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Raksha Bandhan', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Rakhi Muhurat', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Sunday, 28 August 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Tika & Aarti', placeholder: '10:30 AM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Family Residence, Hazratganj, Lucknow', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Bhaiya ka dil, behna ka pyaar', maxLength: 80 },
    ],
  },
  retirement: {
    title: 'Retirement Gala', titleHi: 'सेवानिवृत्ति समारोह', titleMr: 'निवृत्ती सोहळा',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'With Gratitude', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Colleagues & the Kapoor Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'A vote of thanks and a send-off for', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Retirement Gala — Mr. R. Kapoor', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Felicitation', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Friday, 20 November 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Programme', placeholder: '6:30 PM memento, 8:00 PM dinner', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Hotel Sai Palace Banquet, Nashik', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'New chapter, same smile', maxLength: 80 },
    ],
  },
  farewell: {
    title: 'Farewell Evening', titleHi: 'विदाई समारोह', titleMr: 'निरोप सोहळा',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Bon Voyage', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Batch of 2026', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Music, memories and a wish-thanks send-off for', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'Farewell — Ananya', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Alvida', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Saturday, 30 May 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '5:00 PM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Campus Lawns, Fergusson College, Pune', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Memories forever, distances never', maxLength: 80 },
    ],
  },
  'new-year': {
    title: 'New Year Eve', titleHi: 'नया साल', titleMr: 'नववर्ष स्वागत',
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: 'Hello 2027', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'The Sharma Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Dinner, music and the countdown party for', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: 'New Year Celebration', maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Countdown', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Thursday, 31 December 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '9:00 PM · fireworks at midnight', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Rooftop Resort, Candolim, Goa', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'Naya saal, nayi shubhkamnayein', maxLength: 80 },
    ],
  },
};

// Generic fallback for any category not explicitly configured above, so a new
// occasion never inherits another one's ritual labels.
const getFestivalFields = (category) => {
  if (FESTIVAL_FIELDS[category]) return FESTIVAL_FIELDS[category];
  const title = category
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return {
    title,
    fields: [
      { key: 'blessingLine', label: 'Blessing Line', placeholder: '|| Blessings ||', maxLength: 60 },
      { key: 'hostName', label: "Who's Inviting", placeholder: 'Host Family', maxLength: 60 },
      { key: 'message', label: 'Invitation Message', placeholder: 'Invite you to celebrate with us', maxLength: 80 },
      { key: 'eventName', label: 'Occasion', placeholder: title, maxLength: 60 },
      { key: 'dateLabel', label: 'The word above the date', placeholder: 'Join us', maxLength: 60 },
      { key: 'date', label: 'Date', placeholder: 'Sunday, 1 January 2026', maxLength: 60 },
      { key: 'aartiTimes', label: 'Time', placeholder: '10:00 AM onwards', maxLength: 60 },
      { key: 'venue', label: 'Venue', placeholder: 'Venue Address', maxLength: 120 },
      { key: 'closingLine', label: 'Closing Line', placeholder: 'With love and joy', maxLength: 80 },
    ],
  };
};

const TEXT_COLORS = {
  // Royal & traditional reds
  'royal-maroon': { name: 'royal maroon', color: '#800020', dotColor: '#800020' },
  'deep-burgundy': { name: 'deep burgundy', color: '#6B0F2E', dotColor: '#6B0F2E' },
  'maroon-rose': { name: 'maroon rose', color: '#7B1E3A', dotColor: '#7B1E3A' },
  'wine': { name: 'wine', color: '#5C1A2E', dotColor: '#5C1A2E' },
  'crimson': { name: 'crimson', color: '#C21E3A', dotColor: '#C21E3A' },
  'scarlet': { name: 'scarlet', color: '#D93A2B', dotColor: '#D93A2B' },
  'rani-pink': { name: 'rani pink', color: '#D6236A', dotColor: '#D6236A' },
  'plum': { name: 'plum', color: '#6B2D5C', dotColor: '#6B2D5C' },
  // Gold & warm earth
  'gold-leaf': { name: 'gold leaf', color: '#B8860B', dotColor: '#B8860B' },
  'antique-gold': { name: 'antique gold', color: '#C19A6B', dotColor: '#C19A6B' },
  'brass': { name: 'brass', color: '#9C7A21', dotColor: '#9C7A21' },
  'mustard': { name: 'mustard', color: '#B8912F', dotColor: '#B8912F' },
  'saffron': { name: 'saffron', color: '#D2761A', dotColor: '#D2761A' },
  'marigold': { name: 'marigold', color: '#DD8A17', dotColor: '#DD8A17' },
  'amber': { name: 'amber', color: '#A96A15', dotColor: '#A96A15' },
  'warm-terracotta': { name: 'terracotta', color: '#A0522D', dotColor: '#A0522D' },
  'rust': { name: 'rust', color: '#8A3D20', dotColor: '#8A3D20' },
  'copper': { name: 'copper', color: '#8B5A2B', dotColor: '#8B5A2B' },
  'soft-brown': { name: 'soft brown', color: '#7D5A44', dotColor: '#7D5A44' },
  'cinnamon': { name: 'cinnamon', color: '#5E3A1F', dotColor: '#5E3A1F' },
  // Greens
  'peacock-teal': { name: 'peacock teal', color: '#2A7A7A', dotColor: '#2A7A7A' },
  'emerald': { name: 'emerald', color: '#0F6B4F', dotColor: '#0F6B4F' },
  'forest': { name: 'forest', color: '#23542F', dotColor: '#23542F' },
  'sage': { name: 'sage', color: '#5F7A5B', dotColor: '#5F7A5B' },
  'olive': { name: 'olive', color: '#5A6320', dotColor: '#5A6320' },
  'turquoise': { name: 'turquoise', color: '#128088', dotColor: '#128088' },
  // Blues & purples
  'royal-blue': { name: 'royal blue', color: '#1F4E9C', dotColor: '#1F4E9C' },
  'indigo': { name: 'indigo', color: '#2B3A8C', dotColor: '#2B3A8C' },
  'peacock-blue': { name: 'peacock blue', color: '#0F6C94', dotColor: '#0F6C94' },
  'navy': { name: 'navy', color: '#17263F', dotColor: '#17263F' },
  'steel': { name: 'steel blue', color: '#43617A', dotColor: '#43617A' },
  'lavender': { name: 'lavender', color: '#6F5B94', dotColor: '#6F5B94' },
  'lilac': { name: 'lilac', color: '#8B6FA8', dotColor: '#8B6FA8' },
  'magenta': { name: 'magenta', color: '#A81E6B', dotColor: '#A81E6B' },
  // Soft pinks & pastels
  'rose-blush': { name: 'rose blush', color: '#C4787A', dotColor: '#C4787A' },
  'dusty-rose': { name: 'dusty rose', color: '#A85C66', dotColor: '#A85C66' },
  'peach': { name: 'peach', color: '#C86F42', dotColor: '#C86F42' },
  'coral': { name: 'coral', color: '#D95B43', dotColor: '#D95B43' },
  'powder-blue': { name: 'powder blue', color: '#41698A', dotColor: '#41698A' },
  'mint': { name: 'mint', color: '#2E7D63', dotColor: '#2E7D63' },
  // Lights — for dark artwork
  'ivory-cream': { name: 'ivory cream', color: '#F5E6D3', dotColor: '#F5E6D3' },
  'pearl': { name: 'pearl', color: '#EDE4D3', dotColor: '#EDE4D3' },
  'champagne': { name: 'champagne', color: '#EAD9A6', dotColor: '#EAD9A6' },
  'rose-gold-light': { name: 'blush light', color: '#F3C9CE', dotColor: '#F3C9CE' },
  'sky-light': { name: 'sky light', color: '#CFE3F0', dotColor: '#CFE3F0' },
  'sage-light': { name: 'sage light', color: '#D6E3D0', dotColor: '#D6E3D0' },
  'white': { name: 'pure white', color: '#FFFFFF', dotColor: '#FFFFFF' },
  // Neutrals
  'sand': { name: 'sand', color: '#A8916F', dotColor: '#A8916F' },
  'graphite': { name: 'graphite', color: '#4A4A4A', dotColor: '#4A4A4A' },
  'charcoal': { name: 'charcoal', color: '#2E2C2A', dotColor: '#2E2C2A' },
  'near-black': { name: 'near black', color: '#141414', dotColor: '#141414' },
};

// Swatches shown in the picker, grouped so a long list stays scannable
const COLOR_GROUPS = [
  { label: 'Royal', keys: ['royal-maroon', 'deep-burgundy', 'maroon-rose', 'wine', 'crimson', 'scarlet', 'rani-pink', 'plum'] },
  { label: 'Gold & Earth', keys: ['gold-leaf', 'antique-gold', 'brass', 'mustard', 'saffron', 'marigold', 'amber', 'warm-terracotta', 'rust', 'copper', 'soft-brown', 'cinnamon'] },
  { label: 'Greens', keys: ['peacock-teal', 'emerald', 'forest', 'sage', 'olive', 'turquoise'] },
  { label: 'Blue & Violet', keys: ['royal-blue', 'indigo', 'peacock-blue', 'navy', 'steel', 'lavender', 'lilac', 'magenta'] },
  { label: 'Soft & Pastel', keys: ['rose-blush', 'dusty-rose', 'peach', 'coral', 'powder-blue', 'mint'] },
  { label: 'For dark art', keys: ['ivory-cream', 'pearl', 'champagne', 'rose-gold-light', 'sky-light', 'sage-light', 'white'] },
  { label: 'Neutral', keys: ['sand', 'graphite', 'charcoal', 'near-black'] },
];

// One-click typography sets. Applies a font to every line of the invitation.
const TEXT_STYLES = [
  {
    id: 'classic', name: 'Classic Temple',
    fonts: { blessingLine: 'Cormorant SC', hostName: 'Playfair Display', message: 'Lora', groomName: 'Playfair Display', brideName: 'Playfair Display', eventName: 'Marcellus', dateLabel: 'Marcellus', date: 'Cormorant Garamond', aartiTimes: 'Lora', visarjanLabel: 'Marcellus', visarjanDate: 'Cormorant Garamond', venue: 'Lora', closingLine: 'Great Vibes' },
  },
  {
    id: 'royal', name: 'Royal Serif',
    fonts: { blessingLine: 'Cinzel', hostName: 'Cinzel', message: 'EB Garamond', groomName: 'Cinzel', brideName: 'Cinzel', eventName: 'Cinzel', dateLabel: 'Cinzel', date: 'EB Garamond', aartiTimes: 'EB Garamond', visarjanLabel: 'Cinzel', visarjanDate: 'EB Garamond', venue: 'EB Garamond', closingLine: 'Pinyon Script' },
  },
  {
    id: 'minimal', name: 'Modern Minimal',
    fonts: { blessingLine: 'Poppins', hostName: 'Poppins', message: 'Mukta', groomName: 'Poppins', brideName: 'Poppins', eventName: 'Italiana', dateLabel: 'Poppins', date: 'Mukta', aartiTimes: 'Mukta', visarjanLabel: 'Poppins', visarjanDate: 'Mukta', venue: 'Mukta', closingLine: 'Poppins' },
  },
  {
    id: 'devanagari', name: 'Devanagari',
    fonts: { blessingLine: 'Tiro Devanagari Hindi', hostName: 'Tiro Devanagari Hindi', message: 'Mukta', groomName: 'Rozha One', brideName: 'Rozha One', eventName: 'Rozha One', dateLabel: 'Tiro Devanagari Hindi', date: 'Mukta', aartiTimes: 'Mukta', visarjanLabel: 'Tiro Devanagari Hindi', visarjanDate: 'Mukta', venue: 'Hind', closingLine: 'Kalam' },
  },
  {
    id: 'romantic', name: 'Romantic Script',
    fonts: { blessingLine: 'Cormorant Garamond', hostName: 'Cormorant Garamond', message: 'EB Garamond', groomName: 'Great Vibes', brideName: 'Great Vibes', eventName: 'Italiana', dateLabel: 'Cormorant SC', date: 'Cormorant Garamond', aartiTimes: 'Cormorant Garamond', visarjanLabel: 'Cormorant SC', visarjanDate: 'Cormorant Garamond', venue: 'Cormorant Garamond', closingLine: 'Tangerine' },
  },
  {
    id: 'festive', name: 'Festive Bold',
    fonts: { blessingLine: 'Yatra One', hostName: 'Baloo 2', message: 'Hind', groomName: 'Yatra One', brideName: 'Yatra One', eventName: 'Yatra One', dateLabel: 'Baloo 2', date: 'Hind', aartiTimes: 'Hind', visarjanLabel: 'Baloo 2', visarjanDate: 'Hind', venue: 'Hind', closingLine: 'Kalam' },
  },
];

// Backdrop behind the text block. This is what guarantees legible text on
// artwork that has no genuinely clean region to write on.
const TEXT_BOARDS = [
  { id: 'none', name: 'None', css: {}, dark: false },
  { id: 'cream', name: 'Cream', css: { background: 'rgba(255,248,235,0.94)', border: '1px solid rgba(184,134,11,0.35)', boxShadow: '0 6px 26px rgba(80,40,10,0.18)' }, dark: false },
  { id: 'frost', name: 'Frost', css: { background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 6px 26px rgba(60,30,30,0.16)' }, dark: false },
  { id: 'gold', name: 'Gold wash', css: { background: 'rgba(245,224,170,0.72)', border: '1.5px solid rgba(176,124,20,0.6)', boxShadow: '0 6px 26px rgba(90,55,10,0.2)' }, dark: false },
  { id: 'dark', name: 'Royal dark', css: { background: 'rgba(48,10,22,0.72)', border: '1.5px solid rgba(212,175,55,0.65)', boxShadow: '0 8px 30px rgba(0,0,0,0.35)' }, dark: true },
  { id: 'ink', name: 'Ink', css: { background: 'rgba(18,18,20,0.7)', border: '1px solid rgba(255,255,255,0.28)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }, dark: true },
];

// Panel picker — 'auto' lets the artwork decide, everything else is explicit.
const BOARD_CHOICES = [
  { id: 'auto', name: 'Auto (best fit)', swatch: 'linear-gradient(135deg, rgba(255,248,235,0.95) 0 50%, #ece2ce 50% 100%)' },
  ...TEXT_BOARDS.map((b) => ({
    id: b.id,
    name: b.name,
    swatch: b.id === 'none'
      ? 'repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 8px 8px'
      : b.css.background,
  })),
];

// Canvas styles mirroring TEXT_BOARDS, for the video renderer
const VIDEO_BOARD_STYLES = {
  none: null,
  cream: { fill: 'rgba(255,248,235,0.94)', stroke: 'rgba(184,134,11,0.35)', dark: false },
  frost: { fill: 'rgba(255,255,255,0.62)', stroke: 'rgba(255,255,255,0.9)', dark: false },
  gold: { fill: 'rgba(245,224,170,0.72)', stroke: 'rgba(176,124,20,0.6)', dark: false },
  dark: { fill: 'rgba(48,10,22,0.72)', stroke: 'rgba(212,175,55,0.65)', dark: true },
  ink: { fill: 'rgba(18,18,20,0.7)', stroke: 'rgba(255,255,255,0.28)', dark: true },
};

const MUSIC_STYLES = [
  { id: 'auto', name: 'Auto' },
  { id: 'flute', name: 'Bansuri' },
  { id: 'sitar', name: 'Sitar' },
  { id: 'bells', name: 'Temple bells' },
  { id: 'tabla', name: 'Tabla' },
];

// Single ordered description of every text line an invitation can contain.
// The preview and the video both render from this, so spacing is always uniform
// and lines can never collide with each other.
const TEXT_STACK = [
  { key: 'blessingLine', font: 'Cormorant SC', size: 15, weight: 600, opacity: 0.95, letterSpacing: '0.06em', gap: 0 },
  { key: 'hostName', font: 'Playfair Display', size: 15, weight: 600, opacity: 0.96, gap: 9 },
  { key: 'message', font: 'Lora', size: 13, weight: 400, opacity: 0.9, gap: 7 },
  { key: '__couple', font: 'Playfair Display', size: 21, weight: 600, opacity: 1, gap: 9 },
  { key: 'eventName', font: 'Marcellus', size: 30, weight: 700, opacity: 1, letterSpacing: '0.02em', gap: 11 },
  { key: 'dateLabel', font: 'Marcellus', size: 14.5, weight: 600, opacity: 0.92, letterSpacing: '0.05em', gap: 12 },
  { key: 'date', font: 'Cormorant Garamond', size: 15.5, weight: 600, opacity: 0.96, gap: 3 },
  { key: 'aartiTimes', font: 'Lora', size: 13.5, weight: 500, opacity: 0.92, gap: 3 },
  { key: 'visarjanLabel', font: 'Marcellus', size: 14.5, weight: 600, opacity: 0.92, letterSpacing: '0.05em', gap: 12 },
  { key: 'visarjanDate', font: 'Cormorant Garamond', size: 15.5, weight: 600, opacity: 0.96, gap: 3 },
  { key: 'venue', font: 'Lora', size: 13.5, weight: 500, opacity: 0.92, gap: 12 },
  { key: 'closingLine', font: 'Great Vibes', size: 22, weight: 500, opacity: 0.98, gap: 4 },
];

// Preview card is rendered ~420px wide; the video canvas is 720px wide.
const PREVIEW_CARD_WIDTH = 420;
const VIDEO_WIDTH = 720;
const VIDEO_HEIGHT = 1280;
const VIDEO_SCALE = VIDEO_WIDTH / PREVIEW_CARD_WIDTH;

const clampBand = (value, min, max) => Math.min(Math.max(value, min), max);

// Perceived 0-255 brightness of a hex colour, plus a simple contrast measure
// between a text colour and the average brightness of the artwork behind it.
const hexLuminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
};
const contrastAgainst = (colorLum, groundLum) => {
  const hi = Math.max(colorLum, groundLum);
  const lo = Math.min(colorLum, groundLum);
  return (hi + 5) / (lo + 5);
};

// Scans the template artwork and returns the band (in % of card height) that is
// cleanest AND lightest — the only place overlaid text stays readable.
const analyzeTextBand = (src) => new Promise((resolve) => {
  const fallback = { start: 6, end: 52, luminance: 235, busy: false };
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const W = 96, H = 170;
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const g = cv.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0, W, H);
      const { data } = g.getImageData(0, 0, W, H);

      const lum = new Float32Array(W * H);
      const rgb = [new Float32Array(W * H), new Float32Array(W * H), new Float32Array(W * H)];
      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        rgb[0][p] = data[i];
        rgb[1][p] = data[i + 1];
        rgb[2][p] = data[i + 2];
        lum[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      const rowCost = new Float32Array(H);
      const rowLum = new Float32Array(H);
      const rowInk = new Float32Array(H);
      const rowEdge = new Float32Array(H);
      const rowDev = new Float32Array(H);
      for (let y = 0; y < H; y++) {
        let edges = 0, mean = 0, sat = 0;
        for (let x = 0; x < W; x++) {
          const p = y * W + x;
          const v = lum[p];
          mean += v;
          const hi = Math.max(rgb[0][p], rgb[1][p], rgb[2][p]);
          const lo = Math.min(rgb[0][p], rgb[1][p], rgb[2][p]);
          sat += hi > 0 ? (hi - lo) / hi : 0;
          if (x > 0) edges += Math.abs(v - lum[p - 1]);
          if (y > 0) edges += Math.abs(v - lum[p - W]);
        }
        mean /= W;
        let variance = 0, strokes = 0;
        for (let x = 0; x < W; x++) {
          const d = lum[y * W + x] - mean;
          variance += d * d;
          // A row carrying a baked-in greeting is flat ground pierced by thin
          // letter strokes — counting them keeps type off stock artwork text.
          if (Math.abs(d) > 55) strokes++;
        }
        // Three reasons a row is a bad place for type:
        //  1. detail/edges — it is line art or ornament
        //  2. colour spread — it is a painted figure rather than plain paper
        //  3. very dark — the deep maroon / gold / brown palette disappears
        // Flat but heavily saturated areas (a solid gold deity body) are caught
        // by (2), which plain variance happily accepts as "clean".
        const saturation = sat / W;
        const clutter = Math.max(0, saturation - 0.35) * 90;
        const darkness = mean < 150 ? (150 - mean) * 0.25 : 0;
        const ink = strokes / W;
        rowInk[y] = ink;
        // Texture is kept apart from the cost because "needs a panel" is judged
        // on messiness alone — darkness is not messiness, ivory type reads fine
        // on deep maroon.
        rowEdge[y] = edges / W;
        rowDev[y] = Math.sqrt(variance / W);
        rowCost[y] = edges / W + Math.sqrt(variance / W) * 0.9 + clutter + darkness + Math.min(ink, 0.3) * 70;
        rowLum[y] = mean;
      }

      const smooth = new Float32Array(H);
      for (let y = 0; y < H; y++) {
        let sum = 0, n = 0;
        for (let k = -2; k <= 2; k++) {
          const yy = y + k;
          if (yy >= 0 && yy < H) { sum += rowCost[yy]; n++; }
        }
        smooth[y] = sum / n;
      }

      // Prefer a tall band, but drop to a compact one on busy artwork rather than
      // forcing text over the illustration.
      const candidates = [0.5, 0.42, 0.34, 0.28, 0.22].map((f) => {
        const win = Math.max(10, Math.round(H * f));
        let start = Math.round(H * 0.05);
        let cost = Infinity;
        for (let s = 0; s + win <= H; s++) {
          // Keep clear of the decorative borders most templates carry.
          if (s < H * 0.05 || s + win > H * 0.95) continue;
          let total = 0;
          for (let y = s; y < s + win; y++) total += smooth[y];
          total /= win;
          if (total < cost) { cost = total; start = s; }
        }
        return { win, start, cost };
      });

      const floor = Math.min(...candidates.map((c) => c.cost));
      const chosen = candidates.find((c) => c.cost <= floor * 1.12) || candidates[candidates.length - 1];

      // The stacked invitation is usually taller than the band it was placed in,
      // so judge colour and backdrop against the whole area the type covers.
      const pad = Math.round(H * 0.09);
      const r0 = Math.max(0, chosen.start - pad);
      const r1 = Math.min(H, chosen.start + chosen.win + pad);
      const rows = Math.max(1, r1 - r0);
      let lumTotal = 0, inkTotal = 0, edgeTotal = 0, devTotal = 0;
      for (let y = r0; y < r1; y++) {
        lumTotal += rowLum[y];
        inkTotal += rowInk[y];
        edgeTotal += rowEdge[y];
        devTotal += rowDev[y];
      }
      const meanLum = lumTotal / rows;

      resolve({
        start: Math.round((chosen.start / H) * 100),
        end: Math.round(((chosen.start + chosen.win) / H) * 100),
        luminance: meanLum,
        // Cases where the type cannot be trusted on the artwork on its own, so a
        // panel goes behind it:
        //  · photography or dense ornament — far too much local detail to fight
        //  · a greeting baked into the image itself
        //  · a mid-tone ground — too dark for maroon and too light for ivory at
        //    the same time, so no single colour reads on both the light and the
        //    dark parts of the band
        busy: devTotal / rows > 15 || edgeTotal / rows > 14 || inkTotal / rows > 0.06
          || (meanLum > 92 && meanLum < 196),
      });
    } catch {
      resolve(fallback);
    }
  };
  img.onerror = () => resolve(fallback);
  img.src = src;
});

const TEMPLATE_IMAGES = {
  wedding: '/templates/wedding-01.png',
  engagement: '/templates/engagement-01.png',
  haldi: '/templates/haldi-01.png',
  mehndi: '/templates/mehndi-01.png',
  sangeet: '/templates/sangeet-01.png',
  reception: '/templates/reception-01.png',
  ganpati: '/templates/ganpati-01.png',
  navratri: '/templates/navratri-01.png',
  'durga-puja': '/templates/durgapuja-02.png',
  diwali: '/templates/diwali-01.png',
  holi: '/templates/holi-01.png',
  janmashtami: '/templates/janmashtami-01.png',
  birthday: '/templates/birthday-01.png',
};

// Sample text for each festival in English, Hindi, and Marathi
const SAMPLE_TEXT = {
  ganpati: {
    english: { blessingLine: '॥ Shri Ganeshay Namah ॥', hostName: 'Shri & Sau. Deshmukh Family', message: 'warmly invites you to\nGanpati Bappa\'s arrival at our home', eventName: 'Ganesh Chaturthi', dateLabel: 'Sthapana', date: 'Monday, 14 September 2026', aartiTimes: 'Aarti — 7:00 AM & 7:30 PM daily', visarjanLabel: 'Visarjan', visarjanDate: 'Friday, 25 September 2026', venue: '101, Shivsagar Society,\nThane (W)', closingLine: 'Ganpati Bappa Morya' },
    hindi: { blessingLine: '॥ श्री गणेशाय नमः ॥', hostName: 'श्री. व श्रीमती देशमुख परिवार', message: 'हमारे घर श्री गणेश जी के\nआगमन के शुभ अवसर पर', eventName: 'गणेश चतुर्थी', dateLabel: 'प्राणप्रतिष्ठा', date: 'सोमवार, १४ सितंबर २०२६', aartiTimes: 'आरती — प्रातः ७:०० व सायं ७:३०', visarjanLabel: 'विसर्जन', visarjanDate: 'शुक्रवार, २५ सितंबर २०२६', venue: '१०१, शिवसागर सोसायटी,\nठाणे (प.)', closingLine: 'गणपति बाप्पा मोरया' },
    marathi: { blessingLine: '॥ श्री गणेशाय नमः ॥', hostName: 'श्री. व श्रीमती देशमुख कुटुंब', message: 'आमच्या घरी श्री गणेश मूर्तीच्या\nआगमनाच्या शुभ प्रसंगी', eventName: 'गणेश चतुर्थी', dateLabel: 'प्राणप्रतिष्ठा', date: 'सोमवार, १४ सप्टेंबर २०२६', aartiTimes: 'आरती — सकाळी ७:०० व संध्याकाळी ७:३०', visarjanLabel: 'विसर्जन', visarjanDate: 'शुक्रवार, २५ सप्टेंबर २०२६', venue: '१०१, शिवसागर सोसायटी,\nठाणे (प.)', closingLine: 'गणपती बाप्पा मोरया' },
  },
  wedding: {
    english: { blessingLine: '|| Shubh Vivah ||', hostName: 'Mr. & Mrs. Sharma', message: 'Request the pleasure of your company at the wedding of', groomName: 'Rahul', brideName: 'Priya', eventName: 'Wedding Ceremony', date: 'Sunday, 15 December 2026', aartiTimes: '7:00 PM onwards', venue: 'Grand Ballroom, Taj Hotel, Mumbai', closingLine: 'Your presence is our blessing' },
    hindi: { blessingLine: '|| शुभ विवाह ||', hostName: 'श्री और श्रीमती शर्मा', message: 'के विवाह समारोह में आपकी उपस्थिति की प्रार्थना करते हैं', groomName: 'राहुल', brideName: 'प्रिया', eventName: 'विवाह समारोह', date: 'रविवार, 15 दिसंबर 2026', aartiTimes: 'शाम 7:00 बजे से', venue: 'ग्रैंड बॉलरूम, ताज होटल, मुंबई', closingLine: 'आपकी उपस्थिति हमारा आशीर्वाद है' },
    marathi: { blessingLine: '|| शुभ विवाह ||', hostName: 'श्री आणि श्रीमती शर्मा', message: 'च्या विवाह सोहळ्यासाठी आपला सस्नेह आमंत्रण', groomName: 'राहुल', brideName: 'प्रिया', eventName: 'विवाह सोहळा', date: 'रविवार, 15 डिसेंबर 2026', aartiTimes: 'सायंकाळी 7:00 वाजतापासून', venue: 'ग्रँड बॉलरूम, ताज हॉटेल, मुंबई', closingLine: 'आपली उपस्थिति आमच्यासाठी आशीर्वाद आहे' },
  },
  birthday: {
    english: { blessingLine: 'You are invited!', hostName: "Aarav's Parents", message: 'Celebrate with us as our little one turns', eventName: "Aarav's Birthday Bash!", date: 'Saturday, 20 March 2026', aartiTimes: '4:00 PM - 7:00 PM', venue: 'Fun Zone, Andheri West, Mumbai', closingLine: 'Come dressed in your favorite superhero costume!' },
    hindi: { blessingLine: 'आपको आमंत्रित किया जाता है!', hostName: 'आरव के माता-पिता', message: 'हमारे छोटे के जन्मदिन पर हमारे साथ उत्सव मनाएं', eventName: 'आरव का जन्मदिन!', date: 'शनिवार, 20 मार्च 2026', aartiTimes: 'शाम 4:00 - 7:00 बजे', venue: 'फन जोन, अंधेरी वेस्ट, मुंबई', closingLine: 'अपने पसंदीदा सुपरहीरो कॉस्ट्यूम में आएं!' },
    marathi: { blessingLine: 'तुम्हाला आमंत्रित!', hostName: 'आरवचे आई-वडील', message: 'आपल्या लाडाच्या वाढदिवसाच्या सोहळ्यात सामील व्हा', eventName: 'आरवचा वाढदिवस!', date: 'शनिवार, 20 मार्च 2026', aartiTimes: 'सायंकाळी 4:00 - 7:00', venue: 'फन झोन, अंधेरी वेस्ट, मुंबई', closingLine: 'आपल्या आवडत्या सुपरहिरो कॉस्ट्यूममध्ये या!' },
  },
  diwali: {
    english: { blessingLine: '|| Shubh Deepavali ||', hostName: 'Sharma Family', message: 'Invite you to celebrate the festival of lights with', eventName: 'Diwali Celebration', date: 'Monday, 4 November 2026', aartiTimes: '6:30 PM onwards', venue: 'Residence, Vasant Vihar, New Delhi', closingLine: 'May the light illuminate your life' },
    hindi: { blessingLine: '|| शुभ दीपावली ||', hostName: 'शर्मा परिवार', message: 'दीपों के त्योहार को मनाने के लिए आमंत्रित करते हैं', eventName: 'दीवाली उत्सव', date: 'सोमवार, 4 नवंबर 2026', aartiTimes: 'शाम 6:30 बजे से', venue: 'निवास, वसंत विहार, नई दिल्ली', closingLine: 'प्रकाश आपके जीवन को रोशन करे' },
    marathi: { blessingLine: '|| शुभ दिवाळी ||', hostName: 'शर्मा परिवार', message: 'दिव्यांच्या सणाच्या جشن मध्ये सामील व्हा', eventName: 'दिवाळी उत्सव', date: 'सोमवार, 4 नोव्हेंबर 2026', aartiTimes: 'सायंकाळी 6:30 वाजतापासून', venue: 'निवास, वसंत विहार, नवी दिल्ली', closingLine: 'प्रकाश तुमचे जीवन प्रकाशित करो' },
  },
  holi: {
    english: { blessingLine: '|| Holi Hai! ||', hostName: 'Verma Family', message: 'Join us for a colorful celebration of', eventName: 'Holi Festival', date: 'Saturday, 14 March 2026', aartiTimes: '10:00 AM - 4:00 PM', venue: 'Community Center, Sector 22, Chandigarh', closingLine: 'Wear white and bring your colors!' },
    hindi: { blessingLine: '|| होली है! ||', hostName: 'वर्मा परिवार', message: 'के रंगीन त्योहार में हमारे साथ शामिल हों', eventName: 'होली उत्सव', date: 'शनिवार, 14 मार्च 2026', aartiTimes: 'सुबह 10:00 - शाम 4:00', venue: 'कम्युनिटी सेंटर, सेक्टर 22, चंडीगढ़', closingLine: 'सफेद पहनें और अपने रंग लाएं!' },
    marathi: { blessingLine: '|| होली आहे! ||', hostName: 'वर्मा परिवार', message: 'च्या रंगीत सणात सामील व्हा', eventName: 'होली उत्सव', date: 'शनिवार, 14 मार्च 2026', aartiTimes: 'सकाळी 10:00 - सायंकाळी 4:00', venue: 'कम्युनिटी सेंटर, सेक्टर 22, चंदिगढ़', closingLine: 'पांढरे परिधान करा आणि रंग आणा!' },
  },
  navratri: {
    english: { blessingLine: '|| Jai Mata Di ||', hostName: 'Sharma Family', message: 'Cordially invite you to join us for', eventName: 'Navratri Garba Night', date: 'Friday, 3 October 2026', aartiTimes: '7:00 PM onwards', venue: 'Community Hall, Sector 15, Noida', closingLine: 'Dress in traditional attire' },
    hindi: { blessingLine: '|| जय माता दी ||', hostName: 'शर्मा परिवार', message: 'में हमारे साथ शामिल होने के लिए सादर आमंत्रित करते हैं', eventName: 'नवरात्रि गरबा नाइट', date: 'शुक्रवार, 3 अक्टूबर 2026', aartiTimes: 'शाम 7:00 बजे से', venue: 'कम्युनिटी हॉल, सेक्टर 15, नोएडा', closingLine: 'पारंपरिक वेशभूषा में आएं' },
    marathi: { blessingLine: '|| जय माता दी ||', hostName: 'शर्मा परिवार', message: 'मध्ये सामील होण्यासाठी सादर आमंत्रण', eventName: 'नवरात्री गरबा नाईट', date: 'शुक्रवार, 3 ऑक्टोबर 2026', aartiTimes: 'सायंकाळी 7:00 वाजतापासून', venue: 'कम्युनिटी हॉल, सेक्टर 15, नोएडा', closingLine: 'पारंपारिक वेशभूषेत या' },
  },
  engagement: {
    english: { blessingLine: '|| Shubh Sagai ||', hostName: 'Mr. & Mrs. Gupta', message: 'Request the honor of your presence at the engagement of', groomName: 'Vikram', brideName: 'Ananya', eventName: 'Ring Ceremony', date: 'Saturday, 14 February 2026', aartiTimes: '6:00 PM onwards', venue: 'The Leela Palace, New Delhi', closingLine: 'Your blessings make it complete' },
    hindi: { blessingLine: '|| शुभ सगाई ||', hostName: 'श्री और श्रीमती गुप्ता', message: 'की सगाई समारोह में आपकी उपस्थिति की प्रार्थना करते हैं', groomName: 'विक्रम', brideName: 'अनन्या', eventName: 'सगाई समारोह', date: 'शनिवार, 14 फरवरी 2026', aartiTimes: 'शाम 6:00 बजे से', venue: 'द लीला पैलेस, नई दिल्ली', closingLine: 'आपका आशीर्वाद इसे पूरा बनाए' },
    marathi: { blessingLine: '|| शुभ साखरपुडा ||', hostName: 'श्री आणि श्रीमती गुप्ता', message: 'च्या साखरपुडा सोहळ्यासाठी सादर आमंत्रण', groomName: 'विक्रम', brideName: 'अनन्या', eventName: 'साखरपुडा सोहळा', date: 'शनिवार, 14 फेब्रुवारी 2026', aartiTimes: 'सायंकाळी 6:00 वाजतापासून', venue: 'द लीला पॅलेस, नवी दिल्ली', closingLine: 'आपले आशीर्वाद हा सोहळा पूर्ण करतील' },
  },
  haldi: {
    english: { blessingLine: '|| Shubh Vivah ||', hostName: 'Both Families', message: 'Join us for the colorful celebration of', groomName: 'Arjun', brideName: 'Sneha', eventName: 'Haldi Ceremony', date: 'Friday, 20 March 2026', aartiTimes: '10:00 AM onwards', venue: 'Farmhouse, Chhatarpur, New Delhi', closingLine: 'Wear yellow and join the fun!' },
    hindi: { blessingLine: '|| शुभ विवाह ||', hostName: 'दोनों परिवार', message: 'के रंगीन समारोह में हमारे साथ शामिल हों', groomName: 'अर्जुन', brideName: 'स्नेहा', eventName: 'हल्दी समारोह', date: 'शुक्रवार, 20 मार्च 2026', aartiTimes: 'सुबह 10:00 बजे से', venue: 'फार्महाउस, छतरपुर, नई दिल्ली', closingLine: 'पीले पहनें और मस्ती में शामिल हों!' },
    marathi: { blessingLine: '|| शुभ विवाह ||', hostName: 'दोन्ही कुटुंब', message: 'च्या रंगीत समारंभात सामील व्हा', groomName: 'अर्जुन', brideName: 'स्नेहा', eventName: 'हळदी समारंभ', date: 'शुक्रवार, 20 मार्च 2026', aartiTimes: 'सकाळी 10:00 वाजतापासून', venue: 'फार्महाऊस, छतरपूर, नवी दिल्ली', closingLine: 'पिवळे परिधान करा आणि मजेत सामील व्हा!' },
  },
  mehndi: {
    english: { blessingLine: '|| Mehndi Raachao ||', hostName: 'Verma Family', message: 'Invite you to the beautiful evening of', eventName: 'Mehndi Ceremony', date: 'Wednesday, 11 February 2026', aartiTimes: '6:00 PM onwards', venue: 'Rose Garden, Jaipur', closingLine: 'Come get henna and celebrate!' },
    hindi: { blessingLine: '|| मेहँदी रचाओ ||', hostName: 'वर्मा परिवार', message: 'के सुंदर कार्यक्रम में आपका स्वागत है', eventName: 'मेहँदी समारोह', date: 'बुधवार, 11 फरवरी 2026', aartiTimes: 'शाम 6:00 बजे से', venue: 'रोज गार्डन, जयपुर', closingLine: 'मेहँदी लगवाएं और जश्न मनाएं!' },
    marathi: { blessingLine: '|| मेहंदी रचवा ||', hostName: 'वर्मा कुटुंब', message: 'च्या सुंदर कार्यक्रमात आपले स्वागत आहे', eventName: 'मेहँदी समारंभ', date: 'बुधवार, 11 फेब्रुवारी 2026', aartiTimes: 'सायंकाळी 6:00 वाजतापासून', venue: 'रोज गार्डन, जयपूर', closingLine: 'मेहंदी काढा आणि जल्लोष साजरा करा!' },
  },
  sangeet: {
    english: { blessingLine: 'Sangeet Night', hostName: 'Sharma Family', message: 'Cordially invite you to dance the night away at', eventName: 'Sangeet Ceremony', date: 'Friday, 13 February 2026', aartiTimes: '7:00 PM onwards', venue: 'Grand Banquet, Mumbai', closingLine: 'Dress to dazzle!' },
    hindi: { blessingLine: 'संगीत की रात', hostName: 'शर्मा परिवार', message: 'में नाचते हुए रात बिताने के लिए सादर आमंत्रित', eventName: 'संगीत समारोह', date: 'शुक्रवार, 13 फरवरी 2026', aartiTimes: 'शाम 7:00 बजे से', venue: 'ग्रैंड बैंक्वेट, मुंबई', closingLine: 'चमकने के लिए तैयार हों!' },
    marathi: { blessingLine: 'संगीताची रात्र', hostName: 'शर्मा कुटुंब', message: 'मध्ये नाचत रात्र काढण्यासाठी सादर आमंत्रण', eventName: 'संगीत समारंभ', date: 'शुक्रवार, 13 फेब्रुवारी 2026', aartiTimes: 'सायंकाळी 7:00 वाजतापासून', venue: 'ग्रँड बँक्वेट, मुंबई', closingLine: 'तेजस्वी दिसण्यासाठी तयार व्हा!' },
  },
  reception: {
    english: { blessingLine: 'Reception', hostName: 'Mr. & Mrs. Sharma', message: 'Request the pleasure of your company at the wedding reception of', groomName: 'Rahul', brideName: 'Priya', eventName: 'Wedding Reception', date: 'Saturday, 20 February 2026', aartiTimes: '7:00 PM onwards', venue: 'Grand Ballroom, Taj Hotel, Mumbai', closingLine: 'Cocktails, dinner & dancing await!' },
    hindi: { blessingLine: 'रिसेप्शन', hostName: 'श्री और श्रीमती शर्मा', message: 'के विवाह रिसेप्शन में आपकी उपस्थिति की प्रार्थना करते हैं', groomName: 'राहुल', brideName: 'प्रिया', eventName: 'विवाह रिसेप्शन', date: 'शनिवार, 20 फरवरी 2026', aartiTimes: 'शाम 7:00 बजे से', venue: 'ग्रैंड बॉलरूम, ताज होटल, मुंबई', closingLine: 'कॉकटेल, डिनर और नाच की रात!' },
    marathi: { blessingLine: 'रिसेप्शन', hostName: 'श्री आणि श्रीमती शर्मा', message: 'च्या विवाह रिसेप्शनसाठी सादर आमंत्रण', groomName: 'राहुल', brideName: 'प्रिया', eventName: 'विवाह रिसेप्शन', date: 'शनिवार, 20 फेब्रुवारी 2026', aartiTimes: 'सायंकाळी 7:00 वाजतापासून', venue: 'ग्रँड बॉलरूम, ताज हॉटेल, मुंबई', closingLine: 'कॉकटेल, जेवण आणि नृत्याची रात्र!' },
  },
  'durga-puja': {
    english: { blessingLine: '|| Durga Mata Ki Jai ||', hostName: 'Bose Family', message: 'Cordially invite you to celebrate', eventName: 'Durga Puja', date: 'Friday, 9 October 2026', aartiTimes: 'Pushpanjali — 12:00 PM', venue: 'Community Pandal, Kolkata', closingLine: 'Shubho Bijoya!' },
    hindi: { blessingLine: '॥ दुर्गा माता की जय ॥', hostName: 'बोस परिवार', message: 'दुर्गा पूजा मनाने के लिए सादर आमंत्रित करते हैं', eventName: 'दुर्गा पूजा', date: 'शुक्रवार, 9 अक्टूबर 2026', aartiTimes: 'पुष्पांजलि — दोपहर 12:00', venue: 'कम्युनिटी पंडाल, कोलकाता', closingLine: 'शुभो बिजोया!' },
    marathi: { blessingLine: '॥ दुर्गा माता की जय ॥', hostName: 'बोस कुटुंब', message: 'दुर्गा पूजा साजरी करण्यासाठी सादर आमंत्रण', eventName: 'दुर्गा पूजा', date: 'शुक्रवार, 9 ऑक्टोबर 2026', aartiTimes: 'पुष्पांजली — दुपारी 12:00', venue: 'कम्युनिटी पंडाल, कोलकाता', closingLine: 'शुभो बिजोया!' },
  },
  janmashtami: {
    english: { blessingLine: '|| Hare Krishna ||', hostName: 'Patel Family', message: 'Invite you to celebrate the divine birth of', eventName: 'Shri Krishna Janmashtami', date: 'Monday, 24 August 2026', aartiTimes: 'Midnight Aarti — 12:00 AM', venue: 'ISKCON Temple, Juhu, Mumbai', closingLine: 'Come dressed as Radha-Krishna' },
    hindi: { blessingLine: '॥ हरे कृष्ण ॥', hostName: 'पटेल परिवार', message: 'श्री कृष्ण जन्मोत्सव में आमंत्रित करते हैं', eventName: 'श्री कृष्ण जन्माष्टमी', date: 'सोमवार, 24 अगस्त 2026', aartiTimes: 'मध्यरात्रि आरती — 12:00 बजे', venue: 'इस्कॉन मंदिर, जुहू, मुंबई', closingLine: 'राधा-कृष्ण के वेश में आएं' },
    marathi: { blessingLine: '॥ हरे कृष्ण ॥', hostName: 'पटेल कुटुंब', message: 'श्री कृष्ण जन्माच्या पर्वाच्या जल्लोषासाठी आमंत्रण', eventName: 'श्री कृष्ण जन्माष्टमी', date: 'सोमवार, 24 ऑगस्ट 2026', aartiTimes: 'मध्यरात्री आरती — 12:00', venue: 'इस्कॉन मंदिर, जुहू, मुंबई', closingLine: 'राधा-कृष्ण वेशात या' },
  },
};

// Fallback sample for any category not explicitly translated — uses the real category title so "Festival Celebration" never appears
const getDefaultSample = (category, language = 'english') => {
  const config = getFestivalFields(category);
  const title = (language === 'hindi' && config.titleHi)
    || (language === 'marathi' && config.titleMr)
    || config.title
    || 'Celebration';
  const samples = {
    english: { blessingLine: `|| ${title} ||`, hostName: 'Host Family', message: 'Invite you to celebrate', eventName: title, dateLabel: 'Join us!', date: 'Sunday, 1 January 2026', aartiTimes: '10:00 AM onwards', visarjanLabel: 'Closing', visarjanDate: 'Sunday, 8 January 2026', venue: 'Venue Address', closingLine: 'With love and joy' },
    hindi: { blessingLine: `॥ ${title} ॥`, hostName: 'मेजबान परिवार', message: 'आपको इस खास मौके पर आमंत्रित करते हैं', eventName: title, dateLabel: 'हमारे साथ जुड़ें!', date: 'रविवार, 1 जनवरी 2026', aartiTimes: 'सुबह 10:00 बजे से', visarjanLabel: 'समापन', visarjanDate: 'रविवार, 8 जनवरी 2026', venue: 'स्थान का पता', closingLine: 'प्रेम और खुशी के साथ' },
    marathi: { blessingLine: `॥ ${title} ॥`, hostName: 'यजमान परिवार', message: 'या खास प्रसंगी आमंत्रित', eventName: title, dateLabel: 'आमच्यासोबत सामील व्हा!', date: 'रविवार, 1 जानेवारी 2026', aartiTimes: 'सकाळी 10:00 वाजतापासून', visarjanLabel: 'समापन', visarjanDate: 'रविवार, 8 जानेवारी 2026', venue: 'स्थान पत्ता', closingLine: 'प्रेम आणि आनंदाने' },
  };
  // The occasion's own ritual vocabulary (Vrat Katha, Sandhya Arghya, Gudi
  // Stapana…) ships as field placeholders, so reuse it as the sample copy —
  // a Karva Chauth card never reads like a Ganpati one.
  const ritual = {};
  config.fields.forEach((f) => { ritual[f.key] = f.placeholder; });
  const base = samples[language] || samples.english;
  return {
    ...base,
    blessingLine: ritual.blessingLine || base.blessingLine,
    eventName: title,
    dateLabel: language === 'english' ? (ritual.dateLabel || base.dateLabel) : base.dateLabel,
    aartiTimes: language === 'english' ? (ritual.aartiTimes || base.aartiTimes) : base.aartiTimes,
    closingLine: language === 'english' ? (ritual.closingLine || base.closingLine) : base.closingLine,
  };
};

const CustomizePage = () => {
  const { templateId } = useParams();
  const id = templateId;
  const navigate = useNavigate();
  const previewRef = useRef(null);

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form data
  const [formData, setFormData] = useState({});

  // Per-field font config
  const [fieldFonts, setFieldFonts] = useState({});

  // Per-field font size config
  const [fieldSizes, setFieldSizes] = useState({});

  // Palette colour chosen by the user (null = auto). Custom hex kept separately.
  const [userTextColor, setUserTextColor] = useState(null);
  const [customTextColor, setCustomTextColor] = useState(null);

  // Typography preset applied to every line at once
  const [textStyleId, setTextStyleId] = useState('classic');
  // Backdrop panel behind the text block — null means "let the artwork decide"
  const [textBoardId, setTextBoardId] = useState(null);
  // Background-music voice selection
  const [musicStyle, setMusicStyle] = useState('auto');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const musicCtxRef = useRef(null);

  // Cleanest band of the artwork for the text block, auto-detected per template
  const [autoBand, setAutoBand] = useState({ start: 6, end: 52, luminance: 235, busy: false });
  // Manual vertical nudge in percentage points, applied on top of the auto band
  const [textNudge, setTextNudge] = useState(0);

  // Live width of the preview card, so the preview scales exactly like the video
  const [previewWidth, setPreviewWidth] = useState(PREVIEW_CARD_WIDTH);

  // Audio toggle for video bundle
  const [includeAudio, setIncludeAudio] = useState(true);

  // Watermark
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('GuestInvitation');

  // Preview animation mute (petals on/off)
  const [isMuted, setIsMuted] = useState(false);

  // Payment modal: { type: 'image' | 'video', amount }
  const [paymentModal, setPaymentModal] = useState(null);
  const [paying, setPaying] = useState(false);

  // LocalStorage-based payment tracking (no backend required)
  const getPaidTemplates = () => {
    try {
      return JSON.parse(localStorage.getItem('guestinvitation_paid') || '{}');
    } catch { return {}; }
  };
  const isPaidFor = (slug, type) => {
    const paid = getPaidTemplates();
    return paid[slug] === 'video' || paid[slug] === type;
  };
  const markPaid = (slug, type) => {
    const paid = getPaidTemplates();
    if (paid[slug] !== 'video') paid[slug] = type;
    localStorage.setItem('guestinvitation_paid', JSON.stringify(paid));
  };

  // Language
  const [language, setLanguage] = useState('english');

  // Load sample text when language changes
  useEffect(() => {
    if (template) {
      const category = template.category || 'ganpati';
      const sample = SAMPLE_TEXT[category]?.[language] || getDefaultSample(category, language);
      setFormData(sample);
    }
  }, [language, template]);

  // Reset the look-and-feel choices when switching templates.
  // null = "Auto (best fit)", so every new artwork re-decides its own panel.
  useEffect(() => {
    setUserTextColor(null);
    setCustomTextColor(null);
    setTextStyleId('classic');
    setTextBoardId(null);
    setFieldFonts({});
    setFieldSizes({});
  }, [id]);

  // Use TEMPLATES from data/templates.js as the single source of truth — no backend needed
  // Memoised: with 1 800+ templates re-creating this array on every render is expensive.
  const fallbackTemplates = useMemo(() => TEMPLATES.map(t => ({
    id: t._id,
    slug: t.slug,
    category: t.category,
    name: t.name,
    price: t.price,
    videoPrice: t.videoPrice,
    previewImage: t.previewImage,
    recommendedColor: t.recommendedColor,
  })), []);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    const found = fallbackTemplates.find(t => t.id === id || t.slug === id);
    if (found) {
      const fullTemplate = TEMPLATES.find(t => t._id === found.id || t.slug === found.slug);
      setTemplate({
        ...found,
        previewImage: fullTemplate?.previewImage || found.previewImage || '/templates/ganpati-01.png',
        language: fullTemplate?.language || 'english',
        recommendedColor: fullTemplate?.recommendedColor || 'royal-maroon',
      });
    }
    setLoading(false);
  }, [id]);

  const category = template?.category || 'ganpati';
  const occasionConfig = getFestivalFields(category);
  const fields = occasionConfig.fields;
  const templateColor = TEXT_COLORS[template?.recommendedColor] ? template.recommendedColor : 'royal-maroon';

  // ---- Backdrop board -----------------------------------------------------
  // A board guarantees legibility on artwork that has no clean region, so the
  // type colour is decided *against the board* rather than against the art.
  // Until the user picks one, the artwork itself decides: photos, dense ornament
  // and any greeting baked into the image get a panel; clean art does not.
  const activeBoardId = textBoardId || (autoBand.busy ? 'cream' : 'none');
  const board = TEXT_BOARDS.find((b) => b.id === activeBoardId) || TEXT_BOARDS[0];
  const boardStyle = VIDEO_BOARD_STYLES[board.id];

  const groundLuminance = boardStyle
    ? (board.dark ? 30 : 240)
    : autoBand.luminance;

  const contrastTarget = boardStyle ? 4.5 : 3.6;

  // Colours allowed on a light board must be dark enough; on a dark board, light.
  const colourPool = (() => {
    if (!boardStyle) return TEXT_COLORS;
    const pool = {};
    Object.entries(TEXT_COLORS).forEach(([key, val]) => {
      const lum = hexLuminance(val.color);
      if (board.dark ? lum > 150 : lum < 165) pool[key] = val;
    });
    return Object.keys(pool).length ? pool : TEXT_COLORS;
  })();

  // Keep the template's suggested colour when it actually reads against the
  // artwork; otherwise fall back to whichever palette entry contrasts best.
  const autoColorKey = (() => {
    const recommendedLum = hexLuminance(TEXT_COLORS[templateColor].color);
    const recommendedContrast = contrastAgainst(recommendedLum, groundLuminance);
    if (recommendedContrast >= contrastTarget) return templateColor;
    let bestKey = templateColor;
    let bestContrast = recommendedContrast;
    Object.entries(colourPool).forEach(([key, val]) => {
      const c = contrastAgainst(hexLuminance(val.color), groundLuminance);
      if (c > bestContrast) { bestContrast = c; bestKey = key; }
    });
    return bestKey;
  })();

  const userColorKey = customTextColor ? null : userTextColor;
  const activeTextColor = customTextColor ? null : (userColorKey || autoColorKey);
  const textColorValue = customTextColor
    || TEXT_COLORS[activeTextColor]?.color
    || TEXT_COLORS[autoColorKey]?.color
    || '#800020';

  // The halo has to oppose the type: light letters need a dark halo, and vice versa.
  // On a solid board the panel already does the work, so the glow is dialled right down.
  const textIsLight = hexLuminance(textColorValue) > groundLuminance;
  const haloAlpha = boardStyle ? 0.28 : 0.9;
  const textHalo = textIsLight
    ? `rgba(0,0,0,${Math.min(0.65, 0.72 * haloAlpha + 0.08)})`
    : `rgba(255,255,255,${Math.min(0.92, 0.98 * haloAlpha + 0.06)})`;
  const textOutline = textIsLight
    ? `rgba(0,0,0,${0.5 * haloAlpha})`
    : `rgba(255,255,255,${0.85 * haloAlpha})`;
  const boardCss = board.id === 'none' ? null : board.css;
  const templateImage = template?.previewImage || TEMPLATE_IMAGES[category] || '/templates/ganpati-01.png';

  // Re-detect the cleanest text band whenever the artwork changes
  useEffect(() => {
    let cancelled = false;
    setTextNudge(0);
    analyzeTextBand(templateImage).then((band) => {
      if (!cancelled && band) setAutoBand(band);
    });
    return () => { cancelled = true; };
  }, [templateImage]);

  // Final band after the user's nudge, kept inside the card
  const textBand = {
    start: clampBand(autoBand.start + textNudge, 2, 90),
    end: clampBand(autoBand.end + textNudge, 10, 97),
  };


  // Template navigation (prev / next) — memoised so 1 800+ .findIndex is not repeated on every render.
  const currentIndex = useMemo(() => Math.max(0, fallbackTemplates.findIndex(t => t.slug === id || t.id === id)), [fallbackTemplates, id]);
  const totalTemplates = fallbackTemplates.length;
  const goToTemplate = (idx) => {
    const next = fallbackTemplates[(idx + totalTemplates) % totalTemplates];
    if (next) navigate(`/customize/${next.slug}`);
  };

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFontChange = (key, font) => {
    setFieldFonts(prev => ({ ...prev, [key]: font }));
  };

  const handleSizeChange = (key, size) => {
    setFieldSizes(prev => ({ ...prev, [key]: size }));
  };

  // One click re-types every line of the invitation from a curated preset.
  // A font picked per-field afterwards still overrides the preset for that line.
  const applyTextStyle = (styleId) => {
    const style = TEXT_STYLES.find((s) => s.id === styleId);
    if (!style) return;
    setTextStyleId(styleId);
    setFieldFonts({ ...style.fonts });
  };

  // Track the rendered preview width so the on-screen card and the exported
  // video use the identical layout (video is 720px wide by definition).
  useEffect(() => {
    const el = previewRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setPreviewWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [template]);
  const previewScale = previewWidth / PREVIEW_CARD_WIDTH;

  // Let the user hear the track before paying for the video export.
  const stopMusicPreview = () => {
    if (musicCtxRef.current) {
      try { musicCtxRef.current.close(); } catch (e) { /* ignore */ }
      musicCtxRef.current = null;
    }
    setMusicPlaying(false);
  };

  const playMusicPreview = async () => {
    if (musicPlaying) { stopMusicPreview(); return; }
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) { toast.error('Is browser mein music preview support nahi hai'); return; }
      const ctx = new Ctx();
      musicCtxRef.current = ctx;
      await ctx.resume();
      generateBackgroundMusic(ctx, 12, category, null, musicStyle);
      setMusicPlaying(true);
      setTimeout(() => { if (musicCtxRef.current === ctx) stopMusicPreview(); }, 12800);
    } catch (e) {
      console.error(e);
      toast.error('Music preview start nahi ho paya');
      stopMusicPreview();
    }
  };

  useEffect(() => () => stopMusicPreview(), []);

  // Default rendered size per editable field, used as the "M" reference for scaling
  const baseSizeFor = (key) => {
    if (key === 'groomName' || key === 'brideName') {
      return TEXT_STACK.find((i) => i.key === '__couple')?.size || 21;
    }
    return TEXT_STACK.find((i) => i.key === key)?.size || 15;
  };

  // Resolve the ordered text lines that currently have content.
  // Used by both the live preview and the video renderer.
  const getTextBlocks = () => TEXT_STACK.reduce((acc, item) => {
    const styleKey = item.key === '__couple' ? 'groomName' : item.key;
    let text;
    if (item.key === '__couple') {
      const parts = [formData.groomName, formData.brideName].filter(Boolean);
      text = parts.length ? parts.join('  &  ') : '';
    } else {
      text = formData[item.key];
    }
    if (!text || !String(text).trim()) return acc;
    const value = String(text);
    acc.push({
      key: item.key,
      text: value,
      size: fieldSizes[styleKey] || item.size,
      font: fieldFonts[styleKey] || item.font,
      weight: item.weight,
      opacity: item.opacity,
      letterSpacing: item.letterSpacing || 'normal',
      gap: item.gap,
      lines: value.split('\n').length,
    });
    return acc;
  }, []);

  // Video text blocks: stacked top-down inside the detected band so that
  // spacing matches the preview and lines can never overlap each other.
  const buildVideoTextBlocks = () => {
    const blocks = getTextBlocks();
    const heights = blocks.map((b) => b.lines * b.size * VIDEO_SCALE * 1.32 + b.gap * VIDEO_SCALE);
    const total = heights.reduce((sum, h) => sum + h, 0);
    // Text lives in the bottom 45% of the frame on a clean cream background.
    // Top padding starts at 60% so the blocks sit nicely in the lower band.
    const textTopFrac = 0.60;
    const textBottomFrac = 0.96;
    const bandTop = textTopFrac * VIDEO_HEIGHT;
    const bandH = (textBottomFrac - textTopFrac) * VIDEO_HEIGHT;
    const bandCenter = bandTop + bandH / 2;
    let y = bandCenter - total / 2;
    return blocks.map((b, i) => {
      const centerY = y + heights[i] / 2;
      y += heights[i];
      return { ...b, yPx: centerY, fontPx: b.size * VIDEO_SCALE };
    });
  };

  // Rich, Indian-themed background music using Web Audio API
  // Produces tanpura drone, sitar-like plucked melodies, tabla groove and temple bells.
  const generateBackgroundMusic = (audioCtx, durationSec, category = 'wedding', destinationNode = null, styleFilter = 'auto') => {
    // Raga-inspired scales (C-based for simplicity), drone root and groove tempo
    const MOODS = {
      wedding: { scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], drone: 130.81, tempo: 0.55, droneVol: 0.28, melodyVol: 0.18, tablaVol: 0.22, bell: true },
      engagement: { scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], drone: 130.81, tempo: 0.52, droneVol: 0.26, melodyVol: 0.18, tablaVol: 0.22, bell: true },
      haldi: { scale: [293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 523.25, 587.33], drone: 146.83, tempo: 0.42, droneVol: 0.24, melodyVol: 0.16, tablaVol: 0.24, bell: false },
      mehndi: { scale: [246.94, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33], drone: 123.47, tempo: 0.45, droneVol: 0.24, melodyVol: 0.17, tablaVol: 0.23, bell: false },
      sangeet: { scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25], drone: 130.81, tempo: 0.38, droneVol: 0.22, melodyVol: 0.18, tablaVol: 0.25, bell: false },
      reception: { scale: [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16, 523.25], drone: 130.81, tempo: 0.50, droneVol: 0.25, melodyVol: 0.16, tablaVol: 0.22, bell: true },
      ganpati: { scale: [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00], drone: 98.00, tempo: 0.36, droneVol: 0.30, melodyVol: 0.19, tablaVol: 0.24, bell: true },
      navratri: { scale: [220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25], drone: 110.00, tempo: 0.32, droneVol: 0.26, melodyVol: 0.18, tablaVol: 0.25, bell: true },
      'durga-puja': { scale: [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00], drone: 98.00, tempo: 0.34, droneVol: 0.28, melodyVol: 0.18, tablaVol: 0.24, bell: true },
      diwali: { scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25], drone: 130.81, tempo: 0.40, droneVol: 0.24, melodyVol: 0.18, tablaVol: 0.24, bell: true },
      holi: { scale: [246.94, 261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88], drone: 123.47, tempo: 0.34, droneVol: 0.22, melodyVol: 0.18, tablaVol: 0.25, bell: false },
      janmashtami: { scale: [220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25], drone: 110.00, tempo: 0.44, droneVol: 0.28, melodyVol: 0.17, tablaVol: 0.22, bell: true },
      birthday: { scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], drone: 130.81, tempo: 0.40, droneVol: 0.20, melodyVol: 0.18, tablaVol: 0.23, bell: false },
      'griha-pravesh': { scale: [261.63, 293.66, 329.63, 392.00, 440.00, 493.88, 523.25], drone: 130.81, tempo: 0.48, droneVol: 0.26, melodyVol: 0.16, tablaVol: 0.22, bell: true },
      'maha-shivratri': { scale: [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00], drone: 98.00, tempo: 0.44, droneVol: 0.30, melodyVol: 0.15, tablaVol: 0.20, bell: true },
      dussehra: { scale: [220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25], drone: 110.00, tempo: 0.40, droneVol: 0.26, melodyVol: 0.17, tablaVol: 0.24, bell: true },
    };
    // Occasions added later borrow the closest tuned raga rather than falling
    // back to the wedding mood, so a vrat reads devotional and a gala reads bright.
    const MOOD_ALIASES = {
      'ram-navami': 'ganpati',
      'makar-sankranti': 'diwali',
      pongal: 'diwali',
      onam: 'haldi',
      vaisakhi: 'navratri',
      gurpurab: 'ganpati',
      'buddha-purnima': 'maha-shivratri',
      'mahavir-jayanti': 'ganpati',
      paryushan: 'maha-shivratri',
      'eid-ul-fitr': 'haldi',
      'eid-ul-adha': 'haldi',
      muharram: 'maha-shivratri',
      'milad-un-nabi': 'maha-shivratri',
      christmas: 'diwali',
      easter: 'birthday',
      'good-friday': 'maha-shivratri',
      'karva-chauth': 'maha-shivratri',
      teej: 'janmashtami',
      'bhai-dooj': 'diwali',
      chhath: 'maha-shivratri',
      'gudi-padwa': 'ganpati',
      'saraswati-puja': 'janmashtami',
      annaprashan: 'ganpati',
      dhanteras: 'diwali',
      'raksha-bandhan': 'navratri',
      satyanarayan: 'ganpati',
      mundan: 'ganpati',
      naamkaran: 'ganpati',
      'thread-ceremony': 'ganpati',
      anniversary: 'reception',
      'baby-shower': 'birthday',
      'baby-announcement': 'birthday',
      retirement: 'griha-pravesh',
      farewell: 'birthday',
      'new-year': 'sangeet',
    };
    const mood = MOODS[category] || MOODS[MOOD_ALIASES[category]] || MOODS.wedding;
    const scale = mood.scale;
    const drone = mood.drone;
    const tempo = mood.tempo;
    const now = audioCtx.currentTime;

    // Layer balance per user-selected music style. 'auto' follows the occasion.
    const LAYERS = {
      auto: { drone: 1, sitar: 1, flute: 0.55, tabla: 1, bell: 1 },
      flute: { drone: 0.9, sitar: 0, flute: 1.25, tabla: 0.45, bell: 0.35 },
      sitar: { drone: 1, sitar: 1.3, flute: 0, tabla: 0.7, bell: 0.4 },
      bells: { drone: 0.75, sitar: 0.35, flute: 0.3, tabla: 0.25, bell: 1.9 },
      tabla: { drone: 0.8, sitar: 0.9, flute: 0.4, tabla: 1.6, bell: 0.3 },
    };
    const L = LAYERS[styleFilter] || LAYERS.auto;

    // Create a simple convolution reverb impulse (medium hall)
    const createReverb = () => {
      const length = audioCtx.sampleRate * 1.8;
      const impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) {
          const decay = Math.pow(1 - i / length, 2.2);
          data[i] = (Math.random() * 2 - 1) * decay * (ch === 0 ? 1 : 0.92);
        }
      }
      const convolver = audioCtx.createConvolver();
      convolver.buffer = impulse;
      return convolver;
    };

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.gain.linearRampToValueAtTime(0.22, now + 0.8);
    masterGain.gain.setValueAtTime(0.22, now + durationSec - 1.0);
    masterGain.gain.linearRampToValueAtTime(0, now + durationSec + 0.1);
    masterGain.connect(destinationNode || audioCtx.destination);

    const reverb = createReverb();
    const reverbGain = audioCtx.createGain();
    reverbGain.gain.value = 0.35;
    reverb.connect(reverbGain);
    reverbGain.connect(masterGain);

    // Helper: connect dry + wet
    const makeSend = (dryNode) => {
      dryNode.connect(masterGain);
      dryNode.connect(reverb);
    };

    // ── TANPURA DRONE ── continuous Sa-Pa-Sa with subtle movement
    const droneGroup = audioCtx.createGain();
    droneGroup.gain.value = mood.droneVol * L.drone;
    const droneOscs = [
      { f: drone, type: 'sine', vol: 1.0 },
      { f: drone * 1.5, type: 'sine', vol: 0.55 },
      { f: drone * 2, type: 'triangle', vol: 0.12 },
    ];
    droneOscs.forEach(({ f, type, vol }) => {
      const o = audioCtx.createOscillator();
      o.type = type;
      o.frequency.value = f + (Math.random() - 0.5) * 0.4;
      const g = audioCtx.createGain();
      g.gain.value = vol;
      o.connect(g);
      g.connect(droneGroup);
      o.start();
      o.stop(now + durationSec + 0.15);
    });
    // Slow tanpura amplitude swirl
    const droneLfo = audioCtx.createOscillator();
    droneLfo.frequency.value = 0.25;
    const droneLfoGain = audioCtx.createGain();
    droneLfoGain.gain.value = 0.08;
    droneLfo.connect(droneLfoGain);
    droneLfoGain.connect(droneGroup.gain);
    droneLfo.start();
    droneLfo.stop(now + durationSec + 0.15);
    makeSend(droneGroup);

    // ── SITAR-LIKE PLUCKED MELODY ── with pitch bend (meend) and jawari buzz
    const playSitar = (freq, startTime, dur = 0.55, vol = 1) => {
      const noteGain = audioCtx.createGain();
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(mood.melodyVol * vol * L.sitar, startTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      const saw = audioCtx.createOscillator();
      saw.type = 'sawtooth';
      saw.frequency.setValueAtTime(freq, startTime);
      // Slight meend (pitch slide)
      const bend = 1 + (Math.random() < 0.5 ? 1 : -1) * (0.03 + Math.random() * 0.04);
      saw.frequency.exponentialRampToValueAtTime(freq * bend, startTime + 0.18);
      saw.frequency.exponentialRampToValueAtTime(freq, startTime + dur * 0.7);

      // Jawari-style metallic buzz via filtered triangle overtone
      const tri = audioCtx.createOscillator();
      tri.type = 'triangle';
      tri.frequency.setValueAtTime(freq, startTime);
      const triGain = audioCtx.createGain();
      triGain.gain.value = 0.18;

      const pluckFilter = audioCtx.createBiquadFilter();
      pluckFilter.type = 'lowpass';
      pluckFilter.frequency.setValueAtTime(2400, startTime);
      pluckFilter.frequency.exponentialRampToValueAtTime(900, startTime + dur);

      saw.connect(pluckFilter);
      tri.connect(triGain);
      triGain.connect(pluckFilter);
      pluckFilter.connect(noteGain);
      makeSend(noteGain);

      saw.start(startTime);
      tri.start(startTime);
      saw.stop(startTime + dur + 0.05);
      tri.stop(startTime + dur + 0.05);
    };

    // ── BANSURI (flute) ── breathy sine with vibrato and a soft swelling attack
    const playFlute = (freq, startTime, dur = 0.9, vol = 1) => {
      const noteGain = audioCtx.createGain();
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(mood.melodyVol * 0.95 * vol * L.flute, startTime + dur * 0.22);
      noteGain.gain.setValueAtTime(mood.melodyVol * 0.85 * vol * L.flute, startTime + dur * 0.7);
      noteGain.gain.exponentialRampToValueAtTime(0.0005, startTime + dur);

      const body = audioCtx.createOscillator();
      body.type = 'sine';
      body.frequency.setValueAtTime(freq, startTime);
      // Expressive slide into the note, the way a flautist glides the breath
      body.frequency.exponentialRampToValueAtTime(freq, startTime + dur * 0.3);

      const harm = audioCtx.createOscillator();
      harm.type = 'triangle';
      harm.frequency.value = freq * 2;
      const harmGain = audioCtx.createGain();
      harmGain.gain.value = 0.07;

      // Vibrato at ~5.5 Hz
      const vib = audioCtx.createOscillator();
      vib.frequency.value = 5.5;
      const vibGain = audioCtx.createGain();
      vibGain.gain.value = freq * 0.006;
      vib.connect(vibGain);
      vibGain.connect(body.frequency);

      // Warm, rounded tone — a gentle lowpass keeps the edge off
      const tone = audioCtx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = 2200;
      tone.Q.value = 0.5;

      body.connect(tone);
      harm.connect(harmGain);
      harmGain.connect(tone);
      tone.connect(noteGain);
      makeSend(noteGain);

      body.start(startTime);
      harm.start(startTime);
      vib.start(startTime);
      body.stop(startTime + dur + 0.05);
      harm.stop(startTime + dur + 0.05);
      vib.stop(startTime + dur + 0.05);
    };

    // Compose melodic phrases (4-beat motifs) instead of random notes.
    // Sitar carries the phrase; on 'auto' a flute answers every second motif so
    // the tune has call-and-response instead of one flat voice.
    const motifLength = tempo * 4;
    const motifs = Math.floor(durationSec / motifLength);
    const fluteAnswers = L.flute > 0 && L.sitar > 0;
    for (let m = 0; m < motifs; m++) {
      const motifStart = now + m * motifLength;
      const rootIndex = Math.floor(Math.random() * (scale.length - 4));
      const motif = [0, 2, 1, 3, 2, 4, 3, 1].map(off => (rootIndex + off) % scale.length);
      const useFlute = fluteAnswers ? m % 2 === 1 : L.flute > 0 && L.sitar === 0;
      motif.forEach((noteIdx, i) => {
        const time = motifStart + i * (motifLength / 8);
        const freq = scale[noteIdx];
        if (useFlute) {
          // Flute phrasing is slower and more legato than a pluck
          if (i % 2 === 0) playFlute(freq, time, motifLength / 4, 0.9 + Math.random() * 0.15);
        } else {
          const dur = tempo * (1.2 + Math.random() * 0.6);
          playSitar(freq, time, dur, 0.9 + Math.random() * 0.2);
        }
      });
    }

    // ── TABLA PERCUSSION ── realistic bol patterns
    const playTablaBass = (startTime, vol = 1) => {
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(0.9 * mood.tablaVol * L.tabla * vol, startTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);
      const o = audioCtx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(130, startTime);
      o.frequency.exponentialRampToValueAtTime(48, startTime + 0.14);
      o.connect(g);
      makeSend(g);
      o.start(startTime);
      o.stop(startTime + 0.2);
    };

    const playTablaTone = (startTime, vol = 1) => {
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(0.7 * mood.tablaVol * L.tabla * vol, startTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
      const o = audioCtx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(420, startTime);
      o.frequency.exponentialRampToValueAtTime(280, startTime + 0.10);
      o.connect(g);
      makeSend(g);
      o.start(startTime);
      o.stop(startTime + 0.14);
    };

    const playTablaSlap = (startTime, vol = 1) => {
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(0.6 * mood.tablaVol * L.tabla * vol, startTime + 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
      const o = audioCtx.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(250, startTime);
      o.frequency.exponentialRampToValueAtTime(120, startTime + 0.06);
      o.connect(g);
      makeSend(g);
      o.start(startTime);
      o.stop(startTime + 0.1);
    };

    // Cycle through a few tabla thekas
    const thekas = [
      ['dha', 'tin', 'dha', 'dhin', 'na', 'dha', 'tin', 'na'],
      ['dha', 'dhin', 'dha', 'dhin', 'dha', 'tin', 'dha', 'na'],
      ['dha', 'na', 'dha', 'tin', 'na', 'dha', 'dhin', 'na'],
    ];
    const beats = L.tabla > 0 ? Math.floor(durationSec / tempo) : 0;
    for (let i = 0; i < beats; i++) {
      const t = now + i * tempo;
      const theka = thekas[i % thekas.length];
      const bol = theka[i % theka.length];
      if (bol === 'dha') playTablaBass(t, 1);
      else if (bol === 'tin') playTablaTone(t, 0.85);
      else if (bol === 'dhin') { playTablaBass(t, 0.6); playTablaTone(t, 0.5); }
      else if (bol === 'na') playTablaSlap(t, 0.9);
    }

    // ── TEMPLE BELLS / GHANTA ── for spiritual/festive categories
    if (mood.bell && L.bell > 0) {
      const bellTimes = Math.floor(durationSec / 1.6);
      for (let i = 0; i < bellTimes; i++) {
        const t = now + 0.4 + i * 1.6 + Math.random() * 0.2;
        const bellGain = audioCtx.createGain();
        bellGain.gain.setValueAtTime(0, t);
        bellGain.gain.linearRampToValueAtTime(0.06 * L.bell, t + 0.01);
        bellGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
        [1, 1.5, 2.0, 2.5].forEach((mult, idx) => {
          const o = audioCtx.createOscillator();
          o.type = 'sine';
          o.frequency.value = 880 * mult + (Math.random() - 0.5) * 3;
          const g = audioCtx.createGain();
          g.gain.value = 1 / (idx + 1.5);
          o.connect(g);
          g.connect(bellGain);
          o.start(t);
          o.stop(t + 1.5);
        });
        makeSend(bellGain);
      }
    }
  };

  // Generate a smooth animated video (canvas + MediaRecorder)
  const generateAnimatedVideo = (withWatermark, withMusic = true) => {
    return new Promise((resolve, reject) => {
      const W = 720, H = 1280;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      // Keep canvas in DOM (hidden) so captureStream produces frames reliably
      canvas.style.position = 'fixed';
      canvas.style.left = '-9999px';
      canvas.style.top = '-9999px';
      canvas.style.width = '1px';
      canvas.style.height = '1px';
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = templateImage;

      img.onload = () => {
        const blocks = buildVideoTextBlocks();
        const color = textColorValue;
        const DURATION = 9000; // 9 seconds
        const FPS = 30;

        // Category-specific particle palette
        const getParticlePalette = () => {
          switch (category) {
            case 'diwali': return ['#ff9f43', '#feca57', '#ff6b6b', '#48dbfb'];
            case 'holi': return ['#ff9ff3', '#feca57', '#54a0ff', '#5f27cd', '#ff6b6b'];
            case 'birthday': return ['#ff9ff3', '#feca57', '#54a0ff', '#5f27cd'];
            case 'ganpati': return ['#feca57', '#ff9f43', '#e8a0a8', '#f5c9a0'];
            case 'navratri': return ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1'];
            case 'mehndi': return ['#e8a0a8', '#f5c9a0', '#d63031', '#b8860b'];
            case 'haldi': return ['#feca57', '#f5c9a0', '#e8a0a8', '#b8860b'];
            case 'wedding':
            case 'engagement':
            case 'reception':
              return ['#e8a0a8', '#f5c9a0', '#ffffff', '#b8860b'];
            default: return ['#e8a0a8', '#f5c9a0', '#ffffff'];
          }
        };
        const palette = getParticlePalette();

        // Falling petals / confetti particles
        const petals = Array.from({ length: 34 }, () => ({
          x: Math.random() * W,
          y: Math.random() * -H,
          r: 5 + Math.random() * 11,
          speed: 1 + Math.random() * 2.4,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.01 + Math.random() * 0.025,
          color: palette[Math.floor(Math.random() * palette.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.08,
        }));

        // Floating lanterns / diyas for festival feel
        const floaters = Array.from({ length: 10 }, () => ({
          x: Math.random() * W,
          y: H + Math.random() * 200,
          r: 8 + Math.random() * 12,
          speed: 0.6 + Math.random() * 1.2,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.02 + Math.random() * 0.03,
          alpha: 0.3 + Math.random() * 0.4,
        }));

        // Sparkles
        const sparkles = Array.from({ length: 18 }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 1 + Math.random() * 2.5,
          phase: Math.random() * Math.PI * 2,
          speed: 0.003 + Math.random() * 0.004,
        }));

        // Create combined stream (video + optional audio)
        const videoStream = canvas.captureStream(FPS);
        const tracks = [...videoStream.getVideoTracks()];

        let audioCtx = null;
        let musicDestination = null;
        if (withMusic && includeAudio) {
          try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
              audioCtx = new AudioCtx();
              if (audioCtx.state === 'suspended') {
                audioCtx.resume();
              }
              musicDestination = audioCtx.createMediaStreamDestination();
              generateBackgroundMusic(audioCtx, DURATION / 1000, category, musicDestination, musicStyle);
              musicDestination.stream.getAudioTracks().forEach(t => tracks.push(t));
            }
          } catch (e) {
            console.warn('Audio generation failed:', e);
          }
        }

        const combinedStream = new MediaStream(tracks);
        let recorder;
        const mimeCandidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
        const mime = mimeCandidates.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
        try {
          recorder = new MediaRecorder(combinedStream, mime ? { mimeType: mime, videoBitsPerSecond: 5_000_000 } : undefined);
        } catch (e) {
          recorder = new MediaRecorder(combinedStream);
        }
        const chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
          if (audioCtx && audioCtx.state !== 'closed') {
            try { audioCtx.close(); } catch (e) { /* ignore */ }
          }
          const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
          if (blob.size === 0) {
            reject(new Error('Video recording produced an empty file. Please try again or disable background music.'));
          } else {
            resolve(blob);
          }
        };
        recorder.onerror = (e) => {
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
          reject(e);
        };

        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        const easeOutBack = (t) => {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };
        const roundRectPath = (x, y, w, h, r) => {
          const rr = Math.min(r, w / 2, h / 2);
          ctx.beginPath();
          ctx.moveTo(x + rr, y);
          ctx.lineTo(x + w - rr, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
          ctx.lineTo(x + w, y + h - rr);
          ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
          ctx.lineTo(x + rr, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
          ctx.lineTo(x, y + rr);
          ctx.quadraticCurveTo(x, y, x + rr, y);
          ctx.closePath();
        };

        // Pre-compute the backdrop panel geometry so the type always sits on it
        let boardRect = null;
        if (boardStyle && blocks.length) {
          let top = Infinity;
          let bottom = -Infinity;
          let maxW = 0;
          blocks.forEach((b) => {
            ctx.font = `${b.weight} ${Math.round(b.fontPx)}px '${b.font}', 'Tiro Devanagari Hindi', serif`;
            String(b.text).split('\n').forEach((line) => {
              maxW = Math.max(maxW, ctx.measureText(line).width);
            });
            const h = b.lines * b.fontPx * 1.32;
            top = Math.min(top, b.yPx - h / 2);
            bottom = Math.max(bottom, b.yPx + h / 2);
          });
          const padX = Math.max(26, Math.min(54, W * 0.1));
          const padY = 30;
          const halfW = Math.min(maxW, W * 0.84) / 2 + padX;
          boardRect = {
            x: Math.max(14, W / 2 - halfW),
            y: Math.max(14, top - padY),
            w: Math.min(W - 28, halfW * 2),
            h: Math.min(H - 28, (bottom - top) + padY * 2),
          };
        }

        // Draw a soft vignette to keep text readable over busy areas
        const drawVignette = () => {
          const grad = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(0.7, 'rgba(0,0,0,0.08)');
          grad.addColorStop(1, 'rgba(0,0,0,0.35)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        };

        const drawFrame = (elapsed) => {
          // Artwork in the top 55% of the frame, with a subtle Ken Burns zoom + pan
          const zoomProgress = elapsed / DURATION;
          const zoom = 1.03 + 0.05 * Math.sin(zoomProgress * Math.PI);
          const panX = 6 * Math.sin(zoomProgress * Math.PI * 2);
          const panY = 4 * Math.cos(zoomProgress * Math.PI * 2);
          const dw = W * zoom, dh = (H * 0.55) * zoom;
          ctx.clearRect(0, 0, W, H);

          // Clean cream base for the bottom 45% text area
          const baseGrad = ctx.createLinearGradient(0, 0, 0, H);
          baseGrad.addColorStop(0, '#fdf8f0');
          baseGrad.addColorStop(1, '#faf3e8');
          ctx.fillStyle = baseGrad;
          ctx.fillRect(0, 0, W, H);

          // Clip the artwork to the top 55% so it never bleeds into the text area
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, W, H * 0.55);
          ctx.clip();
          ctx.drawImage(img, (W - dw) / 2 + panX, ((H * 0.55) - dh) / 2 + panY, dw, dh);
          ctx.restore();

          // Soft blend between artwork and text area (45% to 60%)
          const blendGrad = ctx.createLinearGradient(0, H * 0.45, 0, H * 0.60);
          blendGrad.addColorStop(0, 'rgba(253,248,240,0)');
          blendGrad.addColorStop(0.5, 'rgba(253,248,240,0.35)');
          blendGrad.addColorStop(1, 'rgba(253,248,240,0.92)');
          ctx.fillStyle = blendGrad;
          ctx.fillRect(0, H * 0.45, W, H * 0.15);

          // Soft animated light rays from top
          const rayGrad = ctx.createLinearGradient(W / 2, -100, W / 2, H * 0.50);
          rayGrad.addColorStop(0, `rgba(255, 248, 220, ${0.12 + 0.08 * Math.sin(elapsed * 0.002)})`);
          rayGrad.addColorStop(1, 'rgba(255, 248, 220, 0)');
          ctx.fillStyle = rayGrad;
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, W, H * 0.55);
          ctx.clip();
          ctx.beginPath();
          ctx.moveTo(W * 0.2, -50);
          ctx.lineTo(W * 0.8, -50);
          ctx.lineTo(W * 0.55, H * 0.55);
          ctx.lineTo(W * 0.45, H * 0.55);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          drawVignette();

          // Floating lanterns / diyas rise upward
          floaters.forEach(f => {
            f.y -= f.speed;
            f.sway += f.swaySpeed;
            const fx = f.x + Math.sin(f.sway) * 25;
            if (f.y < -40) { f.y = H + 40; f.x = Math.random() * W; }
            ctx.save();
            ctx.globalAlpha = f.alpha * (0.7 + 0.3 * Math.sin(f.sway));
            const glow = ctx.createRadialGradient(fx, f.y, 0, fx, f.y, f.r * 3);
            glow.addColorStop(0, 'rgba(255, 200, 100, 0.55)');
            glow.addColorStop(1, 'rgba(255, 200, 100, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(fx, f.y, f.r * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffcc66';
            ctx.beginPath();
            ctx.arc(fx, f.y, f.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });

          // Petals / confetti fall
          petals.forEach(p => {
            p.y += p.speed;
            p.sway += p.swaySpeed;
            p.rotation += p.rotSpeed;
            const px = p.x + Math.sin(p.sway) * 35;
            if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
            ctx.save();
            ctx.globalAlpha = 0.55;
            ctx.translate(px, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });

          // Sparkles twinkle
          sparkles.forEach(s => {
            const alpha = 0.4 + 0.6 * Math.sin(elapsed * s.speed + s.phase);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#fff8dc';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });

          // ── Text group ── panel + lines move together and breathe very gently,
          // so the frame never looks like a frozen still
          const breathe = 1 + 0.006 * Math.sin(elapsed * 0.0012);
          ctx.save();
          ctx.translate(W / 2, H / 2);
          ctx.scale(breathe, breathe);
          ctx.translate(-W / 2, -H / 2);

          // Backdrop panel wipes in before the type lands
          if (boardRect) {
            const bt = easeOut(Math.min(Math.max(elapsed / 650, 0), 1));
            ctx.save();
            ctx.globalAlpha = bt;
            const bh = boardRect.h * bt;
            const by = boardRect.y + (boardRect.h - bh) / 2;
            roundRectPath(boardRect.x, by, boardRect.w, bh, 24);
            ctx.fillStyle = boardStyle.fill;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = boardStyle.stroke;
            ctx.stroke();
            // Inner hairline frame for a printed-card finish
            if (bt > 0.55) {
              ctx.globalAlpha = (bt - 0.55) / 0.45 * 0.75;
              roundRectPath(boardRect.x + 8, by + 8, Math.max(0, boardRect.w - 16), Math.max(0, bh - 16), 16);
              ctx.lineWidth = 1;
              ctx.strokeStyle = boardStyle.stroke;
              ctx.stroke();
            }
            ctx.restore();
          }

          // Text blocks animate in sequentially with scale + fade + glow
          const perBlock = (DURATION * 0.5) / Math.max(blocks.length, 1);
          blocks.forEach((b, i) => {
            const start = (boardRect ? 520 : 300) + i * perBlock * 0.5;
            const t = Math.min(Math.max((elapsed - start) / 750, 0), 1);
            if (t <= 0) return;
            const alpha = easeOut(t) * b.opacity;
            const scale = 0.94 + 0.06 * easeOut(t);
            const offsetY = (1 - easeOut(t)) * 26;
            const y = b.yPx + offsetY;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const fontSize = Math.round(b.fontPx);
            ctx.font = `${b.weight} ${fontSize}px '${b.font}', 'Tiro Devanagari Hindi', serif`;
            const lines = String(b.text).split('\n');
            const lineH = fontSize * 1.32;
            const startY = y - ((lines.length - 1) * lineH) / 2;

            // Halo only does real work when there is no panel behind the type
            ctx.shadowColor = textHalo;
            ctx.shadowBlur = boardRect ? 6 : 16;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.lineWidth = boardRect ? 0 : Math.max(2.5, fontSize / 10);
            ctx.strokeStyle = textOutline;

            lines.forEach((line, li) => {
              const ly = startY + li * lineH;
              ctx.save();
              ctx.translate(W / 2, ly);
              ctx.scale(scale, scale);
              if (!boardRect) ctx.strokeText(line, 0, 0, W * 0.86);
              ctx.fillText(line, 0, 0, W * 0.86);
              ctx.restore();
            });

            // Gold rule draws itself under the occasion name
            if (b.key === 'eventName' && t > 0.55) {
              const gt = Math.min((t - 0.55) / 0.45, 1);
              const half = Math.min(W * 0.28, fontSize * 4) * easeOut(gt);
              const ry = y + (lines.length * lineH) / 2 + fontSize * 0.42;
              ctx.save();
              ctx.globalAlpha = gt * 0.85;
              ctx.strokeStyle = textIsLight ? 'rgba(255,215,130,0.9)' : 'rgba(184,134,11,0.85)';
              ctx.lineWidth = 1.6;
              ctx.beginPath();
              ctx.moveTo(W / 2 - half, ry);
              ctx.lineTo(W / 2 + half, ry);
              ctx.stroke();
              ctx.fillStyle = ctx.strokeStyle;
              [W / 2 - half, W / 2 + half].forEach((cx) => {
                ctx.beginPath();
                ctx.arc(cx, ry, 2.6, 0, Math.PI * 2);
                ctx.fill();
              });
              ctx.restore();
            }
            ctx.restore();
          });
          ctx.restore();

          // Watermark — soft scrim along the bottom edge, then a centred white credit
          // Scrim is kept thin (8%) so it never covers artwork borders or text.
          if (withWatermark) {
            ctx.save();
            const scrimH = Math.round(H * 0.08);
            const scrim = ctx.createLinearGradient(0, H - scrimH, 0, H);
            scrim.addColorStop(0, 'rgba(24,6,12,0)');
            scrim.addColorStop(0.5, 'rgba(24,6,12,0.28)');
            scrim.addColorStop(1, 'rgba(24,6,12,0.55)');
            ctx.fillStyle = scrim;
            ctx.fillRect(0, H - scrimH, W, scrimH);

            const mark = 'Made with GuestInvitation  ·  guestinvitation.com';
            const markSize = Math.round(17 * (W / 720));
            ctx.font = `600 ${markSize}px 'Inter', sans-serif`;
            const heartW = markSize * 1.05;
            const textW = ctx.measureText(mark).width;
            const baseY = H - Math.round(18 * (W / 720));
            let cursor = (W - (heartW + textW)) / 2;

            // little heart before the credit
            ctx.save();
            ctx.translate(cursor + heartW * 0.42, baseY - markSize * 0.32);
            const hs = markSize * 0.62;
            ctx.scale(hs, hs);
            ctx.beginPath();
            ctx.moveTo(0, 0.34);
            ctx.bezierCurveTo(-0.52, -0.16, -0.36, -0.62, 0, -0.32);
            ctx.bezierCurveTo(0.36, -0.62, 0.52, -0.16, 0, 0.34);
            ctx.closePath();
            ctx.fillStyle = '#FF6B7A';
            ctx.shadowColor = 'rgba(0,0,0,0.55)';
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.restore();

            cursor += heartW;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            ctx.shadowColor = 'rgba(0,0,0,0.85)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 1;
            ctx.fillText(mark, cursor, baseY);
            ctx.restore();
          }
        };

        let startTime = null;
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          try { recorder.stop(); } catch (e) { /* ignore */ }
        };
        recorder.onerror = (e) => {
          finished = true;
          reject(new Error('MediaRecorder error: ' + (e.message || 'unknown')));
        };
        // Start with a 100ms timeslice so chunks are emitted throughout recording
        recorder.start(100);
        // Safety timeout: force stop if animation loop somehow stalls
        const safetyTimeout = setTimeout(finish, DURATION + 3000);
        // Use setTimeout instead of requestAnimationFrame so recording works
        // even when the tab is hidden or in a headless environment.
        const frameInterval = 1000 / FPS;
        const tick = () => {
          if (finished) return;
          const now = performance.now();
          if (startTime === null) startTime = now;
          const elapsed = now - startTime;
          drawFrame(elapsed);
          if (elapsed < DURATION) {
            setTimeout(tick, frameInterval);
          } else {
            clearTimeout(safetyTimeout);
            setTimeout(finish, 120);
          }
        };
        setTimeout(tick, frameInterval);
      };
      img.onerror = () => reject(new Error('Template image failed to load'));
    });
  };

  // Download a canvas as PNG (+ optional PDF)
  const downloadCanvasImage = async (canvas, withWatermark, withPdf) => {
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `guestinvitation-${template.slug || 'template'}-${withWatermark ? 'preview' : 'clean'}.png`;
    link.href = image;
    link.click();
    if (withPdf) {
      try {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
        pdf.addImage(image, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`guestinvitation-${template.slug || 'template'}.pdf`);
      } catch (e) { console.error('PDF error:', e); }
    }
  };

  // Capture the live preview element to a canvas
  const capturePreview = () => html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: null, logging: false });

  // Entry point for paid buttons + preview
  const handleDownload = async (type, withWatermark = false) => {
    setGenerating(true);
    try {
      if (type === 'video') {
        // Video + image bundle
        const originalWatermark = showWatermark;
        setShowWatermark(false);
        await new Promise(r => setTimeout(r, 60));
        const [videoBlob, canvas] = await Promise.all([
          generateAnimatedVideo(false),
          capturePreview(),
        ]);
        // Download video
        const vUrl = URL.createObjectURL(videoBlob);
        const vLink = document.createElement('a');
        vLink.download = `guestinvitation-${template.slug || 'template'}.webm`;
        vLink.href = vUrl;
        vLink.click();
        setTimeout(() => URL.revokeObjectURL(vUrl), 5000);
        // Download clean image
        await downloadCanvasImage(canvas, false, false);
        setShowWatermark(originalWatermark);
        toast.success('Video + image downloaded! 🎬');
      } else if (type === 'pdf') {
        // PDF only
        const originalWatermark = showWatermark;
        setShowWatermark(false);
        await new Promise(r => setTimeout(r, 60));
        const canvas = await capturePreview();
        const image = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
        pdf.addImage(image, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`guestinvitation-${template.slug || 'template'}.pdf`);
        setShowWatermark(originalWatermark);
        toast.success('PDF downloaded! 📄');
      } else {
        // Clean image (+PDF)
        const originalWatermark = showWatermark;
        setShowWatermark(false);
        await new Promise(r => setTimeout(r, 60));
        const canvas = await capturePreview();
        await downloadCanvasImage(canvas, false, true);
        setShowWatermark(originalWatermark);
        toast.success('Clean image + PDF downloaded! 🎉');
      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to generate. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Preview (watermarked) download - no payment
  const handlePreviewDownload = async () => {
    setGenerating(true);
    try {
      const canvas = await capturePreview();
      await downloadCanvasImage(canvas, true, false);
      toast.success('Preview downloaded with GuestInvitation mark!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate preview.');
    } finally {
      setGenerating(false);
    }
  };

  // Open payment modal (skip if already paid for this template)
  const openPayment = (type) => {
    const slug = template.slug || template._id;
    if (isPaidFor(slug, type)) {
      toast('Already paid — downloading now…', { icon: '✅' });
      handleDownload(type, false);
      return;
    }
    const amount = type === 'video' ? (template.videoPrice || 99) : (template.price || 49);
    setPaymentModal({ type, amount });
  };

  // Simulated payment success -> mark paid & trigger download
  const handlePay = async () => {
    if (!paymentModal) return;
    setPaying(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate gateway
    setPaying(false);
    const { type } = paymentModal;
    const slug = template.slug || template._id;
    markPaid(slug, type);
    setPaymentModal(null);
    toast.success('Payment successful! Downloading…');
    await handleDownload(type, false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#800020] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-[#fdf8f0] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-800 mb-2">Template not found</h2>
          <Link to="/" className="text-[#800020] hover:underline">← Back to Gallery</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f0]">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/40 px-4 py-3 flex items-center justify-between shadow-[0_4px_20px_rgba(128,0,32,0.06)]">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-[#800020] transition-colors font-medium">
          <HiArrowLeft className="w-5 h-5" />
          <span className="text-sm">Gallery</span>
        </Link>

        {/* Template counter + prev/next */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => goToTemplate(currentIndex - 1)}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white/80 flex items-center justify-center text-gray-600 hover:text-[#800020] hover:border-[#800020] transition-all shadow-sm"
            aria-label="Previous template"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600 tabular-nums font-medium min-w-[3.5rem] text-center">
            {currentIndex + 1} / {totalTemplates}
          </span>
          <button
            onClick={() => goToTemplate(currentIndex + 1)}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white/80 flex items-center justify-center text-gray-600 hover:text-[#800020] hover:border-[#800020] transition-all shadow-sm"
            aria-label="Next template"
          >
            <HiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Preview Card (sticky) */}
          <div className="lg:w-[380px] xl:w-[420px] flex-shrink-0 mx-auto lg:mx-0">
            <div className="lg:sticky lg:top-24">
              {/* Preview */}
              <div
                id="im-editor-preview"
                ref={previewRef}
                className="relative w-full max-h-[55vh] sm:max-h-none mx-auto rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                style={{ aspectRatio: '9/16', background: 'linear-gradient(to bottom, #fdf8f0 0%, #faf3e8 100%)' }}
              >
                {/* Artwork — top 55% of the card, design area */}
                <img
                  src={templateImage}
                  alt="Template"
                  className="absolute top-0 left-0 w-full object-cover"
                  style={{ height: '55%', objectPosition: 'center 30%' }}
                />

                {/* Soft blend between artwork and text area */}
                <div
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{
                    top: '45%',
                    height: '15%',
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(253,248,240,0.35) 35%, rgba(253,248,240,0.92) 100%)',
                  }}
                />

                {/* Text area — bottom 45% on clean warm cream background, no overlap with artwork */}
                <div
                  className="absolute left-0 right-0 bottom-0 flex items-start justify-center text-center px-[8%] pt-6"
                  style={{
                    height: '48%',
                    background: 'linear-gradient(to bottom, rgba(253,248,240,0.96) 0%, #faf3e8 100%)',
                    color: textColorValue,
                  }}
                >
                  <div
                    className="flex flex-col items-center max-w-full"
                    style={{
                      ...(boardCss || {}),
                      borderRadius: boardCss ? '18px' : 0,
                      padding: boardCss ? `${Math.round(16 * previewScale)}px ${Math.round(18 * previewScale)}px` : 0,
                    }}
                  >
                    {getTextBlocks().map((b) => (
                      <p
                        key={b.key}
                        style={{
                          fontFamily: `'${b.font}', 'Tiro Devanagari Hindi', serif`,
                          fontSize: `${b.size * previewScale}px`,
                          fontWeight: b.weight,
                          lineHeight: 1.32,
                          opacity: b.opacity,
                          letterSpacing: b.letterSpacing,
                          marginTop: b.gap ? `${b.gap * previewScale}px` : 0,
                          textShadow: boardCss ? `0 1px 2px ${textHalo}` : `0 0 14px ${textHalo}, 0 1px 2px rgba(0,0,0,0.12)`,
                          wordBreak: 'break-word',
                        }}
                      >
                        {b.text}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Watermark — bottom scrim + centred white credit, same read as the reference card */}
                {showWatermark && (
                  <>
                    <div
                      className="absolute inset-x-0 bottom-0 pointer-events-none"
                      style={{ height: '8%', background: 'linear-gradient(to top, rgba(24,6,12,0.50) 0%, rgba(24,6,12,0.25) 50%, rgba(24,6,12,0) 100%)' }}
                    />
                    <div
                      className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none"
                      style={{ paddingBottom: `${Math.round(5 * previewScale)}px`, paddingInline: `${Math.round(14 * previewScale)}px` }}
                    >
                      <HiHeart
                        className="w-3 h-3 flex-shrink-0"
                        style={{ color: '#FF6B7A', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
                      />
                      <span
                        className="text-white font-semibold tracking-wide text-center"
                        style={{
                          fontSize: `${Math.max(8.5, Math.round(11 * previewScale))}px`,
                          textShadow: '0 1px 3px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.45)',
                          // Wraps instead of truncating, so the credit can never
                          // be cut off on a narrow card.
                          lineHeight: 1.3,
                        }}
                      >
                        Made with GuestInvitation
                        <span className="opacity-55 mx-1">·</span>
                        <span className="font-medium opacity-90">guestinvitation.com</span>
                      </span>
                    </div>
                  </>
                )}

                {/* Falling confetti / petals animation overlay (video feel) */}
                {!isMuted && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    {Array.from({ length: 18 }).map((_, i) => {
                      const colors = ['#e8a0a8', '#f5c9a0', '#feca57', '#ff9ff3', '#48dbfb', '#B8860B', '#ffffff'];
                      return (
                        <span
                          key={i}
                          className="petal"
                          style={{
                            left: `${(i * 5.7 + 3) % 100}%`,
                            width: `${4 + (i % 3) * 2}px`,
                            height: `${3 + (i % 2) * 2}px`,
                            backgroundColor: colors[i % colors.length],
                            opacity: 0.55 + (i % 4) * 0.1,
                            animationDuration: `${3.5 + (i % 5)}s`,
                            animationDelay: `${(i * 0.35) % 5}s`,
                            borderRadius: i % 3 === 0 ? '50%' : '2px',
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Mute / play animation button */}
                <button
                  onClick={() => setIsMuted(m => !m)}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
                  aria-label={isMuted ? 'Play animation' : 'Pause animation'}
                >
                  {isMuted ? <HiVolumeOff className="w-4 h-4" /> : <HiVolumeUp className="w-4 h-4" />}
                </button>
              </div>

              {/* Text placement control */}
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Text position</p>
                  <button
                    type="button"
                    onClick={() => setTextNudge(0)}
                    className="text-[11px] text-[#800020] hover:underline"
                  >
                    Auto fit
                  </button>
                </div>
                <input
                  type="range"
                  min={-25}
                  max={25}
                  step={1}
                  value={textNudge}
                  onChange={(e) => setTextNudge(Number(e.target.value))}
                  className="w-full accent-[#800020]"
                  aria-label="Move text up or down"
                />
                <p className="text-[10px] text-gray-400 mt-1.5 leading-snug">
                  Text artwork ke sabse clean hisse mein automatically set hota hai. Zaroorat ho to upar-neeche slide karein.
                </p>
              </div>

              {/* Pricing below preview */}
              <p className="text-center text-xs text-gray-500 mt-3">
                Clean image ₹{template.price || 49} · Video ₹{template.videoPrice || 99}
              </p>
            </div>
          </div>

          {/* Right: Form Fields */}
          <div className="flex-1 min-w-0">
            {/* Template Title */}
            <div className="mb-6">
              <p className="text-[11px] font-semibold text-[#800020] uppercase tracking-wider mb-1">
                {occasionConfig.title}
              </p>
              <h1 className="text-2xl font-medium text-gray-800">{template.name}</h1>
            </div>

            {/* Sample Notice */}
            <div className="mb-5 flex items-start gap-2 text-xs text-gray-500">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#800020] flex-shrink-0" />
              <p>Sample text hai — neeche fields mein apna naam aur date daal kar customize karein.</p>
            </div>

            {/* Field Editors */}
            <div className="space-y-1">
              {fields.map((field) => (
                <FieldEditor
                  key={field.key}
                  label={field.label}
                  value={formData[field.key] || ''}
                  onChange={(val) => handleFieldChange(field.key, val)}
                  maxLength={field.maxLength}
                  config={{
                    font: fieldFonts[field.key] || 'Playfair Display',
                    size: fieldSizes[field.key] || baseSizeFor(field.key),
                    baseSize: baseSizeFor(field.key),
                    onFontChange: (font) => handleFontChange(field.key, font),
                    onSizeChange: (size) => handleSizeChange(field.key, size),
                  }}
                />
              ))}
            </div>

            {/* Reset to Sample Button */}
            <div className="mt-4 mb-4">
              <button
                onClick={() => {
                  const sample = SAMPLE_TEXT[category]?.[language] || getDefaultSample(category, language);
                  setFormData(sample);
                }}
                className="text-sm text-[#800020] hover:underline font-normal"
              >
                ↺ Reset to sample text ({language === 'english' ? 'English' : language === 'hindi' ? 'हिंदी' : 'मराठी'})
              </button>
            </div>

            {/* Preview dekho link */}
            <div className="mb-4">
              <a
                href="#im-editor-preview"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('im-editor-preview');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-sm text-[#800020] hover:underline font-normal"
              >
                Preview dekho ↑
              </a>
            </div>

            {/* ===== Design Studio — typography, backdrop, colour, music ===== */}
            <div className="mt-6 mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-5">
              {/* One-click typography presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Text style</p>
                  <span className="text-[10px] text-gray-400">sab lines ek saath</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TEXT_STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => applyTextStyle(s.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                        textStyleId === s.id
                          ? 'border-[#800020] bg-[#800020] text-white shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                      style={{ fontFamily: `'${s.fonts.eventName}', serif` }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Backdrop panel behind the text — the legibility guarantee */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Text background</p>
                  <span className="text-[10px] text-gray-400">clear text, har artwork</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {BOARD_CHOICES.map((b) => {
                    const chosen = b.id === 'auto' ? textBoardId === null : textBoardId === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setTextBoardId(b.id === 'auto' ? null : b.id)}
                        className={`rounded-xl border p-2 text-left transition-all ${
                          chosen
                            ? 'border-[#800020] ring-1 ring-[#800020] bg-[#fdf8f0]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className="block h-6 rounded-md mb-1.5 border border-black/5"
                          style={{ background: b.swatch }}
                        />
                        <span className={`text-[10px] block truncate ${chosen ? 'text-[#800020] font-medium' : 'text-gray-500'}`}>
                          {b.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {textBoardId === null && autoBand.busy && (
                  <p className="text-[10px] text-[#800020]/80 mt-1.5">
                    Auto lagaya — is artwork par text safe reh sake. Neeche se badal sakte hain.
                  </p>
                )}
              </div>

              {/* Text colour — grouped palette + custom picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Text ka rang · {Object.keys(colourPool).length} options
                  </p>
                  <button
                    type="button"
                    onClick={() => { setUserTextColor(null); setCustomTextColor(null); }}
                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                      !userTextColor && !customTextColor
                        ? 'border-[#800020] text-[#800020] bg-[#800020]/5 font-medium'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    Auto
                  </button>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {COLOR_GROUPS.map((group) => {
                    const keys = group.keys.filter((k) => colourPool[k]);
                    if (!keys.length) return null;
                    return (
                      <div key={group.label}>
                        <p className="text-[9px] uppercase tracking-wider text-gray-400 mb-1">{group.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {keys.map((key) => (
                            <button
                              key={key}
                              type="button"
                              title={TEXT_COLORS[key].name}
                              onClick={() => { setUserTextColor(key); setCustomTextColor(null); }}
                              className={`h-6 w-6 rounded-full transition-all hover:scale-110 ${
                                activeTextColor === key && !customTextColor
                                  ? 'ring-2 ring-offset-1 ring-[#800020]'
                                  : 'ring-1 ring-black/10'
                              }`}
                              style={{ backgroundColor: TEXT_COLORS[key].dotColor }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-gray-100">
                  <label className="relative h-7 w-7 rounded-full ring-1 ring-gray-200 overflow-hidden cursor-pointer flex-shrink-0">
                    <input
                      type="color"
                      value={customTextColor || TEXT_COLORS[autoColorKey].color}
                      onChange={(e) => { setCustomTextColor(e.target.value); setUserTextColor(null); }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      aria-label="Custom text colour"
                    />
                    <span
                      className="block h-full w-full"
                      style={{ background: 'conic-gradient(#f66,#fc6,#6c6,#6cc,#66c,#c6c,#f66)' }}
                    />
                  </label>
                  <span className="text-[11px] text-gray-500">
                    {customTextColor ? `Custom ${customTextColor.toUpperCase()}` : 'Koi bhi custom rang chunein'}
                  </span>
                </div>
              </div>

              {/* Music */}
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Video music</p>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {MUSIC_STYLES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMusicStyle(m.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                        musicStyle === m.id
                          ? 'border-[#800020] bg-[#800020] text-white shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={playMusicPreview}
                    className="px-3 py-1.5 rounded-full border border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B]/5 text-xs transition-all flex items-center gap-1.5"
                  >
                    <HiVolumeUp className="w-3.5 h-3.5" />
                    {musicPlaying ? 'Ruk jaao' : 'Music suno'}
                  </button>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={includeAudio}
                      onChange={(e) => setIncludeAudio(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:border-[#800020] peer-checked:bg-[#800020] transition-all flex items-center justify-center">
                      {includeAudio && <HiCheck className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Include background music</p>
                    <p className="text-xs text-gray-500">Video ke saath live music track record hota hai</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Language Selector */}
            <div className="mt-6 mb-6">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Bhasha Chunein / Select Language
              </p>
              <div className="flex flex-wrap gap-2">
                {['english', 'hindi', 'marathi'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-5 py-2 rounded-full border-2 transition-all text-sm font-normal ${
                      language === lang
                        ? 'border-[#800020] bg-[#800020] text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {lang === 'english' ? 'English' : lang === 'hindi' ? 'हिंदी' : 'मराठी'}
                  </button>
                ))}
              </div>
            </div>

            {/* Download Section */}
            <div className="border-t border-gray-100 pt-8 mt-8">
              <h2 className="text-2xl font-display font-bold text-center mb-1 text-[#800020]">
                Aapka invite taiyaar hai
              </h2>
              <p className="text-center text-gray-500 text-sm mb-6">
                Ab download karein —
              </p>

              {/* Preview Download with Watermark */}
              <button
                onClick={handlePreviewDownload}
                disabled={generating}
                className="w-full mb-5 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <HiDownload className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-600">
                  Download Preview (with GuestInvitation mark)
                </span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Download Image + PDF */}
                <div className="flex flex-col">
                  <button
                    onClick={() => openPayment('image')}
                    disabled={generating}
                    className="w-full flex items-center justify-center px-6 py-4 rounded-2xl border-2 border-[#800020] bg-white text-[#800020] hover:bg-[#800020] hover:text-white transition-all disabled:opacity-50 font-semibold"
                  >
                    <span className="text-base">
                      Image + PDF — ₹{template.price || 49}
                    </span>
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    PNG + PDF without mark · instant after payment
                  </p>
                </div>

                {/* Download Video + Image */}
                <div className="flex flex-col">
                  <button
                    onClick={() => openPayment('video')}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#800020] hover:bg-[#6a0018] text-white transition-all disabled:opacity-50 shadow-lg font-semibold"
                  >
                    <HiVideoCamera className="w-5 h-5" />
                    <span className="text-base">
                      Video + Image — ₹{template.videoPrice || 99}
                    </span>
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Video with Indian music + both files · instant
                  </p>
                </div>
              </div>

              {/* PDF-only quick link (visible if already paid for image) */}
              {isPaidFor(template.slug || template._id, 'image') && (
                <button
                  onClick={() => handleDownload('pdf', false)}
                  disabled={generating}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#B8860B]/10 text-[#B8860B] hover:bg-[#B8860B]/20 transition-all text-sm font-semibold disabled:opacity-50"
                >
                  <HiDownload className="w-4 h-4" />
                  Download PDF only
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => !paying && setPaymentModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Complete Payment</h3>
              <button onClick={() => setPaymentModal(null)} disabled={paying} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl bg-[#fdf8f0] border border-gray-100 p-4 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{paymentModal.type === 'video' ? 'Video + Image bundle' : 'Clean image + PDF'}</span>
                <span className="font-medium text-gray-800">₹{paymentModal.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Template</span>
                <span className="font-normal text-gray-800">{template.name}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Payment ke baad download turant shuru ho jayega. (Demo gateway — no real charge)
            </p>

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full py-3 rounded-2xl bg-[#800020] hover:bg-[#6a0018] text-white font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                <>Pay ₹{paymentModal.amount} & Download</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizePage;
