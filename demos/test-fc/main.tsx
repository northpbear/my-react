import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    const [num, setNumber] = useState(0);
    return (
        <div>
            <span>{num}</span>
        </div>
    );
}

console.log(`React`, React);
console.log('ReactDOM', ReactDOM);
ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
