import "@babel/polyfill";
const greeting = 'Hello World';
console.log(greeting);

const getData = async (url:any) => {
  const response = await fetch(url);
  const result = await response.json();
  console.log(result);
};

getData('https://jsonplaceholder.typicode.com/posts');