# Graph Explorer Client beta (WIP)

## Introduction

this project is a viewer for Apache AGE, AgensGraph
AGE is a graph database that is postgresql extension, and this viewer is a desktop application that can be used to visualize the graph data stored in AGE.
to be continue for neo4j and other graph databases

It will be developed to support Mac OS X, Windows, and Linux.

## Preview
<img width="1468" alt="image" src="https://github.com/user-attachments/assets/858d743b-f8e0-40b5-82ac-ca0f0863d00b" />

![image](https://github.com/user-attachments/assets/eae18ad3-7102-4ab2-864f-c8f857381c05)
![image](https://github.com/user-attachments/assets/5e573a82-72a9-4df6-a069-35bcf4db258d)




## Architecture (WIP)

1. next js + electron + react + typescript (template: https:github.com/saltyshiomix/nextron)
2. IPC (inter-process communication) between electron and react
3. using sqlite3 for storing data for application state
4. using chakra-ui for UI components

## Recomend develop Environment
  
1. node js version 18.x.x and later
2. python verson 3.1x
3. "AgensGraph" or "Apache AGE" (postgresql graph database extension)

## How to run

1. clone this repository
2. run `yarn install`
3. run `yarn libs`
4. run `yarn dev`

## Code convention

- String is in single quotes (') <br/>
  문자열은 홀따옴표(')로

- With a semicolon at the end of the code. <br/>
  코드 마지막에 세미콜른이 있게

- Do not use tabs and replace them with space bars. <br/>
  탭의 사용을 금하고 스페이스바 사용으로 대체하게

- Indentation width of 2 spaces <br/>
  들여쓰기 너비는 2칸

- When you create an object or array, you also put a comma on the element or on the back of the key-value. </br>
  객체나 배열을 작성 할 때, 원소 혹은 key-value의 맨 뒤에 있는 것에도 쉼표를 붙임

- One line of code is maximum 80 spaces </br>
  코드 한줄이 maximum 80칸

## Contributors, and Contributions

1. If you have a code that you want to contribute to, pull request
   >  기여하고자 하는 코드가 있다면 pull request 하세요
3. Please write a title and message for the pull request squash.
   > pull request 할 때 squash를 위한 제목과 메시지를 작성하여 부탁드립니다.

