import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    const [num, setNumber] = useState(0);
    window.setNumber = setNumber;
    return num === 3 ? (
        <Child />
    ) : (
        <div>
            <span>{num}</span>
        </div>
    );
}

function Child() {
    return <span>child</span>;
}

console.log(`React`, React);
console.log('ReactDOM', ReactDOM);
ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
