export interface User {
  id: string;
  name: string;
  imageUrl: string;
  role: string;
}

interface CheckIn {
  id: string;
  eventId: string;
  userId: string;
  user: User;
  checkInDatetime: string;
}

export interface Event {
  id: string;
  instructor: User;
  name: string;
  instructorImageUrl: string;
  checkInsQuantity: number;
  checkInsMaxQuantity: number;
  startDatetime: string;
  liveUrl?: string;
  recordedUrl?: string;
  checkins: CheckIn[];
}

const kaka = {
  id: 'clcnjt32i0000xms6adn9hs4',
  name: 'kaká',
  imageUrl: '/preview.jpeg',
  role: 'INSTRUCTOR',
};

const jp = {
  id: 'clcnjt32i0000xms6adn9hs4r',
  name: 'jp',
  imageUrl: '/preview.jpeg',
  role: 'ALUNO',
};

const anna = {
  id: 'clcnjt32i000s6adn9hs4r',
  name: 'anna',
  imageUrl: '/preview.jpeg',
  role: 'ALUNO',
};

const rose = {
  id: 'clc000xms6adn9hs4r',
  name: 'rose',
  imageUrl: '/preview.jpeg',
  role: 'ALUNO',
};

const vicente = {
  id: 'clcnjt32i0000s6ad',
  name: 'vicente',
  imageUrl: '/preview.jpeg',
  role: 'ALUNO',
};

const rafael = {
  id: 'clcnjt32i',
  name: 'rafael',
  imageUrl: '/preview.jpeg',
  role: 'ALUNO',
};

const mel = {
  id: 'c000xms6ad',
  name: 'mel',
  imageUrl: '/preview.jpeg',
  role: 'ALUNO',
};

const edina = {
  id: '0xms6ad',
  name: 'edina',
  imageUrl: '/preview.jpeg',
  role: 'ALUNO',
};

export const mockUsers = [kaka, jp, anna, rose, vicente, rafael, mel, edina];

export const mockEvents: Event[] = [
  {
    id: '1',
    instructor: kaka,
    name: 'aula de yoga',
    instructorImageUrl: '/preview.jpeg',
    checkInsQuantity: 3,
    checkInsMaxQuantity: 10,
    startDatetime: '2023-07-20T06:00:00',
    liveUrl: 'url',
    recordedUrl: 'url',
    checkins: [
      {
        id: '1',
        eventId: '1',
        userId: 'clcnjt32i0000xms6adn9hs4r',
        user: jp,
        checkInDatetime: '2023-07-19T07:45:00',
      },
      {
        id: '2',
        eventId: '1',
        userId: 'clcnjt32i000s6adn9hs4r',
        user: anna,
        checkInDatetime: '2023-07-19T07:48:00',
      },
      {
        id: '3',
        eventId: '1',
        userId: 'clc000xms6adn9hs4r',
        user: rose,
        checkInDatetime: '2023-07-19T07:50:00',
      },
    ],
  },
  {
    id: '2',
    instructor: kaka,
    name: 'aula de yoga',
    instructorImageUrl: '/preview.jpeg',
    checkInsQuantity: 3,
    checkInsMaxQuantity: 10,
    startDatetime: '2023-07-22T06:00:00',
    liveUrl: 'url',
    checkins: [
      {
        id: '4',
        eventId: '2',
        userId: 'clcnjt32i0000xms6adn9hs4r',
        user: jp,
        checkInDatetime: '2023-07-21T07:45:00',
      },
      {
        id: '5',
        eventId: '2',
        userId: 'clcnjt32i000s6adn9hs4r',
        user: anna,
        checkInDatetime: '2023-07-21T07:48:00',
      },
      {
        id: '6',
        eventId: '2',
        userId: 'clc000xms6adn9hs4r',
        user: rose,
        checkInDatetime: '2023-07-21T07:50:00',
      },
    ],
  },
  {
    id: '3',
    instructor: kaka,
    name: 'aula de yoga',
    instructorImageUrl: '/preview.jpeg',
    checkInsQuantity: 3,
    checkInsMaxQuantity: 10,
    startDatetime: '2023-07-24T06:00:00',
    liveUrl: 'url',
    checkins: [
      {
        id: '7',
        eventId: '3',
        userId: 'clcnjt32i000s6adn9hs4r',
        user: anna,
        checkInDatetime: '2023-07-23T07:48:00',
      },
      {
        id: '8',
        eventId: '3',
        userId: 'clc000xms6adn9hs4r',
        user: rose,
        checkInDatetime: '2023-07-23T07:50:00',
      },
    ],
  },
  {
    id: '4',
    instructor: kaka,
    name: 'aula de yoga',
    instructorImageUrl: '/preview.jpeg',
    checkInsQuantity: 3,
    checkInsMaxQuantity: 10,
    startDatetime: '2023-07-26T06:00:00',
    checkins: [
      // {
      //   id: '9',
      //   eventId: '3',
      //   userId: 'clcnjt32i0000xms6adn9hs4r',
      //   user: jp,
      //   checkInDatetime: '2023-07-23T07:45:00',
      // },
      {
        id: '10',
        eventId: '3',
        userId: 'clcnjt32i000s6adn9hs4r',
        user: anna,
        checkInDatetime: '2023-07-23T07:48:00',
      },
      {
        id: '11',
        eventId: '3',
        userId: 'clc000xms6adn9hs4r',
        user: rose,
        checkInDatetime: '2023-07-23T07:50:00',
      },
    ],
  },
];
