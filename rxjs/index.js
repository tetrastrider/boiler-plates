const { Observable , fromEvent, from, pipe, of } = rxjs;
const { scan , filter , throttleTime,pluck,map } = rxjs.operators;

let boton = document.getElementById('boton');

fromEvent(boton,'click').pipe( 
	scan(x => x + 1,0),
	filter(x =>x % 2 === 0),
	throttleTime(2000)
		).subscribe(x => console.log(x));


from([
{
	id:10,
	nombre:'alex',
	correo:'alexanderbrache@gmail.com'
},
{
	id:1,
	nombre:'alexander',
	correo:'megaturricandos@hotmail.com'
}
]).pipe(pluck('correo')).subscribe((s)=>{console.log(s)});
//,map(m=>m.length)

let elem = document.registerElement('alex-custom');
document.body.appendChild(new elem());

let o = document.createElement("p", { is: "word-count" });
document.body.appendChild(o)

class Expandingall extends HTMLUListElement {
  constructor() {
    // Always call super first in constructor
    super();

  }
}
let i =customElements.define('expanding-all', Expandingall, { extends: "ul" });
let expandingList = document.createElement('ul', { is : 'expanding-all' });
document.body.appendChild(expandingList)

const nums = of(1,2,3,4,5);//OBSERVADO

const alCuadrado = pipe(
	filter(n=>n % 2 ===0),
	map(n=> n *n)
	);


const cuadrado = alCuadrado(nums);

cuadrado.subscribe(x => console.log(x));//BRECHADOR