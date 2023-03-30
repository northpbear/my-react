import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    const [num, setNum] = useState(0);
    const arr =
        num % 2
            ? [<li key="1">1</li>, <li key="2">2</li>, <li key="3">3</li>]
            : [<li key="3">3</li>, <li key="2">2</li>, <li key="1">1</li>];
    return (
        <ul onClick={() => setNum(num + 1)} className="App">
            {arr}
        </ul>
    );
}

function Child() {
    return <span>child</span>;
}

console.log(`React`, React);
console.log('ReactDOM', ReactDOM);
console.log('111', [
    <li key="1">1</li>,
    <li key="2">2</li>,
    <li key="3">3</li>
]);
ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
